'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CheckCircle2, MessageCircle, Phone, Send, ShieldCheck } from 'lucide-react'
import { whatsappService, type WhatsAppTemplateType } from '@/services/whatsapp.service'

const templates = [
  {
    name: 'Muayene Özeti',
    key: 'exam_summary',
    description: 'Muayene sonrası sahibin telefonuna kısa bilgilendirme gönderir.',
    status: 'Template bekleniyor',
  },
  {
    name: 'Aşı Hatırlatma',
    key: 'vaccine_reminder',
    description: 'Yaklaşan veya gecikmiş aşılar için otomatik hatırlatma.',
    status: 'Template bekleniyor',
  },
  {
    name: 'Randevu Hatırlatma',
    key: 'appointment_reminder',
    description: 'Randevu tarihinden önce sahibin telefonuna hatırlatma.',
    status: 'Template bekleniyor',
  },
]

const setupSteps = [
  'Meta Business hesabı doğrulanır',
  'Klinik WhatsApp numarası bağlanır',
  'Template mesajlar onaya gönderilir',
  'Backend gönderim endpointi aktif edilir',
]

export default function WhatsAppSettingsPage() {
  const queryClient = useQueryClient()
  const [phoneNumber, setPhoneNumber] = useState('')
  const [testPhone, setTestPhone] = useState('')
  const [testTemplate, setTestTemplate] = useState<WhatsAppTemplateType>('exam_summary')
  const statusQuery = useQuery({
    queryKey: ['whatsapp-status'],
    queryFn: whatsappService.getStatus,
    retry: 1,
  })
  const connectMutation = useMutation({
    mutationFn: whatsappService.connect,
    onSuccess: () => {
      toast.success('WhatsApp bağlantısı kaydedildi')
      queryClient.invalidateQueries({ queryKey: ['whatsapp-status'] })
    },
    onError: () => toast.error('WhatsApp bağlantı endpointi henüz hazır değil'),
  })
  const testMutation = useMutation({
    mutationFn: whatsappService.sendTest,
    onSuccess: () => toast.success('Test mesajı kuyruğa alındı'),
    onError: () => toast.error('WhatsApp test endpointi henüz hazır değil'),
  })

  const status = statusQuery.data
  const templateStatusMap = useMemo(() => new Map(
    (status?.templates ?? []).map(template => [template.key, template.status])
  ), [status?.templates])

  return (
    <div>
      <Header title="WhatsApp Business" subtitle="Klinik iletişim entegrasyonu" />

      <div className="p-6 space-y-6 max-w-5xl">
        <section className="rounded-2xl bg-primary p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/10 -translate-y-16 translate-x-16" />
          <div className="relative z-10 max-w-2xl">
            <Badge className="bg-white/15 text-white border-white/20 mb-4">P1 Klinik satışı</Badge>
            <h1 className="text-2xl font-bold">WhatsApp hatırlatmaları için hazırlık tamam.</h1>
            <p className="text-sm text-primary-foreground/75 mt-2 leading-relaxed">
              Meta Business API ve backend gönderim servisi bağlandığında muayene, aşı ve randevu
              mesajları hasta detayından ve otomasyonlardan gönderilebilir.
            </p>
          </div>
        </section>

        {statusQuery.isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            WhatsApp durum servisi henüz hazır değil. Endpoint bekleniyor.
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Klinik WhatsApp Numarası</h2>
                  <p className="text-xs text-muted-foreground">
                    {statusQuery.isLoading ? 'Durum yükleniyor' : status?.connected ? 'Bağlantı aktif' : 'Meta doğrulaması bekleniyor'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <div className="text-xs text-muted-foreground">Bağlı numara</div>
                <div className="mt-1 text-lg font-bold text-foreground">{status?.phoneNumber ?? '—'}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {status?.businessName ? `${status.businessName} Meta Business hesabı.` : 'Numara doğrulama endpointi gelince bu alan aktif durumu gösterecek.'}
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <Input
                  value={phoneNumber}
                  onChange={event => setPhoneNumber(event.target.value)}
                  placeholder="+90 5xx xxx xx xx"
                />
              </div>
              <Button
                className="mt-3 w-full gap-2"
                onClick={() => connectMutation.mutate({ phoneNumber })}
                disabled={!phoneNumber.trim() || connectMutation.isPending}
              >
                <MessageCircle className="w-4 h-4" />
                {connectMutation.isPending ? 'Bağlanıyor...' : 'WhatsApp numarası bağla'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Kurulum adımları</h2>
              <div className="space-y-3">
                {setupSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <span className="text-sm text-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {templates.map(template => (
            <Card key={template.key} className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Send className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{template.name}</h3>
                <p className="text-xs text-muted-foreground mt-2 min-h-10">{template.description}</p>
                <Badge variant="outline" className="mt-4 text-[10px]">
                  {templateStatusMap.get(template.key as WhatsAppTemplateType) ?? template.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground">Test mesajı</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Gönderim endpointi aktif olduğunda klinik numarasına test template mesajı gönderilecek.
              </p>
              <div className="mt-5 space-y-3">
                <Input
                  value={testPhone}
                  onChange={event => setTestPhone(event.target.value)}
                  placeholder="Test alıcı telefonu"
                />
                <select
                  value={testTemplate}
                  onChange={event => setTestTemplate(event.target.value as WhatsAppTemplateType)}
                  className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {templates.map(template => (
                    <option key={template.key} value={template.key}>{template.name}</option>
                  ))}
                </select>
              </div>
              <div className="mt-5 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                <CheckCircle2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Test gönderimi endpoint hazır olunca kuyruğa alınır</p>
              </div>
              <Button
                className="mt-5 w-full"
                onClick={() => testMutation.mutate({ phoneNumber: testPhone, template: testTemplate })}
                disabled={!testPhone.trim() || testMutation.isPending}
              >
                {testMutation.isPending ? 'Gönderiliyor...' : 'Test Mesajı Gönder'}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-6">
              <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Hasta detayındaki WhatsApp modalı bu endpointlere bağlanacak.
              </p>
              <div className="mt-5 space-y-2">
                {['GET /whatsapp/status', 'POST /whatsapp/connect', 'POST /whatsapp/messages', 'POST /whatsapp/test'].map(endpoint => (
                  <code key={endpoint} className="block rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                    {endpoint}
                  </code>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-xs text-primary">
                <ShieldCheck className="w-3.5 h-3.5" />
                Meta template onayı canlı gönderim öncesi zorunlu.
              </div>
            </CardContent>
          </Card>
        </section>

        <Link
          href="/settings"
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
        >
          Ayarlara dön
        </Link>
      </div>
    </div>
  )
}
