/**
 * Regression test for setup-browser.mjs.
 *
 * Runs the real provisioning script (as a child process, against a throwaway
 * $XDG_CACHE_HOME so it never touches the shared cache) across every realistic
 * preexisting state of the target path, and asserts that after two runs the
 * link resolves to the Nix Chromium. This locks in idempotency and guards the
 * EISDIR / dangling-symlink / stray-file edge cases.
 *
 * The oxot-web harness ships a byte-identical setup-browser.mjs, so this single
 * test covers both implementations.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync, readlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SCRIPT = join(HERE, 'setup-browser.mjs');
const NIX_CHROME_LINUX =
  '/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux';

function runScript(cacheHome) {
  execFileSync(process.execPath, [SCRIPT], {
    env: { ...process.env, XDG_CACHE_HOME: cacheHome },
    stdio: 'pipe',
  });
}

let failures = 0;
function scenario(name, seed) {
  const cacheHome = mkdtempSync(join(tmpdir(), 'setup-browser-test-'));
  const link = join(cacheHome, 'ms-playwright', 'chromium-1091', 'chrome-linux');
  try {
    seed(link);
    // Run twice: the first run fixes the state, the second proves idempotency.
    runScript(cacheHome);
    runScript(cacheHome);
    const target = readlinkSync(link);
    if (target !== NIX_CHROME_LINUX) {
      throw new Error(`link resolves to "${target}", expected "${NIX_CHROME_LINUX}"`);
    }
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    failures += 1;
    console.error(`  \u2717 ${name}: ${err.message}`);
  } finally {
    rmSync(cacheHome, { recursive: true, force: true });
  }
}

scenario('missing link', () => {});
scenario('correct symlink already present', (link) => {
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync(NIX_CHROME_LINUX, link);
});
scenario('dangling symlink', (link) => {
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync('/nonexistent/chrome-linux', link);
});
scenario('wrong-target symlink', (link) => {
  mkdirSync(dirname(link), { recursive: true });
  symlinkSync('/tmp', link);
});
scenario('stray regular file', (link) => {
  mkdirSync(dirname(link), { recursive: true });
  writeFileSync(link, 'stale');
});
scenario('real non-empty directory (prior playwright install)', (link) => {
  mkdirSync(link, { recursive: true });
  writeFileSync(join(link, 'chrome'), 'binary');
});

if (failures > 0) {
  console.error(`setup-browser regression: ${failures} scenario(s) failed`);
  process.exit(1);
}
console.log('setup-browser regression: all scenarios passed');
