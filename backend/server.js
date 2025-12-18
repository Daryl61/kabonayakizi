// Ana Server Dosyası - SOA Mimarisi (6 Katmanlı)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// SOA Katmanları
const apiRoutes = require('./routes/api'); // Presentation Layer
const soapService = require('./services/soapService'); // Communication Layer
const grpcService = require('./services/grpcService'); // Communication Layer

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Infrastructure Layer
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Carbon Footprint API is running',
        architecture: '6-Layer SOA',
        layers: [
            'Presentation Layer',
            'Service Layer',
            'Data Access Layer',
            'Integration Layer',
            'Communication Layer',
            'Infrastructure Layer'
        ]
    });
});

// RESTful API Routes (Presentation Layer)
app.use('/api', apiRoutes);

// SOAP Service (Communication Layer)
soapService.setupSoapService(app);

// gRPC Service başlatılacak (Communication Layer - ayrı port)
grpcService.startGrpcServer();

// Server başlat
app.listen(PORT, () => {
    console.log('\n🚀 ============================================');
    console.log('   CARBON FOOTPRINT API - SOA MİMARİSİ');
    console.log('============================================\n');
    console.log(`✅ REST API:     http://localhost:${PORT}/api`);
    console.log(`✅ SOAP Service: http://localhost:${PORT}/soap?wsdl`);
    console.log(`✅ gRPC Service: localhost:${process.env.GRPC_PORT || 50051}`);
    console.log(`✅ Health Check: http://localhost:${PORT}/health`);
    console.log('\n📋 SOA Katmanları:');
    console.log('   1. Presentation Layer (REST API)');
    console.log('   2. Service Layer (Business Logic)');
    console.log('   3. Data Access Layer (JSON Storage)');
    console.log('   4. Integration Layer (External APIs)');
    console.log('   5. Communication Layer (SOAP, gRPC)');
    console.log('   6. Infrastructure Layer (Middleware, Config)');
    console.log('\n============================================\n');
});

module.exports = app;

