## SOA İsterleri ve Projedeki Karşılıkları

Bu dosya, verilen ödev dokümanındaki **Servis Odaklı Mimari (SOA)** isterlerinin
bu projede nerede ve nasıl karşılandığını özetler.

---

### 1. 6 Katmanlı SOA Tasarımı

Projede aşağıdaki katmanlar uygulanmıştır:

- **Presentation Layer (Sunum Katmanı)**
  - `routes/api.js` → REST endpoint tanımları (`/auth/*`, `/carbon/*`)
  - `controllers/AuthController.js` → Kullanıcı kayıt ve giriş işlemleri
  - `controllers/CarbonController.js` → Karbon hesapse, kayıt getirme, toplam ve dağılım

- **Service Layer (İş Mantığı Katmanı)**
  - `services/CarbonCalculationService.js` → Ulaşım, enerji, beslenme ve tüketim
    verilerinden toplam karbon ayak izi hesaplama mantığı bu dosyada toplanmıştır.

- **Data Access Layer (Veri Erişim Katmanı)**
  - `models/User.js` → Kullanıcı verilerini `data/users.json` içinde yönetir.
  - `models/CarbonRecord.js` → Karbon kayıtlarını `data/carbon_records.json` içinde tutar.

- **Integration Layer (Entegrasyon Katmanı)**
  - `services/externalApiService.js` → Anthropic Claude hazır API’sine bağlanarak
    AI tabanlı öneriler üretir (`getAIRecommendations` metodu).

- **Communication Layer (İletişim Katmanı)**
  - `services/soapService.js` → SOAP tabanlı web servisi (`CalculateCarbon` operasyonu).
  - `services/grpcService.js` → gRPC servisi (`CalculateCarbon`, `GetTotalCarbon`, `GetBreakdown` RPC’leri).

- **Infrastructure Layer (Altyapı Katmanı)**
  - `server.js` → Express uygulaması, middleware’ler (`cors`, `body-parser`), port ayarları,
    `/health` endpoint’i ve SOAP/gRPC sunucularının başlatılması.
  - `middleware/auth.js` → JWT tabanlı kimlik doğrulama (token üretme ve doğrulama).

`server.js` içindeki `/health` endpoint’i, bu katmanların isimlerini de döndürerek
mimariyi dışarıya da göstermektedir.

---

### 2. SOAP İletişim Protokolü ile İletişim

- **İlgili dosya:** `services/soapService.js`
- **Servis adı:** `CarbonFootprintService`
- **Operasyon:** `CalculateCarbon`
- **Erişim adresi (WSDL):** `http://localhost:3000/soap?wsdl`

Akış:
1. İstemci WSDL’i alır ve `CalculateCarbon` operasyonuna SOAP isteği gönderir.
2. `soapService.js`, gelen verileri `CarbonCalculationService` ve `CarbonRecord` ile
   işleyip sisteme kaydeder.
3. Hesaplanan toplam ve kategorisel karbon değerlerini içeren SOAP yanıtı döner.

Detaylı açıklama için: `SOAP_Aciklama.md`

---

### 3. gRPC Protokolü ile İletişim

- **İlgili dosyalar:**
  - `services/grpcService.js`
  - `proto/carbon.proto`
- **Servis adı:** `CarbonFootprintService` (gRPC)
- **Metotlar:**
  - `CalculateCarbon`
  - `GetTotalCarbon`
  - `GetBreakdown`
- **Port:** `.env` içindeki `GRPC_PORT` (yoksa varsayılan `50051`)

Akış:
1. gRPC istemcisi, `carbon.proto` dosyasını kullanarak stub oluşturur.
2. İstemci, yukarıdaki RPC metotlarından birini çağırır.
3. `grpcService.js` içinde:
   - İş mantığı için `CarbonCalculationService` kullanılır.
   - Veri kaydı ve sorguları için `CarbonRecord` modeli kullanılır.
4. Sonuçlar gRPC yanıtı olarak istemciye döner.

Bu yapı ile rubrikteki **“gRPC protokolü ile en az bir iletişim sağlama”** maddesi karşılanmaktadır.

---

### 4. Node.js ile Yazılmış API

- **Teknoloji:** Node.js + Express
- **Ana dosya:** `server.js`
- **Rotalar:** `routes/api.js`

Sağlanan başlıca endpoint’ler:

- `POST /api/auth/register` → Yeni kullanıcı kaydı
- `POST /api/auth/login` → Giriş ve JWT token üretimi
- `POST /api/carbon/calculate` → Karbon hesaplama ve kayıt oluşturma
- `GET  /api/carbon/records` → Kullanıcının karbon kayıtlarını listeleme
- `GET  /api/carbon/total` → Seçili tarih aralığında toplam karbon
- `GET  /api/carbon/breakdown` → Kategorilere göre karbon dağılımı
- `POST /api/carbon/recommendations` → AI tabanlı öneriler (Claude entegrasyonu)

Bu REST endpoint’leri, rubrikteki **“Node.js/Vue.js ile yazılmış API”** maddesini Node.js tarafında yerine getirir.

---

### 5. En Az Bir Hazır API Kullanımı

Projede hazır bir dış servis (third‑party API) olarak:

- **Anthropic Claude API** kullanılmıştır.
  - **Backend entegrasyonu:**
    - Dosya: `services/externalApiService.js`
    - Metot: `getAIRecommendations(carbonData)`
    - İlgili endpoint: `POST /api/carbon/recommendations`
    - Amaç: Kullanıcının karbon ayak izi sonuçlarına göre Türkçe, maddeli ve
      pratik öneriler üretmek.
  - **Frontend entegrasyonu:**
    - Dosya: `script.js`
    - Fonksiyon: `getAIRecommendations(total, transport, energy, food, shopping)`
    - Bu fonksiyon, `api-client.js` içindeki `carbonAPI.getRecommendations` aracılığıyla
      backend endpoint’ine istek gönderir ve gelen tavsiye metnini arayüzde gösterir.

Bu yapı ile rubrikteki **“En az bir hazır API kullanımı”** maddesi, gerçek bir
üçüncü taraf AI servisi (Anthropic Claude) üzerinden karşılanmaktadır.

---

Bu dosya, proje raporunda ve sunumda SOA isterlerinin tek bir yerden
özetlenmesi için hazırlanmıştır. Her madde için ilgili dosyalar belirtilmiş
ve akış kısaca açıklanmıştır.


