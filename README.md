[![Netlify Status](https://api.netlify.com/api/v1/badges/044a6266-766e-4756-a05a-4f2d3223e68e/deploy-status)](https://app.netlify.com/projects/omahasoundry/deploys)

# Soundry

Omaha experimental education by Stacey Barelos - https://staceybarelos.com/soundry/

## Overview

Soundry is a static single-page website built with **Eleventy** and **Bun**, hosted on **Netlify**. The site serves 4 key use cases:

1. **🎯 Impact/Grants Marketing** - Showcase community impact with anecdotes and submit new stories via Netlify form
2. **📅 Event Calendar** - Human-writable event calendar with Google Calendar/Outlook integration via ICS export
3. **📧 Email Engagement** - Email list signup via Netlify forms (ready for Sendgrid integration)
4. **📸 Instagram Presence** - Embedded Instagram feed from @omahasoundry

## Project Structure

```
soundry/
├── src/                           # Source files
│   ├── index.html                # Main single-page site (Liquid template)
│   ├── js/
│   │   └── main.js              # Dynamic event rendering
│   ├── css/
│   │   └── style.css            # Tailwind CSS + custom styles
│   └── _data/
│       ├── events.yml           # Human-writable event calendar
│       └── events.js            # YAML parser for events
├── .eleventy.js                 # Eleventy config with ICS generation hook
├── netlify.toml                 # Netlify build and form configuration
├── package.json                 # Dependencies (Eleventy, js-yaml)
├── bun.lock                     # Bun lockfile
├── tailwind.config.js           # Tailwind configuration
├── postcss.config.js            # PostCSS config
└── _site/                        # Generated output (git-ignored)
```

## Quick Start

### Prerequisites
- **Bun** (v1.0+) - https://bun.sh
- **Node.js** (v18+) - for compatibility

### Local Development

```bash
# Install dependencies
bun install

# Build the site
bun run build
# Output: _site/index.html, _site/calendar.ics

# Serve locally with watch mode
bun run serve
# Opens at http://localhost:8080
```

## Customization Guide

### 1. Edit the Homepage & Content

**File:** `src/index.html`

This is a Liquid template containing the entire single-page site with sections:
- Hero section (title, tagline, CTA buttons)
- Impact section (grant/funding info, anecdotes, submit story form)
- Calendar section (event list, ICS download link)
- Email signup section (Netlify form)
- Instagram embed section
- Footer

### 2. Manage Events (Calendar)

**File:** `src/_data/events.yml`

Add or edit events in YAML format:

```yaml
events:
  - title: "Workshop Title"
    date: "2026-05-15"          # ISO format (YYYY-MM-DD)
    time: "6:00 PM - 8:00 PM"   # Optional
    location: "Venue Name"       # Optional
    description: "Event description..."  # Optional
    rsvp_link: "https://forms.example.com"  # Optional
```

**The site automatically:**
- Renders events on the calendar section (sorted by date)
- Generates `calendar.ics` file for Google Calendar/Outlook import
- Displays events via JavaScript from JSON data

### 3. Update Impact Anecdotes

**File:** `src/index.html` (Impact section, lines ~80-110)

Edit the anecdote cards to include real stories:

```html
<div class="bg-gray-50 p-8 rounded-lg border-l-4 border-blue-600 hover:shadow-lg transition">
  <p class="text-gray-800 italic mb-4">
    "Your quote here..."
  </p>
  <p class="font-semibold text-gray-900">— Attribution here</p>
</div>
```

### 4. Netlify Forms Configuration

Two forms are pre-configured:

#### Impact Stories Form (`impact-stories`)
- **Location:** Impact section
- **Fields:** name, email (both optional), story (required)
- **Purpose:** Collect impact stories from community members

#### Email Signup Form (`email-signup`)
- **Location:** Email signup section
- **Fields:** email (required), name (optional)
- **Purpose:** Build email list

**To view submissions:**
1. Go to Netlify admin: https://app.netlify.com/sites/omahasoundry/forms
2. View form submissions in the dashboard

**Spam Protection:** Both forms use honeypot (`netlify-honeypot`) protection

### 5. Configure Sendgrid Integration (Optional)

The email form is ready for Sendgrid integration:

```bash
# Create a Netlify function at netlify/functions/subscribe.js
# This function will receive form submissions and send to Sendgrid
```

See: https://docs.netlify.com/extend/install-and-use/setup-guides/email-integration/

### 6. Styling with Tailwind

**Files:** 
- `src/index.html` - Uses Tailwind classes (e.g., `bg-blue-600`, `text-white`)
- `src/css/style.css` - Custom Tailwind directives and utilities
- `tailwind.config.js` - Tailwind config (colors, fonts, plugins)

We use **Tailwind CDN** for quick development (fast builds, no build step for CSS).

For production optimization, consider:
```bash
# Install locally
bun add -D @tailwindcss/postcss

# Build CSS with PostCSS
bunx postcss src/css/style.css -o _site/css/style.css
```

## Build & Deployment

### Local Build

```bash
bun run build
```

Generates:
- `_site/index.html` - Main site
- `_site/calendar.ics` - iCalendar file for calendar apps
- `_site/js/main.js` - Event loader script
- `_site/netlify.toml` - Netlify config (passed through)

### Deploy to Netlify

The site is configured to deploy automatically on push to GitHub:

1. **Build command:** `bun run build`
2. **Publish directory:** `_site`
3. **Functions directory:** `netlify/functions`

**Manual deployment:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=_site
```

## Technical Details

### Eleventy Configuration

**File:** `.eleventy.js`

- **Input directory:** `src/`
- **Output directory:** `_site/`
- **Template formats:** HTML, Markdown, YAML
- **ICS generation:** Hook in `eleventy.after` event generates `calendar.ics` from `events.yml`

### Event Data Flow

1. **Source:** `src/_data/events.yml` (human-writable)
2. **Parser:** `src/_data/events.js` (js-yaml reads YAML)
3. **JSON output:** Available as `events` global in templates
4. **ICS generation:** `.eleventy.js` hook creates `calendar.ics` at build time
5. **Frontend rendering:** `src/js/main.js` fetches `/events.json` and renders dynamically

### Form Handling

**Netlify Forms:**
- Forms with `netlify` attribute are automatically captured by Netlify
- Submissions stored in Netlify Forms dashboard
- No server-side processing needed (static site)

**To add Sendgrid integration:**
- Create a Netlify Function to intercept form submissions
- Function calls Sendgrid API
- See: `.netlify/functions/subscribe.js` (example)

## Dependencies

```json
{
  "@11ty/eleventy": "^3.1.5",    // Static site generator
  "@11ty/eleventy-img": "^6.0.4", // Image optimization (included)
  "js-yaml": "^4.1.1",            // YAML parser for events
  "tailwindcss": "^4.2.2",        // CSS framework (dev)
  "postcss": "^8.5.9",            // CSS processing (dev)
  "autoprefixer": "^10.4.27"      // CSS vendor prefixes (dev)
}
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses Tailwind CSS v4 (support for ~95% of browsers)
- Responsive design (mobile-first)

## Performance Notes

- **Static site:** No database, no server overhead
- **Tailwind CDN:** Quick loads, no build step
- **ICS generation:** Done at build time (instant downloads)
- **Event rendering:** Client-side JavaScript (minimal)

## Troubleshooting

### Calendar events not showing?
- Check `src/_data/events.yml` for proper YAML format
- Verify date format: `YYYY-MM-DD`
- Rebuild: `bun run build`

### Forms not submitting?
- Verify form `name` attributes match in netlify.toml
- Check that site is deployed to Netlify (forms only work there)
- Ensure `netlify` attribute is on `<form>` tag

### Instagram embed not loading?
- Check @omahasoundry account is public
- Verify iframe src is correct: `https://www.instagram.com/omahasoundry/embed`
- Some browsers/adblockers may block Instagram embeds

## Future Enhancements

- [ ] Sendgrid email integration (Phase 3 ready)
- [ ] Photo gallery for past events
- [ ] Testimonial carousel
- [ ] RSVP system
- [ ] Volunteer signup form
- [ ] Blog/news section
