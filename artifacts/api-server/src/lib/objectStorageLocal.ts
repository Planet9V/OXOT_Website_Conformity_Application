import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

import { ObjectAclPolicy, ObjectPermission } from './objectAcl';
import { ObjectNotFoundError } from './objectStorage';

/**
 * Local-filesystem object storage backend (task 10.1).
 *
 * Mirrors the public surface of `ObjectStorageService` (the Replit GCS
 * sidecar backend) method-for-method, so every consumer goes through
 * `lib/storageBackend.ts` and neither knows which backend is active:
 *
 * - Entities live under `<OBJECT_STORAGE_DIR>/private/uploads/<uuid>` and
 *   keep the exact same objectPath contract: `/objects/uploads/<uuid>`.
 * - The GCS backend mints a presigned PUT URL; a filesystem cannot. Instead
 *   `getObjectEntityUploadURL` registers a short-lived one-time upload id
 *   and returns the RELATIVE authenticated URL
 *   `/api/storage/uploads/local/<id>` — the client PUTs to it exactly as it
 *   would to a presigned URL (same-origin, session cookie applies), so the
 *   client contract is unchanged.
 * - The ACL policy the GCS backend stores as object metadata is stored here
 *   as a `<file>.acl.json` sidecar with the same shape and the same
 *   decision rules (public+READ, then owner, else deny — the access-group
 *   machinery has no members in either backend).
 *
 * Nothing here is reachable unless `OBJECT_STORAGE_BACKEND=local` is set —
 * see `storageBackend.ts`; the Replit path stays byte-for-byte as it was.
 */

/** Metadata sidecar next to each stored object. */
type LocalObjectMeta = {
  contentType?: string;
  aclPolicy?: ObjectAclPolicy;
};

/** Opaque handle for a stored local object (never leaves the service). */
export type LocalObjectFile = {
  absPath: string;
};

const PENDING_UPLOAD_TTL_MS = 15 * 60 * 1000; // mirrors the 900 s presign TTL

export class LocalObjectStorageService {
  /** One-time upload ids minted by getObjectEntityUploadURL. */
  private pendingUploads = new Map<string, { expiresAt: number }>();

  private baseDir(): string {
    const dir = process.env.OBJECT_STORAGE_DIR || '';
    if (!dir) {
      throw new Error(
        'OBJECT_STORAGE_DIR not set. The local storage backend needs a writable directory (compose mounts a volume for it).',
      );
    }
    return dir;
  }

  private privateDir(): string {
    return path.join(this.baseDir(), 'private');
  }

  private metaPath(absPath: string): string {
    return `${absPath}.acl.json`;
  }

  private readMeta(absPath: string): LocalObjectMeta {
    try {
      return JSON.parse(fs.readFileSync(this.metaPath(absPath), 'utf8')) as LocalObjectMeta;
    } catch {
      return {};
    }
  }

  private writeMeta(absPath: string, meta: LocalObjectMeta): void {
    fs.writeFileSync(this.metaPath(absPath), JSON.stringify(meta));
  }

  /** Resolve an entity path under the private dir, refusing traversal. */
  private entityAbsPath(entityId: string): string {
    const abs = path.resolve(this.privateDir(), entityId);
    if (!abs.startsWith(path.resolve(this.privateDir()) + path.sep)) {
      throw new ObjectNotFoundError();
    }
    return abs;
  }

  // ── public surface, mirroring ObjectStorageService ────────────────────────

  getPublicObjectSearchPaths(): Array<string> {
    // Same env contract as the GCS backend; paths are directories under
    // which public assets are searched, here on the local filesystem.
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || '';
    const paths = Array.from(
      new Set(
        pathsStr
          .split(',')
          .map((p) => p.trim())
          .filter((p) => p.length > 0),
      ),
    );
    if (paths.length === 0) {
      throw new Error(
        'PUBLIC_OBJECT_SEARCH_PATHS not set. Point it at one or more directories under OBJECT_STORAGE_DIR.',
      );
    }
    return paths;
  }

  async searchPublicObject(filePath: string): Promise<LocalObjectFile | null> {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const abs = path.resolve(searchPath, filePath);
      if (!abs.startsWith(path.resolve(searchPath) + path.sep)) continue; // traversal
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        return { absPath: abs };
      }
    }
    return null;
  }

  async downloadObject(file: LocalObjectFile, cacheTtlSec: number = 3600): Promise<Response> {
    const stat = fs.statSync(file.absPath);
    const meta = this.readMeta(file.absPath);
    const isPublic = meta.aclPolicy?.visibility === 'public';
    const nodeStream = fs.createReadStream(file.absPath);
    const webStream = Readable.toWeb(nodeStream) as ReadableStream;
    return new Response(webStream, {
      headers: {
        'Content-Type': meta.contentType || 'application/octet-stream',
        'Cache-Control': `${isPublic ? 'public' : 'private'}, max-age=${cacheTtlSec}`,
        'Content-Length': String(stat.size),
      },
    });
  }

  async getObjectEntityUploadURL(): Promise<string> {
    this.baseDir(); // fail fast when unconfigured, like getPrivateObjectDir()
    const objectId = randomUUID();
    const now = Date.now();
    for (const [id, entry] of this.pendingUploads) {
      if (entry.expiresAt < now) this.pendingUploads.delete(id);
    }
    this.pendingUploads.set(objectId, { expiresAt: now + PENDING_UPLOAD_TTL_MS });
    return `/api/storage/uploads/local/${objectId}`;
  }

  /**
   * Accept the PUT for a previously minted one-time upload id. Returns the
   * objectPath, or null when the id is unknown/expired (the route 404s).
   */
  acceptLocalUpload(objectId: string, bytes: Buffer, contentType: string): string | null {
    const entry = this.pendingUploads.get(objectId);
    if (!entry || entry.expiresAt < Date.now()) return null;
    this.pendingUploads.delete(objectId);
    const abs = this.entityAbsPath(path.join('uploads', objectId));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, bytes);
    this.writeMeta(abs, { contentType });
    return `/objects/uploads/${objectId}`;
  }

  async downloadToBuffer(objectPath: string): Promise<Buffer> {
    const file = await this.getObjectEntityFile(objectPath);
    return fs.readFileSync(file.absPath);
  }

  async downloadToBufferIfWithin(objectPath: string, maxBytes: number): Promise<Buffer | null> {
    const file = await this.getObjectEntityFile(objectPath);
    if (fs.statSync(file.absPath).size > maxBytes) return null;
    return fs.readFileSync(file.absPath);
  }

  async uploadBytes(buffer: Buffer, contentType: string, extension = ''): Promise<string> {
    const objectId = randomUUID();
    const suffix = extension ? (extension.startsWith('.') ? extension : `.${extension}`) : '';
    const abs = this.entityAbsPath(path.join('uploads', `${objectId}${suffix}`));
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, buffer);
    this.writeMeta(abs, { contentType });
    return `/objects/uploads/${objectId}${suffix}`;
  }

  async getObjectEntityFile(objectPath: string): Promise<LocalObjectFile> {
    if (!objectPath.startsWith('/objects/')) {
      throw new ObjectNotFoundError();
    }
    const parts = objectPath.slice(1).split('/');
    if (parts.length < 2) {
      throw new ObjectNotFoundError();
    }
    const entityId = parts.slice(1).join('/');
    const abs = this.entityAbsPath(entityId);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      throw new ObjectNotFoundError();
    }
    return { absPath: abs };
  }

  normalizeObjectEntityPath(rawPath: string): string {
    const m = /^\/api\/storage\/uploads\/local\/([A-Za-z0-9-]+)$/.exec(rawPath);
    if (m) return `/objects/uploads/${m[1]}`;
    return rawPath;
  }

  async trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: ObjectAclPolicy): Promise<string> {
    const normalizedPath = this.normalizeObjectEntityPath(rawPath);
    if (!normalizedPath.startsWith('/')) {
      return normalizedPath;
    }
    const file = await this.getObjectEntityFile(normalizedPath);
    const meta = this.readMeta(file.absPath);
    this.writeMeta(file.absPath, { ...meta, aclPolicy });
    return normalizedPath;
  }

  async canAccessObjectEntity({
    userId,
    objectFile,
    requestedPermission,
  }: {
    userId?: string;
    objectFile: LocalObjectFile;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean> {
    // Same decision rules as objectAcl.canAccessObject: no policy → deny;
    // public+READ → allow; owner → allow; the group machinery has no
    // members in either backend, so anything else denies.
    const policy = this.readMeta(objectFile.absPath).aclPolicy;
    if (!policy) return false;
    const permission = requestedPermission ?? ObjectPermission.READ;
    if (policy.visibility === 'public' && permission === ObjectPermission.READ) return true;
    if (!userId) return false;
    return policy.owner === userId;
  }
}
