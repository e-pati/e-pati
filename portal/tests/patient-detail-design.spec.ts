import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

test.describe('Klinik hasta detayı kurumsal görünüm', () => {
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
      body: '[]',
    }))
    await page.route('**/pets/pet-1', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'pet-1',
        ownerId: 'owner-1',
        name: 'Pamuk',
        species: 'Cat',
        breed: 'British Shorthair',
        sex: 'Female',
        birthDate: '2022-04-12T00:00:00.000Z',
        microchipNo: '900182001234567',
        createdAt: '2025-01-15T10:30:00.000Z',
        updatedAt: '2025-01-15T10:30:00.000Z',
        owner: { id: 'owner-1', fullName: 'Ayşe Yılmaz', email: 'ayse@example.com', phone: '0532 111 22 33' },
      }),
    }))
    await page.route('**/examinations?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{
        id: 'exam-1', petId: 'pet-1', veterinarianId: 'vet-test', complaint: 'İştahsızlık',
        findings: 'Hafif ateş', assessment: 'Üst solunum yolu enfeksiyonu', plan: 'Kontrol ve destek tedavisi',
        followUpDate: '2026-08-05T00:00:00.000Z', createdAt: '2026-08-01T09:00:00.000Z',
        vet: { id: 'vet-test', fullName: 'Test Veteriner', title: 'Dr.' },
      }] }),
    }))
    await page.route('**/vaccinations?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{
        id: 'vac-1', petId: 'pet-1', name: 'Karma Aşı', lotNumber: 'LOT-2026-18',
        appliedAt: '2026-07-01T00:00:00.000Z', dueAt: '2027-07-01T00:00:00.000Z', notes: 'Rutin uygulama',
      }] }),
    }))
    await page.route('**/prescriptions?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{
        id: 'rx-1', petId: 'pet-1', createdAt: '2026-08-01T09:30:00.000Z',
        medications: [{ id: 'med-1', name: 'Veteriner destek ürünü', dose: '1 ölçek', frequency: 'Günde 1', duration: '5 gün' }],
      }] }),
    }))
    await page.route('**/lab-results?*', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: [{
        id: 'lab-1', petId: 'pet-1', testType: 'Tam Kan Sayımı', comment: 'Değerler referans aralığında',
        date: '2026-08-01T08:30:00.000Z', fileUrl: 'https://example.com/lab.pdf',
      }] }),
    }))
  })

  test('hasta kimliği, sahip ve muayene kaydı görünmeli', async ({ page }, testInfo) => {
    await page.goto('/patients/pet-1')

    await expect(page.getByTestId('patient-detail-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pamuk', level: 2 })).toBeVisible()
    await expect(page.getByText('900182001234567')).toBeVisible()
    await expect(page.getByText('Ayşe Yılmaz')).toBeVisible()
    await expect(page.getByText('İştahsızlık')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Hasta dizinine dön' })).toHaveAttribute('href', '/patients')
    await expect(page.getByRole('button', { name: 'Kaydı düzenle' })).toBeVisible()

    await page.screenshot({ path: testInfo.outputPath('patient-detail-desktop.png'), fullPage: true })
  })

  test('sekmeler gerçek sağlık kayıtlarını göstermeli', async ({ page }) => {
    await page.goto('/patients/pet-1')

    await page.getByRole('tab', { name: 'Aşılar' }).click()
    await expect(page.getByText('Karma Aşı')).toBeVisible()

    await page.getByRole('tab', { name: 'Reçeteler' }).click()
    await expect(page.getByText('Veteriner destek ürünü')).toBeVisible()

    await page.getByRole('tab', { name: 'Laboratuvar' }).click()
    await expect(page.getByText('Tam Kan Sayımı')).toBeVisible()
  })

  test('mobil görünüm yatay taşmasız ve ana eylemleri erişilebilir olmalı', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/patients/pet-1')

    await expect(page.getByRole('button', { name: 'Kaydı düzenle' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Yeni muayene' })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('patient-detail-mobile.png'), fullPage: true })
  })
})
