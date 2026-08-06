import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { describe, it, expect } from 'vitest';

/**
 * Drift guard: the conformity web client mirrors this server's upload
 * guardrails (allowed extensions, content types, 50 MB size cap) so bad files
 * fail before any network round-trip. If either side changes without the
 * other, users see confusing behaviour — files rejected client-side that the
 * server would accept, or files that pass the client check and then fail
 * after uploading.
 *
 * The client file uses browser-only types (File, XMLHttpRequest), so instead
 * of importing it we parse the allow-list literals out of both source files
 * and compare them. If this test fails, UPDATE BOTH SIDES IN LOCKSTEP:
 *   - server: artifacts/api-server/src/routes/storage.ts
 *   - client: artifacts/conformity/src/lib/upload.ts
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SERVER_FILE = path.resolve(HERE, '../storage.ts');
const CLIENT_FILE = path.resolve(
  HERE,
  '../../../../conformity/src/lib/upload.ts',
);

const LOCKSTEP_MESSAGE =
  'Upload rules drifted between client and server. Update BOTH sides in lockstep: ' +
  'artifacts/api-server/src/routes/storage.ts and artifacts/conformity/src/lib/upload.ts';

function readSource(file: string): string {
  return readFileSync(file, 'utf8');
}

/** Extract the sorted string entries of `const <name> = new Set([...])`. */
function extractSetLiteral(source: string, name: string, file: string): string[] {
  const match = source.match(
    new RegExp(`${name}\\s*=\\s*new Set\\(\\[([\\s\\S]*?)\\]\\)`),
  );
  if (!match) {
    throw new Error(
      `Could not find "const ${name} = new Set([...])" in ${file}. ` +
        `If the allow-list was renamed or restructured, update this drift test AND keep ` +
        `client/server lists in lockstep. ${LOCKSTEP_MESSAGE}`,
    );
  }
  const entries = [...match[1].matchAll(/(['"])((?:(?!\1).)*)\1/g)].map(
    (m) => m[2],
  );
  if (entries.length === 0) {
    throw new Error(`Allow-list ${name} in ${file} parsed as empty. ${LOCKSTEP_MESSAGE}`);
  }
  return [...entries].sort();
}

/** Extract the MAX_UPLOAD_BYTES initializer expression and evaluate it. */
function extractMaxBytes(source: string, file: string): number {
  const match = source.match(
    /MAX_UPLOAD_BYTES\s*=\s*([0-9][0-9\s*+]*?);/,
  );
  if (!match) {
    throw new Error(
      `Could not find MAX_UPLOAD_BYTES in ${file}. ${LOCKSTEP_MESSAGE}`,
    );
  }
  // The initializer is a plain numeric expression like `50 * 1024 * 1024`.
  const value = match[1]
    .split('*')
    .map((part) => Number(part.trim()))
    .reduce((a, b) => a * b, 1);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(
      `MAX_UPLOAD_BYTES in ${file} did not parse to a positive number. ${LOCKSTEP_MESSAGE}`,
    );
  }
  return value;
}

describe('client/server upload rule drift guard', () => {
  const serverSrc = readSource(SERVER_FILE);
  const clientSrc = readSource(CLIENT_FILE);

  it('allowed extensions match', () => {
    const server = extractSetLiteral(serverSrc, 'ALLOWED_EXTENSIONS', SERVER_FILE);
    const client = extractSetLiteral(clientSrc, 'ALLOWED_EXTENSIONS', CLIENT_FILE);
    expect(client, LOCKSTEP_MESSAGE).toEqual(server);
  });

  it('allowed content types match', () => {
    const server = extractSetLiteral(
      serverSrc,
      'ALLOWED_CONTENT_TYPES',
      SERVER_FILE,
    );
    const client = extractSetLiteral(
      clientSrc,
      'ALLOWED_CONTENT_TYPES',
      CLIENT_FILE,
    );
    expect(client, LOCKSTEP_MESSAGE).toEqual(server);
  });

  it('size cap matches', () => {
    const server = extractMaxBytes(serverSrc, SERVER_FILE);
    const client = extractMaxBytes(clientSrc, CLIENT_FILE);
    expect(client, LOCKSTEP_MESSAGE).toBe(server);
  });
});
