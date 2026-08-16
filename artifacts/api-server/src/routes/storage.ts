import { Readable } from 'stream';
import {
  RequestUploadUrlBody,
  RequestUploadUrlResponse,
} from '@workspace/api-zod';
import { Router, type IRouter, type Request, type Response } from 'express';
import { eq } from 'drizzle-orm';
import { db, mediaAssetsTable, carouselSlidesTable } from '@workspace/db';

import { ObjectNotFoundError } from '../lib/objectStorage';
import { objectStorage, localBackend } from '../lib/storageBackend';
import { requireAdmin } from '../lib/adminAuth';

/**
 * A private object may only be served publicly if it is registered as CMS
 * media (a media-library asset or a carousel slide image). This prevents
 * anonymous enumeration of arbitrary objects in PRIVATE_OBJECT_DIR while still
 * letting the public site display admin-curated media.
 */
async function isRegisteredMedia(objectPath: string): Promise<boolean> {
  const [asset] = await db
    .select({ id: mediaAssetsTable.id })
    .from(mediaAssetsTable)
    .where(eq(mediaAssetsTable.objectPath, objectPath))
    .limit(1);
  if (asset) return true;
  const [slide] = await db
    .select({ id: carouselSlidesTable.id })
    .from(carouselSlidesTable)
    .where(eq(carouselSlidesTable.imagePath, objectPath))
    .limit(1);
  return Boolean(slide);
}

const router: IRouter = Router();
const objectStorageService = objectStorage;

/**
 * Upload guardrails. The client-side `accept` attribute is trivially
 * bypassable, so the size cap and type allow-list are enforced here BEFORE a
 * write-capable presigned URL is minted. Covers both CMS media (images, PDFs)
 * and conformity evidence files (reports, SBOMs, DoCs, spreadsheets).
 */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

const ALLOWED_EXTENSIONS = new Set([
  // documents
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  // images (CMS media / evidence screenshots)
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  'svg',
  'bmp',
  'tiff',
  'avif',
  // data / SBOM formats
  'json',
  'txt',
  'csv',
  'xml',
]);

const ALLOWED_CONTENT_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/json',
  'text/plain',
  'text/csv',
  'application/xml',
  'text/xml',
  // browsers report an empty type for some files (e.g. SBOM .json on some
  // OSes); clients send octet-stream then. The extension check above still
  // applies, so this does not open the door to arbitrary types.
  'application/octet-stream',
]);

/** Returns an error message when the upload is not allowed, else null. */
export function validateUpload(
  name: string,
  size: number,
  contentType: string,
): string | null {
  if (size > MAX_UPLOAD_BYTES) {
    return `File is too large. The maximum allowed size is ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))} MB.`;
  }
  const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  const normalizedType = contentType.split(';')[0].trim().toLowerCase();
  const typeAllowed =
    normalizedType.startsWith('image/') ||
    ALLOWED_CONTENT_TYPES.has(normalizedType);
  if (!ALLOWED_EXTENSIONS.has(ext) || !typeAllowed) {
    return 'This file type is not allowed. Upload a PDF, Office document, image, or data file (JSON, CSV, XML, TXT).';
  }
  return null;
}

/**
 * POST /storage/uploads/request-url
 *
 * Request a presigned URL for file upload.
 * The client sends JSON metadata (name, size, contentType) — NOT the file.
 * Then uploads the file directly to the returned presigned URL.
 * Requires auth middleware so public callers cannot mint write-capable URLs.
 */
router.post(
  '/storage/uploads/request-url',
  requireAdmin,
  async (req: Request, res: Response) => {
    const parsed = RequestUploadUrlBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid required fields' });
      return;
    }

    const { name, size, contentType } = parsed.data;
    const rejection = validateUpload(name, size, contentType);
    if (rejection) {
      res.status(400).json({ error: rejection });
      return;
    }

    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      const objectPath =
        objectStorageService.normalizeObjectEntityPath(uploadURL);

      res.json(
        RequestUploadUrlResponse.parse({
          uploadURL,
          objectPath,
          metadata: { name, size, contentType },
        }),
      );
    } catch (error) {
      req.log.error({ err: error }, 'Error generating upload URL');
      res.status(500).json({ error: 'Failed to generate upload URL' });
    }
  },
);

/**
 * PUT /storage/uploads/local/:id
 *
 * The local backend's replacement for the GCS presigned PUT: accepts the raw
 * file bytes for a one-time upload id minted by request-url (same 15-minute
 * lifetime as the presign TTL). Only exists when OBJECT_STORAGE_BACKEND=local;
 * on the Replit backend the URL is never issued and this route 404s. Requires
 * the same admin session that minted the id — unlike a presigned URL, the
 * cookie flows because the URL is same-origin.
 */
router.put(
  '/storage/uploads/local/:id',
  requireAdmin,
  async (req: Request, res: Response) => {
    const local = localBackend();
    if (!local) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const body = req.body as unknown;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(400).json({ error: 'Missing file body' });
      return;
    }
    if (body.length > MAX_UPLOAD_BYTES) {
      res.status(400).json({ error: 'File is too large.' });
      return;
    }
    const contentType =
      (req.headers['content-type'] as string | undefined)?.split(';')[0].trim() ||
      'application/octet-stream';
    const objectPath = local.acceptLocalUpload(String(req.params.id), body, contentType);
    if (!objectPath) {
      res.status(404).json({ error: 'Upload id unknown or expired' });
      return;
    }
    res.json({ ok: true, objectPath });
  },
);

/**
 * GET /storage/public-objects/*
 *
 * Serve public assets from PUBLIC_OBJECT_SEARCH_PATHS.
 * These are unconditionally public — no authentication or ACL checks.
 * IMPORTANT: Always provide this endpoint when object storage is set up.
 */
router.get(
  '/storage/public-objects/*filePath',
  async (req: Request, res: Response) => {
    try {
      const raw = req.params.filePath;
      const filePath = Array.isArray(raw) ? raw.join('/') : raw;
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        res.status(404).json({ error: 'File not found' });
        return;
      }

      const response = await objectStorageService.downloadObject(file);

      res.status(response.status);
      response.headers.forEach((value, key) => res.setHeader(key, value));

      if (response.body) {
        const nodeStream = Readable.fromWeb(
          response.body as ReadableStream<Uint8Array>,
        );
        nodeStream.pipe(res);
      } else {
        res.end();
      }
    } catch (error) {
      req.log.error({ err: error }, 'Error serving public object');
      res.status(500).json({ error: 'Failed to serve public object' });
    }
  },
);

/**
 * GET /storage/objects/*
 *
 * Serve object entities from PRIVATE_OBJECT_DIR.
 * These are served from a separate path from /public-objects and can optionally
 * be protected with authentication or ACL checks based on the use case.
 */
router.get('/storage/objects/*path', async (req: Request, res: Response) => {
  try {
    const raw = req.params.path;
    const wildcardPath = Array.isArray(raw) ? raw.join('/') : raw;
    const objectPath = `/objects/${wildcardPath}`;

    // Access control: only objects registered as CMS media are downloadable
    // here. Return 404 (not 403) so unregistered paths are indistinguishable
    // from missing ones.
    if (!(await isRegisteredMedia(objectPath))) {
      res.status(404).json({ error: 'Object not found' });
      return;
    }

    const objectFile =
      await objectStorageService.getObjectEntityFile(objectPath);

    const response = await objectStorageService.downloadObject(objectFile);

    res.status(response.status);
    response.headers.forEach((value, key) => res.setHeader(key, value));

    if (response.body) {
      const nodeStream = Readable.fromWeb(
        response.body as ReadableStream<Uint8Array>,
      );
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      req.log.warn({ err: error }, 'Object not found');
      res.status(404).json({ error: 'Object not found' });
      return;
    }
    req.log.error({ err: error }, 'Error serving object');
    res.status(500).json({ error: 'Failed to serve object' });
  }
});

export default router;
