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

test.describe('Hastalar Sayfası', () => {
  test('hastalar sayfası yüklenmeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/patients')
    await expect(page).toHaveURL(/\/patients/, { timeout: 10000 })
    // Header veya sayfa içeriği yüklenmeli
    await expect(page.locator('h1, [class*="title"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('arama input görünür olmalı', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/patients')
    await expect(page.locator('input[type="text"], input[placeholder*="ara"]').first()).toBeVisible({ timeout: 10000 })
  })

  test('yeni hasta sayfası erişilebilir', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/patients/new')
    await expect(page).toHaveURL(/\/patients\/new/)
    await expect(page.locator('form, input, textarea').first()).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Hasta Ekleme Formu', () => {
  test('/patients/new sayfası yüklenmeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/patients/new')
    // Form veya input görünür olmalı
    await expect(page.locator('input, textarea').first()).toBeVisible({ timeout: 10000 })
  })

  test('submit butonu mevcut olmalı', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/patients/new')
    await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 10000 })
  })

  test('zorunlu alanlar olmadan form hata vermeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/patients/new')
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('p.text-destructive, [class*="error"], [class*="destructive"]').first()).toBeVisible({ timeout: 3000 })
  })
})
