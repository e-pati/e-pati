'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, MessageCircle, RotateCw, Send, Smartphone, UsersRound } from 'lucide-react'
import { campaignsService, type CampaignChannel } from '@/services/campaigns.service'

const campaignChannels = [
  { label: 'WhatsApp', icon: MessageCircle, status: 'Meta template bekleniyor' },
  { label: 'SMS', icon: Smartphone, status: 'SMS provider bekleniyor' },
]

const campaignContracts = [
  'GET /campaigns/lost-patients/candidates',
  'POST /campaigns/lost-patients/preview',
  'POST /campaigns/lost-patients/send',
  'GET /campaigns/:id/results',
]

export default function LostPatientsCampaignPage() {
  const [channel, setChannel] = useState<CampaignChannel>('whatsapp')
  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(null)
  const [message, setMessage] = useState(
    'Merhaba, VetCep kayıtlarımıza göre dostunuzun kontrol zamanı yaklaşmış olabilir. Uygun olduğunuzda kliniğimizden randevu alabilirsiniz.'
  )
  const candidatesQuery = useQuery({
    queryKey: ['campaigns-lost-patients-candidates'],
    queryFn: campaignsService.getLostPatientCandidates,
    retry: 1,
  })
  const previewCampaign = useMutation({
    mutationFn: campaignsService.previewLostPatients,
    onSuccess: preview => {
      toast.success('Kampanya önizlemesi hazır', {
        description: `${preview.recipientCount} alıcı için mesaj hazırlandı.`,
      })
    },
    onError: () => toast.error('Kampanya önizleme endpointi henüz hazır değil'),
  })
  const sendCampaign = useMutation({
    mutationFn: campaignsService.sendLostPatients,
    onSuccess: response => {
      setActiveCampaignId(response.campaignId)
      toast.success('Kampanya kuyruğa alındı', {
        description: `${response.queuedCount} mesaj gönderim kuyruğuna alındı.`,
      })
    },
    onError: () => toast.error('Kampanya gönderim endpointi henüz hazır değil'),
  })
  const campaignResultsQuery = useQuery({
    queryKey: ['campaign-results', activeCampaignId],
    queryFn: () => campaignsService.getResults(activeCampaignId as string),
    enabled: !!activeCampaignId,
    retry: 1,
  })

  const candidates = useMemo(() => candidatesQuery.data ?? [], [candidatesQuery.data])
  const candidateIds = useMemo(() => candidates.map(candidate => candidate.id), [candidates])
  const campaignResults = campaignResultsQuery.data
  const stats = [
    { label: 'Aday Hasta', value: campaignResults?.candidateCount ?? (candidates.length || '—'), icon: UsersRound },
    { label: 'Gönderilen Mesaj', value: campaignResults?.sentCount ?? sendCampaign.data?.queuedCount ?? '—', icon: Send },
    { label: 'Geri Dönen Hasta', value: campaignResults?.returnedPatientCount ?? '—', icon: CheckCircle2 },
  ]

  const campaignPayload = { candidateIds, channel, message }

  return (
    <div>
      <Header title="Kayıp Hasta Kampanyası" subtitle="Uzun süredir gelmeyen hastalara geri dönüş akışı" />

      <div className="p-6 space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
          <Badge className="bg-primary/10 text-primary border-0 mb-4">P2 büyüme otomasyonu</Badge>
          <h1 className="text-2xl font-bold text-foreground">Riskli hastaları kampanyaya dönüştürün.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
            Analitik endpointleri geldiğinde 90+ gündür kliniğe gelmeyen hasta sahipleri listelenecek,
            WhatsApp veya SMS üzerinden kontrollü geri çağırma kampanyası başlatılacak.
          </p>
        </section>

        {candidatesQuery.isError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Kayıp hasta kampanya servisi henüz hazır değil. Endpoint bekleniyor.
          </div>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">Kampanya adayları</h2>
                  <p className="text-xs text-muted-foreground mt-1">Risk listesi backend analitiğinden gelecek.</p>
                </div>
                <Badge variant="outline">{candidates.length} aday</Badge>
              </div>
              {candidatesQuery.isLoading ? (
                <div className="px-5 py-16 text-center text-sm text-muted-foreground">Kampanya adayları yükleniyor...</div>
              ) : candidates.length === 0 ? (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-7 h-7 text-amber-600" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">Kayıp hasta listesi bekleniyor</h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-lg mx-auto">
                    `GET /campaigns/lost-patients/candidates` endpointi geldiğinde hasta, sahip,
                    son ziyaret tarihi ve önerilen kampanya kanalı burada listelenecek.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {candidates.map(candidate => (
                    <div key={candidate.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{candidate.petName}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {candidate.ownerName ?? 'Sahip bilgisi yok'} · {candidate.daysSinceLastVisit ?? '—'} gün
                        </p>
                      </div>
                      <Badge className="bg-amber-100 text-amber-700 border-0">
                        Risk {candidate.riskScore ?? '—'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Kampanya mesajı</h2>
                <textarea
                  value={message}
                  onChange={event => setMessage(event.target.value)}
                  rows={5}
                  className="mt-4 w-full rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-foreground outline-none transition-colors focus:border-primary/40 focus:ring-3 focus:ring-primary/10"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4 w-full gap-2"
                  onClick={() => previewCampaign.mutate(campaignPayload)}
                  disabled={candidateIds.length === 0 || previewCampaign.isPending}
                >
                  Önizleme Al
                </Button>
                <Button
                  type="button"
                  className="mt-2 w-full gap-2"
                  onClick={() => sendCampaign.mutate(campaignPayload)}
                  disabled={candidateIds.length === 0 || sendCampaign.isPending}
                >
                  <Send className="w-4 h-4" />
                  {sendCampaign.isPending ? 'Kuyruğa alınıyor...' : 'Kampanyayı Başlat'}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <h2 className="text-sm font-semibold text-foreground">Kanallar</h2>
                <div className="mt-4 space-y-3">
                  {campaignChannels.map(channelOption => (
                    <button
                      key={channelOption.label}
                      type="button"
                      onClick={() => setChannel(channelOption.label.toLowerCase() as CampaignChannel)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${
                        channelOption.label.toLowerCase() === channel
                          ? 'bg-primary/10 ring-1 ring-primary/20'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                        <channelOption.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-foreground">{channelOption.label}</div>
                        <div className="text-xs text-muted-foreground">{channelOption.status}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {stats.map(item => (
            <Card key={item.label} className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <item.icon className="w-5 h-5 text-primary mb-3" />
                <div className="text-2xl font-bold text-foreground">{item.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {activeCampaignId && (
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Kampanya sonuçları</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Kampanya ID: <span className="font-mono">{activeCampaignId}</span>
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => campaignResultsQuery.refetch()}
                disabled={campaignResultsQuery.isFetching}
              >
                <RotateCw className={`h-4 w-4 ${campaignResultsQuery.isFetching ? 'animate-spin' : ''}`} />
                Yenile
              </Button>
            </div>

            {campaignResultsQuery.isError ? (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Kampanya sonuç endpointi henüz hazır değil. Gönderim ID bilgisi saklandı, endpoint gelince metrikler burada dolacak.
              </div>
            ) : campaignResultsQuery.isLoading ? (
              <div className="mt-5 rounded-xl bg-gray-50 px-4 py-8 text-center text-sm text-muted-foreground">
                Kampanya sonuçları yükleniyor...
              </div>
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { label: 'Aday', value: campaignResults?.candidateCount ?? '—' },
                  { label: 'Gönderildi', value: campaignResults?.sentCount ?? '—' },
                  { label: 'Geri döndü', value: campaignResults?.returnedPatientCount ?? '—' },
                ].map(result => (
                  <div key={result.label} className="rounded-xl bg-gray-50 p-4">
                    <div className="text-2xl font-bold text-foreground">{result.value}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{result.label}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100/50">
          <h2 className="text-sm font-semibold text-foreground">Backend kontratı</h2>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
            {campaignContracts.map(endpoint => (
              <code key={endpoint} className="rounded-xl bg-gray-50 px-3 py-2 text-xs text-muted-foreground">
                {endpoint}
              </code>
            ))}
          </div>
          <Link
            href="/analytics"
            className="mt-5 inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium transition-colors hover:bg-muted hover:text-foreground"
          >
            Analitiğe dön
          </Link>
        </section>
      </div>
    </div>
  )
}
