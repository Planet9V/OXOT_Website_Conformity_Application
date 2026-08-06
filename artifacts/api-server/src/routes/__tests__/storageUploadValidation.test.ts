import { describe, it, expect } from 'vitest';

import { validateUpload, MAX_UPLOAD_BYTES } from '../storage';

describe('validateUpload', () => {
  it('accepts a typical evidence PDF', () => {
    expect(validateUpload('pen-test.pdf', 1024, 'application/pdf')).toBeNull();
  });

  it('accepts an SBOM JSON reported as octet-stream', () => {
    expect(
      validateUpload('sbom.json', 2048, 'application/octet-stream'),
    ).toBeNull();
  });

  it('accepts images regardless of subtype', () => {
    expect(validateUpload('screen.webp', 500, 'image/webp')).toBeNull();
    expect(validateUpload('photo.avif', 500, 'image/avif')).toBeNull();
  });

  it('ignores content-type parameters', () => {
    expect(
      validateUpload('notes.txt', 10, 'text/plain; charset=utf-8'),
    ).toBeNull();
  });

  it('rejects files above the size cap', () => {
    const err = validateUpload('big.pdf', MAX_UPLOAD_BYTES + 1, 'application/pdf');
    expect(err).toMatch(/too large/i);
  });

  it('accepts a file exactly at the cap', () => {
    expect(validateUpload('big.pdf', MAX_UPLOAD_BYTES, 'application/pdf')).toBeNull();
  });

  it('rejects disallowed extensions even with an allowed content type', () => {
    expect(validateUpload('run.exe', 10, 'application/octet-stream')).toMatch(
      /not allowed/i,
    );
    expect(validateUpload('script.sh', 10, 'text/plain')).toMatch(/not allowed/i);
  });

  it('rejects allowed extensions with a disallowed content type', () => {
    expect(validateUpload('page.txt', 10, 'text/html')).toMatch(/not allowed/i);
    expect(validateUpload('report.pdf', 10, 'application/zip')).toMatch(
      /not allowed/i,
    );
  });

  it('rejects files without an extension', () => {
    expect(validateUpload('README', 10, 'text/plain')).toMatch(/not allowed/i);
  });
});
