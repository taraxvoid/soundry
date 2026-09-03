# REVIEW.md

## Project
Soundry is a static Astro site for Omaha's experimental music education workshops.
Domain: `https://soundryomaha.org`

## Architecture
- `src/layouts/Base.astro` — HTML shell, sticky nav, footer, skip link, back-to-top
- `src/pages/index.astro` — home: hero, event calendar, email signup, donate, Instagram
- `src/components/EventCalendar.astro` — upcoming events from content collection
- `src/components/EventSubscribe.astro` — Netlify email form with JS submit handler
- `src/content/events/*.yaml` — event data validated by `src/content.config.ts`
- `src/utils/ical.ts` — `.ics` generation for feed and per-event routes
- `src/utils/eventVisibility.ts` — hides past events on the home page calendar
- Tests: `vitest` for unit/data/ical/build, `playwright` for e2e and a11y

## Review Checklist

### Accessibility
- [ ] Skip link present and focus-visible styles intact
- [ ] Color contrast meets requirements for primary text on cream/white backgrounds
- [ ] Focus rings visible on nav keys, buttons, and links
- [ ] `prefers-reduced-motion` disables transitions and smooth scrolling
- [ ] Form inputs have labels, required fields marked, error/success messaging announced
- [ ] External links have `rel="noopener noreferrer"` and descriptive `aria-label` where icon-only
- [ ] Back-to-top button has `aria-label` and appears only after scrolling

### Events / Content
- [ ] New/changed event YAML has required fields: `title`, `date` (`YYYY-MM-DD`), `time` (`HH:MM`), `location`, `description`
- [ ] Optional fields: `endTime`, `price`, `image`, `rsvpLink`, `revision`
- [ ] Past events are hidden from home calendar; future events display correctly
- [ ] Per-event `.ics` files and `/events.ics` feed regenerate with valid CRLF line endings
- [ ] `X-WR-CALNAME`, `UID`, `SEQUENCE`, timezone `America/Chicago` are correct

### Build / SEO
- [ ] `bun run build` succeeds and `dist/` contains `index.html`, `events.ics`, per-event `.ics`
- [ ] `robots.txt` and `llms.txt` reference `https://soundryomaha.org`
- [ ] Sitemap generated via `@astrojs/sitemap`
- [ ] Favicons and manifest present in `public/`

### Tests
- [ ] `bun run test:data` passes for any new/changed event YAML
- [ ] `bun run test:ical` passes if ICS generation changed
- [ ] `bun run test:build` passes after build-affecting changes
- [ ] `bun run test:e2e` and `bun run test:a11y` pass for frontend changes
- [ ] `bun run lint` passes; `bun run format` auto-fixes formatting if needed

### Style / Conventions
- [ ] Follow existing piano-key nav color conventions via `keyColorClass`
- [ ] Use CSS custom properties from `:root` for colors/typography
- [ ] Avoid adding new font families without discussion
- [ ] Keep components small and focused; avoid inline styles unless using WebAwesome icons
- [ ] No secrets, keys, or credentials in committed files
