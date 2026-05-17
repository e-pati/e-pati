import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('ana sayfa public landing olarak yüklenmeli', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('body')).toContainText('VetCep')
    const loginLink = page.getByRole('link', { name: /Giriş|Login/ }).first()
    await expect(loginLink).toBeVisible()
  })

  test('login sayfası yüklenmeli ve form elemanları mevcut', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input#email, input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 15000 })
    await expect(page.locator('input[type="password"], input#password').first()).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('boş form gönderilince hata mesajları görünmeli', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 15000 })
    await page.locator('button[type="submit"]').click()
    // RHF hata sonrası input aria-invalid olmalı veya hata metni görünmeli
    await expect(
      page.locator('input[aria-invalid="true"], [class*="destructive"], p.text-sm').first()
    ).toBeVisible({ timeout: 5000 })
  })

  test('geçersiz e-posta formatı hata vermeli', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input#email, input[type="email"]').first()
    await emailInput.waitFor({ state: 'visible', timeout: 15000 })
    await emailInput.fill('gecersiz-email')
    await page.locator('input[type="password"], input#password').first().fill('sifre123')
    await page.locator('button[type="submit"]').click()
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid).catch(() => false)
    const hasError = await page.locator('[class*="destructive"]').first().isVisible().catch(() => false)
    expect(isInvalid || hasError).toBe(true)
  })

  test('login olmadan /dashboard\'a gidince /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('login olmadan /patients\'a gidince /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/patients')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('super admin login — mock API ile yönlendirme', async ({ page }) => {
    let loginCalled = false
    await page.route('**/auth/clinic/login', async route => {
      loginCalled = true
      // Cookie simüle et
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Set-Cookie': 'epati-logged-in=1; Path=/' },
        body: JSON.stringify({
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          user: { id: 'admin-1', email: 'admin@vetcep.test', fullName: 'VetCep Admin', role: 'SUPER_ADMIN' },
        }),
      })
    })

    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 })
    await page.locator('input[type="email"]').fill('admin@vetcep.test')
    await page.locator('input[type="password"]').first().fill('secret-pass')
    await page.locator('button[type="submit"]').click()
    // Mock API çağrıldı mı kontrol et
    await page.waitForTimeout(2000)
    expect(loginCalled).toBe(true)
    // Kullanıcı login'den çıkmış mı (admin dashboard veya başka sayfaya gitmiş)
    const url = page.url()
    expect(url).not.toContain('/login')
  })

  test('VetCep başlığı görünür olmalı', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('body')).toContainText('VetCep')
  })
})
