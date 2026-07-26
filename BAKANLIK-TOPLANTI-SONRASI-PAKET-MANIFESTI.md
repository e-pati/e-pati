# VetCep - Bakanlık Toplantısı Sonrası Paket Manifesti

> **Sürüm:** 26 Temmuz 2026
>
> **Kullanım:** İç takip paketi. Mesajlardaki köşeli parantezler doldurulmadan ve toplantı notuyla doğrulanmadan gönderilmez.
>
> **Doğrulama:** SHA-256

| Dosya | Boyut (bayt) | Amaç | SHA-256 |
|---|---:|---|---|
| `BAKANLIK-TOPLANTI-SONRASI-TAKIP-KILAVUZU.md` | 2.836 | Zaman çizelgesi, rol ve gönderim sınırı | `ab8224221eb9a4bbe2821507c5459618a714e4d42721fa9133ba6d342f1e1640` |
| `BAKANLIK-TOPLANTI-SONRASI-MESAJLAR.md` | 4.707 | Teşekkür, oturum talebi, takip ve güvenli yanıtlar | `462468cad5f5dceec34056a520769b6078ca371eb2aa24fb88a08473f9828f85` |
| `PILOT-TEKNIK-CALISMA-OTURUMU-GUNDEMI.md` | 3.782 | 90 dakikalık karar gündemi ve tutanak tablosu | `0b83f4f4288abbf6600af4049f238687ce73e3ba3e7721c7e805c8aeee7db922` |

Manifest kendi kendisini doğrulama döngüsü oluşturmamak için hash tablosuna dahil edilmemiştir. ZIP ayrıca `unzip -t` ile kontrol edilir.

## Ek gönderme kuralı

Bu pakette fiyat belgesi, kaynak kod veya teknik ek bulunmaz. Bakanlık bir ek isterse:

1. İstenen dosya açıkça teyit edilir.
2. Danışman/onay durumu kontrol edilir.
3. Yalnız onaylı sürüm ayrı e-postaya eklenir.
4. Gönderilen sürüm ve tarih iç toplantı kaydına yazılır.
