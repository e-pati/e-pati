import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portal girişi',
  description: 'VetCep klinik ve yetkili ekip portalına güvenli erişim.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
