import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { clinicName, authorizedName, email, phone, city, address, veterinarianCount } = data

    if (!clinicName || !email) {
      return NextResponse.json({ error: 'Eksik alan' }, { status: 400 })
    }

    const resendKey = process.env.RESEND_API_KEY
    if (!resendKey) {
      // Key yoksa başarılı dön (form çalışsın)
      return NextResponse.json({ ok: true })
    }

    const html = `
      <h2>VetCep Yeni Demo Başvurusu</h2>
      <table style="border-collapse:collapse;width:100%">
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Klinik Adı</td><td style="padding:8px;border:1px solid #e5e7eb">${clinicName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Yetkili</td><td style="padding:8px;border:1px solid #e5e7eb">${authorizedName}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">E-posta</td><td style="padding:8px;border:1px solid #e5e7eb">${email}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Telefon</td><td style="padding:8px;border:1px solid #e5e7eb">${phone}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Şehir</td><td style="padding:8px;border:1px solid #e5e7eb">${city}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Adres</td><td style="padding:8px;border:1px solid #e5e7eb">${address ?? '—'}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Veteriner Sayısı</td><td style="padding:8px;border:1px solid #e5e7eb">${veterinarianCount}</td></tr>
        <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">Başvuru Tarihi</td><td style="padding:8px;border:1px solid #e5e7eb">${new Date().toLocaleString('tr-TR')}</td></tr>
      </table>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'VetCep <onboarding@resend.dev>',
        to: ['burakgemicioglu33@gmail.com'],
        subject: `VetCep Demo Başvurusu — ${clinicName}`,
        html,
        reply_to: email,
      }),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: true }) // Sessiz başarı — form deneyimini korur
  }
}
