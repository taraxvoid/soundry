# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev            # dev server (Astro, localhost:4321) with hot-reload
bun run build          # build static site to dist/
bun run preview        # preview built dist/ locally
bun run check          # astro check (type checking)

bun run lint           # check formatting/linting (Biome)
bun run format         # auto-fix formatting (Biome)
bun run lint:actions   # validate .github/workflows/ (github-actionlint)

bun run test           # everything: build, check, unit, e2e (mobile-chrome)
bun run test:push      # pre-push gate: build, check, unit, e2e smoke (site.spec)
bun run test:fast      # lint + data validation, no build
bun run test:unit      # vitest run (all of test/*.test.ts)
bun run test:data      # content validation only
bun run test:build     # test/build.test.ts only (needs a built dist/)
bun run test:e2e       # build + Playwright (mobile-chrome)
bun run test:e2e:full  # Playwright only, no rebuild
bun run test:e2e:all   # build + Playwright (mobile + desktop)
bun run test:e2e:a11y  # build + axe a11y spec
```

Tests are **vitest** via `bun run <script>`; bare `bun test` invokes Bun's own
runner and won't run the suite.

Git hooks are lefthook, shared from voidflow's `lefthook/site.yml` (install the
binary with `mise install`; `bun install` wires the hooks). Pre-commit formats
and re-stages, then runs actionlint, `check` and `test:unit:precommit` (skips
`test/build.test.ts`, which needs `dist/`). Pre-push runs `test:push`.

## Architecture

Static site built with **Astro**, deployed to Netlify. Single layout at `src/layouts/Base.astro`.

### Pages

- `/` - home page: about/hero, events calendar, email signup, donation, booking
- `/events` - events listing (static generation from content collection)
- `/events.ics` - iCal feed for calendar subscriptions
- `/llms.txt`, `/robots.txt`, `/404`

### Content model

Events live as YAML in `src/content/events/`; the Zod schema is in `src/content.config.ts`. Helpers for visibility, times and iCal output are in `src/utils/`.

### Components

- `src/layouts/Base.astro` - main layout (HTML shell, nav, footer)
- `src/components/EventCalendar.astro` - upcoming events display
- `src/components/EventSubscribe.astro` - calendar subscribe links (Google Calendar, webcal)
- `src/components/Logo.astro` - site logo

### Forms

Email signup uses Netlify Forms (`data-netlify="true"`). Hidden static form in `index.astro` for build-time detection.

`netlify/functions/submission-created.ts` runs after each verified form submission and adds `email-signup` addresses to Buttondown (`BUTTONDOWN_API_KEY` in Netlify env). Double opt-in and the welcome email are configured in Buttondown. Sending domain is `omahasoundry.org`.

### Tests

- `test/*.test.ts` - unit tests (vitest): content data, event visibility, iCal, subscribe links, build output
- `test/e2e/` - Playwright e2e (`site.spec.js`) and axe accessibility (`a11y.spec.ts`)
