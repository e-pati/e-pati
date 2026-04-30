import { test, expect } from '@playwright/test'

test.describe('Auth', () => {
  test('ana sayfa /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login sayfası görünür ve form elemanları mevcut', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByLabel('E-posta')).toBeVisible()
    await expect(page.getByLabel('Şifre')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Giriş Yap' })).toBeVisible()
  })

  test('boş form gönderilince hata mesajları görünmeli', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Giriş Yap' }).click()
    await expect(page.locator('text=Geçerli bir e-posta giriniz').or(page.locator('text=Şifre'))).toBeVisible()
  })

  test('geçersiz e-posta formatı hata vermeli', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-posta').fill('gecersiz-email')
    await page.getByRole('button', { name: 'Giriş Yap' }).click()
    await expect(page.locator('text=Geçerli bir e-posta giriniz')).toBeVisible()
  })

  test('login olmadan /dashboard\'a gidince /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login olmadan /patients\'a gidince /login\'e yönlendirmeli', async ({ page }) => {
    await page.goto('/patients')
    await expect(page).toHaveURL(/\/login/)
  })
})
