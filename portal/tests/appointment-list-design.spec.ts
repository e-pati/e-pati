import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

function startOfCurrentWeek(): Date {
  const date = new Date()
  const day = date.getDay()
  date.setDate(date.getDate() + (day === 0 ? -6 : 1 - day))
  date.setHours(0, 0, 0, 0)
  return date
}

function dateAt(dayOffset: number, hour: number, minute = 0): string {
  const date = startOfCurrentWeek()
  date.setDate(date.getDate() + dayOffset)
  date.setHours(hour, minute, 0, 0)
  return date.toISOString()
}

function todayAt(hour: number): string {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date.toISOString()
}

const appointments = [
  {
    id: 'appt-pending',
    petId: 'pet-pamuk',
    scheduledAt: dateAt(0, 10, 30),
    durationMinutes: 30,
    reason: 'İştahsızlık ve rutin kontrol talebi',
    status: 'pending',
    pet: { id: 'pet-pamuk', name: 'Pamuk', species: 'Cat', owner: { fullName: 'Selin Kaya', phone: '0532 111 22 33' } },
  },
  {
    id: 'appt-confirmed',
    petId: 'pet-atlas',
    scheduledAt: todayAt(11),
    durationMinutes: 45,
    reason: 'Genel sağlık kontrolü',
    status: 'confirmed',
    pet: { id: 'pet-atlas', name: 'Atlas', species: 'Dog', owner: { fullName: 'Mert Demir' } },
  },
  {
    id: 'appt-completed',
    petId: 'pet-mavi',
    scheduledAt: dateAt(2, 14),
    durationMinutes: 30,
    reason: 'Aşı sonrası kontrol',
    status: 'completed',
    pet: { id: 'pet-mavi', name: 'Mavi', species: 'Bird', owner: { fullName: 'Derya Aydın' } },
  },
  {
    id: 'appt-cancelled',
    petId: 'pet-zeytin',
    scheduledAt: dateAt(3, 16),
    durationMinutes: 30,
    reason: 'Diş kontrolü',
    status: 'cancelled',
    pet: { id: 'pet-zeytin', name: 'Zeytin', species: 'Cat', owner: { fullName: 'Emre Kaya' } },
  },
]

test.describe('Randevu listesi kurumsal görünüm', () => {
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
    await page.route('**/appointments?**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(appointments),
    }))
  })

  test('gerçek hafta sorgusu, program özeti ve kayıtları göstermeli', async ({ page }, testInfo) => {
    const requestPromise = page.waitForRequest(request => request.url().includes('/appointments?'))
    await page.goto('/appointments')
    const request = await requestPromise
    const url = new URL(request.url())

    expect(url.searchParams.get('from')).toBeTruthy()
    expect(url.searchParams.get('to')).toBeTruthy()
    await expect(page.getByTestId('appointments-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Haftalık klinik programı' })).toBeVisible()
    await expect(page.getByText('Bugün', { exact: true })).toBeVisible()
    await expect(page.locator('p').filter({ hasText: /^Bekleyen$/ })).toBeVisible()
    await expect(page.getByText('Aktif hasta', { exact: true })).toBeVisible()

    const schedule = page.getByTestId('weekly-schedule')
    await expect(schedule.locator('[data-testid="appointment-card-appt-pending"][data-layout="compact"]')).toContainText('Pamuk')
    await expect(schedule.locator('[data-testid="appointment-card-appt-confirmed"][data-layout="compact"]')).toContainText('Atlas')
    await expect(page.getByRole('link', { name: 'Yeni Randevu' })).toHaveAttribute('href', '/appointments/new')

    await page.screenshot({ path: testInfo.outputPath('appointment-list-desktop.png'), fullPage: true })
  })

  test('hafta navigasyonu ve durum filtresi programı güncellemeli', async ({ page }) => {
    const initialRequestPromise = page.waitForRequest(request => request.url().includes('/appointments?'))
    await page.goto('/appointments')
    const initialRequest = await initialRequestPromise
    const nextRequestPromise = page.waitForRequest(request => request.url().includes('/appointments?'))
    await page.getByRole('button', { name: 'Sonraki hafta' }).click()
    const nextRequest = await nextRequestPromise

    expect(nextRequest.url()).not.toBe(initialRequest.url())
    await expect(page.getByText('Gelecek hafta')).toBeVisible()

    await page.getByRole('button', { name: 'Bugün' }).click()
    await page.getByRole('button', { name: 'Bekleyen', exact: true }).click()
    const schedule = page.getByTestId('weekly-schedule')
    await expect(schedule.getByTestId('appointment-card-appt-pending')).toBeVisible()
    await expect(schedule.getByTestId('appointment-card-appt-confirmed')).toHaveCount(0)
  })

  test('bekleyen talebi onaylamalı ve onaylı ziyareti tamamlamalı', async ({ page }) => {
    await page.route('**/appointments/appt-pending/confirm', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...appointments[0], status: 'confirmed' }),
    }))
    await page.route('**/appointments/appt-confirmed', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ...appointments[1], status: 'completed' }),
    }))
    await page.goto('/appointments')

    const pendingQueue = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Bekleyen talepler' }) })
    const confirmRequest = page.waitForRequest(request => request.url().endsWith('/appointments/appt-pending/confirm'))
    await pendingQueue.getByRole('button', { name: 'Pamuk randevusunu onayla' }).click()
    expect((await confirmRequest).method()).toBe('POST')

    const todayQueue = page.locator('section').filter({ has: page.getByRole('heading', { name: 'Bugünkü ziyaretler' }) })
    const completeRequest = page.waitForRequest(request => request.url().endsWith('/appointments/appt-confirmed'))
    await todayQueue.getByRole('button', { name: 'Atlas randevusunu tamamla' }).click()
    const request = await completeRequest
    expect(request.method()).toBe('PATCH')
    expect(request.postDataJSON()).toEqual({ status: 'completed' })
  })

  test('mobilde yatay tablo yerine gün ajandası göstermeli', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/appointments')

    const schedule = page.getByTestId('weekly-schedule')
    await expect(schedule.getByLabel('Ajanda günü seç')).toBeVisible()
    await expect(schedule.locator('[data-testid="appointment-card-appt-confirmed"][data-layout="roomy"]')).toContainText('Atlas')

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('appointment-list-mobile.png'), fullPage: true })
  })

  test('randevu servisi hatasını yeniden deneme eylemiyle göstermeli', async ({ page }) => {
    await page.unroute('**/appointments?**')
    await page.route('**/appointments?**', route => route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Servis geçici olarak kullanılamıyor' }),
    }))
    await page.goto('/appointments')

    await expect(page.getByText('Randevu programı alınamadı')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Yeniden dene' })).toBeVisible()
    await expect(page.getByText(/Endpoint bekleniyor|Backend kontratı/)).toHaveCount(0)
  })
})
