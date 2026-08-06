/**
 * Ensures the Playwright-managed browser path resolves to the Nix-provided
 * Chromium binary so no separate `playwright install` download is needed.
 *
 * Playwright 1.40.0 expects:
 *   ~/.cache/ms-playwright/chromium-1091/chrome-linux/chrome
 *
 * The Nix store already ships the full Chromium at:
 *   /nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium
 *     /chromium-1080/chrome-linux/chrome
 *
 * We create a symlink so Playwright finds the binary at its expected path.
 *
 * NOTE: keep this file byte-identical with artifacts/oxot-web/e2e/setup-browser.mjs.
 * Both harnesses share $XDG_CACHE_HOME and validation runs them in parallel, so
 * a change to one must be mirrored to the other.
 */
import { mkdirSync, symlinkSync, rmSync, readlinkSync, renameSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const NIX_CHROME_LINUX =
  '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux';

// Playwright resolves its browser registry under the OS cache dir, which is
// $XDG_CACHE_HOME when set (it is in this environment) and otherwise
// ~/.cache. Mirror that exact resolution so the symlink lands where Playwright
// actually looks — otherwise the launch falls back to a missing download.
const CACHE_HOME = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');

const TARGET_DIR = join(CACHE_HOME, 'ms-playwright', 'chromium-1091');
const LINK = join(TARGET_DIR, 'chrome-linux');

mkdirSync(TARGET_DIR, { recursive: true });

// The symlink's current target, or null if LINK is missing or not a symlink.
function linkTarget() {
  try {
    return readlinkSync(LINK);
  } catch {
    return null;
  }
}

// Provision the Chromium symlink idempotently and concurrency-safely.
//
// The conformity and oxot-web e2e harnesses share $XDG_CACHE_HOME, and
// task-completion validation runs their `test:e2e` in parallel, so this script
// can run concurrently against the same LINK. It must also tolerate any
// preexisting state at LINK: our own symlink (correct, dangling, or wrong), a
// stray regular file, or a real directory from a prior `playwright install`.
if (linkTarget() !== NIX_CHROME_LINUX) {
  const tmp = `${LINK}.tmp-${process.pid}-${Date.now()}`;
  try {
    symlinkSync(NIX_CHROME_LINUX, tmp);
    try {
      // rename atomically replaces a missing entry, a symlink, or a regular
      // file, so a parallel run never observes a missing link.
      renameSync(tmp, LINK);
    } catch (err) {
      // rename cannot clobber a real directory (EISDIR/ENOTEMPTY): remove it and
      // retry. This branch only triggers for a genuine browser-install dir,
      // never for our symlink, so the brief non-atomic window is acceptable.
      if (!['EISDIR', 'ENOTEMPTY', 'EEXIST', 'ENOTDIR'].includes(err.code)) throw err;
      rmSync(LINK, { recursive: true, force: true });
      renameSync(tmp, LINK);
    }
  } catch (err) {
    try {
      rmSync(tmp, { force: true });
    } catch {
      /* ignore cleanup failure */
    }
    // A concurrent run may have installed the correct link in the meantime.
    if (linkTarget() !== NIX_CHROME_LINUX) throw err;
  }
}

console.log(`[setup-browser] Symlinked ${LINK} → ${NIX_CHROME_LINUX}`);
