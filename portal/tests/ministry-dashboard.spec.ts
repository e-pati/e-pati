import { expect, test } from '@playwright/test'

test.describe('Bakanlık konsolu', () => {
  test('81 ili gösterir ve haritadan il drill-down yapar', async ({ page }) => {
    await page.goto('/bakanlik')

    await expect(page.getByRole('heading', { name: 'Ulusal Hayvan Sağlığı Görünümü' })).toBeVisible()
    await expect(page.getByText('Sentetik Veri · Demo', { exact: true })).toBeVisible()
    await expect(page.getByTestId('province-shape')).toHaveCount(81)
    await expect(page.getByText('T.C. Tarım ve Orman Bakanlığı CBS · TATUS İl Sınırları katmanı')).toBeVisible()
    await expect(page.getByTestId('risk-legend-low')).toContainText('Normal39 il')
    await expect(page.getByTestId('risk-legend-medium')).toContainText('İzleniyor41 il')
    await expect(page.getByTestId('risk-legend-high')).toContainText('Kritik1 il')
    await expect(page.getByTestId('province-risk-legend')).toContainText('İl risk dağılımı')
    await expect(
      page.getByText('Risk statüsü, aktif erken uyarı adedinden farklıdır;', { exact: false }),
    ).toBeVisible()

    await expect(page.getByRole('heading', { name: 'Ankara' })).toBeVisible()
    await expect(page.getByTestId('province-map-tooltip')).toContainText(
      'Aktif erken uyarı yok',
    )
    await page.getByRole('button', { name: 'Konya ilini seç' }).hover()
    await expect(page.getByTestId('province-map-tooltip')).toContainText('42 · Konya')
    await expect(page.getByTestId('province-map-tooltip')).toContainText('Aşılama kapsamı %')
    await expect(page.getByTestId('province-map-tooltip')).toContainText('1 aktif erken uyarı')
    await page.getByRole('button', { name: 'Konya ilini seç' }).click()

    await expect(page.getByRole('heading', { name: 'Konya' })).toBeVisible()
    await expect(page.getByText('Bu il için 1 aktif erken uyarı sinyali bulunuyor.')).toBeVisible()

    await expect(page.getByTestId('vaccination-chart')).toBeVisible()
    await expect(page.getByTestId('population-chart')).toBeVisible()

    await page.getByRole('button', { name: 'Kars erken uyarısını incele' }).click()
    await expect(page.getByRole('heading', { name: 'Kars' })).toBeVisible()
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
