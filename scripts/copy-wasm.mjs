// Copies the Ghostty WASM binary from @wterm/ghostty into public/ so it can be
// served at a stable URL (/ghostty-vt.wasm) by Vite during dev and build, and
// by the preview server. The terminal core resolves the binary via
// `GhosttyCore.load({ wasmPath: "/ghostty-vt.wasm" })`.

import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const source = join(root, 'node_modules', '@wterm', 'ghostty', 'wasm', 'ghostty-vt.wasm');
const targetDir = join(root, 'public');
const target = join(targetDir, 'ghostty-vt.wasm');

if (!existsSync(source)) {
  console.error(`[copy-wasm] source not found: ${source}`);
  console.error('[copy-wasm] run `deno install` (or `npm install`) first to fetch @wterm/ghostty');
  process.exit(1);
}

mkdirSync(targetDir, { recursive: true });
copyFileSync(source, target);

console.log(`[copy-wasm] ${source} -> ${target}`);