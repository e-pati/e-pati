import { expect, test } from '@playwright/test'

const email = process.env.VETCEP_SMOKE_EMAIL
const password = process.env.VETCEP_SMOKE_PASSWORD

test.describe('Prod smoke', () => {
  test.skip(!email || !password, 'VETCEP_SMOKE_EMAIL ve VETCEP_SMOKE_PASSWORD gerekli')

  test('landing, super admin login ve admin dashboard canlı çalışmalı', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=VetCep').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Giriş Yap|Klinik Girişi/ }).first()).toHaveAttribute('href', '/login')

    await page.goto('/login')
    await page.locator('input[type="email"]').fill(email as string)
    await page.locator('input[type="password"]').fill(password as string)
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 30000 })
    await expect(page.getByText(/Admin Pano|Admin metrikleri|Toplam Klinik/).first()).toBeVisible({ timeout: 30000 })
  })
})
