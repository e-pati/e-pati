# VetCep — Faz 0 Demo Prova Runbook'u

> Son teknik prova: **22 Temmuz 2026**  
> Sunum süresi: **25 dakika**  
> Ana kumanda: `http://localhost:3001/demo-akisi`

Bu belge, Bakanlık sunumundan önce aynı ortamı ayağa kaldırmak ve demo akışını aynı sırayla tekrarlamak için hazırlanmıştır. VetCep; HAYBİS, PETVET, İTS, TÜRKVET ve e-Devlet'in yerine geçen bir sistem olarak değil, bu sistemlerin üzerinde çalışan entegrasyon, kullanıcı deneyimi, klinik derinlik ve karar-destek katmanı olarak anlatılmalıdır.

## 1. Zorunlu ön kontrol

Üç ayrı terminal kullanın. Önce Docker Desktop ve PostgreSQL bağlantısının hazır olduğundan emin olun. Bu provada Docker Desktop kapalı olduğu için backend mevcut `.env` veritabanına doğrudan NestJS ile bağlanarak doğrulandı.

```bash
# Terminal 1 — backend
cd e-pati-api
npm run db:generate
npm run start:dev

# Terminal 2 — portal
cd portal
npm run dev -- --port 3001

# Terminal 3 — mobil
cd mobile
npm run web
```

Backend hazır olunca aşağıdaki iki adres HTTP 200 dönmelidir:

- `http://localhost:3000/health`
- `http://localhost:3000/health/ready`

Demo hesapları:

- Klinik: `vet@example.com` / `DemoPass123`
- Vatandaş simülasyonu: `12345678901` / `demo1234`

Prisma şeması değişmişse `npm run db:generate` atlanmamalıdır. Demo verisi görünmüyorsa Burak ve Erol birlikte migration/seed durumunu kontrol etmelidir; paylaşılan veritabanında prova sırasında habersiz seed çalıştırılmamalıdır.

Sunumdan hemen önce:

1. `/demo-akisi` sayfasını açın ve **Tüm demo verisini sıfırla** eylemini çalıştırın.
2. Klinik hesabıyla ayrı bir sekmede giriş yapın.
3. `/patients` ekranında `Misket` aramasının sonuç verdiğini kontrol edin.
4. Mobilde `/pets`, `/pets/demo-pamuk` ve `/pets/producer-demo` rotalarını önceden açın.
5. Tarayıcı yakınlaştırmasını `%100`, bildirimleri sessiz ve ekran paylaşımını hazır tutun.

## 2. 25 dakikalık sunum rotası

| Süre | Bölüm | Canlı eylem | Ana cümle |
|---|---|---|---|
| 00:00–02:00 | Açılış | `/demo-akisi` | “Mevcut kamu sistemlerinin yerine değil, üzerinde çalışan deneyim ve karar-destek katmanıyız.” |
| 02:00–05:00 | Vatandaş + mobil | `/vatandas-giris` → Pamuk → Sarıkız | Simülasyon etiketini göster; tek HKN altında evcil ve üretici deneyimini bağla. |
| 05:00–09:00 | Klinik | `/login` → `/patients` → Misket → `/vaccinations` | Misket'i arayarak profil, muayene ve aşı kayıtlarını göster. |
| 09:00–14:00 | Üretici | `/hayvancilik` | İşletme kaydı → küpe/HKN → Güneş Süt'ten Bereket Besi'ye hareket → olay geçmişi. |
| 14:00–18:00 | Belediye | `/belediye` | Dost için barınak kabulü → kısırlaştırma → doğrulanmış sahiplendirme ilanı. |
| 18:00–24:00 | Bakanlık | `/bakanlik` | 81 il → Konya drill-down → aşılama/popülasyon → Kars erken uyarısı. |
| 24:00–25:00 | Kapanış | `/demo-akisi` | Ulusal dönüşüm sözü değil; sınırlı, ölçülebilir ve resmî entegrasyonlu pilot önerisi. |

### Akış notları

- Vatandaş ekranındaki **Simülasyon / Demo** etiketini saklamayın; güven unsurudur.
- Misket, 13 kayıtlı hastanın ilk sayfasında olmayabilir. `/patients` aramasına `Misket` yazın.
- Hayvancılık ve belediye akışlarında forma veri girmek yerine sentetik varsayılanları kullanıp ilerleyin.
- Bakanlık ekranında önce ulusal görünümü, sonra tek il detayını gösterin. Haritadaki her noktayı açıklamaya çalışmayın.
- Her bölüm sonunda kumandaya dönüp süreyi kontrol edin; süre aşılırsa ayrıntı ekranını değil ana mesajı koruyun.

## 3. Arıza anı B planı

| Sorun | Hızlı karar |
|---|---|
| Backend veya veritabanı açılamıyor | Klinik bölümünü atlamayın; önceden alınmış Misket ekran görüntülerini kullanın. Vatandaş, üretici, belediye ve Bakanlık yüzeyleri sentetik veriyle backend'den bağımsızdır. |
| Mobil Expo bağlantısı kopuyor | Expo web çıktısını veya önceden açık Pamuk/Sarıkız sekmelerini gösterin. Yeni paket kurmayın. |
| İnternet kesiliyor | Yerel portal ve mobil servislerle devam edin; dış görsel/servis bağımlılığı üzerinden canlı iddia kurmayın. |
| Demo adımı yarıda kalıyor | `/demo-akisi` üzerinden tüm demo verisini sıfırlayın ve ilgili bölümün başlangıç rotasına dönün. |
| Süre 2 dakikadan fazla geride | Klinik ayrıntılarını ve belediye ilan önizlemesini kısaltın; Bakanlık karar-destek ekranını ve pilot kapanışını koruyun. |

## 4. Zor sorulara kısa cevaplar

**“HAYBİS/TÜRKVET ile nasıl entegre olacaksınız?”**  
Yetkili kayıt kaynağı kamu sistemleri olarak kalır. VetCep, Bakanlığın sağlayacağı resmî protokol ve servis sözleşmeleri üzerinden adaptörlerle veri alışverişi yapan deneyim ve analitik katmanıdır; demo ekranları bugün bu hedef sözleşmeyi sentetik veriyle temsil ediyor.

**“Veri nerede barınacak?”**  
Bu demo üretim altyapısı değildir. Pilot tasarımında veri sınıflandırması, KVKK, Türkiye'de barındırma, erişim kayıtları, şifreleme, yedekleme ve Bakanlık güvenlik onayı birlikte netleştirilecektir. Hazır olmayan bir sertifika veya onay varmış gibi anlatılmamalıdır.

**“İki kişilik ekip bunu nasıl sürdürecek?”**  
İlk talep ulusal yaygınlaştırma değil, kapsamı ve başarı ölçütleri sınırlı bir pilottur. Pilotla birlikte güvenlik, DevOps, kamu entegrasyonu ve destek kapasitesi işe alım/iş ortaklığı planıyla büyütülür; yönetişim ve sorumluluk matrisi sözleşmeye bağlanır.

**“Bunu neden TÜBİTAK veya mevcut yüklenici yapmasın?”**  
Bu bir kurumlar arası yarış değildir. VetCep'in katkısı hızlı ürün iterasyonu, veteriner klinik derinliği ve vatandaş/üretici deneyimini tek akışta doğrulamaktır. TÜBİTAK, Bakanlık birimleri ve mevcut yükleniciler pilotun entegrasyon ve güvenlik ortakları olabilir.

**“Şirket kapanırsa ne olur?”**  
Pilot sözleşmesinde veri sahipliği Bakanlıkta kalmalı; açık veri dışa aktarma, dokümantasyon, kaynak kod emaneti/teslim koşulları, geçiş planı ve hizmet sürekliliği maddeleri bulunmalıdır. Tek tedarikçiye kilitlenme ürün avantajı olarak sunulmaz.

## 5. Teknik prova #1 sonucu — 22 Temmuz 2026

- Backend `npm run db:generate` sonrasında **0 TypeScript hatasıyla** açıldı.
- `/health`, `/health/ready` ve gerçek klinik login isteği HTTP 200 döndü.
- Gerçek portal akışı: klinik giriş → pano → Misket araması → profil → aşı kaydı geçti.
- Portal demo paketi: vatandaş, sunum kumandası, hayvancılık, belediye ve Bakanlık için **10/10 Playwright testi geçti**.
- Mobil `npx tsc --noEmit` ve Expo production web export başarılı.
- Portal lint başarılı.
- İlk paralel test turundaki tek hayvancılık zaman aşımı, tek işçili tekrar ve tam turda tekrarlanmadı; ürün hatası olarak doğrulanmadı.
- Portalın backend üst sınırını aşan üç `limit=500` isteği `100` olarak düzeltildi; Misket aşı-hasta eşleşmesi yeniden doğrulandı.
- İnsan anlatımlı, kronometreli iki tam prova hâlâ yapılmalıdır.

## 6. Sunum günü go/no-go

Sunuma ancak aşağıdakilerin tümü “evet” ise canlı demoyla girin:

- [ ] `origin/main` ve sunum dalı beklenen committe
- [ ] Backend health ve readiness 200
- [ ] Klinik login ve Misket araması çalışıyor
- [ ] Pamuk ve Sarıkız mobil ekranları açık
- [ ] Hayvancılık ve belediye demo durumu sıfırlandı
- [ ] Bakanlık haritasında 81 il ve grafikler görünüyor
- [ ] Bir tam kronometreli prova 25 dakika içinde bitti
- [ ] Yedek ekran görüntüleri yerel diskte hazır

