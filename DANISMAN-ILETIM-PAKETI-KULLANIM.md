# VetCep - Danışman İletim Paketi Kullanımı

> **Sınıflandırma:** GİZLİ İÇ İNCELEME
>
> **Amaç:** Bakanlık görüşmesi öncesinde hukuk, KVKK ve mali/kamu ihalesi kararlarını yazılı olarak kapatmak.
>
> **Paylaşım sınırı:** Bu ZIP Bakanlığa, potansiyel müşteriye veya danışman ekibi dışındaki üçüncü kişilere doğrudan iletilmez.

## Paketi alan danışmandan beklenen

1. `VETCEP-DANISMAN-INCELEME-VE-ONAY-MATRISI.pdf` dosyasındaki kendisine ait satırları incelemek.
2. Her satır için **Onay**, **Revizyon gerekli** veya **Kapsam dışı** sonucu vermek.
3. Revizyon gerekiyorsa dosya adı, bölüm başlığı ve önerilen metni açıkça belirtmek.
4. Sonucu imzalı PDF, e-posta yanıtı veya izlenebilir yazılı görüş olarak göndermek.
5. Kesin hukuki/mali görüş verilemeyen konularda eksik bilgi ve sonraki adımı yazmak.

## Hangi danışmana hangi ekler?

| Alıcı | Zorunlu ekler | İhtiyaca göre |
|---|---|---|
| Hukuk danışmanı | Onay matrisi PDF, teknik mimari, güvenlik/KVKK notu, fazlı teslim ve fiyat çerçevesi | Düzenlenebilir matris |
| KVKK danışmanı | Onay matrisi PDF, güvenlik/KVKK notu, teknik mimari, dış-paylaşım teknik ek PDF | Fazlı teslim ve fiyat çerçevesinin veri sorumluluğu/SLA bölümleri |
| Mali müşavir / kamu ihalesi danışmanı | Onay matrisi PDF, fazlı teslim ve fiyat çerçevesi, teknik mimari | Dış-paylaşım teknik ek PDF |
| Erol - teknik inceleme | Onay matrisi PDF, teknik mimari, güvenlik/KVKK notu, fazlı teslim ve fiyat çerçevesi | Düzenlenebilir matris |

## Dosya sınırları

- `FAZLI-TESLIM-VE-FIYAT-CERCEVESI.md` bağlayıcı teklif değildir; iç müzakere taslağıdır.
- `VETCEP-BAKANLIK-TEKNIK-EKLER-TASLAK.pdf` onaylı uyum veya sertifikasyon belgesi değildir.
- Belgelerdeki takvim, efor, fiyat, SLA, fikrî hak ve ihale varsayımları yazılı uzman görüşü gelene kadar taslak kalır.
- Paket gerçek parola, kişisel veri, `.env`, kaynak kod veya veritabanı dökümü içermez.

## Yanıtların işlenmesi

- Burak, gelen her yazılı görüşü onay matrisindeki ilgili satıra bağlar.
- Erol, teknik olarak uygulanabilirlik gerektiren barındırma, entegrasyon, SLA ve escrow maddelerini doğrular.
- Çelişen danışman görüşleri tek taraflı yorumlanmaz; ortak karar oturumu açılır.
- Tüm kritik satırlar kapanmadan `TASLAK` etiketi kaldırılmaz ve Bakanlığa bağlayıcı fiyat/uyum taahhüdü verilmez.
