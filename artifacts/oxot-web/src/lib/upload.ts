export interface UploadResult {
  objectPath: string;
  name: string;
  size: number;
  contentType: string;
}

/**
 * Upload a file straight to object storage: ask the API for a presigned URL,
 * PUT the bytes to it, and return the normalized object path. The admin session
 * cookie authorizes the request-url call; the PUT uses the short-lived signed URL.
 */
export async function uploadFile(file: File): Promise<UploadResult> {
  const contentType = file.type || "application/octet-stream";
  const res = await fetch("/api/storage/uploads/request-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify({ name: file.name, size: file.size, contentType }),
  });
  if (!res.ok) {
    throw new Error("Could not start the upload. Please sign in again and retry.");
  }
  const { uploadURL, objectPath } = (await res.json()) as {
    uploadURL: string;
    objectPath: string;
  };
  const put = await fetch(uploadURL, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: file,
  });
  if (!put.ok) {
    throw new Error("The file upload failed. Please try again.");
  }
  return { objectPath, name: file.name, size: file.size, contentType };
}
