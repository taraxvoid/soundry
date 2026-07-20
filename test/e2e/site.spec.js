import { expect, test } from '@playwright/test'

test('no console errors on home page', async ({ page }) => {
    const errors = []
    page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text())
    })
    await page.goto('/')
    expect(errors).toHaveLength(0)
})

test('has correct title and meta description', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Soundry/)
    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute('content', /experimental/i)
})

test('no horizontal scroll at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const overflow = await page.evaluate(
        () => document.scrollingElement.scrollWidth > window.innerWidth,
    )
    expect(overflow).toBe(false)
})

test('calendar subscribe links point at the real site domain', async ({
    page,
}) => {
    await page.goto('/')
    const googleLink = page.locator(
        '.calendar-subscribe a[href*="calendar.google.com"]',
    )
    await expect(googleLink).toHaveAttribute(
        'href',
        `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(
            'webcal://soundryomaha.org/events.ics',
        )}`,
    )

    const appleLink = page.locator('.calendar-subscribe a[href^="webcal://"]')
    await expect(appleLink).toHaveAttribute(
        'href',
        'webcal://soundryomaha.org/events.ics',
    )
})

test('tabbing to the skip link and activating it focuses main content', async ({
    page,
}) => {
    await page.goto('/')
    const skipLink = page.locator('a.skip-link')
    await expect(skipLink).toHaveAttribute('href', '#main')

    await page.keyboard.press('Tab')
    await expect(skipLink).toBeFocused()

    await page.keyboard.press('Enter')
    await expect(page.locator('#main')).toBeFocused()
})

test('transitions are near-instant under prefers-reduced-motion', async ({
    page,
}) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')

    const duration = await page
        .locator('.signup-button')
        .evaluate((el) => getComputedStyle(el).transitionDuration)
    expect(
        duration.split(',').every((d) => Number.parseFloat(d) <= 0.001),
    ).toBe(true)
})

test('nav links point to expected sections', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const nav = page.locator('.nav-links')
    await expect(nav.getByRole('link', { name: 'Events' })).toHaveAttribute(
        'href',
        '#events',
    )
    await expect(nav.getByRole('link', { name: 'Donate' })).toHaveAttribute(
        'href',
        '#donate',
    )
    await expect(nav.getByRole('link', { name: 'Signup' })).toHaveAttribute(
        'href',
        '#signup',
    )

    const instagram = nav.getByRole('link', { name: 'Instagram' })
    await expect(instagram).toHaveAttribute(
        'href',
        'https://www.instagram.com/omahasoundry/',
    )
    await expect(instagram).toHaveAttribute('target', '_blank')
    await expect(instagram).toHaveAttribute('rel', 'noopener noreferrer')

    await expect(page.locator('#events')).toBeAttached()
    await expect(page.locator('#about')).toBeAttached()
    await expect(page.locator('#donate')).toBeAttached()
    await expect(page.locator('#signup')).toBeAttached()
})

test('donate section links to Venmo and PayPal', async ({ page }) => {
    await page.goto('/')
    const donate = page.locator('#donate')

    const venmo = donate.getByRole('link', { name: /venmo/i })
    await expect(venmo).toHaveAttribute(
        'href',
        'https://venmo.com/u/omahasoundry',
    )
    await expect(venmo).toHaveAttribute('target', '_blank')

    const paypal = donate.getByRole('link', { name: /paypal/i })
    await expect(paypal).toHaveAttribute(
        'href',
        'https://www.paypal.com/US/fundraiser/charity/5506255',
    )
    await expect(paypal).toHaveAttribute('target', '_blank')
})

test('events calendar lists upcoming events with calendar links', async ({
    page,
}) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'))
    await page.goto('/')
    const calendar = page.locator('#events')
    await expect(
        calendar.getByRole('heading', { name: /Upcoming Events/ }),
    ).toBeVisible()

    const cards = calendar.locator('wa-card')
    await expect(cards.first()).toBeVisible()

    const addToCalendar = cards
        .first()
        .getByRole('link', { name: /Add to Calendar/ })
    await expect(addToCalendar).toHaveAttribute('href', /\/events\/.+\.ics$/)
})

test('hides past events and keeps future events visible', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-06-20T12:00:00'))
    await page.goto('/')

    await expect(
        page.locator('wa-card[data-event-date="2026-06-16"]'),
    ).toHaveAttribute('hidden', '')
    await expect(
        page.locator('wa-card[data-event-date="2026-06-16"]'),
    ).toHaveAttribute('hidden', '')
    await expect(
        page.locator('wa-card[data-event-date="2026-07-28"]'),
    ).not.toHaveAttribute('hidden', '')
    await expect(page.locator('#no-events-message')).toHaveAttribute(
        'hidden',
        '',
    )
})

test('shows the no-events message once every event is in the past', async ({
    page,
}) => {
    await page.clock.setFixedTime(new Date('2027-01-01T12:00:00'))
    await page.goto('/')

    const cards = page.locator('#events wa-card[data-event-date]')
    await expect(cards.first()).toHaveAttribute('hidden', '')
    await expect(cards.last()).toHaveAttribute('hidden', '')
    await expect(page.locator('#no-events-message')).not.toHaveAttribute(
        'hidden',
        '',
    )
})

test('shows all events when every event is in the future', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-01-01T12:00:00'))
    await page.goto('/')

    const cards = page.locator('#events wa-card[data-event-date]')
    await expect(cards.first()).not.toHaveAttribute('hidden', '')
    await expect(cards.last()).not.toHaveAttribute('hidden', '')
    await expect(page.locator('#no-events-message')).toHaveAttribute(
        'hidden',
        '',
    )
})

test('email signup form requires an email address', async ({ page }) => {
    await page.goto('/')
    const form = page.locator('#signup-form')
    const emailInput = form.locator('#signup-email')
    const submitButton = form.locator('#signup-submit')

    await expect(emailInput).toHaveAttribute('required', '')

    await submitButton.click()
    await expect(emailInput).toBeFocused()
})

test('events.ics feed returns a valid calendar', async ({ request }) => {
    const response = await request.get('/events.ics')
    expect(response.ok()).toBeTruthy()
    expect(response.headers()['content-type']).toContain('text/calendar')

    const body = await response.text()
    expect(body).toContain('BEGIN:VCALENDAR')
    expect(body).toContain('END:VCALENDAR')
})
