import { expect, test } from '@playwright/test'

test.describe('VetCep portal girişi', () => {
  test('kurumsal portal kimliğini ve doğru bağlantıları göstermeli', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', error => pageErrors.push(error.message))

    await page.goto('/login')

    await expect(page).toHaveTitle(/Portal girişi \| VetCep/)
    await expect(page.getByRole('heading', { name: 'Kayıtları yöneten ekibin çalışma alanı.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Portal girişi' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Demo görüşmesi talep et' })).toHaveAttribute('href', '/demo-talep')
    await expect(page.locator('a[href="/clinic-onboarding"]')).toHaveCount(0)
    await expect(page.getByLabel('E-posta adresi')).toBeVisible()
    await expect(page.getByLabel('Şifre', { exact: true })).toBeVisible()
    expect(pageErrors).toEqual([])
  })

  test('koyu sistem tercihinde form kontrastını korumalı', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/login')

    const colors = await page.getByLabel('E-posta adresi').evaluate(element => {
      const style = window.getComputedStyle(element)
      return {
        background: style.backgroundColor,
        foreground: style.color,
      }
    })

    expect(colors.background).toBe('rgb(255, 255, 255)')
    expect(colors.foreground).not.toBe(colors.background)
    await expect(page.getByRole('heading', { name: 'Portal girişi' })).toBeVisible()
  })

  test('form alanlarını doğrulamalı ve şifre görünürlüğünü değiştirmeli', async ({ page }) => {
    await page.goto('/login')

    await page.getByRole('button', { name: 'Giriş yap' }).click()
    await expect(page.getByText('Geçerli bir e-posta adresi girin.')).toBeVisible()
    await expect(page.getByText('Şifre en az 6 karakter olmalıdır.')).toBeVisible()

    const passwordInput = page.getByLabel('Şifre', { exact: true })
    await passwordInput.fill('ornek-sifre')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    await page.getByRole('button', { name: 'Şifreyi göster' }).click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await expect(page.getByRole('button', { name: 'Şifreyi gizle' })).toBeVisible()
  })

  test('390px mobil görünümde taşmamalı ve eylemler dokunulabilir olmalı', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/login')

    const metrics = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }))
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 1)

    for (const target of [
      page.getByRole('button', { name: 'Giriş yap' }),
      page.getByRole('button', { name: 'Şifre desteği' }),
      page.getByRole('button', { name: 'Şifreyi göster' }),
      page.getByRole('link', { name: 'Ana sayfa', exact: true }),
    ]) {
      const box = await target.boundingBox()
      expect(box).not.toBeNull()
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44)
    }
  })
})
