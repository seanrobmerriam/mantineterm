# 0001. Integrate wterm terminal into the main App

**Date**: 2026-09-29
**Status**: In Progress

## Summary

We will mount a real web terminal inside the existing Mantine App layout. The left sidebar keeps the existing segmented navigation. The main content area becomes a terminal backed by wterm's Ghostty core (a small compiled core that implements full VT100/VT220 compliance). The terminal echoes typed input in this first slice and is wired to a recoverable error path so a missing or broken WASM asset does not break the page.

## Requirements

**User stories**:
- As a developer exploring the app, I want a working terminal in the main area so that I can see the integration is wired up end to end.
- As a developer hitting a broken build, I want a clear error and a retry button when the terminal core fails to load so that I can recover without reloading the page.

**Acceptance criteria** (the contract):
- **AC-1**: `src/App.tsx` renders `MantineProvider` + `AppShell`, with `NavbarSegmented` (from `src/components/NavbarSegmented`) in the navbar slot and a terminal component in `AppShell.Main`.
- **AC-2**: While `GhosttyCore.load()` is unresolved, the main slot shows a centered Mantine `Loader` (a small spinner) with the caption "Loading terminal core...".
- **AC-3**: Once `GhosttyCore.load()` resolves, the main slot renders `<Terminal core={core} />` (from `@wterm/react`), and typed input is echoed back to the screen.
- **AC-4**: A `ResizeObserver` on the terminal wrapper div calls `term.fit()` whenever the wrapper's content rect changes (sidebar toggle, viewport resize).
- **AC-5**: If `GhosttyCore.load()` rejects, the main slot shows a Mantine `Alert` with `color="red"`, the error message, and a "Retry" button that re-invokes `GhosttyCore.load()`.
- **AC-6**: A `copy-wasm` script in `package.json` copies `node_modules/@wterm/ghostty/wasm/ghostty-vt.wasm` to `public/ghostty-vt.wasm`, and `dev`, `build`, and `preview` invoke it before their own steps. `GhosttyCore.load()` is called with `{ wasmPath: '/ghostty-vt.wasm' }`.
- **AC-7**: The terminal palette is fixed dark regardless of Mantine color scheme, with `foregroundColor: '#ededed'` and `backgroundColor: '#0a0a0a'` passed to `GhosttyCore.load()`.
- **AC-8**: A Vitest + Testing Library render smoke test under `src/App.test.tsx` mounts the App in jsdom and asserts it does not throw (the test does not assert terminal behavior; jsdom cannot run the WASM core).

## Decision

**Chosen option**: Option 1: `@wterm/react` wrapper mounted in a new `TerminalPanel` component.

A small dedicated component keeps loading, error, and resize handling in one place, fits the existing React patterns, and lets `App.tsx` stay a pure layout file.

**Implementation skills**: `vercel-react-best-practices` (`vercel-labs/agent-skills`, `.agents/skills/vercel-react-best-practices/`).

## Feature design

**Data model sketch**:

None. The terminal core lives in memory only. No persistence is required for an echo loop.

**State transitions**:

The `TerminalPanel` component has a small state machine:

```
mounting → loading → ready
             ↓
           error → (retry) → loading
```

`mounting` is the initial render before the `useEffect` runs. `loading` is the brief wait while `GhosttyCore.load()` resolves. `ready` shows `<Terminal core={core} />`. `error` shows the Alert; the Retry button transitions back to `loading`.

**API surface**:

The component surface is one component with no props:

| Component | Mounted in | Props | Outputs | Auth | Key errors |
|---|---|---|---|---|---|
| `TerminalPanel` | `AppShell.Main` in `src/App.tsx` | none | renders Loader, Alert, or Terminal | none | none thrown; caught internally and shown via Alert |

There are no server endpoints.

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Initial render | "Loading terminal core..." caption | decided in spec (literal string) |
| `GhosttyCore.load({ wasmPath: '/ghostty-vt.wasm' })` | WASM URL | decided in spec; copied to public by `copy-wasm` script |
| `GhosttyCore.load({ foregroundColor, backgroundColor })` | terminal palette | decided in spec (`#ededed` / `#0a0a0a`) |
| ResizeObserver callback | `term.fit()` invocation | DOM `ResizeObserver` on wrapper div, calls `terminalRef.current?.instance?.fit()` |
| Error path | error message text | `err.message` from `GhosttyCore.load()` rejection |
| Echo loop | typed character echo | decided in spec: wterm `Terminal` echoes by default when `onData` is omitted |

**Key invariants**:

- The terminal wrapper fills `AppShell.Main` minus its padding, so the term can never overflow the layout.
- `GhosttyCore.load()` is invoked exactly once per mount; the Retry button performs a fresh load, not a stale retry.

**Security model**:

None at this slice. The terminal is local only, runs entirely in the browser, accepts no remote input, and reads no user data. No PII or regulated data is touched.

**Configuration required**:

None. No new environment variables or secrets.

**Critical test scenarios** (each maps to an acceptance criterion):

- Happy path: `src/App.test.tsx` renders `<App />` in jsdom and asserts the document contains the loader or the main slot without throwing, verifies **AC-1**, **AC-2**, **AC-8**.
- Failure case: a `GhosttyCore.load` rejection renders the red Alert with the error message, verifies **AC-5**.

## Build plan

Build approach: Tracer Bullet (a thin end to end thread through every layer, then thickened). `AGENTS.md` records the project default as `<TBD, set by /scope>`; per Staff judgment we default to Tracer Bullet for this kind of wiring slice because each layer (deps, build script, component, layout, test) has to land together to be useful.

1. Add `@wterm/dom`, `@wterm/ghostty`, `@wterm/react` to `package.json` `dependencies` (CSS is shipped inside these packages via their `./css` export), then `deno install`. Add a `copy-wasm` npm script that creates `public/` if missing and copies `node_modules/@wterm/ghostty/wasm/ghostty-vt.wasm` to `public/ghostty-vt.wasm`. Wire it as a pre-step in `dev`, `build`, and `preview` (and `storybook` for parity). Update `tsconfig.json` to add the `@components/*` path mapping so `tsc` resolves the alias `vite.config.mjs` already supplies. Add `src/types/modules.d.ts` to declare the `@wterm/dom/css` and `@wterm/react/css` side-effect imports for `tsc`. Satisfies **AC-6**.

2. Create `src/components/TerminalPanel/TerminalPanel.tsx` and its `index.ts`. The component calls `GhosttyCore.load(...)` inside a `useEffect`, holds `core` in state plus a `status` (`loading` | `ready` | `error`) and the captured error. Renders Mantine `Loader` for `loading`, `<Terminal core={core} />` for `ready`, Mantine `Alert` (with a Retry button that re-runs the effect) for `error`. Wraps the `Terminal` in a div with a `ResizeObserver` that calls `term.fit()` on each change. Imports `@wterm/dom/css` and `@wterm/react/css` once at the top. The `<Terminal>` omits `onData` so wterm echoes typed input back automatically (AC-3). Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-7**.

3. Update `src/App.tsx`: import `TerminalPanel`, replace the `Main Content Area (Viewport: …)` placeholder in `AppShell.Main` with `<TerminalPanel />`. Keep the existing Mantine `AppShell` shape and the existing `NavbarSegmented` import. Set `AppShell.Main` to `position: relative` so the panel's `position: absolute; inset: 0` fills the padded main box. Satisfies **AC-1**.

4. Add `src/App.test.tsx`: a Vitest + Testing Library render test that mounts `<App />` and asserts the Mantine AppShell root is present. jsdom cannot run the WASM core, so the assertion is "renders without throwing", not "terminal prints characters". Satisfies **AC-8**.

5. Run `deno task format:test`, `deno task typecheck`, `deno task oxlint`, `deno task vitest -- src/App.test.tsx`, and `deno run --allow-all npm:vite build` to confirm the slice is green end to end. Verifies the Tracer Bullet has not regressed.

## Consequences

**Positive**:
- Real, fully featured terminal emulator in the browser, ready for a future PTY backend swap.
- Loading and error paths are recoverable and testable, no silent black box.
- Layout (Mantine `AppShell`) is preserved, so all existing responsive behavior keeps working.

**Negative / tradeoffs**:
- Adds ~592KB of WASM to the served bundle (the Ghostty core; 198KB gzipped). Acceptable for a terminal first slice; revisit if it ever blocks perceived performance.
- Adds two packages (`@wterm/react`, plus its bundled CSS export) on top of the three the topic named (`@wterm/dom`, `@wterm/dom/css`, `@wterm/ghostty`).
- A `copy-wasm` build step is required; forgetting it in CI produces a broken terminal at runtime.

**Neutral**:
- `AppShell.Main` keeps its Mantine padding; the terminal lives inside that padded box, not flush to the viewport.
- A `src/components/TerminalPanel/` directory joins the project; this is consistent with the existing `src/components/NavbarSegmented/` layout.

## Follow-up

- [ ] `vercel-react-best-practices` skill conventions (specifically `bundle-dynamic-imports` for the ~592KB Ghostty core) should be reflected in `AGENTS.md` under `## Rules` once the slice ships; today the skill is referenced under `## Agent skills` only.
- [ ] Future slice: replace the local echo loop with a real PTY transport (likely `@wterm/core` WebSocket to a backend); should be designed as its own spec.
- [ ] Consider dynamic import of `@wterm/ghostty` so the WASM download is deferred off the critical path; only worth it if profiling shows the core is on the critical render path.

## Rationale

See [rationale.md](./rationale.md) for the context, options weighed, and the reasoning behind choosing the `@wterm/react` wrapper.