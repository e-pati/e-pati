import { expect, test } from '@playwright/test'

test.describe('Bakanlık konsolu', () => {
  test('81 ili gösterir ve haritadan il drill-down yapar', async ({ page }) => {
    await page.goto('/bakanlik')

    await expect(page.getByRole('heading', { name: 'Ulusal Hayvan Sağlığı Görünümü' })).toBeVisible()
    await expect(page.getByText('Sentetik Veri · Demo', { exact: true })).toBeVisible()
    await expect(page.locator('button[aria-label$="ilini seç"]')).toHaveCount(81)

    await expect(page.getByRole('heading', { name: 'Ankara' })).toBeVisible()
    await page.getByRole('button', { name: 'Konya ilini seç' }).click()

    await expect(page.getByRole('heading', { name: 'Konya' })).toBeVisible()
    await expect(page.getByText('Bu il için 1 aktif erken uyarı sinyali bulunuyor.')).toBeVisible()
  })

  test('klinik oturumu açıkken de Bakanlık demosu erişilebilir kalır', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'epati-logged-in',
        value: 'true',
        url: 'http://localhost:3001',
      },
    ])

    await page.goto('/bakanlik')

    await expect(page).toHaveURL('/bakanlik')
    await expect(page.getByText('81 İl Risk ve Kapsama Haritası')).toBeVisible()
  })
})
