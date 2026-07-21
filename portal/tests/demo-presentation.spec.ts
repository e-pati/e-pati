import { expect, test } from '@playwright/test'

test.describe('Faz 0 sunum kumandası', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo-akisi')
    await page.getByRole('button', { name: 'Tüm demo durumlarını sıfırla' }).click()
  })

  test('25 dakikalık yedi bölümü sırayla yönetir', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '25 dakikada vatandaş deneyiminden ulusal karar desteğine' })).toBeVisible()
    await expect(page.getByText('Hedef 25:00')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sunumu başlat' })).toBeVisible()

    await page.getByRole('button', { name: 'Sunumu başlat' }).click()
    await expect(page.getByTestId('presentation-current-stage')).toHaveText('Açılış ve konumlandırma')
    await expect(page.getByTestId('presentation-timer')).toHaveText('00:00')

    await page.getByRole('button', { name: /Sonraki bölüme geç/ }).click()
    await expect(page.getByTestId('presentation-current-stage')).toHaveText('Vatandaş girişi ve mobil kayıtlar')
    await expect(page.getByRole('link', { name: /Vatandaş girişini aç/ })).toHaveAttribute('target', '_blank')
    await expect(page.getByRole('link', { name: 'Mobil geçiş sayfası' })).toBeVisible()
  })

  test('klinik oturumu açıkken sunum kumandası erişilebilir kalır', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'epati-logged-in',
        value: 'true',
        url: 'http://localhost:3001',
      },
    ])

    await page.goto('/demo-akisi')
    await expect(page).toHaveURL('/demo-akisi')
    await expect(page.getByText('Sunum zaman çizelgesi')).toBeVisible()
  })
})
