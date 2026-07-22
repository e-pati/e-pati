import { expect, test } from '@playwright/test'

test.describe('Vatandaş demo girişi', () => {
  test('simülasyon bilgisini gösterir ve geçerli demo formunu yönlendirir', async ({ page }) => {
    await page.goto('/vatandas-giris')

    await expect(page.getByText('Simülasyon / Demo', { exact: true })).toBeVisible()
    await expect(
      page.getByText('Bu ekran gerçek e-Devlet Kapısı değildir', { exact: false }),
    ).toBeVisible()

    await page.getByRole('button', { name: 'e-Devlet ile Giriş Yap' }).click()
    await expect(page.getByText('TC Kimlik No 11 rakamdan oluşmalıdır')).toBeVisible()
    await expect(page.getByText('Şifre en az 4 karakter olmalıdır')).toBeVisible()

    await page.getByLabel('TC Kimlik No').fill('12345678901')
    await page.getByLabel('e-Devlet Şifresi').fill('demo1234')
    await page.getByRole('button', { name: 'e-Devlet ile Giriş Yap' }).click()

    await expect(page).toHaveURL('/get-app?source=edevlet-demo')
    await expect(page.getByText('Vatandaş girişi tamamlandı · Simülasyon')).toBeVisible()
    await expect(page.getByText('Pamuk ve Sarıkız kayıt senaryosu')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hayvan kayıtlarınız her zaman yanınızda' })).toBeVisible()
    await expect(page.getByRole('link', { name: /App Store/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Google Play/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /e-pati-portal/ })).toHaveCount(0)
  })

  test('klinik oturumu açıkken de demo route erişilebilir kalır', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'epati-logged-in',
        value: 'true',
        url: 'http://localhost:3001',
      },
    ])

    await page.goto('/vatandas-giris')

    await expect(page).toHaveURL('/vatandas-giris')
    await expect(page.getByRole('heading', { name: 'Vatandaş Girişi' })).toBeVisible()
  })
})
