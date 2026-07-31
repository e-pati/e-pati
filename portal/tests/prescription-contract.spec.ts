import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { expect, test } from '@playwright/test'

const workspaceRoot = path.resolve(process.cwd(), '..')

test.describe('Reçete istemci sözleşmesi', () => {
  test('portal pet filtresini kalıcı reçete liste endpointine göndermeli', async () => {
    const service = await readFile(
      path.join(workspaceRoot, 'portal/src/services/prescriptions.service.ts'),
      'utf8',
    )

    expect(service).toContain("api.get<ListResponse<ApiPrescription>>('/prescriptions'")
    expect(service).not.toContain('/summary')
  })

  test('portal ve mobil PDF endpointini yetkili API isteğiyle çözmeli', async () => {
    const [portalService, mobileService] = await Promise.all([
      readFile(path.join(workspaceRoot, 'portal/src/services/prescriptions.service.ts'), 'utf8'),
      readFile(path.join(workspaceRoot, 'mobile/services/prescriptions.service.ts'), 'utf8'),
    ])

    for (const service of [portalService, mobileService]) {
      expect(service).toContain('async getPdfStatus')
      expect(service).toContain('api.get<PrescriptionPdfResponse>')
      expect(service).not.toContain('getPdfUrl')
    }
  })
})
