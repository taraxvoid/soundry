[![Netlify Status](https://api.netlify.com/api/v1/badges/044a6266-766e-4756-a05a-4f2d3223e68e/deploy-status)](https://app.netlify.com/projects/omahasoundry/deploys)

# Soundry

Omaha experimental education by Stacey Barelos - https://staceybarelos.com/soundry/

## Overview

Soundry is a static single-page website built with **Eleventy** and **Bun**, hosted on **Netlify**. The site serves 4 key use cases:

1. **🎯 Impact/Grants Marketing** - Showcase community impact with anecdotes and submit new stories via Netlify form
2. **📅 Event Calendar** - Human-writable event calendar with Google Calendar/Outlook integration via ICS export
3. **📧 Email Engagement** - Email list signup with Sendgrid integration (via Netlify Functions)
4. **📸 Instagram Presence** - Embedded Instagram feed from @omahasoundry

## Project Structure

```
soundry/
├── src/                           # Source files
│   ├── index.html                # Main single-page site (Liquid template)
│   ├── js/
│   │   └── main.js              # Dynamic event rendering + email form handling
│   ├── css/
│   │   └── style.css            # Tailwind CSS + custom styles
│   └── _data/
│       ├── events.yml           # Human-writable event calendar
│       └── events.js            # YAML parser for events
├── netlify/
│   └── functions/
│       └── subscribe.js         # Netlify Function for Sendgrid integration
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

### 5. Configure Sendgrid Integration

The email form now includes **Sendgrid integration via Netlify Functions**.

#### Prerequisites
1. **Sendgrid Account:** Create a free account at https://sendgrid.com
2. **Sendgrid API Key:** Generate an API key in Sendgrid dashboard
3. **Netlify Environment Variable:** Set `NETLIFY_EMAILS_PROVIDER_API_KEY` to your Sendgrid API key

#### Setup Steps

**Step 1: Get Sendgrid API Key**
1. Go to https://app.sendgrid.com/settings/api_keys
2. Click "Create API Key"
3. Name it something like "Soundry Email Signup"
4. Copy the key (you'll only see it once)

**Step 2: Add to Netlify**
1. Go to https://app.netlify.com/sites/omahasoundry/settings/env
2. Click "Add a variable" under Environment variables
3. Set:
   - **Key:** `NETLIFY_EMAILS_PROVIDER_API_KEY`
   - **Value:** (paste your Sendgrid API key)
4. Save

**Step 3: Deploy**
The Netlify Function is already configured at `netlify/functions/subscribe.js`. On your next deploy (or redeploy), the function will be available at `/.netlify/functions/subscribe`.

#### How It Works

**Email Form Flow:**
1. User fills out email form in "Stay Connected" section
2. Form submits to `/.netlify/functions/subscribe` (POST request)
3. Function validates email and checks honeypot spam protection
4. Function calls Sendgrid API to add contact to marketing list
5. User sees success/error message

**Form Fields:**
- `email` (required) - Email address to subscribe
- `name` (optional) - Contact name (split into first/last)
- `_website` (honeypot) - Empty field for spam protection

**Response Handling:**
- **Success (200):** "Successfully subscribed to our mailing list!"
- **Invalid Email (400):** "Invalid subscription request"
- **API Error (500):** "Failed to subscribe. Please try again."

#### Sendgrid Configuration

**Create a Marketing List (Optional):**
1. Go to Sendgrid > Marketing > Contacts > Lists
2. Click "Create List"
3. Name it "Soundry Email Subscribers"
4. Note: The current function adds contacts to the default list
5. To use a specific list, modify the function to include the list ID

**View Subscriptions:**
1. Go to Sendgrid > Marketing > Contacts
2. Filter by tags or custom fields to see Soundry signups
3. Manage unsubscribes and email preferences here

#### Testing the Integration

**Local Testing:**
```bash
# Start dev server
bun run serve

# Test the function (requires NETLIFY_EMAILS_PROVIDER_API_KEY env var locally)
# You can test by filling out the form on http://localhost:8080
```

**Live Testing:**
1. Ensure env var is set on Netlify
2. Visit the deployed site
3. Fill out email form in "Stay Connected" section
4. Should see success message
5. Check Sendgrid dashboard to confirm contact was added

#### Troubleshooting

**Function not found (404):**
- Ensure `netlify/functions/subscribe.js` exists
- Redeploy the site to Netlify

**Invalid API Key error:**
- Check that `NETLIFY_EMAILS_PROVIDER_API_KEY` is set correctly in Netlify
- Verify the key hasn't been revoked in Sendgrid dashboard

**Email not added:**
- Check browser console for error messages
- Review Netlify function logs: https://app.netlify.com/sites/omahasoundry/functions
- Verify email format is valid (contains @)

#### Function Code

The function is located at `netlify/functions/subscribe.js` and:
- Handles form POST requests
- Validates email format
- Implements honeypot spam protection
- Calls Sendgrid Marketing Contacts API v3
- Returns proper HTTP status codes
- Includes error handling and logging

Reference: https://docs.netlify.com/extend/install-and-use/setup-guides/email-integration/


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
