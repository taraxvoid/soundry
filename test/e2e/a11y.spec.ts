import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('/ has no axe violations', async ({ page }) => {
    await page.goto('/')
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
