import { ImageResponse } from 'next/og'

export const alt = 'VetCep — Hayvan sağlığında yaşam boyu dijital kayıt'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#f8fafc',
          color: '#102a43',
          padding: '62px 72px',
          fontFamily: 'Arial, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: '-120px', top: '-150px', width: '600px', height: '600px', borderRadius: '999px', background: '#ccfbf1' }} />
        <div style={{ position: 'absolute', right: '55px', top: '55px', width: '350px', height: '350px', borderRadius: '999px', border: '2px solid rgba(15,118,110,0.16)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative' }}>
          <div style={{ width: '62px', height: '62px', borderRadius: '18px', background: '#0f766e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '999px', border: '4px solid white' }} />
            <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '999px', background: 'white', left: '12px', top: '13px' }} />
            <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '999px', background: 'white', right: '11px', top: '10px' }} />
            <div style={{ position: 'absolute', width: '8px', height: '8px', borderRadius: '999px', background: 'white', right: '11px', bottom: '10px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '31px', fontWeight: 800, letterSpacing: '-1px' }}>VetCep</div>
            <div style={{ marginTop: '5px', color: '#64748b', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase' }}>Hayvan sağlığı platformu</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '850px', position: 'relative' }}>
          <div style={{ color: '#0f766e', fontSize: '17px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>Bağımsız dijital deneyim</div>
          <div style={{ marginTop: '22px', fontSize: '66px', lineHeight: 1.02, fontWeight: 900, letterSpacing: '-3.5px' }}>
            Hayvan sağlığında yaşam boyu dijital kayıt.
          </div>
          <div style={{ marginTop: '24px', fontSize: '22px', lineHeight: 1.5, color: '#475569', maxWidth: '780px' }}>
            Kimlik, sağlık ve yaşam döngüsü kayıtlarını anlaşılır bir deneyimde buluşturmayı hedefler.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #cbd5e1', paddingTop: '24px', position: 'relative' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>Sentetik demonstrasyon · Yetkiye bağlı entegrasyon</div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f766e' }}>vetcep.com</div>
        </div>
      </div>
    ),
    size,
  )
}
