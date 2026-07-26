# VetCep - Bakanlık Toplantısı Sonrası Paket Manifesti

> **Sürüm:** 26 Temmuz 2026
>
> **Kullanım:** İç takip paketi. Mesajlardaki köşeli parantezler doldurulmadan ve toplantı notuyla doğrulanmadan gönderilmez.
>
> **Doğrulama:** SHA-256

| Dosya | Boyut (bayt) | Amaç | SHA-256 |
|---|---:|---|---|
| `BAKANLIK-TOPLANTI-SONRASI-TAKIP-KILAVUZU.md` | 3.006 | Zaman çizelgesi, rol ve gönderim sınırı | `37d970df6609471075aa64598a63049376cdd4c273e4ad06ae5d45ef1726cd16` |
| `BAKANLIK-TOPLANTI-SONRASI-MESAJLAR.md` | 4.945 | Teşekkür, oturum talebi, takip ve güvenli yanıtlar | `aa191601a6c59954561aebc4f4020256c68ed982586ef8ac2839844692ecf561` |
| `PILOT-TEKNIK-CALISMA-OTURUMU-GUNDEMI.md` | 3.782 | 90 dakikalık karar gündemi ve tutanak tablosu | `0b83f4f4288abbf6600af4049f238687ce73e3ba3e7721c7e805c8aeee7db922` |
| `PILOT-ON-CERCEVESI.md` | 4.023 | Düzenlenebilir pilot keşif ve karar formu | `f256e7015006f860c61df568c113aebdc53f68290ec1fc47656e66d636b3100a` |
| `VETCEP-PILOT-ON-CERCEVESI.pdf` | 71.731 | Toplantıda doldurulabilir tek sayfalık A4 form | `1663f70ed7fad79845f54ceaba17b56f0cbc1d72cacdd7dfe58dcb34abc60798` |

Manifest kendi kendisini doğrulama döngüsü oluşturmamak için hash tablosuna dahil edilmemiştir. ZIP ayrıca `unzip -t` ile kontrol edilir.

## Ek gönderme kuralı

Bu pakette fiyat belgesi, kaynak kod veya onaylı teknik ek bulunmaz. Pilot ön çerçevesi fiyat/ihale/entegrasyon izni olmayan boş keşif formudur. Bakanlık başka bir ek isterse:

1. İstenen dosya açıkça teyit edilir.
2. Danışman/onay durumu kontrol edilir.
3. Yalnız onaylı sürüm ayrı e-postaya eklenir.
4. Gönderilen sürüm ve tarih iç toplantı kaydına yazılır.
