# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev            # dev server (Astro, localhost:4321) with hot-reload
bun run build          # build static site to dist/
bun run preview        # preview built dist/ locally

bun run lint           # check formatting/linting (Biome)
bun run format         # auto-fix formatting (Biome)

bun run test:e2e       # Playwright e2e tests (requires built dist/)
```

## Architecture

Static site built with **Astro**, deployed to Netlify. Single-page layout at `src/layouts/Base.astro`.

### Pages

- `/` — home page: about/hero, events calendar, email signup, donation, booking
- `/events` — events listing (static generation from content collection)
- `/events.ics` — iCal feed for calendar subscriptions

### Content model

Events live in `src/content/events/`. Musicians/performers are referenced from events.

### Components

- `src/layouts/Base.astro` — main layout (HTML shell, nav, footer)
- `src/components/EventCalendar.astro` — upcoming events display
- `src/components/EventSubscribe.astro` — email list signup form
- `src/components/Logo.astro` — site logo

### Forms

Email signup uses Netlify Forms (`data-netlify="true"`). Hidden static form in `index.astro` for build-time detection.

### Tests

- `test/e2e/` — Playwright e2e tests

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install`
- Use `bun run <script>` instead of `npm run <script>`
- Use `bunx <package>` instead of `npx <package>`
- Bun automatically loads .env, so don't use dotenv.
