import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('/ has no axe violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
})

test('the open mobile nav menu has no axe violations', async ({ page }) => {
    await page.setViewportSize({ width: 480, height: 800 })
    await page.goto('/')
    await page.locator('#nav-toggle').click()
    await expect(page.locator('#nav-mobile')).toHaveClass(/open/)

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
})

test('the invalid signup form has no axe violations', async ({ page }) => {
    await page.goto('/')
    await page.locator('#signup-submit').click()
    await expect(page.locator('#signup-email')).toBeFocused()

    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
})
