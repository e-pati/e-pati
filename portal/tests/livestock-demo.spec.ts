import { expect, test } from '@playwright/test'

test.describe('Büyükbaş/küçükbaş demo akışı', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hayvancilik')
    await page.getByRole('button', { name: 'Demo akışını sıfırla' }).click()
  })

  test('işletme kaydından olay geçmişine kadar senaryoyu tamamlar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'İşletmeden hayvan hareketine tek dijital kayıt zinciri' })).toBeVisible()
    await expect(page.getByText('HAYBİS entegrasyon simülasyonu')).toBeVisible()

    await page.getByRole('link', { name: /Demo akışını başlat/ }).click()
    await expect(page.getByRole('heading', { name: 'Yeni işletme kaydı' })).toBeVisible()
    await page.getByRole('button', { name: /İşletmeyi kaydet ve ilerle/ }).click()

    await expect(page).toHaveURL('/hayvancilik/hayvanlar/yeni')
    await expect(page.locator('input').first()).toHaveValue('TR 06 458921')
    await page.getByRole('button', { name: /Küpeyi doğrula ve ilerle/ }).click()

    await expect(page).toHaveURL('/hayvancilik/hareket')
    await expect(page.getByText('Güneş Süt İşletmesi')).toBeVisible()
    await expect(page.getByText('Bereket Besi Çiftliği')).toBeVisible()
    await page.getByRole('checkbox', { name: /Hareket bilgilerini doğruladım/ }).check()
    await page.getByRole('button', { name: /Hareketi onayla ve tamamla/ }).click()

    await expect(page).toHaveURL('/hayvancilik/hayvanlar/sarikiz')
    await expect(page.getByRole('heading', { name: 'Sarıkız' })).toBeVisible()
    await expect(page.getByText('Hareket başarıyla tamamlandı', { exact: true })).toBeVisible()
    await expect(page.getByText('İşletmeler arası hareket tamamlandı', { exact: true })).toBeVisible()
    await expect(page.getByText('Bereket Besi Çiftliği', { exact: true }).first()).toBeVisible()
  })

  test('klinik oturumu açıkken hayvancılık demosu erişilebilir kalır', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'epati-logged-in',
        value: 'true',
        url: 'http://localhost:3001',
      },
    ])

    await page.goto('/hayvancilik')
    await expect(page).toHaveURL('/hayvancilik')
    await expect(page.getByText('Kayıtlı demo işletmeleri')).toBeVisible()
  })
})
