# Verify: Integrate wterm terminal into the main App · spec 0001 · updated 2026-09-29

_Steps derived from spec 0001 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Run `deno task dev` → open the browser → see Mantine `Loader` with "Loading terminal core..." → terminal renders → type characters → see them echoed back → toggle the sidebar (Burger on mobile, drag the breakpoint otherwise) → terminal resizes to fit. (AC-1, AC-2, AC-3, AC-4)
- [ ] Rename `public/ghostty-vt.wasm` (e.g. `mv public/ghostty-vt.wasm public/ghostty-vt.wasm.bak`) → reload the page → see a red Mantine Alert with the error message and a Retry button → click Retry → see a new Alert (the network stays broken until the file is restored). (AC-5)

## Commands

- [ ] `deno task copy-wasm` → expect `[copy-wasm] .../ghostty-vt.wasm -> .../public/ghostty-vt.wasm` printed and `public/ghostty-vt.wasm` present. (AC-6)
- [ ] `deno task vitest -- src/App.test.tsx` → expect 1 test passed. (AC-8)
- [ ] `deno run --allow-all npm:vite build` → expect `dist/assets/ghostty-vt--*.wasm` and `dist/assets/wasm-inline-*.js` emitted, and the main bundle to include the `@wterm` modules. (AC-7, dark palette is baked into the build.)
- [ ] `deno task typecheck` → expect zero errors in the new files (`src/App.tsx`, `src/App.test.tsx`, `src/components/TerminalPanel/*`, `src/types/modules.d.ts`). Pre-existing errors in `HeaderTabs`, `NavbarSegmented.test`, and `Home.page` are out of scope and remain.

## Acceptance-criteria coverage

- AC-1 … covered by UI step 1 (terminal renders in `AppShell.Main` next to `NavbarSegmented`).
- AC-2 … covered by UI step 1 (initial Loader visible while core loads).
- AC-3 … covered by UI step 1 (typed characters echo back).
- AC-4 … covered by UI step 1 (resize on sidebar toggle).
- AC-5 … covered by UI step 2 (red Alert + Retry after WASM is removed).
- AC-6 … covered by command step 1 (`copy-wasm` script).
- AC-7 … covered by command step 3 (build produces the dark terminal asset).
- AC-8 … covered by command step 2 (smoke test passes).