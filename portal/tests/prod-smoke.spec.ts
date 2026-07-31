import { expect, test } from '@playwright/test'

const email = process.env.VETCEP_SMOKE_EMAIL
const password = process.env.VETCEP_SMOKE_PASSWORD
const publicDemoRoutes = [
  { path: '/vatandas-giris', marker: 'Vatandaş Girişi' },
  { path: '/demo-akisi', marker: 'Sunum zaman çizelgesi' },
  { path: '/hayvancilik', marker: 'Kayıtlı demo işletmeleri' },
  { path: '/belediye', marker: 'Dost’un belediye süreci' },
  { path: '/bakanlik', marker: 'Ulusal Hayvan Sağlığı Görünümü' },
] as const

test.describe('Prod smoke', () => {
  for (const route of publicDemoRoutes) {
    test(`${route.path} public demo rotası canlıda erişilebilir olmalı`, async ({ page }) => {
      await page.goto(route.path)

      await expect(page).toHaveURL(route.path)
      await expect(page.getByText(route.marker, { exact: false }).first()).toBeVisible()
    })
  }

  test('landing, super admin login ve admin dashboard canlı çalışmalı', async ({ page }) => {
    test.skip(!email || !password, 'VETCEP_SMOKE_EMAIL ve VETCEP_SMOKE_PASSWORD gerekli')

    await page.goto('/')
    await expect(page.locator('text=VetCep').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Portal girişi|Giriş Yap|Klinik Girişi/i }).first()).toHaveAttribute('href', '/login')

    await page.goto('/login')
    await page.locator('input[type="email"]').fill(email as string)
    await page.locator('input[type="password"]').fill(password as string)
    await page.locator('button[type="submit"]').click()

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 30000 })
    await expect(page.getByText(/Admin Pano|Admin metrikleri|Toplam Klinik/).first()).toBeVisible({ timeout: 30000 })
  })
})
