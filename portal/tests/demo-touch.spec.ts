import { expect, type Locator, test } from '@playwright/test'

async function expectTouchTarget(locator: Locator) {
  const box = await locator.boundingBox()

  expect(box, 'Eylem mobil görünümde görünür olmalı').not.toBeNull()
  expect(box?.height, 'Birincil eylem en az 44px dokunma yüksekliğine sahip olmalı').toBeGreaterThanOrEqual(44)
}

test.describe('Faz 0 mobil dokunma akışları', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  })

  test('üretici akışı mobilde işletmeden olay geçmişine tamamlanmalı', async ({ page }) => {
    await page.goto('/hayvancilik')
    await page.getByRole('button', { name: 'Demo akışını sıfırla' }).click()

    const startButton = page.getByRole('link', { name: /Demo akışını başlat/ })
    await expectTouchTarget(startButton)
    await startButton.click()

    const enterpriseButton = page.getByRole('button', { name: /İşletmeyi kaydet ve ilerle/ })
    await expectTouchTarget(enterpriseButton)
    await enterpriseButton.click()

    const animalButton = page.getByRole('button', { name: /Küpeyi doğrula ve ilerle/ })
    await expectTouchTarget(animalButton)
    await animalButton.click()

    await page.getByRole('checkbox', { name: /Hareket bilgilerini doğruladım/ }).check()
    const movementButton = page.getByRole('button', { name: /Hareketi onayla ve tamamla/ })
    await expectTouchTarget(movementButton)
    await movementButton.click()

    await expect(page).toHaveURL('/hayvancilik/hayvanlar/sarikiz')
    await expect(page.getByText('Hareket başarıyla tamamlandı', { exact: true })).toBeVisible()
  })

  test('belediye akışı mobilde kabulden ilana tamamlanmalı', async ({ page }) => {
    await page.goto('/belediye')
    await page.getByRole('button', { name: 'Demo akışını sıfırla' }).click()

    const startButton = page.getByRole('link', { name: /Demo akışını başlat/ })
    await expectTouchTarget(startButton)
    await startButton.click()

    const admissionButton = page.getByRole('button', { name: /Kabulü kaydet ve ilerle/ })
    await expectTouchTarget(admissionButton)
    await admissionButton.click()

    await page.getByRole('checkbox', { name: /Operasyon kaydını doğruladım/ }).check()
    const sterilizationButton = page.getByRole('button', { name: /İşlemi kaydet ve ilerle/ })
    await expectTouchTarget(sterilizationButton)
    await sterilizationButton.click()

    const publishButton = page.getByRole('button', { name: /İlanı yayımla/ })
    await expectTouchTarget(publishButton)
    await publishButton.click()

    await expect(page.getByText('İlan başarıyla yayımlandı')).toBeVisible()
    await expect(page.getByText('Yayında · Demo')).toBeVisible()
  })
})
