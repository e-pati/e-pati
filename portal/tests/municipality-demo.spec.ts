import { expect, test } from '@playwright/test'

test.describe('Sokak hayvanı belediye demo akışı', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/belediye')
    await page.getByRole('button', { name: 'Demo akışını sıfırla' }).click()
  })

  test('barınak girişinden sahiplendirme ilanına kadar senaryoyu tamamlar', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Barınak kabulünden güvenli sahiplendirmeye izlenebilir süreç' })).toBeVisible()
    await expect(page.getByText('Belediye operasyon simülasyonu')).toBeVisible()

    await page.getByRole('link', { name: /Demo akışını başlat/ }).click()
    await expect(page.getByRole('heading', { name: 'Barınak kabul kaydı' })).toBeVisible()
    await expect(page.locator('input').first()).toHaveValue('Dost')
    await page.getByRole('button', { name: /Kabulü kaydet ve ilerle/ }).click()

    await expect(page).toHaveURL('/belediye/kisirlastirma')
    await expect(page.getByText('KSR-2026-ANK-01842')).toBeVisible()
    await page.getByRole('checkbox', { name: /Operasyon kaydını doğruladım/ }).check()
    await page.getByRole('button', { name: /İşlemi kaydet ve ilerle/ }).click()

    await expect(page).toHaveURL('/belediye/sahiplendirme/yeni')
    await expect(page.locator('input').first()).toHaveValue('Dost sıcak bir yuva arıyor')
    await page.getByRole('button', { name: /İlanı yayımla/ }).click()

    await expect(page.getByText('İlan başarıyla yayımlandı')).toBeVisible()
    await expect(page.getByText('Yayında · Demo')).toBeVisible()
    await expect(page.getByText('Kısırlaştırıldı', { exact: true })).toBeVisible()
    await expect(page.getByText('Keçiören / Ankara', { exact: true })).toBeVisible()
  })

  test('klinik oturumu açıkken belediye demosu erişilebilir kalır', async ({ context, page }) => {
    await context.addCookies([
      {
        name: 'epati-logged-in',
        value: 'true',
        url: 'http://localhost:3001',
      },
    ])

    await page.goto('/belediye')
    await expect(page).toHaveURL('/belediye')
    await expect(page.getByText('Dost’un belediye süreci')).toBeVisible()
  })
})
