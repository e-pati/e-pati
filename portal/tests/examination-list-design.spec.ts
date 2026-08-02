import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

const recentDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
const olderDate = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
const followUpDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()

const patients = [
  {
    id: 'pet-pamuk',
    name: 'Pamuk',
    species: 'Cat',
    breed: 'British Shorthair',
    sex: 'FEMALE',
    microchipNo: '900182001234567',
    clinicId: 'clinic-test',
    createdAt: '2025-01-01T09:00:00.000Z',
    updatedAt: recentDate,
    owner: { id: 'owner-pamuk', fullName: 'Selin Kaya', email: 'selin@example.com', phone: '0532 111 22 33' },
  },
  {
    id: 'pet-atlas',
    name: 'Atlas',
    species: 'Dog',
    breed: 'Golden Retriever',
    sex: 'MALE',
    clinicId: 'clinic-test',
    createdAt: '2025-02-01T09:00:00.000Z',
    updatedAt: recentDate,
    owner: { id: 'owner-atlas', fullName: 'Mert Demir', email: 'mert@example.com' },
  },
]

const examinations = [
  {
    id: 'exam-pamuk-recent',
    petId: 'pet-pamuk',
    complaint: 'İki gündür iştahsızlık ve mide hassasiyeti',
    findings: 'Ateş 39,8 °C',
    assessment: 'Gastroenterit ön tanısı',
    plan: 'Destek tedavisi ve beslenme takibi',
    followUpDate,
    createdAt: recentDate,
    vet: { id: 'vet-1', fullName: 'Dr. Ayşe Demir', title: 'Veteriner Hekim' },
  },
  {
    id: 'exam-atlas-old',
    petId: 'pet-atlas',
    complaint: 'Rutin genel sağlık kontrolü',
    findings: 'Genel durum iyi',
    assessment: 'Sağlıklı klinik görünüm',
    plan: 'Rutin aşı takvimine devam',
    createdAt: olderDate,
    vet: { id: 'vet-2', firstName: 'Can', lastName: 'Yılmaz', title: 'Dr.' },
  },
  {
    id: 'exam-pamuk-old',
    petId: 'pet-pamuk',
    complaint: 'Yıllık kontrol muayenesi',
    findings: 'Vital bulgular normal',
    assessment: 'Klinik olarak stabil',
    plan: 'Yıllık takip önerildi',
    createdAt: '2025-03-10T09:00:00.000Z',
    vet: { id: 'vet-1', fullName: 'Dr. Ayşe Demir' },
  },
]

test.describe('Muayene listesi kurumsal görünüm', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuthenticatedSession(page)
    await page.route('**/subscription/current', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'active', cancelAtPeriodEnd: false }),
    }))
    await page.route('**/notifications**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '[]',
    }))
    await page.route('**/clinics/*/patients**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: patients, total: patients.length, page: 1, limit: 100 }),
    }))
    await page.route('**/examinations?**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(examinations),
    }))
  })

  test('özet, klinik kayıt listesi ve ana eylemi göstermeli', async ({ page }, testInfo) => {
    await page.goto('/examinations')

    await expect(page.getByTestId('examinations-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Klinik muayene kayıtları' })).toBeVisible()
    await expect(page.getByText('Toplam kayıt', { exact: true })).toBeVisible()
    await expect(page.getByText('Son 7 gün', { exact: true })).toBeVisible()
    await expect(page.getByText('Takip tarihi', { exact: true })).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-pamuk-recent')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-atlas-old')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-pamuk-recent')).toContainText('Dr. Ayşe Demir')
    await expect(page.getByRole('button', { name: 'Yeni Muayene' })).toBeVisible()

    await page.screenshot({ path: testInfo.outputPath('examination-list-desktop.png'), fullPage: true })
    await page.getByRole('button', { name: 'Yeni Muayene' }).click()
    await expect(page).toHaveURL(/\/examinations\/new/)
  })

  test('arama, hasta ve tarih filtrelerini birlikte uygulamalı', async ({ page }) => {
    await page.goto('/examinations')

    await page.getByRole('textbox', { name: 'Muayene ara' }).fill('mide')
    await expect(page.getByText('1 eşleşen kayıt')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-pamuk-recent')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-atlas-old')).toHaveCount(0)

    await page.getByRole('button', { name: 'Filtreleri temizle' }).click()
    await page.getByLabel('Hastaya göre filtrele').click()
    await page.getByRole('option', { name: 'Atlas' }).click()
    await expect(page.getByText('1 eşleşen kayıt')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-atlas-old')).toBeVisible()

    await page.getByRole('button', { name: 'Filtreleri temizle' }).click()
    await page.getByLabel('Tarihe göre filtrele').click()
    await page.getByRole('option', { name: 'Son 7 gün' }).click()
    await expect(page.getByText('1 eşleşen kayıt')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-pamuk-recent')).toBeVisible()
    await expect(page.getByTestId('examination-row-exam-atlas-old')).toHaveCount(0)
  })

  test('mobil görünüm yatay taşmasız ve klinik kayıtlar okunabilir kalmalı', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/examinations')

    await expect(page.getByTestId('examination-row-exam-pamuk-recent')).toContainText('Gastroenterit ön tanısı')
    await expect(page.getByTestId('examination-row-exam-pamuk-recent')).toContainText('Dr. Ayşe Demir')

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('examination-list-mobile.png'), fullPage: true })
  })

  test('muayene servisi hatasını yeniden deneme eylemiyle göstermeli', async ({ page }) => {
    await page.unroute('**/examinations?**')
    await page.route('**/examinations?**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Servis geçici olarak kullanılamıyor' }),
    }))

    await page.goto('/examinations')

    await expect(page.getByText('Muayene kayıtları alınamadı')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Yeniden dene' })).toBeVisible()
  })
})
