'use client'

import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { MessageCircle, Send } from 'lucide-react'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  whatsappService,
  type WhatsAppTemplateType,
} from '@/services/whatsapp.service'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  petId: string
  petName: string
  ownerName: string
  ownerPhone?: string
}

const templateOptions: Array<{ type: WhatsAppTemplateType; label: string }> = [
  { type: 'exam_summary', label: 'Muayene Özeti' },
  { type: 'vaccine_reminder', label: 'Aşı Hatırlatma' },
  { type: 'appointment_reminder', label: 'Randevu Hatırlatma' },
  { type: 'custom', label: 'Özel Mesaj' },
]

export function SendWhatsAppDialog({ open, onOpenChange, petId, petName, ownerName, ownerPhone }: Props) {
  const [type, setType] = useState<WhatsAppTemplateType>('exam_summary')
  const defaultMessage = useMemo(() => buildDefaultMessage(type, petName, ownerName), [ownerName, petName, type])
  const [customMessage, setCustomMessage] = useState('')
  const message = type === 'custom' ? customMessage : defaultMessage

  const sendMessage = useMutation({
    mutationFn: () => {
      if (!ownerPhone) throw new Error('missing-phone')
      return whatsappService.send({
        petId,
        ownerPhone,
        type,
        message,
      })
    },
    onSuccess: () => {
      toast.success('WhatsApp mesajı kuyruğa alındı')
      onOpenChange(false)
      setCustomMessage('')
    },
    onError: () => {
      toast.error('WhatsApp gönderimi hazır değil', {
        description: 'Meta/WhatsApp backend endpointi bekleniyor.',
      })
    },
  })

  const canSend = Boolean(ownerPhone && message.trim())

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            WhatsApp Gönder
          </AlertDialogTitle>
          <AlertDialogDescription>
            Hasta sahibine Meta WhatsApp template akışıyla bilgilendirme gönderimi.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 p-3 text-sm">
            <div className="text-xs text-muted-foreground">Alıcı</div>
            <div className="font-medium text-foreground">{ownerName}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {ownerPhone ?? 'Telefon bilgisi yok'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Şablon</div>
            <div className="grid grid-cols-2 gap-2">
              {templateOptions.map(option => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => setType(option.type)}
                  className={`rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${
                    type === option.type
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-gray-100 bg-white text-muted-foreground hover:border-primary/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-muted-foreground mb-2">Mesaj Önizleme</div>
            {type === 'custom' ? (
              <textarea
                value={customMessage}
                onChange={event => setCustomMessage(event.target.value)}
                rows={5}
                placeholder="Göndermek istediğiniz mesajı yazın"
                className="w-full rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
              />
            ) : (
              <div className="min-h-28 rounded-xl border border-gray-100 bg-white p-3 text-sm text-foreground whitespace-pre-wrap">
                {defaultMessage}
              </div>
            )}
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
            Backend kontratı: <code>POST /whatsapp/messages</code>. Meta template onayı ve gönderim servisi bekleniyor.
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>İptal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => sendMessage.mutate()}
            disabled={!canSend || sendMessage.isPending}
            className="gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            {sendMessage.isPending ? 'Gönderiliyor...' : 'Gönder'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function buildDefaultMessage(type: WhatsAppTemplateType, petName: string, ownerName: string): string {
  if (type === 'vaccine_reminder') {
    return `Merhaba ${ownerName}, ${petName} için yaklaşan aşı takibini hatırlatmak isteriz. Uygun olduğunuzda kliniğimizle iletişime geçebilirsiniz.`
  }
  if (type === 'appointment_reminder') {
    return `Merhaba ${ownerName}, ${petName} için planlanan klinik randevunuzu hatırlatmak isteriz. Görüşmek üzere.`
  }
  return `Merhaba ${ownerName}, ${petName} için yapılan muayene özeti VetCep kayıtlarına eklenmiştir. Sağlıklı günler dileriz.`
}
