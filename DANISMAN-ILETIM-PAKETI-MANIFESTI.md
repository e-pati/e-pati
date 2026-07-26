# VetCep - Danışman İletim Paketi Manifesti

> **Sürüm:** 26 Temmuz 2026
>
> **Sınıflandırma:** GİZLİ İÇ İNCELEME - Bakanlığa veya üçüncü kişilere doğrudan iletilmez
>
> **Doğrulama:** SHA-256

| Dosya | Boyut (bayt) | Sınıf / amaç | SHA-256 |
|---|---:|---|---|
| `DANISMAN-ILETIM-PAKETI-KULLANIM.md` | 2.478 | Tüm danışmanlar - başlangıç | `4a490eb85b1074c770ba5f2edd05a2ee14ec8cb531984341f801079dfdfb8327` |
| `DANISMAN-ILETIM-MESAJLARI.md` | 4.514 | Burak - hazır iletim metinleri | `9bd6ab21ee250c9e96d3e26251f1e17dc037b301660199d8dff84226d3134a96` |
| `VETCEP-DANISMAN-INCELEME-VE-ONAY-MATRISI.pdf` | 69.312 | Tüm danışmanlar - doldurulabilir form | `26de932668626ca10b42226703c0d5d506c5a8317812932878333f7ad907051a` |
| `DANISMAN-INCELEME-VE-ONAY-MATRISI.md` | 3.657 | Düzenlenebilir form kaynağı | `8816605bbd572be2bb74448baa7cab756028ff7b06ecfaa24fcd8e682718fd12` |
| `BAKANLIK-TEKNIK-MIMARI.md` | 8.117 | Hukuk, KVKK, ihale ve teknik | `05d486601d6f703bbf506d0d81043c18f0fc5af400eb40a6fb503968f07614c4` |
| `GUVENLIK-KVKK-DURUS-NOTU.md` | 9.030 | Hukuk, KVKK ve teknik | `d66c40c1d6fae211180d309020757dc90052b9f2084606d970aa16f3118eda36` |
| `FAZLI-TESLIM-VE-FIYAT-CERCEVESI.md` | 9.684 | GİZLİ - hukuk, mali/kamu ihalesi ve teknik | `6d320e817f3010ed5958dea34a872b6c859f0a262e3731ed05d226f4c4a408ab` |
| `VETCEP-BAKANLIK-TEKNIK-EKLER-TASLAK.pdf` | 174.044 | KVKK/ihale bağlamı - dış paylaşım taslağı | `483758c7fa3c0c354e6f36fd7241593c6b60cc7fbdf5341247756f46cee9eabc` |

Bu manifest kendi kendisini doğrulama döngüsü oluşturmamak için hash tablosuna dahil edilmemiştir. Arşiv ayrıca `unzip -t` ile doğrulanır.

## Güvenli kullanım

- Paketin tamamı yalnız güven ilişkisi ve gerekiyorsa gizlilik sözleşmesi bulunan danışmanlarla paylaşılır.
- Her alıcıya yalnız görevi için gerekli ekler gönderilir; fiyat çerçevesi varsayılan olarak herkese eklenmez.
- Dosyalar e-postaya eklenmeden önce alıcı adresi ve ek listesi ikinci kez kontrol edilir.
- Danışman yanıtları tarih ve ileti referansıyla onay matrisine bağlanır.
