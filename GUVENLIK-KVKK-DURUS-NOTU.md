# VetCep — Güvenlik ve KVKK Duruş Notu

> **Belge durumu:** Bakanlık görüşmesi için dürüst durum ve iyileştirme taslağı
> **Sürüm:** 26 Temmuz 2026
> **Uyarı:** Bu belge hukuki görüş, sertifika veya uyum beyanı değildir. Nihai yükümlülükler veri sorumlusu/veri işleyen rolleri ve pilot sözleşmesi belirlendikten sonra KVKK ve kamu bilişim güvenliği uzmanlarıyla doğrulanmalıdır.

## 1. Duruşumuz

VetCep Faz 0, sentetik veriyle çalışan bir ürün demosudur; üretim güvenliği veya KVKK uyumu tamamlanmış ulusal sistem olarak sunulmaz.

Pilot yaklaşımımız:

- kişisel veriyi amaçla sınırlı ve en az miktarda işlemek;
- yetkili kamu kayıtlarını doğruluk kaynağı olarak korumak;
- Türkiye'de Bakanlıkça onaylanan altyapıda barındırmak;
- her erişimi rol, kurum ve amaç bağlamında sınırlandırmak;
- güvenlik, gizlilik ve denetimi sonradan eklenen özellik değil kabul kapısı yapmak.

## 2. İşlenecek veri sınıfları

| Veri grubu | Örnek | Temel risk |
|---|---|---|
| Kimlik ve iletişim | TCKN, ad, iletişim ve adres | Kimlik kötüye kullanımı, gereksiz toplama |
| Kurum/meslek | klinik, veteriner, belediye, işletme | Yetki aşımı, kurumlar arası veri sızıntısı |
| Hayvan-sahiplik ilişkisi | HKN, mikroçip/küpe, sahiplik ve hareket | Kişinin konumu, ekonomik faaliyeti ve davranış örüntüsü |
| Klinik kayıt | muayene, aşı, reçete, laboratuvar | Yanlış kişiye erişim, kayıt bütünlüğü |
| Konum ve hareket | işletme, barınak, il/ilçe, transfer | Fiziksel güvenlik ve ticari hassasiyet |
| Denetim verisi | kullanıcı, zaman, amaç, işlem sonucu | Çalışan ve kullanıcı faaliyetinin izlenmesi |

Hayvan sağlık kaydı tek başına insan sağlık verisi değildir; ancak TCKN, adres, sahiplik, ekonomik faaliyet ve konumla birleştiğinde gerçek kişiye ilişkin yüksek etkili bir veri seti oluşturur. Risk değerlendirmesi yalnız alan adına göre değil, birleşik kullanım ve olası zarar üzerinden yapılmalıdır.

## 3. Bugünkü durum

Faz 0'da bulunan güvenlik temelleri:

- portal oturumunda erişim ve yenileme tokenları JavaScript tarafından okunamayan httpOnly cookie'de tutulur;
- tarayıcı kaynaklı güvenli olmayan isteklerde Origin/Referer allowlist kontrolü bulunur;
- rol tabanlı koruma ve klinik kapsamı için başlangıç modeli vardır;
- Docker ile tekrarlanabilir yerel demo ortamı ve gerçek oturum smoke testi bulunur;
- demo kamu entegrasyonları ve sentetik veriler açıkça etiketlenir.

Pilot öncesi tamamlanması gereken başlıca boşluklar:

- ulusal/il/ilçe/kurum hiyerarşisini kapsayan yetki modeli ve veri katmanı politikaları;
- native mobil kimlik doğrulama ile imzalı dış servis webhook'larının güvenli istek politikası;
- merkezi secret yönetimi, anahtar rotasyonu ve depo geçmişi güvenlik taraması;
- kişisel veri envanteri, aydınlatma, hukuki işleme şartı, saklama-imha ve ilgili kişi başvuru süreçleri;
- Türkiye'de onaylı barındırma ve alt işleyen/tedarikçi değerlendirmesi;
- değiştirilemez denetim izi, merkezi güvenlik logları ve olay müdahale süreci;
- bağımsız sızma testi, bağımlılık/uygulama güvenliği taraması ve bulgu kapatma;
- yedekleme, geri yükleme ve felaket kurtarma tatbikatı.

## 4. KVKK iş paketleri

### 4.1 Yönetişim ve envanter

- Veri sorumlusu, ortak veri sorumlusu ve veri işleyen rollerini işlem bazında belirlemek.
- İşleme amacı, hukuki sebep, veri kategorisi, kişi grubu, alıcı, aktarım, saklama süresi ve tedbiri içeren kişisel veri işleme envanteri hazırlamak.
- VERBİS kayıt yükümlülüğünü güncel istisnalar ve kurum yapısı üzerinden hukuk danışmanıyla değerlendirmek.
- Tedarikçi ve alt işleyen sözleşmelerine gizlilik, güvenlik, denetim, ihlal ve veri iade/imha hükümleri eklemek.

### 4.2 Şeffaflık ve kişi hakları

- Rol ve hizmete göre kısa, anlaşılır aydınlatma metinleri hazırlamak.
- Açık rıza gereken işlemleri hizmetin zorunlu parçasından ayırmak; rızayı genel bir güvenlik veya işleme dayanağı gibi kullanmamak.
- Erişim, düzeltme, silme ve itiraz başvurularının kimlik doğrulamalı iş akışını tasarlamak.
- Çocuklar, yetiştiriciler ve çalışanlar gibi farklı kişi grupları için uygun iletişim dili belirlemek.

### 4.3 Saklama, silme ve anonimleştirme

- Her kayıt sınıfı için mevzuat ve hizmet gereksinimine dayalı saklama süresi belirlemek.
- Süre sonunda silme, yok etme veya anonimleştirme yöntemini kayıt ortamına göre tanımlamak.
- Bakanlık panolarında mümkün olduğunca toplulaştırılmış veri kullanmak; küçük grup ve yeniden tanımlama riskini test etmek.
- Silme ve anonimleştirme işlemlerini doğrulanabilir kayıtlarla izlemek.

## 5. Teknik güvenlik kontrolleri

### Kimlik ve erişim

- e-Devlet entegrasyonu yalnız resmî protokol ve test ortamıyla;
- kurum kapsamlı RBAC/ABAC ve PostgreSQL politika/RLS katmanı;
- ayrıcalıklı işlemlerde güçlü kimlik doğrulama ve gerekirse çift onay;
- düzenli yetki gözden geçirme, görev ayrılığı ve acil erişim prosedürü.

### Uygulama ve API

- güvenli yazılım yaşam döngüsü, kod inceleme ve bağımlılık taraması;
- sürümlü API sözleşmeleri, girdi doğrulama, hız sınırlama ve kötüye kullanım izleme;
- cookie-auth tarayıcı isteklerinde CSRF/Origin politikası;
- native mobilde uygun token saklama ve cihaz/oturum iptali;
- webhook'larda sağlayıcı imzası, zaman damgası ve replay koruması.

### Veri ve altyapı

- aktarımda ve depolamada şifreleme; anahtarların veriden ayrı yönetimi;
- secretların kaynak koddan ayrılması, merkezi kasa ve periyodik rotasyon;
- kişisel veri erişimi için ayrıntılı ve kurcalamaya dayanıklı denetim izi;
- ağ bölümlendirme, en az yetki, güvenli yönetim erişimi ve düzenli yama;
- şifreli yedek, geri yükleme testi ve tanımlı RPO/RTO;
- loglarda TCKN, token, parola ve gereksiz kişisel veri maskeleme.

## 6. Pilot güvenlik takvimi

| Dönem | Çıktı | Kabul ölçütü |
|---|---|---|
| Ay 0–1 | veri akışları, rol matrisi, envanter ve tehdit modeli | Bakanlık, ürün, hukuk ve güvenlik ortak onayı |
| Ay 1–2 | Türkiye barındırma, secret yönetimi, CI güvenlik kapıları | kritik secret kodda değil; otomatik taramalar aktif |
| Ay 2–4 | hiyerarşik yetki, RLS/politika, denetim izi | kurumlar arası izolasyon negatif testleri geçer |
| Ay 3–5 | aydınlatma, başvuru, saklama-imha ve olay müdahale süreçleri | masa başı tatbikat ve kanıt paketi |
| Ay 5–6 | bağımsız sızma testi ve düzeltmeler | kritik/yüksek bulgular kabul edilmeden kapatılır |
| Pilot öncesi | yedek geri yükleme ve güvenlik kabulü | imzalı go/no-go kararı |

Takvim entegrasyon erişimi, pilot kapsamı ve Bakanlık güvenlik gereksinimlerine göre güncellenir; bir sertifika tarihi vaadi değildir.

## 7. Olay ve ihlal yönetimi

Pilot öncesi şu akış yazılı ve tatbik edilmiş olmalıdır:

1. güvenlik olayını algılama ve sınıflandırma;
2. yayılımı durdurma ve kanıtı koruma;
3. veri, kişi ve etki kapsamını belirleme;
4. Bakanlık, veri sorumlusu ve hukuk ekiplerine eskalasyon;
5. gerekli ilgili kişi/Kurum bildirimlerinin güncel mevzuata göre yürütülmesi;
6. kök neden, düzeltici faaliyet ve tekrar test.

Kesin bildirim süresi ve sorumlusu olay anında tahmin edilmez; güncel Kurul kararları, sözleşme ve hukuk görüşü esas alınır.

## 8. Bakanlık görüşmesinde kullanılacak ifadeler

**Kullanılabilir:**

> Faz 0 sentetik veriyle çalışan bir demodur. Pilot canlı veriye ancak Türkiye barındırma, rol/kurum izolasyonu, KVKK süreçleri, bağımsız sızma testi ve Bakanlık güvenlik kabulü tamamlandıktan sonra geçer.

**Kullanılmamalı:**

- “KVKK uyumumuz tamam.”
- “ISO 27001 sertifikamız var.” — gerçekten alınmadıysa.
- “Veri kesinlikle hiçbir zaman dışarı çıkmaz.” — mimari ve tedarikçi sözleşmeleri doğrulanmadan.
- “e-Devlet ve kamu sistemlerine bağlıyız.” — resmî entegrasyon yokken.

## 9. Resmî başvuru kaynakları

- [KVKK — Kişisel Veri Güvenliği Rehberi](https://www.kvkk.gov.tr/Icerik/4198/Kisisel-Veri-Guvenligi-Rehberi-%28Teknik-ve-Idari-Tedbirler%29)
- [KVKK — Veri Güvenliğine İlişkin Yükümlülükler](https://www.kvkk.gov.tr/Icerik/2040/Veri-Guvenligine-Iliskin-Yukumlulukler)
- [KVKK — VERBİS Kılavuzu güncellemesi](https://www.kvkk.gov.tr/Icerik/8426/Sorularla-Veri-Sorumlulari-Sicil-Bilgi-Sistemi-VERBIS-ve-Veri-Sorumlulari-Sicil-Bilgi-Sistemi-VERBIS-Kilavuzu-Guncellendi)
- [KVKK — Silme, Yok Etme veya Anonim Hale Getirme](https://www.kvkk.gov.tr/Icerik/2038/kisisel-verilerin-silinmesi-yok-edilmesi-veya-anonim-hale-getirilmesi)
- [KVKK — T.C. Kimlik Numaralarının İşlenmesi Rehberi](https://www.kvkk.gov.tr/Icerik/7798/Turkiye-Cumhuriyeti-Kimlik-Numaralarinin-Islenmesi-Hakkinda-Rehber)
