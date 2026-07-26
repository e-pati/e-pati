import { expect, test } from '@playwright/test'

const email = process.env.VETCEP_DOCKER_EMAIL ?? 'vet@example.com'
const password = process.env.VETCEP_DOCKER_PASSWORD ?? 'DemoPass123'

test.describe('Docker klinik kabul turu', () => {
  test('httpOnly oturum, demo aboneliği, Misket kaydı, aşılar ve logout çalışmalı', async ({ context, page }, testInfo) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: 'Giriş Yap', exact: true })).toBeVisible()

    const loginResponsePromise = page.waitForResponse(response =>
      response.url().endsWith('/auth/clinic/login')
      && response.request().method() === 'POST',
    )

    await page.getByLabel('E-posta', { exact: true }).fill(email)
    await page.getByLabel('Şifre', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Giriş Yap', exact: true }).click()

    const loginResponse = await loginResponsePromise
    expect(loginResponse.status()).toBe(200)

    const loginBody = await loginResponse.json() as Record<string, unknown>
    expect(loginBody).toHaveProperty('user')
    expect(loginBody).not.toHaveProperty('accessToken')
    expect(loginBody).not.toHaveProperty('refreshToken')

    await expect(page).toHaveURL(/\/dashboard$/)

    const authCookies = await context.cookies()
    const accessCookie = authCookies.find(cookie => cookie.name === 'accessToken')
    const refreshCookie = authCookies.find(cookie => cookie.name === 'refreshToken')

    expect(accessCookie).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/',
    })
    expect(refreshCookie).toMatchObject({
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      path: '/auth',
    })

    const browserStorage = await page.evaluate(() => ({
      localStorage: { ...window.localStorage },
      sessionStorage: { ...window.sessionStorage },
    }))
    expect(JSON.stringify(browserStorage)).not.toContain('accessToken')
    expect(JSON.stringify(browserStorage)).not.toContain('refreshToken')

    const checkoutResponse = await context.request.post('http://localhost:3000/billing/checkout', {
      data: {
        plan: 'monthly',
        successUrl: 'http://localhost:3001/billing/success',
        cancelUrl: 'http://localhost:3001/billing/cancel',
      },
      headers: {
        Origin: 'http://localhost:3001',
      },
    })
    expect(checkoutResponse.ok()).toBe(true)

    await page.reload()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByRole('heading', { name: 'Pano' })).toBeVisible()
    await expect(page.getByText('Merhaba, Ayse! 👋')).toBeVisible()

    await page.screenshot({
      path: testInfo.outputPath('01-dashboard.png'),
      fullPage: true,
    })

    await page.reload()
    await expect(page).toHaveURL(/\/dashboard$/)
    await expect(page.getByText('Merhaba, Ayse! 👋')).toBeVisible()

    await page.goto('/patients')
    await expect(page.getByRole('heading', { name: 'Hastalar' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Misket' })).toBeVisible()

    const misketLink = page.locator('a[href^="/patients/"]').filter({ hasText: 'Misket' })
    await expect(misketLink).toHaveCount(1)
    await misketLink.click()

    await expect(page).toHaveURL(/\/patients\/seed-pet-misket$/)
    await expect(page.locator('header h1').filter({ hasText: 'Misket' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Aşılar (1)' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Reçeteler (1)' })).toBeVisible()
    await expect(page.getByText('Sahip bilgisi yok')).toHaveCount(0)
    await expect(page.getByText('Bazı hasta kayıtları alınamadı.')).toHaveCount(0)
    await expect(page.getByRole('img', { name: 'Misket' })).toHaveCount(0)

    await page.screenshot({
      path: testInfo.outputPath('02-misket-profili.png'),
      fullPage: true,
    })

    await page.goto('/vaccinations')
    await expect(page.getByRole('heading', { name: 'Aşılar' })).toBeVisible()
    await expect(page.getByText('Kuduz', { exact: true })).toBeVisible()
    await expect(page.getByText('Yıllık kuduz aşısı tamamlandı.', { exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Misket', exact: true })).toBeVisible()

    await page.screenshot({
      path: testInfo.outputPath('03-asi-listesi.png'),
      fullPage: true,
    })

    const logoutButton = page.locator('aside button').filter({ hasText: 'Dr. Ayse Demir' })
    await expect(logoutButton).toHaveCount(1)
    await logoutButton.click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('button', { name: 'Giriş Yap', exact: true })).toBeVisible()

    const cookiesAfterLogout = await context.cookies()
    expect(cookiesAfterLogout.some(cookie => cookie.name === 'accessToken')).toBe(false)
    expect(cookiesAfterLogout.some(cookie => cookie.name === 'refreshToken')).toBe(false)
  })
})
