import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

const patients = [
  {
    id: 'pet-pamuk',
    name: 'Pamuk',
    species: 'Cat',
    breed: 'British Shorthair',
    sex: 'FEMALE',
    birthDate: '2022-04-12',
    microchipNo: '900182001234567',
    clinicId: 'clinic-test',
    createdAt: '2026-01-01T09:00:00.000Z',
    updatedAt: '2026-07-30T09:00:00.000Z',
    owner: {
      id: 'owner-pamuk',
      fullName: 'Selin Kaya',
      email: 'selin@example.com',
      phone: '0532 111 22 33',
    },
  },
  {
    id: 'pet-atlas',
    name: 'Atlas',
    species: 'Dog',
    breed: 'Golden Retriever',
    sex: 'MALE',
    clinicId: 'clinic-test',
    createdAt: '2026-01-02T09:00:00.000Z',
    updatedAt: '2026-07-31T09:00:00.000Z',
    owner: {
      id: 'owner-atlas',
      fullName: 'Mert Demir',
      email: 'mert@example.com',
    },
  },
]

test.describe('Yeni muayene kaydı kurumsal görünüm', () => {
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
  })

  test('hasta seçimi, klinik notlar ve kayıt özetini açık kurumsal düzende göstermeli', async ({ page }, testInfo) => {
    await page.goto('/examinations/new')

    await expect(page.getByTestId('examination-create-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Yeni muayene kaydı' })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Hasta seçimi/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Klinik değerlendirme/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Muayene özeti' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Muayene kayıtlarına dön' })).toHaveAttribute('href', '/examinations')

    await page.getByRole('button', { name: 'Pamuk adlı hastayı seç' }).click()
    await expect(page.getByTestId('selected-patient')).toContainText('Pamuk')
    await expect(page.getByTestId('selected-patient')).toContainText('Selin Kaya')
    await expect(page.getByText('WhatsApp açık')).toBeVisible()

    await page.screenshot({ path: testInfo.outputPath('examination-create-desktop.png'), fullPage: true })
    await page.getByRole('heading', { name: /Hasta sahibi bilgilendirmesi/ }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('examination-create-desktop-lower.png') })
  })

  test('alanları doğrulamalı ve yalnızca desteklenen muayene payload alanlarını göndermeli', async ({ page }) => {
    let examinationPayload: Record<string, unknown> | undefined
    let whatsappPayload: Record<string, unknown> | undefined

    await page.route('**/examinations', async route => {
      if (route.request().method() !== 'POST') return route.continue()
      examinationPayload = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'exam-new',
          ...examinationPayload,
          createdAt: '2026-08-02T10:00:00.000Z',
        }),
      })
    })
    await page.route('**/whatsapp/messages', async route => {
      whatsappPayload = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'message-new', status: 'queued' }),
      })
    })

    await page.goto('/examinations/new')
    await page.getByRole('button', { name: 'Muayeneyi kaydet' }).click()
    await expect(page.getByText('Muayene kaydı için bir hasta seçin')).toBeVisible()
    await expect(page.getByText('Şikayet en az 5 karakter olmalı')).toBeVisible()

    await page.getByRole('button', { name: 'Pamuk adlı hastayı seç' }).click()
    await page.getByLabel(/Şikayet/).fill('İki gündür iştahsız ve sakin.')
    await page.getByLabel(/Klinik bulgular/).fill('Ateş 39,8 °C ve hafif hassasiyet var.')
    await page.getByLabel(/Değerlendirme/).fill('Gastroenterit ön tanısı değerlendirildi.')
    await page.getByLabel(/Tedavi ve takip planı/).fill('Destek tedavisi ve üç gün sonra kontrol.')
    await page.getByRole('button', { name: 'Muayeneyi kaydet' }).click()

    await expect(page.getByTestId('examination-create-success')).toBeVisible()
    expect(examinationPayload).toEqual({
      petId: 'pet-pamuk',
      complaint: 'İki gündür iştahsız ve sakin.',
      findings: 'Ateş 39,8 °C ve hafif hassasiyet var.',
      assessment: 'Gastroenterit ön tanısı değerlendirildi.',
      plan: 'Destek tedavisi ve üç gün sonra kontrol.',
    })
    expect(examinationPayload).not.toHaveProperty('followUpDate')
    expect(whatsappPayload).toMatchObject({
      petId: 'pet-pamuk',
      ownerPhone: '0532 111 22 33',
      type: 'exam_summary',
    })
  })

  test('önceden seçili hastayı mobilde yatay taşma olmadan göstermeli', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/examinations/new?petId=pet-pamuk')

    await expect(page.getByTestId('selected-patient')).toContainText('Pamuk')
    await expect(page.getByLabel(/Muayene özetini WhatsApp ile gönder/)).toBeChecked()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('examination-create-mobile.png'), fullPage: true })
    await page.getByRole('button', { name: 'Muayeneyi kaydet' }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('examination-create-mobile-lower.png') })
  })
})
