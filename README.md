[![Netlify Status](https://api.netlify.com/api/v1/badges/044a6266-766e-4756-a05a-4f2d3223e68e/deploy-status)](https://app.netlify.com/projects/omahasoundry/deploys)

# Soundry

Experimental music education by [Stacey Barelos](https://staceybarelos.com/soundry/) in Omaha NE 

## Requirements

- \*nix
- [Bun](https://bun.sh/) as drop-in Node interpreter replacement, package manager and test runner
- (optional) [volta](https://volta.sh/) for node ver wrangling
- (optional) [Netlify CLI](https://docs.netlify.com/cli/get-started/) for managing live deployments

## Stack

- [Astro](https://astro.build/) for static site generation and light SSE
- [Biome](https://biomejs.dev/) for lint
- [Playwright](https://playwright.dev/) for mobile and desktop browser testing
- [vitest](https://vitest.dev/) for unit tests

## Local Development

```
# install dependencies
bun install --development
bunx playwright install --with-deps

# start local astro server w/ HMR
bun run dev
```

### Deploy site via CI

The Netlify GitHub app is installed for this repo, which creates a "preview deployment" on (non-draft) Pull Requests.

Merges to `main` (protected branch) will deploy the production site.

### Deploy site Manually

```
# install netlify CLI globally
bun install -g netlify-cli

# authenticate
netlify login

# link repo with Netlify project
netlify link

# create a test deployment
netlify deploy

# after validation, deploy production
netlify deploy --production
```

### Lint and Tests

Pull Requests must pass lint and include relevant unit/end-to-end tests. 

Accessibility for motion-sensitivity, color, fonts, reduced scrolling, tapping affordances, "go to top" are table stakes.

This project uses Husky hooks which you can install locally to automatically lint and test on pre-commit and pre-push.

```
bunx husky init
```

You can run lint (via biome) manually

```
bun run lint # check formatting
bun run format # auto-fix formatting
```

You must add/update unit tests for code changes. 

End-to-end tests are strongly recommended for commits that touch the frontend.

```
bun run test:unit # vitest
bun run test:e2e # Playwright mobile/ desktop browsers
bun run test:a11y # Accessibility via axe
bun run test:lighthouse # Lighthouse audit (SEO, perf)
```
