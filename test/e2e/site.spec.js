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

test('nav links point to expected sections', async ({ page }) => {
    await page.goto('/')
    const nav = page.locator('.nav-links')
    await expect(
        nav.getByRole('link', { name: 'Upcoming Events' }),
    ).toHaveAttribute('href', '#calendar')
    await expect(nav.getByRole('link', { name: 'About' })).toHaveAttribute(
        'href',
        '#about',
    )
    await expect(nav.getByRole('link', { name: 'Support' })).toHaveAttribute(
        'href',
        '#donate',
    )
    await expect(nav.getByRole('link', { name: 'Email List' })).toHaveAttribute(
        'href',
        '#signup',
    )

    await expect(page.locator('#calendar')).toBeAttached()
    await expect(page.locator('#about')).toBeAttached()
    await expect(page.locator('#donate')).toBeAttached()
    await expect(page.locator('#signup')).toBeAttached()
})

test('mobile nav toggle opens and closes the menu', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await page.goto('/')

    const toggle = page.locator('#nav-toggle')
    const mobileMenu = page.locator('#nav-mobile')

    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(mobileMenu).not.toHaveClass(/open/)

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(mobileMenu).toHaveClass(/open/)

    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await expect(mobileMenu).not.toHaveClass(/open/)
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
    const calendar = page.locator('#calendar')
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

    const cards = page.locator('#calendar wa-card[data-event-date]')
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

    const cards = page.locator('#calendar wa-card[data-event-date]')
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
