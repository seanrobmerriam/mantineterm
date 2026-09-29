# vite-mantine

## Stack

- **Language / Runtime**: TypeScript 7 (strict mode), Deno 2.x
- **Framework**: Vite 8, React 19, React Router 7
- **Key dependencies**: Mantine 9 (core, hooks, form, modals, notifications, tiptap, carousel, dropzone, lightbox, spotlight, nprogress, code-highlight), Vitest 5, Storybook 10
- **Package manager**: Deno (reads `package.json` natively, populates `deno.lock`; Yarn artifacts removed)

## Build approach

`<TBD, set by /scope>`

## Commands

```bash
deno install            # populate node_modules from package.json + write deno.lock
deno task dev           # vite dev server (or deno run npm:vite)
deno task build         # tsc + vite build
deno task typecheck     # tsc --noEmit
deno task test          # typecheck + format + lint + vitest + build
deno task storybook     # storybook dev server
deno ci                 # clean reproducible install for CI (deletes node_modules, uses deno.lock)
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Rules

- Pure functions by default; side effects live at the edges and stay explicit
- Data is immutable: `const`, `readonly`, `Object.freeze`; never mutate in place
- Prefer composition over inheritance; avoid classes where a plain function works
- No shared mutable state; module level variables are constants only
- Avoid `null`; prefer `undefined` with explicit unions, or an Option/Maybe wrapper
- Expected failures use `Result`/`Either` or explicit error returns, not exceptions
- Strict TypeScript: no `any`, exhaustive types, `strictNullChecks`, `noImplicitAny`
- Folder by feature: `src/features/<feature>/{components,hooks,pages}`; each feature owns its files
- One consistent error handling pattern across the app (boundary, toast, or Result), used everywhere
- Deno skills take precedence on Deno specific choices (install vs yarn, lifecycle scripts, permissions); defer to the `deno` SKILL.md on those

## Tooling

- Linter ESLint, formatter Prettier (scaffold ships oxlint and oxfmt; `/develop tooling` swaps them)
- Pre-commit gate: lint + format check + typecheck on every commit
- Tests: Vitest unit and integration with Testing Library and jsdom
- CI: basic GitHub Actions on push and PR (lint, typecheck, test); `deno ci` for clean reproducible installs

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Agent skills

- [deno](.agents/skills/deno/): `denoland/skills`, Deno runtime, package manager, built-in toolchain, permissions, workspaces
- [deno-frontend](.agents/skills/deno-frontend/): `denoland/skills`, React, Vite, Astro, SvelteKit, Next on Deno
- [deno-deploy](.agents/skills/deno-deploy/): `denoland/skills`, deploying Deno apps
- [deno-sandbox](.agents/skills/deno-sandbox/): `denoland/skills`, executing untrusted or AI generated code safely
- [migrate-to-deno](.agents/skills/migrate-to-deno/): `denoland/skills`, moving a Node.js, npm, Yarn, pnpm, or Bun project to Deno
- [vercel-react-best-practices](.agents/skills/vercel-react-best-practices/): `vercel-labs/agent-skills`, React 19+ performance rules from Vercel

Declined: mantine-combobox, mantine-form, mantine-custom-components
MCP servers: @mantine/mcp-server (recommended), github (recommended)

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._