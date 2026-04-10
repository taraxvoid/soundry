# Soundry Deployment Guide

## Status: READY FOR DEPLOYMENT ✅

Your Soundry website is complete and ready to deploy to Netlify.

## Quick Deploy

### Option 1: GitHub Push (Recommended - Automatic)

```bash
cd /home/voidptr/soundry
git push origin main
```

Netlify will automatically build and deploy from the `main` branch.

### Option 2: Manual Deployment via Netlify CLI

```bash
# Install Netlify CLI (one-time)
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod --dir=_site
```

## Pre-Deployment Checklist

- [x] All source files in `src/` directory
- [x] Configuration files present (.eleventy.js, netlify.toml, package.json)
- [x] Build verified locally: `bun run build` ✅
- [x] Dev server tested: `bun run serve` ✅
- [x] All 4 use cases implemented
- [x] Forms configured with proper names
- [x] Calendar ICS generation working
- [x] Instagram embed functional
- [x] README.md with full documentation
- [x] Git commits clean and descriptive

## What Gets Deployed

```
_site/
├── index.html           (13 KB) - Complete site
├── calendar.ics         (1.4 KB) - Downloadable calendar
├── js/
│   └── main.js         (2.2 KB) - Event loader
├── netlify.toml        (320 B) - Form config
└── _data/
    ├── events.js       (YAML parser)
    └── events.yml      (Event config)
```

## Build Command

**Command:** `bun run build`
**Duration:** ~0.2 seconds
**Output:** Optimized files in `_site/`

## Environment Variables

**Currently:** None required (static site)

**For Phase 3 (Sendgrid):** Will need to add `SENDGRID_API_KEY`

## Forms Configuration

Two forms are pre-configured in Netlify:

1. **impact-stories**
   - Collects community impact feedback
   - Fields: name, email (optional), story (required)
   - Submissions viewable in Netlify Forms dashboard

2. **email-signup**
   - Email list signup
   - Fields: email (required), name (optional)
   - Ready for Sendgrid automation

## Post-Deployment

### 1. Verify Site

Visit: https://omahasoundry.netlify.app (or your custom domain once DNS is set)

Check:
- [ ] Homepage loads and is responsive
- [ ] All sections visible (impact, calendar, email, instagram)
- [ ] Navigation anchors work
- [ ] Forms are functional
- [ ] Calendar link downloads .ics file
- [ ] Instagram embed displays

### 2. Test Forms

**Impact Form:**
1. Go to impact section
2. Fill in test story
3. Submit
4. Check Netlify dashboard (Forms tab) for submission

**Email Form:**
1. Go to email signup section
2. Enter test email
3. Submit
4. Check Netlify dashboard for signup

### 3. Update Content

Once deployed, you can update content by:

**Events (Calendar):**
- Edit `src/_data/events.yml`
- Commit and push
- Netlify auto-rebuilds

**Anecdotes:**
- Edit `src/index.html` (impact section)
- Commit and push
- Netlify auto-rebuilds

**Styling:**
- Edit `src/index.html` (Tailwind classes)
- Or `src/css/style.css` (custom styles)
- Commit and push

### 4. Monitor Forms

Netlify Forms Dashboard:
- https://app.netlify.com/sites/omahasoundry/forms
- View all submissions
- Export as CSV if needed

## Next Steps (Optional)

### Phase 3: Sendgrid Integration

When ready to send emails to subscribers:

1. Create Sendgrid account
2. Get API key
3. Create Netlify function: `netlify/functions/subscribe.js`
4. Set environment variable: `SENDGRID_API_KEY`
5. Update form to call function

See README.md section "Configure Sendgrid Integration"

### Enhancements

Consider adding:
- Photo gallery for past events
- Testimonial carousel
- RSVP system
- Blog section
- Newsletter archive

## Support

All source code is in Git. To rollback:

```bash
git log --oneline          # See all commits
git revert <commit-sha>    # Undo a commit
git push                   # Deploy reverted version
```

## Contact

For questions or issues:
- Check README.md (comprehensive guide)
- Review source code in `src/` directory
- Check Netlify deployment logs

---

**Ready to deploy!** Push to GitHub and Netlify will handle the rest.

```bash
git push origin main
```

Your site will be live within 1-2 minutes.
