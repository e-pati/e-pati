# WhatsApp Cloud API kurulumu

## Meta tarafı

1. Meta for Developers'ta bir app oluştur.
2. WhatsApp product ekle.
3. Cloud API ekranından şu değerleri al:
   - Permanent access token
   - Phone number ID
   - WhatsApp Business Account ID
   - App secret
4. Webhook callback URL:
   - `https://API_DOMAIN/whatsapp/webhook`
5. Verify token:
   - `.env` içindeki `META_WHATSAPP_VERIFY_TOKEN` ile aynı olmalı.
6. Webhook fields:
   - `messages`

## Backend env

```env
META_WHATSAPP_API_VERSION="v20.0"
META_WHATSAPP_TOKEN=""
META_WHATSAPP_PHONE_NUMBER_ID=""
META_WHATSAPP_BUSINESS_ACCOUNT_ID=""
META_WHATSAPP_VERIFY_TOKEN="vetcep-whatsapp-webhook"
META_WHATSAPP_APP_SECRET=""
META_WHATSAPP_LANGUAGE="tr"
META_WHATSAPP_TEMPLATE_EXAM_SUMMARY="exam_summary"
META_WHATSAPP_TEMPLATE_VACCINE_REMINDER="vaccine_reminder"
META_WHATSAPP_TEMPLATE_APPOINTMENT_REMINDER="appointment_reminder"
META_WHATSAPP_TEMPLATE_LAB_RESULT_READY="lab_result_ready"
```

## Template isimleri

Portal şu mesaj tiplerini gönderiyor:

- `exam_summary`
- `vaccine_reminder`
- `appointment_reminder`
- `lab_result_ready`
- `custom`

`custom` serbest text mesajı gönderir. Diğer tipler Meta template mesajı olarak gönderilir. Meta'daki template adı farklıysa ilgili `META_WHATSAPP_TEMPLATE_*` env alanını değiştir.

## API akışı

- `POST /whatsapp/connect`: Klinik numarasını kaydeder, Meta template statülerini senkronize eder.
- `GET /whatsapp/status`: Bağlantı ve template durumlarını döner.
- `POST /whatsapp/test`: Test mesajı gönderir.
- `POST /whatsapp/messages`: Hasta/randevu/lab/aşı mesajlarını gönderir.
- `GET /whatsapp/webhook`: Meta webhook doğrulaması.
- `POST /whatsapp/webhook`: Meta delivery/read/failed statülerini işler.
