import { test, expect } from '@playwright/test'

async function setLoggedIn(page: any) {
  await page.goto('/login')
  await page.context().addCookies([{
    name: 'epati-logged-in',
    value: '1',
    domain: 'localhost',
    path: '/',
  }])
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-for-test')
  })
}

test.describe('Muayene Formu', () => {
  test('/examinations/new sayfası yüklenmeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/examinations/new')
    await expect(page).toHaveURL(/\/examinations\/new/)
    await expect(page.locator('form').filter({ hasText: 'Hasta Seçimi' })).toBeVisible({ timeout: 10000 })
  })

  test('submit butonu var olmalı', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/examinations/new')
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 })
  })

  test('hasta seçilmeden form hata vermeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/examinations/new')
    await page.locator('button[type="submit"]').click()
    await expect(
      page.locator('[class*="destructive"], [class*="error"]').first()
    ).toBeVisible({ timeout: 3000 })
  })
})

test.describe('Dashboard', () => {
  test('dashboard yüklenmeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 })
    await expect(page.locator('main, [role="main"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('dashboard sayfasında içerik görünmeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/dashboard')
    // Herhangi bir kart veya içerik yüklenmeli
    await expect(page.locator('[class*="Card"], [class*="card"]').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Sayfalar erişilebilir', () => {
  const pages = [
    { path: '/patients', name: 'Hastalar' },
    { path: '/examinations', name: 'Muayeneler' },
    { path: '/vaccinations', name: 'Aşılar' },
    { path: '/notifications', name: 'Bildirimler' },
    { path: '/settings', name: 'Ayarlar' },
  ]

  for (const { path } of pages) {
    test(`${path} sayfası yüklenmeli`, async ({ page }) => {
      await setLoggedIn(page)
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(path))
      await expect(page.locator('body')).toBeVisible()
    })
  }
})
