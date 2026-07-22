import { test, expect } from '@playwright/test'
import { clinicUser, superAdminUser } from './helpers/auth'

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
          user: superAdminUser,
        }),
      })
    })
    await page.route('**/auth/me', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(superAdminUser),
    }))

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
    await expect.poll(() => page.evaluate(() => localStorage.getItem('epati-auth'))).toBeNull()
  })

  test('korumalı sayfa açılışında httpOnly oturumu /auth/me ile doğrulamalı', async ({ page }) => {
    let meCallCount = 0
    await page.route('**/auth/me', route => {
      meCallCount += 1
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(clinicUser),
      })
    })
    await page.context().addCookies([{
      name: 'epati-logged-in',
      value: '1',
      domain: 'localhost',
      path: '/',
      sameSite: 'Lax',
    }])

    await page.goto('/dashboard')
    await expect(page.getByText('Dr. Test Veteriner').first()).toBeVisible({ timeout: 10000 })
    expect(meCallCount).toBe(1)
    await expect.poll(() => page.evaluate(() => localStorage.getItem('epati-auth'))).toBeNull()
  })

  test('401 sonrası refresh yapıp başarısız isteği bir kez tekrarlamalı', async ({ page }) => {
    let meCallCount = 0
    let refreshCallCount = 0

    await page.route('**/auth/me', route => {
      meCallCount += 1
      return route.fulfill({
        status: meCallCount === 1 ? 401 : 200,
        contentType: 'application/json',
        body: JSON.stringify(meCallCount === 1 ? { message: 'Token expired' } : clinicUser),
      })
    })
    await page.route('**/auth/refresh', route => {
      refreshCallCount += 1
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
    })
    await page.context().addCookies([{
      name: 'epati-logged-in', value: '1', domain: 'localhost', path: '/', sameSite: 'Lax',
    }])

    await page.goto('/dashboard')
    await expect(page.getByText('Dr. Test Veteriner').first()).toBeVisible({ timeout: 10000 })
    expect(refreshCallCount).toBe(1)
    expect(meCallCount).toBe(2)
  })

  test('refresh başarısızsa istemci oturumunu temizleyip login sayfasına dönmeli', async ({ page }) => {
    await page.route('**/auth/me', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Token expired' }),
    }))
    await page.route('**/auth/refresh', route => route.fulfill({
      status: 401,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Refresh expired' }),
    }))
    await page.context().addCookies([{
      name: 'epati-logged-in', value: '1', domain: 'localhost', path: '/', sameSite: 'Lax',
    }])

    await page.goto('/patients')
    await expect(page).toHaveURL(/\/login\?next=%2Fpatients/, { timeout: 10000 })
    const marker = await page.context().cookies().then(cookies => (
      cookies.find(cookie => cookie.name === 'epati-logged-in')
    ))
    expect(marker).toBeUndefined()
  })

  test('çıkış backend erişiminden bağımsız olarak yerel oturumu temizlemeli', async ({ page }) => {
    await page.route('**/auth/me', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(clinicUser),
    }))
    await page.route('**/auth/logout', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Service unavailable' }),
    }))
    await page.context().addCookies([{
      name: 'epati-logged-in', value: '1', domain: 'localhost', path: '/', sameSite: 'Lax',
    }])

    await page.goto('/dashboard')
    await page.getByRole('button', { name: /Dr\. Test Veteriner/ }).click()

    await expect(page).toHaveURL(/\/login$/, { timeout: 10000 })
    const marker = await page.context().cookies().then(cookies => (
      cookies.find(cookie => cookie.name === 'epati-logged-in')
    ))
    expect(marker).toBeUndefined()
  })

  test('VetCep başlığı görünür olmalı', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('body')).toContainText('VetCep')
  })
})
