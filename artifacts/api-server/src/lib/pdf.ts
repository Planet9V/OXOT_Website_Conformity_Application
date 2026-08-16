import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { objectStorage } from "./storageBackend";

const execFileAsync = promisify(execFile);
const storage = objectStorage;

export interface RenderedPage {
  objectPath: string;
  pageIndex: number;
}

function pageNumber(fileName: string): number {
  const match = fileName.match(/-(\d+)\.png$/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Render every page of an uploaded PDF to a PNG using poppler's `pdftoppm`,
 * upload each page image to object storage, and return them in page order.
 */
export async function renderPdfToImages(pdfObjectPath: string): Promise<RenderedPage[]> {
  const pdfBuffer = await storage.downloadToBuffer(pdfObjectPath);
  const dir = await mkdtemp(join(tmpdir(), "pdf-"));
  try {
    const inputPath = join(dir, "input.pdf");
    await writeFile(inputPath, pdfBuffer);
    const prefix = join(dir, "page");
    await execFileAsync("pdftoppm", ["-png", "-r", "150", inputPath, prefix], {
      timeout: 120_000,
    });
    const files = (await readdir(dir))
      .filter((f) => f.startsWith("page") && f.endsWith(".png"))
      .sort((a, b) => pageNumber(a) - pageNumber(b));

    const pages: RenderedPage[] = [];
    for (let i = 0; i < files.length; i++) {
      const buffer = await readFile(join(dir, files[i]));
      const objectPath = await storage.uploadBytes(buffer, "image/png", ".png");
      pages.push({ objectPath, pageIndex: i });
    }
    return pages;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
