import type { Page } from '@playwright/test'
import type { AuthUser } from '../../src/services/auth.service'

export const clinicUser: AuthUser = {
  id: 'vet-test',
  email: 'vet@vetcep.test',
  fullName: 'Dr. Test Veteriner',
  role: 'VETERINARIAN',
  clinicId: 'clinic-test',
}

export const superAdminUser: AuthUser = {
  id: 'super-admin-test',
  email: 'admin@vetcep.test',
  fullName: 'VetCep Admin',
  role: 'SUPER_ADMIN',
}

export async function mockAuthenticatedSession(
  page: Page,
  user: AuthUser = clinicUser,
): Promise<void> {
  await page.route('**/auth/me', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(user),
  }))

  await page.context().addCookies([{
    name: 'epati-logged-in',
    value: '1',
    domain: 'localhost',
    path: '/',
    sameSite: 'Lax',
  }])
}
