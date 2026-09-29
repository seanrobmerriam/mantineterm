# 0001. Rationale

The decision record for spec [0001](./index.md). Skipped by `/develop`; this is the reasoning.

## Context

Today `src/App.tsx` already wires `MantineProvider` + `AppShell` with `NavbarSegmented` in the navbar slot and a literal "Main Content Area" string in main. The project name `mantineterm` and the empty main slot both signal that a terminal belongs there, but nothing wires one up.

We want a terminal that runs in the browser without standing up a backend in this slice. `@wterm/dom` (a DOM terminal renderer) and `@wterm/ghostty` (a VT emulator core compiled to WebAssembly) together give us exactly that. The `@wterm/react` wrapper layers a React component on top of `@wterm/dom`, which is the cleanest way to integrate with our existing React 19 + Mantine 9 app and avoids hand managing lifecycle.

The team has not yet committed to a backend. This slice therefore is intentionally a local echo loop. A real PTY backend can replace the echo loop later without changing the layout or component shape.

## Options considered

### Option 1: `@wterm/react` wrapper mounted in a new `TerminalPanel` component

A thin project component (`src/components/TerminalPanel/TerminalPanel.tsx`) owns the `GhosttyCore.load()` promise, holds the core in state, and renders either a Mantine `Loader` (while loading), a Mantine `Alert` (on error), or `<Terminal core={core} />` (when ready). The wrapper attaches a `ResizeObserver` and forwards the dark palette. `App.tsx` renders `<TerminalPanel />` inside `AppShell.Main`.

**Pros**:
- Idiomatic React lifecycle, fits the existing React 19 + Mantine stack.
- Loading and error states are first class React states, easy to test with Testing Library.
- All wiring is in one file; App.tsx stays a thin layout.

**Cons**:
- Adds two extra packages (`@wterm/react`, plus its bundled CSS export) on top of the three the topic names.

### Option 2: Vanilla `@wterm/dom` mounted via `useRef` + `useEffect`

`App.tsx` (or a thin wrapper) calls `new WTerm(el, { core })` inside a `useEffect`, returning `undefined` and tearing down on unmount. No React wrapper package is added.

**Pros**:
- Fewer packages; matches the three named in the topic exactly.
- Full control of the DOM lifecycle.

**Cons**:
- Loading and error states have to be modeled by hand (a boolean plus a try/catch plus cleanup).
- The React idiom for "spawn and tear down an imperative instance" is leak prone if not written carefully.

### Option 3: A project-local `useTerminal` hook plus a thin component

Build a small `useTerminal(ref, options)` hook in `src/hooks/` that wraps the vanilla API, then a `TerminalPanel` that uses it. No new external package.

**Pros**:
- Reusable across future terminal surfaces (multiple panes, popouts).

**Cons**:
- Two new files where one would do, and we have no second use case yet.
- Premature abstraction for this slice.

## Rationale

The team is already on React 19 and the React wrapper is the path of least resistance. Loading and error states are the load bearing part of this slice; modeling them as React states keeps the test surface small (Testing Library can drive them) and avoids the imperative lifecycle trap of option 2. Option 3 is the right move later if a second terminal surface appears, not today.

The two extra packages (`@wterm/react`, plus its bundled CSS export) are the cost; they sit on top of `@wterm/dom` and add only a few KB on top of the ~592KB WASM the Ghostty core already brings in. The bundle hit is dominated by the core, not by the wrapper.

Keeping `Mantine AppShell` is the same logic: it already supplies the responsive navbar drawer and breakpoint behavior; replacing it would mean re-implementing responsive drawer logic to save zero lines of meaningful code.

## References

None kept at design time; `/architect` was run with the "No references, keep it clean" option. The relevant external sources for the runtime work were the `vercel-labs/wterm` package READMEs (`@wterm/react`, `@wterm/dom`, `@wterm/ghostty`) consulted only as needed at build time.