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

    await expect(page.getByRole('link', { name: 'Demo görüşmesi talep et' }).first()).toHaveAttribute('href', '/demo-talep')
    await expect(page.getByRole('link', { name: 'Portal girişi' }).first()).toHaveAttribute('href', '/login')

    // Eski klinik-SaaS konumlandırmasına ait rota kullanılmamalı.
    await expect(page.locator('a[href="/clinic-onboarding"]')).toHaveCount(0)

    await expect(page.getByText('PatiLife')).toHaveCount(0)
    await expect(page.getByText('Fiyatlandırma', { exact: true })).toHaveCount(0)
    await expect(page.getByText('KVKK', { exact: true })).toHaveCount(0)
    expect(pageErrors).toEqual([])
  })

  test('bölgesel harita sentetik veri kümesinden türetilmiş olmalı', async ({ page }) => {
    await page.goto('/')

    // Lejant: renklerin anlamı sayfada yazılı olmalı.
    await expect(page.getByText('Yüksek kapsam')).toBeVisible()
    await expect(page.getByText('Orta kapsam')).toBeVisible()
    await expect(page.getByText('İzlenen bölge').first()).toBeVisible()

    // Sürüm/tarih damgası ve sentetik uyarısı görünür olmalı.
    await expect(page.getByText(/Sentetik veri kümesi · v1\.0 · Temmuz 2026/)).toBeVisible()
    await expect(page.getByText(/gerçek sağlık verisi değildir/)).toBeVisible()

    // 81 il çizilmeli (grid deseni hariç, yalnız il katmanı).
    await expect(
      page.locator('svg[aria-label="Sentetik bölgesel hayvan sağlığı risk haritası"] > g > path[d]'),
    ).toHaveCount(81)
  })

  test('mobil menü Escape tuşu ile kapanmalı', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    const menu = page.getByLabel('Navigasyon menüsünü aç')
    await menu.click()
    await expect(page.getByRole('navigation', { name: 'Mobil navigasyon' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('navigation', { name: 'Mobil navigasyon' })).toBeHidden()
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

    const primaryCta = page.getByRole('link', { name: 'Demo görüşmesi talep et' }).first()
    const portalCta = page.locator('main').getByRole('link', { name: 'Portal girişi' })
    const mobileMenu = page.getByLabel('Navigasyon menüsünü aç')

    for (const target of [primaryCta, portalCta, mobileMenu]) {
      const box = await target.boundingBox()
      expect(box).not.toBeNull()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })
})
