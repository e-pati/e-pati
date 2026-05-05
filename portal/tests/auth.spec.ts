import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('ana sayfa public landing olarak yüklenmeli', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/$/)
    await expect(page.locator('text=VetCep').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Klinik Girişi|Giriş Yap/ }).first()).toHaveAttribute('href', '/login')
  })

  test('login sayfası yüklenmeli ve form elemanları mevcut', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('boş form gönderilince hata mesajları görünmeli', async ({ page }) => {
    await page.goto('/login')
    await page.locator('button[type="submit"]').click()
    // React Hook Form validation hata mesajı - p tag içinde
    await expect(page.locator('p.text-sm.text-destructive').first()).toBeVisible({ timeout: 3000 })
  })

  test('geçersiz e-posta formatı hata vermeli', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('gecersiz')
    await page.locator('button[type="submit"]').click()
    await expect(emailInput).toHaveJSProperty('validity.valid', false)
  })

  test('login olmadan /dashboard\'a gidince /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('login olmadan /patients\'a gidince /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/patients')
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
  })

  test('VetCep başlığı görünür olmalı', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('text=VetCep').first()).toBeVisible()
  })
})
