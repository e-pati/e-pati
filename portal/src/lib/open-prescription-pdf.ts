import { toast } from 'sonner'

import { prescriptionsService } from '@/services/prescriptions.service'

export async function openPrescriptionPdf(prescriptionId: string): Promise<void> {
  const pendingWindow = window.open('about:blank', '_blank')
  if (pendingWindow) pendingWindow.opener = null

  try {
    const pdf = await prescriptionsService.getPdfStatus(prescriptionId)

    if (pdf.status !== 'ready' || !pdf.url) {
      pendingWindow?.close()
      toast.info('Reçete PDF’i hazırlanıyor', {
        description: 'Dosya hazır olduğunda bu ekrandan yeniden açabilirsiniz.',
      })
      return
    }

    if (pendingWindow) {
      pendingWindow.location.replace(pdf.url)
      return
    }

    toast.success('Reçete PDF’i hazır', {
      description: 'Tarayıcı yeni pencereyi engelledi. Dosyayı açmak için butonu kullanın.',
      action: {
        label: 'PDF’i aç',
        onClick: () => window.open(pdf.url!, '_blank', 'noopener,noreferrer'),
      },
    })
  } catch {
    pendingWindow?.close()
    toast.error('Reçete PDF’i açılamadı', {
      description: 'Bağlantı alınamadı. Lütfen kısa süre sonra yeniden deneyin.',
    })
  }
}
