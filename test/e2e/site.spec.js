import { expect, test } from '@playwright/test'

const _pages = [{ path: '/', titleContains: 'Soundry' }]

test('no console errors on home page', async ({ page }) => {
  const errors = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.goto('/')
  expect(errors).toHaveLength(0)
})
