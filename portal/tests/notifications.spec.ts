import { expect, test } from '@playwright/test'
import { clinicUser, mockAuthenticatedSession } from './helpers/auth'
import type { AuthUser } from '../src/services/auth.service'

const ownerUser: AuthUser = {
  id: 'owner-test',
  email: 'owner@vetcep.test',
  fullName: 'Test Hayvan Sahibi',
  role: 'OWNER',
}

test.describe('Bildirim rol sözleşmesi', () => {
  test('klinik kullanıcısı kendi kapsamındaki bildirim feedini kullanmalı', async ({ page }) => {
    let notificationApiCalls = 0
    await page.route('http://localhost:3000/notifications', route => {
      notificationApiCalls += 1
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          items: [
            {
              id: 'clinic-notification-1',
              clinicId: clinicUser.clinicId,
              title: 'Yeni laboratuvar sonucu',
              body: 'Pamuk için laboratuvar sonucu kaydedildi.',
              payload: { type: 'lab', petId: 'pet-pamuk' },
              status: 'SENT',
              createdAt: '2026-08-01T09:00:00.000Z',
              readAt: null,
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
        }),
      })
    })
    await mockAuthenticatedSession(page, clinicUser)

    await page.goto('/dashboard')
    await expect(page.getByText('Dr. Test Veteriner').first()).toBeVisible({ timeout: 10000 })
    await expect.poll(() => notificationApiCalls).toBeGreaterThan(0)

    await page.goto('/notifications')
    await expect(page.getByText('Yeni laboratuvar sonucu')).toBeVisible()
    await expect(page.getByText('Pamuk için laboratuvar sonucu kaydedildi.')).toBeVisible()
    expect(notificationApiCalls).toBeGreaterThan(0)
  })

  test('owner yanıtındaki body, payload ve status alanlarını portal modeline çevirmeli', async ({ page }) => {
    await mockAuthenticatedSession(page, ownerUser)
    await page.route('http://localhost:3000/notifications', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            id: 'notification-1',
            ownerId: ownerUser.id,
            title: 'Kuduz aşısı yaklaşıyor',
            body: 'Pamuk için aşı randevusu oluşturabilirsiniz.',
            payload: { type: 'vaccination', petId: 'pet-pamuk' },
            status: 'SENT',
            createdAt: '2026-07-22T09:00:00.000Z',
            readAt: null,
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      }),
    }))

    await page.goto('/notifications')

    await expect(page.getByText('Kuduz aşısı yaklaşıyor')).toBeVisible()
    await expect(page.getByText('Pamuk için aşı randevusu oluşturabilirsiniz.')).toBeVisible()
    await expect(page.getByText('1 okunmamış bildirim').first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Bildirimler/ })).toContainText('1')
  })
})
