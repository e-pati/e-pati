import { expect, test, type Page } from '@playwright/test'
import { mockAuthenticatedSession, superAdminUser } from './helpers/auth'

async function setLoggedIn(page: Page) {
  await mockAuthenticatedSession(page, superAdminUser)
}

test.describe('Ürün akışları', () => {
  const protectedPages = [
    { path: '/billing', text: /Abonelik|Klinik/ },
    { path: '/appointments', text: /Randevular/ },
    { path: '/campaigns/lost-patients', text: /Kayıp Hasta|Kampanya/ },
    { path: '/analytics', text: /Analitik|Kayıp hasta/ },
    { path: '/settings/whatsapp', text: /WhatsApp/ },
  ]

  for (const { path, text } of protectedPages) {
    test(`${path} sayfası giriş sonrası yüklenmeli`, async ({ page }) => {
      await setLoggedIn(page)
      await page.goto(path)
      await expect(page).toHaveURL(new RegExp(path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
      await expect(page.getByText(text).first()).toBeVisible({ timeout: 10000 })
    })
  }

  test('randevu oluşturma sayfasında temel alanlar görünmeli', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/appointments/new')
    await expect(page.getByText('Hasta Seçimi')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Randevu Bilgileri')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('admin klinik listesi ve detay route guard altında erişilebilir olmalı', async ({ page }) => {
    await setLoggedIn(page)
    await page.goto('/admin/clinics')
    await expect(page.getByText('Klinikler').first()).toBeVisible({ timeout: 10000 })

    await page.goto('/admin/clinics/test-clinic')
    await expect(page).toHaveURL(/\/admin\/clinics\/test-clinic/)
    await expect(page.getByText(/Klinik detayı|Admin klinik detay servisi|Klinik detayı yükleniyor/).first()).toBeVisible({ timeout: 10000 })
  })
})
