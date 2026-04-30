'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Camera, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useZxing } from 'react-zxing'

interface Props {
  open: boolean
  onClose: () => void
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function QRScannerModal({ open, onClose }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState<'scanning' | 'success' | 'error'>('scanning')
  const [errorMsg, setErrorMsg] = useState('')
  const processed = useRef(false)

  const { ref } = useZxing({
    paused: !open || status !== 'scanning',
    onResult(result) {
      if (processed.current) return
      processed.current = true

      const text = result.getText()
      const payload = decodeJwtPayload(text)

      if (payload?.type === 'pet-readonly' && typeof payload.sub === 'string') {
        setStatus('success')
        setTimeout(() => {
          onClose()
          router.push(`/patients/${payload.sub}`)
        }, 800)
      } else {
        setStatus('error')
        setErrorMsg('Geçersiz QR kod. Lütfen e-Pati hayvan QR kodunu tarayın.')
        setTimeout(() => {
          processed.current = false
          setStatus('scanning')
          setErrorMsg('')
        }, 2500)
      }
    },
    onError() {},
  })

  useEffect(() => {
    if (!open) {
      processed.current = false
      setStatus('scanning')
      setErrorMsg('')
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-sm border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-semibold text-base text-foreground">QR Kod Tara</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scanner alanı */}
        <div className="relative bg-black aspect-square">
          <video ref={ref} className="w-full h-full object-cover" />

          {/* Tarama çerçevesi */}
          {status === 'scanning' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-52 h-52">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br-lg" />
                <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-primary/60 animate-pulse" />
              </div>
            </div>
          )}

          {/* Başarı */}
          {status === 'success' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <p className="text-white text-sm font-medium">Hasta bulundu, yönlendiriliyor...</p>
            </div>
          )}

          {/* Hata */}
          {status === 'error' && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 px-6">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <p className="text-white text-sm text-center">{errorMsg}</p>
            </div>
          )}
        </div>

        {/* Alt bilgi */}
        <div className="p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Hayvan sahibinin e-Pati mobil uygulamasındaki QR kodu kameraya gösterin
          </p>
        </div>
      </div>
    </div>
  )
}
