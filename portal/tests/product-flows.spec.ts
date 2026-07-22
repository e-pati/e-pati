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

  test('link görünümlü butonlar anchor semantiğini korumalı', async ({ page }) => {
    const baseUiWarnings: string[] = []
    page.on('console', message => {
      if (message.type() === 'warning' && message.text().includes('expected a native <button>')) {
        baseUiWarnings.push(message.text())
      }
    })

    await setLoggedIn(page)

    await page.goto('/appointments')
    const newAppointmentLink = page.getByRole('link', { name: 'Yeni Randevu' })
    await expect(newAppointmentLink).toHaveAttribute('href', '/appointments/new')
    await expect(newAppointmentLink).toHaveJSProperty('tagName', 'A')

    await page.goto('/admin/clinics/test-clinic')
    const backToClinicsLink = page.getByRole('link', { name: 'Kliniklere Dön' })
    await expect(backToClinicsLink).toHaveAttribute('href', '/admin/clinics')
    await expect(backToClinicsLink).toHaveJSProperty('tagName', 'A')

    await page.goto('/billing/success')
    await expect(page.getByRole('link', { name: 'Panele Dön' })).toHaveAttribute('href', '/dashboard')

    expect(baseUiWarnings).toEqual([])
  })
})
