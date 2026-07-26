# VetCep — Bakanlık Teknik Mimari Özeti

> **Belge durumu:** Bakanlık teknik görüşmesine uygun taslak
> **Sürüm:** 26 Temmuz 2026
> **Kapsam:** Hedef mimari ve pilot yaklaşımı; mevcut demo üretim sistemi değildir.

## 1. Yönetici özeti

VetCep, HAYBİS, TÜRKVET, PETVET, İTS ve e-Devlet'in yerine geçen yeni bir kayıt silosu değildir. Bu sistemleri yetkili kayıt kaynağı olarak koruyan; vatandaş, veteriner hekim, üretici, belediye ve Bakanlık için modern deneyim, klinik derinlik ve analitik karar-destek katmanı önerir.

Ortak bağ **Hayvan Kimlik Numarasıdır (HKN)**. HKN mevcut mikroçip, küpe, pasaport ve kamu kayıt numaralarını silmez; kaynağı ve doğrulama statüsüyle ilişkilendirir.

Teknik yaklaşım üç ilkeye dayanır:

1. Kamu kayıt otoritesi korunur; veri sahipliği ve resmî kayıt statüsü Bakanlıkça belirlenir.
2. İlk pilot, sınırlı coğrafya ve ölçülebilir kullanım senaryolarıyla yürütülür.
3. Ulusal ölçekte mikroservis karmaşıklığıyla başlanmaz; sınırları belirli, container tabanlı modüler mimari kademeli ayrıştırılır.

## 2. Katmanlar ve sorumluluklar

| Katman | Sorumluluk | Faz 0 demo | Pilot hedefi |
|---|---|---|---|
| Vatandaş mobil | Hayvan kimliği, aşı kartı, kayıt görüntüleme, bildirim | Expo tabanlı Pamuk ve Sarıkız sentetik profilleri | Gerçek kimlik doğrulama, resmi kayıt görüntüleme ve bildirim izinleri |
| Kurum portalı | Klinik, üretici, belediye ve Bakanlık iş akışları | Next.js portalında senaryolu ekranlar | Rol ve kurum kapsamlı işlem yetkileri, erişilebilirlik |
| Uygulama çekirdeği | Kimlik, kayıt, klinik, belediye, gözetim ve entegrasyon alanları | NestJS klinik çekirdeği + sentetik demo modülleri | Modüler monolit, sürümlü API sözleşmeleri |
| Veri katmanı | HKN eşleştirmesi, yaşam döngüsü olayları, denetim izi | PostgreSQL demo verisi | Türkiye'de onaylı barındırma, RLS/politika, yedekleme ve felaket kurtarma |
| Entegrasyon katmanı | Kamu sistemleriyle kontrollü veri alışverişi | Açıkça etiketlenmiş simülasyon | Resmî protokol, adaptör, kuyruk, tekrar deneme ve mutabakat |
| Analitik katman | Popülasyon, aşılama, hareket ve erken uyarı göstergeleri | 81 il sentetik veri | Onaylı veri kaynakları, veri kalitesi ve açıklanabilir karar desteği |

## 3. Hedef sınırlı bağlamlar

İlk pilot için önerilen uygulama çekirdeği aşağıdaki modüllerden oluşur:

- **Identity:** e-Devlet/TCKN doğrulama bağlantısı, kurum üyeliği, rol ve yetki politikaları.
- **Registry:** Animal süpertipi, HKN, işletme, kimliklendirme, sahiplik ve hareket olayları.
- **Clinical:** muayene, aşı, reçete, laboratuvar, bakım epizodu ve klinik bildirimleri.
- **Municipal:** barınak kabulü, tedavi/kısırlaştırma, sahiplendirme ve belediye raporları.
- **Oversight:** il/ilçe/Bakanlık görünümü, denetim, aşılama ve hastalık sinyalleri.
- **Integration:** HAYBİS/TÜRKVET, PETVET, İTS/e-Reçete ve e-Devlet adaptörleri.

Bu modüller başlangıçta aynı dağıtılabilir NestJS uygulamasında sınırları belirli bir **modüler monolit** olarak tutulur. Dış kurumların sürüm ve erişim temposuna bağlı entegrasyon adaptörleri gerektiğinde bağımsız ölçeklenebilir.

## 4. Entegrasyon haritası

| Sistem | Yetkili rol | VetCep'in rolü | Pilot bağımlılığı |
|---|---|---|---|
| HAYBİS/TÜRKVET | Büyükbaş/küçükbaş ve işletme kayıt otoritesi | İşletme, küpe, hareket ve durum bilgisini anlaşılır iş akışına dönüştürmek | Bakanlığın servis, test ortamı ve veri sözlüğü erişimi |
| PETVET | Ev hayvanı kimlik/sahiplik kayıt otoritesi | Mikroçip-HKN eşleştirmesi ve vatandaş/klinik deneyimi | Resmî protokol ve test verisi |
| İTS/e-Reçete | İlaç ve reçete doğrulama ekosistemi | Klinik reçete akışında doğrulama ve izlenebilirlik | Yetkili servis sözleşmesi |
| e-Devlet | Vatandaş kimliği ve hizmet sunumu | Kimlik doğrulanmış VetCep hizmetine güvenli geçiş | Kurumsal entegrasyon onayı |
| MERNİS/KPS | Kimlik verisi doğrulama | Gerektiği kadar veriyle kimlik doğrulama | Yetki, amaç ve veri minimizasyonu kararı |

Her adaptör için veri sahibi, doğruluk kaynağı, yön, sıklık, hata davranışı, mutabakat yöntemi ve saklama süresi Bakanlıkla yazılı sözleşmede belirlenmelidir. Demo ekranları bu bağlantıların hazır olduğunu iddia etmez.

## 5. Kimlik, yetki ve denetim

Ulusal kullanımda düz klinik rolleri yeterli değildir. Yetkilendirme ulusal → il → ilçe → kurum → kullanıcı hiyerarşisini ve göreve bağlı veri kapsamını desteklemelidir.

Asgari roller:

- vatandaş/hayvan sahibi;
- üretici/işletme sahibi;
- özel veteriner ve klinik yöneticisi;
- belediye barınak personeli ve belediye veteriner müdürlüğü;
- il/ilçe tarım birimi;
- Bakanlık program yöneticisi;
- salt-okunur denetçi ve sistem operatörü.

Her kişisel veri erişimi; kullanıcı, kurum, amaç, zaman, kayıt ve işlem sonucu bağlamında değiştirilemez denetim izine yazılmalıdır. Kritik resmî işlemlerde e-İmza ve çift onay ihtiyacı pilot analizinde kararlaştırılmalıdır.

## 6. Veri ve olay modeli

Hedef çekirdeğin ana varlıkları:

- `Party`: kişi, kurum, belediye, klinik ve kamu birimi;
- `Animal`: ortak HKN taşıyan hayvan süpertipi;
- `Identification`: mikroçip, küpe, pasaport ve kaynak sistem kimliği;
- `Premises`: işletme, barınak, klinik ve geçici bakım konumu;
- `Ownership/Custody`: sahiplik ve bakım sorumluluğu;
- `MovementEvent`: kaynak, hedef, tarih, gerekçe ve doğrulama;
- `CareEpisode`: muayene, aşı, reçete ve laboratuvar olaylarını bağlayan bakım süreci;
- `AuditEvent`: erişim ve değişiklik izi.

Kayıtlar sessizce üzerine yazılmamalı; kaynak, sürüm, doğrulama statüsü ve geçerlilik zamanı korunmalıdır. Analitik panolar kişisel kayıt kopyaları yerine mümkün olduğunca toplulaştırılmış ve amaca uygun veri ürünlerinden beslenmelidir.

## 7. Dağıtım ve ölçek yaklaşımı

- Tüm bileşenler container tabanlı paketlenir; Bakanlık veri merkezi veya onaylı Türkiye yerleşimli altyapıya aynı paketle kurulabilir.
- PostgreSQL birincil veri deposudur; hacim arttıkça bölümleme, okuma replikaları ve arşiv politikaları uygulanır.
- Kurumlar arası olay dağıtımı için Türkiye'de barındırılabilir kuyruk altyapısı değerlendirilir.
- Dosya ve görüntüler şifreli nesne depolamada, erişim politikası ve saklama süresiyle tutulur.
- Gözlemlenebilirlik; uygulama metrikleri, merkezi log, dağıtık iz, güvenlik olayları ve veri kalitesi göstergelerini kapsar.
- Felaket kurtarma hedefleri, Bakanlığın hizmet kritiklik sınıfı ve maliyet kararıyla pilotta kesinleştirilir.

## 8. Pilot kabul kapıları

Pilot canlı veriye ancak aşağıdaki kapılar tamamlandığında geçer:

1. Resmî entegrasyon protokolü, veri sözlüğü ve sorumluluk matrisi.
2. Veri sorumlusu/veri işleyen rollerinin ve hukuki işleme şartlarının belirlenmesi.
3. Türkiye barındırma, yedekleme ve felaket kurtarma tasarımının onayı.
4. Rol/kurum kapsamlı yetki testleri ve değiştirilemez denetim izi.
5. Sızma testi bulgularının kapatılması ve bağımsız güvenlik kabulü.
6. KVKK envanteri, aydınlatma, saklama-imha ve ilgili kişi başvuru süreçleri.
7. Erişilebilirlik, performans ve veri kalitesi kabul ölçütleri.

## 9. Faz 0 ile hedef mimari arasındaki sınır

Bugünkü çalışan demo; ürün deneyimini, klinik çekirdeği, dört aktörlü yaşam döngüsünü ve 81 il karar-destek görünümünü doğrular. Şunları doğrulamaz:

- gerçek e-Devlet/HAYBİS/PETVET/İTS entegrasyonu;
- ulusal kapasite, mevzuat uyumu veya sertifikasyon;
- üretim SLA'sı ve felaket kurtarma;
- gerçek hastalık tespiti veya otomatik idari karar.

Önerilen sonraki adım ulusal geçiş taahhüdü değil; tek il ve sınırlı kurumlarla, başarı ölçütleri yazılı **6–9 aylık pilot keşif ve teslim fazıdır**.
