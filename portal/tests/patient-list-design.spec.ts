import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

const patients = [
  {
    id: 'pet-1',
    name: 'Pamuk',
    species: 'Cat',
    breed: 'British Shorthair',
    sex: 'Female',
    birthDate: '2022-04-12T00:00:00.000Z',
    microchipNo: '900182001234567',
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
    owner: { id: 'owner-1', fullName: 'Ayşe Yılmaz', email: 'ayse@example.com', phone: '0532 111 22 33' },
  },
  {
    id: 'pet-2',
    name: 'Atlas',
    species: 'Dog',
    breed: 'Golden Retriever',
    sex: 'Male',
    createdAt: '2025-02-18T09:15:00.000Z',
    updatedAt: '2025-02-18T09:15:00.000Z',
    owner: { id: 'owner-2', fullName: 'Mehmet Kaya', email: 'mehmet@example.com' },
  },
]

test.describe('Klinik hasta listesi kurumsal görünüm', () => {
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
    await page.route('**/clinics/*/patients**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: patients, total: patients.length, page: 1, limit: 12 }),
    }))
  })

  test('hasta dizini gerçek kayıtları ve ana eylemleri göstermeli', async ({ page }, testInfo) => {
    await page.goto('/patients')

    await expect(page.getByTestId('patients-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hasta kayıtları' })).toBeVisible()
    await expect(page.getByText('2 toplam kayıt')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pamuk hasta kaydını görüntüle' })).toHaveAttribute('href', '/patients/pet-1')
    await expect(page.getByText('Ayşe Yılmaz')).toBeVisible()
    await expect(page.getByText('900182001234567')).toBeVisible()
    await expect(page.getByRole('button', { name: /Yeni Hasta/i })).toBeVisible()

    await page.screenshot({ path: testInfo.outputPath('patients-desktop.png'), fullPage: true })
  })

  test('mobil görünümde kayıtlar okunabilir ve yatay taşmasız kalmalı', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/patients')

    await expect(page.getByRole('link', { name: 'Atlas hasta kaydını görüntüle' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Hasta ara' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Türe göre filtrele' })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('patients-mobile.png'), fullPage: true })
  })
})
