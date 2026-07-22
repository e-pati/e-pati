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
  test('klinik kullanıcısı owner bildirim endpointini çağırmamalı', async ({ page }) => {
    let notificationApiCalls = 0
    await page.route('http://localhost:3000/notifications', route => {
      notificationApiCalls += 1
      return route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Only owners can access notifications.' }),
      })
    })
    await mockAuthenticatedSession(page, clinicUser)

    await page.goto('/dashboard')
    await expect(page.getByText('Dr. Test Veteriner').first()).toBeVisible({ timeout: 10000 })
    expect(notificationApiCalls).toBe(0)

    await page.goto('/notifications')
    await expect(page.getByRole('heading', { name: 'Klinik bildirim servisi hazırlanıyor' })).toBeVisible()
    await expect(page.getByText('Portal, sahip bildirim endpoint')).toBeVisible()
    expect(notificationApiCalls).toBe(0)
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
