import { test, expect } from '@playwright/test'

/**
 * Example E2E test
 * This is a placeholder test to verify Playwright setup
 */
test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Verify the page title contains expected text
    await expect(page).toHaveTitle(/GroomArt|SalonFlow/)

    // Verify the page loaded successfully
    const heading = page.locator('h1, h2').first()
    await expect(heading).toBeVisible()
  })

  test('should have no console errors', async ({ page }) => {
    const consoleErrors: string[] = []

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    await page.goto('/')

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle')

    // Assert no console errors occurred
    expect(consoleErrors).toHaveLength(0)
  })
})
