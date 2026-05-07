'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { TrendingUp, Receipt, Plus, Search, CreditCard, Banknote, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface Invoice {
  id: string
  petId: string
  petName: string
  ownerName: string
  items: { description: string; amount: number }[]
  total: number
  status: 'paid' | 'pending' | 'cancelled'
  paymentMethod?: 'cash' | 'card'
  createdAt: string
}

interface InvoiceSummary {
  todayRevenue: number
  monthRevenue: number
  pendingCount: number
  todayCount: number
}

function useInvoices() {
  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data } = await api.get('/invoices')
      return data
    },
    retry: false,
  })
}

function useInvoiceSummary() {
  return useQuery<InvoiceSummary>({
    queryKey: ['invoices', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/invoices/summary')
      return data
    },
    retry: false,
  })
}

const SERVICE_TEMPLATES = [
  { description: 'Genel Muayene', amount: 500 },
  { description: 'Aşı Uygulaması', amount: 300 },
  { description: 'Kuduz Aşısı', amount: 400 },
  { description: 'Kan Tahlili', amount: 800 },
  { description: 'Röntgen', amount: 1200 },
  { description: 'Ultrason', amount: 1500 },
  { description: 'Diş Temizliği', amount: 2000 },
  { description: 'Kısırlaştırma (Dişi)', amount: 4500 },
  { description: 'Kısırlaştırma (Erkek)', amount: 2500 },
  { description: 'Tırnak Kesimi', amount: 150 },
  { description: 'Mikro Çip', amount: 600 },
  { description: 'İlaç (muayene ile)', amount: 250 },
]

export default function InvoicesPage() {
  const qc = useQueryClient()
  const invoicesQuery = useInvoices()
  const summaryQuery = useInvoiceSummary()
  const [search, setSearch] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newItems, setNewItems] = useState([{ description: '', amount: 0 }])
  const [petName, setPetName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')

  const createInvoice = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/invoices', {
        petName, ownerName, paymentMethod,
        items: newItems.filter(i => i.description && i.amount > 0),
        status: 'paid',
      })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Fatura oluşturuldu')
      setShowNew(false)
      setNewItems([{ description: '', amount: 0 }])
      setPetName('')
      setOwnerName('')
    },
    onError: () => toast.error('Fatura oluşturulamadı — backend bağlantısı bekleniyor'),
  })

  const markPaid = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/invoices/${id}`, { status: 'paid' })
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Ödeme alındı')
    },
  })

  const invoices = invoicesQuery.data ?? []
  const filtered = invoices.filter(inv =>
    inv.petName?.toLowerCase().includes(search.toLowerCase()) ||
    inv.ownerName?.toLowerCase().includes(search.toLowerCase())
  )
  const total = newItems.reduce((s, i) => s + (Number(i.amount) || 0), 0)

  const isApiReady = !invoicesQuery.isError

  return (
    <div>
      <Header
        title="Fatura & Kasa"
        subtitle="Günlük gelir takibi"
        action={{ label: 'Yeni Fatura', onClick: () => setShowNew(true) }}
      />

      <div className="p-6 space-y-6">
        {/* Backend uyarısı */}
        {invoicesQuery.isError && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            <strong>Backend bağlantısı bekleniyor</strong> &mdash; <code>/invoices</code> endpoint&apos;i hazır olduğunda gerçek veriler yüklenecek.
          </div>
        )}

        {/* Özet kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Bugünkü Gelir', value: summaryQuery.data?.todayRevenue ?? 0, icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', format: '₺' },
            { label: 'Aylık Gelir', value: summaryQuery.data?.monthRevenue ?? 0, icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-500/10', format: '₺' },
            { label: 'Bugün İşlem', value: summaryQuery.data?.todayCount ?? 0, icon: Receipt, color: 'text-violet-600', bg: 'bg-violet-500/10', format: '' },
            { label: 'Bekleyen Ödeme', value: summaryQuery.data?.pendingCount ?? 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-500/10', format: '' },
          ].map(s => (
            <Card key={s.label} className="bg-white border-0 shadow-sm rounded-2xl">
              <CardContent className="p-5">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold">{s.format}{(s.value as number).toLocaleString('tr-TR')}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Yeni fatura formu */}
        {showNew && (
          <Card className="bg-white border-0 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Yeni Fatura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hasta Adı</label>
                  <Input value={petName} onChange={e => setPetName(e.target.value)} placeholder="örn. Pati" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Sahip Adı</label>
                  <Input value={ownerName} onChange={e => setOwnerName(e.target.value)} placeholder="örn. Ayşe Hanım" />
                </div>
              </div>

              {/* Hızlı servis seçimi */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Hızlı Ekle</label>
                <div className="flex flex-wrap gap-1.5">
                  {SERVICE_TEMPLATES.map(s => (
                    <button
                      key={s.description}
                      type="button"
                      onClick={() => setNewItems(prev => [...prev.filter(i => i.description || i.amount), { description: s.description, amount: s.amount }])}
                      className="text-xs px-2.5 py-1 rounded-full border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      {s.description} — {s.amount}₺
                    </button>
                  ))}
                </div>
              </div>

              {/* Kalemler */}
              <div className="space-y-2">
                {newItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Hizmet açıklaması"
                      value={item.description}
                      onChange={e => setNewItems(prev => prev.map((it, idx) => idx === i ? { ...it, description: e.target.value } : it))}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="₺"
                      value={item.amount || ''}
                      onChange={e => setNewItems(prev => prev.map((it, idx) => idx === i ? { ...it, amount: Number(e.target.value) } : it))}
                      className="w-28"
                    />
                    {newItems.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => setNewItems(prev => prev.filter((_, idx) => idx !== i))}>×</Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => setNewItems(prev => [...prev, { description: '', amount: 0 }])}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Kalem Ekle
                </Button>
              </div>

              {/* Ödeme yöntemi */}
              <div className="flex gap-3">
                {(['cash', 'card'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${paymentMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                  >
                    {m === 'cash' ? <Banknote className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                    {m === 'cash' ? 'Nakit' : 'Kart'}
                  </button>
                ))}
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Toplam:</span>
                  <span className="text-lg font-bold text-primary">₺{total.toLocaleString('tr-TR')}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <Button variant="outline" onClick={() => setShowNew(false)}>İptal</Button>
                <Button onClick={() => createInvoice.mutate()} disabled={createInvoice.isPending || !total}>
                  {createInvoice.isPending ? 'Kaydediliyor...' : 'Faturayı Kaydet'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Fatura listesi */}
        <Card className="bg-white border-0 shadow-sm rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">İşlem Geçmişi</CardTitle>
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hasta veya sahip ara..." className="pl-8 h-8 text-sm" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {!isApiReady ? (
              <div className="text-center py-12">
                <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Backend hazır olduğunda fatura geçmişi burada görünecek</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Henüz fatura yok</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(inv => (
                  <div key={inv.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Receipt className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{inv.petName}</span>
                        <span className="text-xs text-muted-foreground">· {inv.ownerName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {inv.items.map(i => i.description).join(', ')}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-foreground">₺{inv.total.toLocaleString('tr-TR')}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(inv.createdAt)}</div>
                    </div>
                    <Badge
                      className={`flex-shrink-0 text-[10px] ${inv.status === 'paid' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-amber-100 text-amber-700 border-amber-200'}`}
                      variant="outline"
                    >
                      {inv.status === 'paid' ? <><CheckCircle2 className="w-3 h-3 mr-1" />Ödendi</> : 'Bekliyor'}
                    </Badge>
                    {inv.status === 'pending' && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => markPaid.mutate(inv.id)}>
                        Ödeme Al
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
