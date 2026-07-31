import { expect, test } from '@playwright/test'

test.describe('VetCep landing page', () => {
  test('marka metadata varlıkları public erişilebilir olmalı', async ({ request }) => {
    const openGraphImage = await request.get('/opengraph-image')
    const icon = await request.get('/icon.svg')

    expect(openGraphImage.status()).toBe(200)
    expect(openGraphImage.headers()['content-type']).toContain('image/png')
    expect(icon.status()).toBe(200)
    expect(icon.headers()['content-type']).toContain('image/svg+xml')
  })

  test('bağımsız platform konumlandırmasını ve güvenli CTA akışını göstermeli', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))

    await page.goto('/')

    await expect(page).toHaveTitle(/VetCep — Hayvan Sağlığı Kayıt Platformu/)
    await expect(page.getByRole('heading', { level: 1, name: 'Hayvan sağlığında yaşam boyu dijital kayıt.' })).toBeVisible()
    await expect(page.getByText('Bağımsız hayvan sağlığı teknolojisi')).toBeVisible()
    await expect(page.getByText('Sentetik demo kaydı')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Aynı kayıt omurgası, role göre şekillenen deneyimler.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Yerine geçen değil, izinle birlikte çalışan bir katman.' })).toBeVisible()
    await expect(page.getByText('Bu sayfa herhangi bir kurumla mevcut bağlantı, yetkilendirme veya onay iddiası taşımaz.')).toBeVisible()

    await expect(page.getByRole('link', { name: 'Ürün demosu talep et' })).toHaveAttribute('href', '/clinic-onboarding')
    await expect(page.getByRole('link', { name: 'Portal girişi' }).first()).toHaveAttribute('href', '/login')

    await expect(page.getByText('PatiLife')).toHaveCount(0)
    await expect(page.getByText('Fiyatlandırma', { exact: true })).toHaveCount(0)
    await expect(page.getByText('KVKK', { exact: true })).toHaveCount(0)
    expect(pageErrors).toEqual([])
  })

  test('390px mobil görünümde taşmamalı ve temel aksiyonlar dokunulabilir olmalı', async ({ page }) => {
    test.setTimeout(45_000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const viewportMetrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }))

    expect(viewportMetrics.documentWidth).toBeLessThanOrEqual(viewportMetrics.viewportWidth + 1)

    const primaryCta = page.getByRole('link', { name: 'Ürün demosu talep et' })
    const portalCta = page.locator('main').getByRole('link', { name: 'Portal girişi' })
    const mobileMenu = page.getByLabel('Navigasyon menüsünü aç')

    for (const target of [primaryCta, portalCta, mobileMenu]) {
      const box = await target.boundingBox()
      expect(box).not.toBeNull()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })
})
