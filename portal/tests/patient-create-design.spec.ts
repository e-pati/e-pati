import { expect, test } from '@playwright/test'

import { mockAuthenticatedSession } from './helpers/auth'

test.describe('Yeni hasta kaydı kurumsal görünüm', () => {
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
  })

  test('kimlik, sahip ve fotoğraf bölümlerini kurumsal düzende göstermeli', async ({ page }, testInfo) => {
    await page.goto('/patients/new')

    await expect(page.getByTestId('patient-create-page')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Yeni klinik dosyası' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hayvan kimliği' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Sahip bilgileri' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Hasta fotoğrafı' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Hastayı kaydet' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Hasta dizinine dön' })).toHaveAttribute('href', '/patients')

    await page.screenshot({ path: testInfo.outputPath('patient-create-desktop.png'), fullPage: true })
    await page.getByRole('heading', { name: 'Hasta fotoğrafı' }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('patient-create-desktop-lower.png') })
  })

  test('zorunlu alanları doğrulamalı ve kayıt isteğini mevcut API sözleşmesiyle göndermeli', async ({ page }) => {
    let requestBody: Record<string, unknown> | undefined
    await page.route('**/pets', async route => {
      if (route.request().method() !== 'POST') return route.continue()
      requestBody = route.request().postDataJSON() as Record<string, unknown>
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'pet-new',
          ownerId: 'owner-new',
          name: 'Mavi',
          species: 'Bird',
          sex: 'UNKNOWN',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      })
    })

    await page.goto('/patients/new')
    await page.getByRole('button', { name: 'Hastayı kaydet' }).click()

    await expect(page.getByText('Hayvan adı en az 2 karakter olmalı')).toBeVisible()
    await expect(page.getByText('Lütfen bir tür seçin')).toBeVisible()

    await page.getByLabel('Hayvan adı').fill('Mavi')
    await page.getByLabel('Tür').click()
    await page.getByRole('option', { name: 'Kuş' }).click()
    await page.getByLabel('Ad soyad').fill('Selin Kaya')
    await page.getByLabel('Telefon').fill('0532 111 22 33')
    await page.getByRole('button', { name: 'Hastayı kaydet' }).click()

    await expect(page.getByTestId('patient-create-success')).toBeVisible()
    expect(requestBody).toMatchObject({
      name: 'Mavi',
      species: 'Bird',
      sex: 'UNKNOWN',
      ownerFullName: 'Selin Kaya',
      ownerPhone: '0532 111 22 33',
    })
  })

  test('mobil görünüm yatay taşmasız kalmalı ve fotoğraf seçimini göstermeli', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/patients/new')

    await page.getByLabel('Görsel seç').setInputFiles({
      name: 'mavi.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zt9sAAAAASUVORK5CYII=', 'base64'),
    })

    await expect(page.getByText('mavi.png')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Kaldır' })).toBeVisible()

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)

    await page.screenshot({ path: testInfo.outputPath('patient-create-mobile.png'), fullPage: true })
    await page.getByRole('heading', { name: 'Hasta fotoğrafı' }).scrollIntoViewIfNeeded()
    await page.screenshot({ path: testInfo.outputPath('patient-create-mobile-lower.png') })
  })
})
