import { test, expect } from '@playwright/test'

async function loginAsMockVet(page: any) {
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
    await loginAsMockVet(page)
    await page.goto('/examinations/new')
    await expect(page.locator('text=Yeni Muayene')).toBeVisible()
    await expect(page.locator('text=Hasta Seçimi')).toBeVisible()
    await expect(page.locator('text=Muayene Notları')).toBeVisible()
  })

  test('SOAP alanları görünür olmalı', async ({ page }) => {
    await loginAsMockVet(page)
    await page.goto('/examinations/new')
    await expect(page.locator('text=S — Şikayet')).toBeVisible()
    await expect(page.locator('text=O — Bulgular')).toBeVisible()
    await expect(page.locator('text=A — Değerlendirme')).toBeVisible()
    await expect(page.locator('text=P — Plan')).toBeVisible()
  })

  test('hasta seçilmeden form gönderilemez', async ({ page }) => {
    await loginAsMockVet(page)
    await page.goto('/examinations/new')
    await page.getByRole('button', { name: 'Muayeneyi Kaydet' }).click()
    await expect(page.locator('text=Hasta seçiniz').or(page.locator('text=Şikayet giriniz'))).toBeVisible()
  })
})

test.describe('Dashboard', () => {
  test('dashboard yüklenmeli', async ({ page }) => {
    await loginAsMockVet(page)
    await page.goto('/dashboard')
    await expect(page.locator('text=Pano')).toBeVisible()
  })

  test('haftalık muayene grafiği görünür olmalı', async ({ page }) => {
    await loginAsMockVet(page)
    await page.goto('/dashboard')
    await expect(page.locator('text=Haftalık Muayene')).toBeVisible()
  })
})
