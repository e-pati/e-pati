# VetCep — Sunum Günü Dosya Manifesti

> Paket sürümü: 26 Temmuz 2026
> Doğrulama algoritması: SHA-256
> Paket tipi: Çevrimdışı, dış-paylaşıma güvenli Faz 0 sunum paketi

## Paket içeriği

| Dosya | Boyut (bayt) | SHA-256 |
|---|---:|---|
| `SUNUM-GUNU-CEVRIMDISI-KILAVUZ.md` | 3.262 | `44a846ad0b52917e4c48112097a99674c15f9e94dd969dee6ec6ead7237a3ee8` |
| `SEVVAL-VETCEP-SUNUM-PAKETI.pdf` | 159.070 | `4a934c8c85acfb809ff4ea6ad322018fca3e19fec251eb778cbefe2ea1d36249` |
| `VETCEP-BAKANLIK-TEKNIK-EKLER-TASLAK.pdf` | 174.044 | `483758c7fa3c0c354e6f36fd7241593c6b60cc7fbdf5341247756f46cee9eabc` |
| `VETCEP-FAZ0-YEDEK-DEMO.mp4` | 10.966.477 | `4223c6adaeaccb1ccbb0b164ea94626406100d7ee2508e2017af23d0679e0817` |
| `VETCEP-YEDEK-DEMO-KARELER.jpg` | 78.587 | `c433aaabe89f0d2266d5494bb162c2e097327e93a192631c3bd1cf0ed76c090c` |
| `YEDEK-DEMO-VIDEO-KULLANIM.md` | 2.699 | `cb875c320c642d5b2a1101074c71c100dbc9cccf8238993c944f14d28c605d81` |
| `DEMO-PROVA-RUNBOOK.md` | 9.885 | `ad6ef5b7cfca5258669802e8be0ae80b8e5a875e6bcf7036c1d56eb0083913ae` |

`SUNUM-GUNU-DOSYA-MANIFESTI.md` kendi kendisini doğrulama döngüsü oluşturmamak için hash tablosuna dahil edilmemiştir. ZIP bütünlüğü ayrıca arşiv testiyle doğrulanır.

## İçerik sınırı

- Paket fiyat ve iç müzakere belgesi içermez.
- Gerçek kimlik bilgisi, parola, `.env`, veritabanı dökümü veya kaynak kod içermez.
- Teknik ek PDF'i açıkça `TASLAK` olarak etiketlidir.
- Video sentetik veri ve simülasyon etiketlerini korur.

## Yerel doğrulama

macOS üzerinde paketi klasöre çıkardıktan sonra her dosya için:

```bash
shasum -a 256 DOSYA_ADI
```

çıktısı tablodaki değerle aynı olmalıdır. ZIP dosyası için:

```bash
unzip -t VETCEP-SUNUM-GUNU-CEVRIMDISI-PAKETI.zip
```
