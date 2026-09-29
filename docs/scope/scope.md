# Scope: mantineterm

A Mantine shell app that hosts a web terminal in its main content area, built on top of the existing Vite + React 19 + Mantine 9 template.

**Build approach:** Tracer Bullet (a thin end to end thread through every layer first, then thickened).
**Workflow:** Beta (every feature runs `/develop`, then `/check verify`, then `/test` before done).

_These are recommendations to keep the build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Integrate wterm terminal into the main App | Slice 1 | in-progress |

## Slice 1: Web terminal

### 1. Integrate wterm terminal into the main App · in-progress
Mount a real web terminal in the existing Mantine shell. Left sidebar keeps the existing segmented navigation. Main content area renders a terminal backed by the wterm Ghostty core (a small compiled core that implements full VT100/VT220 compliance), with a recoverable loading and error UX.
**Done when:** App boots, sidebar nav and main terminal render together, typed input echoes in the terminal, a missing or broken WASM asset surfaces a red Mantine Alert with a Retry button, and the test suite is green.
- [x] Design it (spec): `/architect integrate wterm terminal into the main App`
- [x] Build it: `/develop integrate wterm terminal into the main App`
  - [x] Add wterm deps and the copy-wasm build script wired into dev, build, preview (AC-6)
  - [x] Build `TerminalPanel` with loading, error, resize handling, and the echo loop (AC-2, AC-3, AC-4, AC-5, AC-7)
  - [x] Mount `TerminalPanel` in `AppShell.Main` and add the render smoke test (AC-1, AC-8)
- [ ] Verify it: `/check verify integrate wterm terminal into the main App`
- [ ] Test it: `/test integrate wterm terminal into the main App`
Spec [0001](../specs/0001-integrate-wterm-terminal-app/index.md)
Code in src/App.tsx, src/components/TerminalPanel/TerminalPanel.tsx, src/App.test.tsx, scripts/copy-wasm.mjs

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.
- **Replace local echo loop with a real PTY transport**: wire `@wterm/core` WebSocket transport to a backend so the terminal becomes interactive with a real shell.
- **Dynamic import for the Ghostty core**: defer the ~400KB WASM download off the critical render path.
- **AGENTS.md rule for `vercel-react-best-practices` conventions**: lift the wterm-specific bundle and dynamic-import rules into the project rules section.

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies, so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` with 2 to 5 milestones; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped |

Next step = the first unticked box (always a command or a tracked milestone). Atomic build tasks live in the spec's `## Build plan`, not here: the scope carries only the milestone rollup.