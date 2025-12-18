# Carbon Footprint Backend API - SOA Mimarisi

Bu proje, **6 Katmanlı SOA (Service-Oriented Architecture)** mimarisi kullanılarak geliştirilmiş bir karbon ayak izi hesaplama API'sidir.

## 🏗️ SOA Mimarisi (6 Katmanlı)

### 1. Presentation Layer
- RESTful API endpoints (`routes/api.js`)
- HTTP request/response yönetimi
- Authentication middleware

### 2. Service Layer
- Business logic (`services/CarbonCalculationService.js`)
- Karbon hesaplama algoritmaları

### 3. Data Access Layer
- JSON dosyası ile veri saklama (`models/`)
- Veritabanı bağımsız çalışma

### 4. Integration Layer
- External API entegrasyonları (`services/externalApiService.js`)
- Claude API kullanımı

### 5. Communication Layer
- SOAP Service (XML-based)
- gRPC Service (Protocol Buffers)

### 6. Infrastructure Layer
- Middleware (`middleware/auth.js`)
- Environment configuration (`.env`)
- Error handling

## 📋 Özellikler

- ✅ RESTful API (Node.js/Express)
- ✅ SOAP Service (XML-based)
- ✅ gRPC Service (Protocol Buffers)
- ✅ JSON File Storage (Veritabanı olmadan)
- ✅ JWT Authentication
- ✅ External API Integration (Claude API)

## 🚀 Kurulum

1. Bağımlılıkları yükleyin:
```bash
cd backend
npm install
```

2. `.env` dosyasını düzenleyin (opsiyonel):
```env
PORT=3000
GRPC_PORT=50051
JWT_SECRET=your-secret-key
ANTHROPIC_API_KEY=your-claude-api-key
```

3. Sunucuyu başlatın:
```bash
npm start
# veya geliştirme modu için
npm run dev
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Kullanıcı girişi

### Carbon Records
- `POST /api/carbon/calculate` - Karbon izi hesapla ve kaydet
- `GET /api/carbon/records` - Kullanıcının kayıtlarını getir
- `GET /api/carbon/total` - Toplam karbon izi
- `GET /api/carbon/breakdown` - Kategorilere göre dağılım

## 🔌 SOAP Service

WSDL: `http://localhost:3000/soap?wsdl`

## 🌐 gRPC Service

Port: `50051`

Proto dosyası: `proto/carbon.proto`

## 📝 Notlar

- Veriler `backend/data/` klasöründe JSON dosyalarında saklanır
- Veritabanı kurulumu gerekmez
- Tüm servisler aynı anda çalışabilir

