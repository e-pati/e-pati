import { expect, test } from '@playwright/test'

const demoRoutes = [
  { path: '/vatandas-giris', marker: 'Vatandaş Girişi' },
  { path: '/get-app?source=edevlet-demo', marker: 'Vatandaş girişi tamamlandı' },
  { path: '/demo-akisi', marker: 'Sunum zaman çizelgesi' },
  { path: '/hayvancilik', marker: 'Kayıtlı demo işletmeleri' },
  { path: '/hayvancilik/isletmeler/yeni', marker: 'Yeni işletme kaydı' },
  { path: '/hayvancilik/hayvanlar/yeni', marker: 'Küpe ile hayvan girişi' },
  { path: '/hayvancilik/hareket', marker: 'İşletmeler arası hayvan hareketi' },
  { path: '/hayvancilik/hayvanlar/sarikiz', marker: 'Sarıkız' },
  { path: '/belediye', marker: 'Dost’un belediye süreci' },
  { path: '/belediye/barinak-giris', marker: 'Barınak kabul kaydı' },
  { path: '/belediye/kisirlastirma', marker: 'Kısırlaştırma kaydı' },
  { path: '/belediye/sahiplendirme/yeni', marker: 'Sahiplendirme ilanı' },
  { path: '/bakanlik', marker: 'Ulusal Hayvan Sağlığı Görünümü' },
] as const

test.describe('Faz 0 mobil demo dayanıklılığı', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  for (const route of demoRoutes) {
    test(`${route.path} yatay taşma veya çalışma zamanı hatası üretmemeli`, async ({ page }) => {
      const pageErrors: string[] = []
      page.on('pageerror', error => pageErrors.push(error.message))

      await page.goto(route.path)
      await expect(page.getByText(route.marker, { exact: false }).first()).toBeVisible()

      const viewportMetrics = await page.evaluate(() => ({
        viewportWidth: window.innerWidth,
        documentWidth: document.documentElement.scrollWidth,
      }))

      expect(viewportMetrics.documentWidth).toBeLessThanOrEqual(viewportMetrics.viewportWidth + 1)
      expect(pageErrors).toEqual([])
    })
  }
})
