import { ObjectAclPolicy, ObjectPermission } from './objectAcl';
import { ObjectStorageService } from './objectStorage';
import { LocalObjectStorageService } from './objectStorageLocal';

/**
 * The storage backend seam (task 10.1). Every consumer imports the shared
 * `objectStorage` instance from here and never constructs a backend itself.
 *
 * Selection rule — deliberately conservative so the Replit deployment is
 * provably untouched: ONLY the explicit `OBJECT_STORAGE_BACKEND=local`
 * selects the local filesystem backend. Any other value, or none, keeps the
 * Replit GCS sidecar backend exactly as before this seam existed.
 */
export type StorageBackendName = 'replit-gcs' | 'local';

export function chooseStorageBackend(env: NodeJS.ProcessEnv = process.env): StorageBackendName {
  return env.OBJECT_STORAGE_BACKEND === 'local' ? 'local' : 'replit-gcs';
}

export const activeStorageBackend: StorageBackendName = chooseStorageBackend();

/**
 * The structural surface both backends satisfy. The object-file handle is
 * OPAQUE to every caller: it is only ever obtained from and passed back into
 * the same service, which is the one justified use of `any` here — typing it
 * as a union would forbid exactly that round-trip.
 */
export interface StorageService {
  getPublicObjectSearchPaths(): Array<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchPublicObject(filePath: string): Promise<any | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  downloadObject(file: any, cacheTtlSec?: number): Promise<Response>;
  getObjectEntityUploadURL(): Promise<string>;
  downloadToBuffer(objectPath: string): Promise<Buffer>;
  downloadToBufferIfWithin(objectPath: string, maxBytes: number): Promise<Buffer | null>;
  uploadBytes(buffer: Buffer, contentType: string, extension?: string): Promise<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getObjectEntityFile(objectPath: string): Promise<any>;
  normalizeObjectEntityPath(rawPath: string): string;
  trySetObjectEntityAclPolicy(rawPath: string, aclPolicy: ObjectAclPolicy): Promise<string>;
  canAccessObjectEntity(args: {
    userId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    objectFile: any;
    requestedPermission?: ObjectPermission;
  }): Promise<boolean>;
}

export const objectStorage: StorageService =
  activeStorageBackend === 'local' ? new LocalObjectStorageService() : new ObjectStorageService();

/** Narrowing helper for the one route that only exists on the local backend. */
export function localBackend(): LocalObjectStorageService | null {
  return objectStorage instanceof LocalObjectStorageService ? objectStorage : null;
}
