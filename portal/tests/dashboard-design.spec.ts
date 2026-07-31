import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

test.describe('Klinik dashboard kurumsal görünüm', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page)

    await page.route('**/subscription/current', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'active', cancelAtPeriodEnd: false }),
    }))
    await page.route('**/notifications', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 'notification-1', title: 'Laboratuvar sonucu', body: 'Yeni sonuç hazır', status: 'SENT', createdAt: new Date().toISOString() },
        { id: 'notification-2', title: 'Aşı hatırlatması', body: 'Takip gerekiyor', status: 'SENT', createdAt: new Date().toISOString() },
      ]),
    }))
    await page.route('**/clinics/*/dashboard', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        stats: {
          patientCount: 1248,
          examinationsToday: 12,
          upcomingVaccinationCount: 4,
          unreadNotificationCount: 2,
        },
        recentExaminations: [
          {
            id: 'exam-1',
            createdAt: new Date().toISOString(),
            complaint: 'Rutin kontrol ve genel değerlendirme',
            pet: { id: 'pet-1', name: 'Pamuk', species: 'CAT' },
            veterinarian: { id: 'vet-1', fullName: 'Dr. Test Veteriner' },
          },
        ],
        upcomingVaccinations: [
          {
            id: 'vac-1',
            name: 'Karma Aşı',
            dueAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
            pet: { id: 'pet-1', name: 'Pamuk', species: 'CAT' },
          },
        ],
      }),
    }))
    await page.route('**/examinations?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{ id: 'exam-1', createdAt: new Date().toISOString() }],
        total: 1,
        page: 1,
        limit: 100,
      }),
    }))
    await page.route('**/vaccinations?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [{ id: 'vac-1', appliedAt: new Date().toISOString() }],
        total: 1,
        page: 1,
        limit: 100,
      }),
    }))
  })

  test('operasyon özeti ve gerçek dashboard verileri görünmeli', async ({ page }, testInfo) => {
    await page.goto('/dashboard')

    await expect(page.getByTestId('clinic-dashboard')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Merhaba Test, kliniğinizin bugünkü görünümü hazır.' })).toBeVisible()
    await expect(page.getByText('1.248')).toBeVisible()
    await expect(page.getByText('Klinik aktivitesi')).toBeVisible()
    await expect(page.getByText('Pamuk').first()).toBeVisible()
    await expect(page.getByText('Karma Aşı')).toBeVisible()
    await expect(page.getByRole('link', { name: /Yeni muayene Klinik değerlendirme başlat/ })).toHaveAttribute('href', '/examinations/new')
    await expect(page.getByRole('button', { name: '2 okunmamış bildirim' })).toBeVisible()

    await page.screenshot({ path: testInfo.outputPath('dashboard-desktop.png'), fullPage: true })
  })

  test('mobil görünüm yatay taşma üretmemeli ve ana eylemler erişilebilir kalmalı', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/dashboard')

    await expect(page.getByTestId('clinic-dashboard')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hızlı işlemler' })).toBeVisible()
    await expect(page.getByRole('link', { name: /Hasta kaydı Yeni hayvan ve sahip bilgisi ekle/ })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('dashboard-mobile.png'), fullPage: true })
  })
})
