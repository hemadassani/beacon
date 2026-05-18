@AGENTS.md

# Beacon

## Mission

Beacon is an AI-powered college admissions platform for international students. It helps them build a structured profile of their academics, activities, and goals, then surfaces a personalized dashboard that orients them inside an unfamiliar admissions process. **v1 ships profile and dashboard only.** AI-driven scoring, recommendations, and matching are explicitly v2 — they must not creep into v1 work.

## Tech stack and rationale

- **Next.js 16 (App Router)** — full-stack React with server components by default. Routes are file-system based under `src/app/`. Deploys natively on Vercel. Note: this is *not* the Next.js most online tutorials cover — App Router and server components are the modern model; the older Pages Router is legacy and should not be used.
- **React 19** — installed transitively. Use server components by default; `"use client"` only where needed (event handlers, browser-only APIs, stateful hooks).
- **TypeScript (strict)** — `strict: true` is already on. Catches bugs at compile time; analogous to Python type hints but enforced.
- **Tailwind CSS v4** — utility-first styling, configured via CSS (no `tailwind.config.ts`). Theme tokens live in `src/app/globals.css` inside `@theme`. Older v3 tutorials with `tailwind.config.js` do not apply.
- **shadcn/ui** *(not installed yet)* — copy-paste accessible components (built on Radix primitives) that live in our repo, not a black-box npm package. We own the source; we can edit it.
- **Supabase** *(not installed yet)* — Postgres + auth + storage with a single SDK. Generous free tier; pairs well with Vercel.
- **Vercel** — hosting. Zero-config for Next.js; same team builds both.
- **ESLint 9** — flagged code patterns; runs in CI and on save.

## File structure conventions

```
src/
  app/                     route segments; each folder is a URL path
    layout.tsx             root layout (wraps every page)
    page.tsx               the "/" route
    globals.css            Tailwind import + theme tokens
    (route)/page.tsx       a route at /(route)
  components/
    ui/                    shadcn primitives (once installed) — minimal edits
    <feature>/             feature-scoped composites (e.g. profile/, dashboard/)
  lib/                     pure utilities, clients (e.g. supabase.ts), helpers
  types/                   shared TypeScript types and Zod schemas
public/                    static assets (favicon, og images)
```

- Colocate route-specific components, loading states, and error boundaries under their route folder.
- One component per file. Filename matches the exported component (`ProfileCard.tsx` exports `ProfileCard`).
- Files should stay under ~150 lines. If a file is growing, split before it gets unwieldy.

## Coding rules

- **TypeScript strict, no `any`.** Use `unknown` and narrow, or define a real type. `as` casts only at trust boundaries (parsed JSON, third-party returns) and even then prefer `zod`.
- **Server components by default.** Add `"use client"` only when the component needs `useState`, `useEffect`, event handlers, refs, or browser APIs. Push client boundaries as deep into the tree as possible.
- **Named exports.** No default exports except where Next.js requires them (`page.tsx`, `layout.tsx`, `error.tsx`, `loading.tsx`, `route.ts`, `middleware.ts`).
- **Imports via `@/`** — e.g. `import { foo } from "@/lib/foo"`. No deep relative paths (`../../..`).
- **No comments that just restate the code.** Comments are reserved for non-obvious *why* (a constraint, a workaround, an invariant).
- **Async/await over `.then()` chains.** Throw real `Error`s; never throw strings.
- **Small focused files; small focused functions.** One responsibility each.
- **No em dashes or en dashes in user-facing text or code comments.** Use commas, periods, parentheses, or restructure the sentence. Hyphens in compound words like `single-select` are fine.
- **Brand wordmark.** The product wordmark is always lowercase `beacon.` with a trailing period.

## Design principles

- **Editorial, not flashy.** Generous whitespace; let content breathe.
- **Soft pastel palette on near-white** — muted lavender, sage, sand, dusty rose against `#FAFAF7`-style off-whites. Inspired by modern dashboards (Linear, Vercel, Things) but warmer.
- **One accent color** used sparingly — only for primary actions and the single most important highlight on a screen. Everything else is neutral.
- **Typography:** one sans-serif (Inter or system sans). Two weights max — regular and semibold. Tight line-height on headings, relaxed on body.
- **Rounded-`xl` corners**, subtle borders (`border-neutral-200`), soft shadows (`shadow-sm`) — never heavy drop shadows.
- **Responsive from the start.** Mobile-first; design at 375px, scale up. Tailwind breakpoints (`sm:`, `md:`, `lg:`) only when layout actually needs to change.
- **Accessibility is not optional.** Semantic HTML, visible focus rings, color contrast ≥ AA. shadcn primitives give us this for free; do not strip it out.

## What NOT to do

- **No AI/scoring features in v1.** Profile and dashboard only. If a request would pull AI work forward, flag it and ask first.
- **No new dependencies without asking.** Including UI libraries, state managers, ORMs, date pickers, animation libs. Tailwind + shadcn + Supabase cover most needs.
- **No premature optimization.** No `useMemo`/`useCallback`/`React.memo` until a profiler shows a real problem. No custom caching until a metric demands it.
- **No global state libraries** (Redux, Zustand, Jotai) in v1. URL params, server state, and local component state are enough.
- **No CSS-in-JS** (styled-components, emotion). Tailwind only.
- **No Pages Router** (`pages/` directory). App Router only.
- **No `any`, no `@ts-ignore`, no `@ts-expect-error`** without a one-line comment explaining why.
- **No barrel files** (`index.ts` that re-exports everything from a folder) — they break tree-shaking and slow type checking.
- **No scope creep.** If a task expands mid-flight, surface it and stop, do not silently expand.

## Commands

- `npm run dev` — start the dev server at `http://localhost:3000`
- `npm run build` — production build (also runs type checking)
- `npm run start` — run the production build locally
- `npm run lint` — ESLint
