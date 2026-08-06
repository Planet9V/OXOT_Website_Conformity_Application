export interface UploadResult {
  objectPath: string;
  fileName: string;
  contentType: string;
}

/** Mirrors the server-side cap; the server remains the source of truth. */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

/**
 * Client-side mirrors of the server's upload allow-list (see the API server's
 * storage route). The server remains the source of truth — this exists so an
 * unsupported or oversized file fails loudly BEFORE any network round-trip.
 */
const ALLOWED_EXTENSIONS = new Set([
  // documents
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  // images
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "svg",
  "bmp",
  "tiff",
  "avif",
  // data / SBOM formats
  "json",
  "txt",
  "csv",
  "xml",
]);

const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
  "text/plain",
  "text/csv",
  "application/xml",
  "text/xml",
  // Browsers report an empty type for some files; we normalize that to
  // octet-stream. The extension check still applies, so this stays safe.
  "application/octet-stream",
]);

/**
 * Validate a file against the shared size cap and type allow-list.
 * Returns a human-readable error message, or null when the file is allowed.
 */
export function validateUploadFile(file: File): string | null {
  if (file.size > MAX_UPLOAD_BYTES) {
    return `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB — the maximum allowed size is ${Math.floor(
      MAX_UPLOAD_BYTES / (1024 * 1024),
    )} MB.`;
  }
  const ext = file.name.includes(".")
    ? file.name.split(".").pop()!.toLowerCase()
    : "";
  const normalizedType = (file.type || "application/octet-stream")
    .split(";")[0]
    .trim()
    .toLowerCase();
  const typeAllowed =
    normalizedType.startsWith("image/") ||
    ALLOWED_CONTENT_TYPES.has(normalizedType);
  if (!ALLOWED_EXTENSIONS.has(ext) || !typeAllowed) {
    return "This file type is not allowed. Upload a PDF, Office document, image, or data file (JSON, CSV, XML, TXT).";
  }
  return null;
}

/**
 * Upload a file straight to object storage: ask the API for a presigned URL,
 * PUT the bytes to it, and return the normalized object path. The admin session
 * cookie authorizes the request-url call; the PUT uses the short-lived signed URL.
 *
 * The server enforces a size cap and content-type allow-list before minting a
 * write URL; we pre-check the size here for a fast failure and surface the
 * server's rejection reason otherwise.
 *
 * The PUT uses XMLHttpRequest (not fetch) so real upload progress can be
 * reported: `onProgress` receives a 0–100 integer as bytes reach storage.
 */
export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const rejection = validateUploadFile(file);
  if (rejection) {
    throw new Error(rejection);
  }
  const contentType = file.type || "application/octet-stream";
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ name: file.name, size: file.size, contentType }),
  });
  if (!res.ok) {
    let message = "Could not start the upload. Please sign in again and retry.";
    try {
      const body = (await res.json()) as { error?: string };
      if (res.status === 400 && body.error) message = body.error;
    } catch {
      // non-JSON error body; keep the generic message
    }
    throw new Error(message);
  }
  const { uploadURL, objectPath } = (await res.json()) as {
    uploadURL: string;
    objectPath: string;
  };

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadURL);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error("The file upload failed. Please try again."));
      }
    };
    xhr.onerror = () => reject(new Error("The file upload failed. Please try again."));
    xhr.onabort = () => reject(new Error("The upload was interrupted. Please try again."));
    xhr.send(file);
  });

  return { objectPath, fileName: file.name, contentType };
}
