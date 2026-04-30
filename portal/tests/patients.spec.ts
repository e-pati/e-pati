import { test, expect } from '@playwright/test'

// Login helper
async function loginAsMockVet(page: any) {
  await page.goto('/login')
  // Mock login için cookie set et
  await page.context().addCookies([{
    name: 'epati-logged-in',
    value: '1',
    domain: 'localhost',
    path: '/',
  }])
  // localStorage'a token ekle
  await page.evaluate(() => {
    localStorage.setItem('accessToken', 'mock-token-for-test')
  })
  await page.goto('/patients')
}

test.describe('Hastalar Sayfası', () => {
  test('hastalar sayfası yüklenmeli', async ({ page }) => {
    await loginAsMockVet(page)
    await expect(page).toHaveURL(/\/patients/)
    await expect(page.locator('text=Hastalar').first()).toBeVisible()
  })

  test('arama kutusu görünür olmalı', async ({ page }) => {
    await loginAsMockVet(page)
    await expect(page.getByPlaceholder('Ad, sahip, mikro çip no...')).toBeVisible()
  })

  test('yeni hasta butonu görünür olmalı', async ({ page }) => {
    await loginAsMockVet(page)
    await expect(page.getByRole('link', { name: 'Yeni Hasta' })).toBeVisible()
  })

  test('tür filtresi görünür olmalı', async ({ page }) => {
    await loginAsMockVet(page)
    await expect(page.locator('text=Tüm Türler')).toBeVisible()
  })
})

test.describe('Hasta Ekleme', () => {
  test('/patients/new sayfası yüklenmeli', async ({ page }) => {
    await loginAsMockVet(page)
    await page.goto('/patients/new')
    await expect(page.locator('text=Yeni Hasta')).toBeVisible()
    await expect(page.getByLabel(/Hayvan Adı/)).toBeVisible()
  })

  test('zorunlu alanlar olmadan form gönderilemez', async ({ page }) => {
    await loginAsMockVet(page)
    await page.goto('/patients/new')
    await page.getByRole('button', { name: 'Hastayı Kaydet' }).click()
    await expect(page.locator('text=En az 2 karakter').or(page.locator('text=Tür seçiniz'))).toBeVisible()
  })
})
