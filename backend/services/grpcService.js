// gRPC Service Implementation - Communication Layer
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const CarbonCalculationService = require('./CarbonCalculationService');
const CarbonRecord = require('../models/CarbonRecord');

// Proto dosyasını yükle
const PROTO_PATH = path.join(__dirname, '../proto/carbon.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneof: true
});

const carbonProto = grpc.loadPackageDefinition(packageDefinition).carbonfootprint;

// gRPC servis implementasyonu
const carbonService = {
    CalculateCarbon: async (call, callback) => {
        try {
            const { user_id, transport, energy, food, shopping } = call.request;
            
            // Karbon hesaplama
            const carbonData = CarbonCalculationService.calculateTotalCarbon({
                transport: {
                    carKm: transport?.car_km || 0,
                    busKm: transport?.bus_km || 0,
                    trainKm: transport?.train_km || 0,
                    planeKm: transport?.plane_km || 0
                },
                energy: {
                    electricityHours: energy?.electricity_hours || 0,
                    gasHours: energy?.gas_hours || 0
                },
                food: {
                    meatMeals: food?.meat_meals || 0,
                    vegetarianMeals: food?.vegetarian_meals || 0
                },
                shopping: {
                    amount: shopping?.amount || 0
                }
            });

            // Veritabanına kaydet
            const recordId = await CarbonRecord.create(user_id, {
                recordDate: new Date().toISOString().split('T')[0],
                totalCarbon: carbonData.total,
                transportCarbon: carbonData.transport,
                energyCarbon: carbonData.energy,
                foodCarbon: carbonData.food,
                shoppingCarbon: carbonData.shopping
            });

            callback(null, {
                total: carbonData.total,
                transport: carbonData.transport,
                energy: carbonData.energy,
                food: carbonData.food,
                shopping: carbonData.shopping,
                record_id: recordId,
                message: 'Karbon izi başarıyla hesaplandı ve kaydedildi'
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: `gRPC Service Error: ${error.message}`
            });
        }
    },

    GetTotalCarbon: async (call, callback) => {
        try {
            const { user_id, start_date, end_date } = call.request;
            
            const start = start_date || '2020-01-01';
            const end = end_date || new Date().toISOString().split('T')[0];

            const total = await CarbonRecord.getTotalCarbon(user_id, start, end);

            callback(null, {
                total_carbon: total,
                message: 'Toplam karbon izi başarıyla getirildi'
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: `gRPC Service Error: ${error.message}`
            });
        }
    },

    GetBreakdown: async (call, callback) => {
        try {
            const { user_id, start_date, end_date } = call.request;
            
            const start = start_date || '2020-01-01';
            const end = end_date || new Date().toISOString().split('T')[0];

            const breakdown = await CarbonRecord.getBreakdown(user_id, start, end);

            callback(null, {
                total_transport: breakdown.total_transport || 0,
                total_energy: breakdown.total_energy || 0,
                total_food: breakdown.total_food || 0,
                total_shopping: breakdown.total_shopping || 0,
                grand_total: breakdown.grand_total || 0,
                message: 'Karbon dağılımı başarıyla getirildi'
            });
        } catch (error) {
            callback({
                code: grpc.status.INTERNAL,
                message: `gRPC Service Error: ${error.message}`
            });
        }
    }
};

// gRPC sunucusunu başlat
const startGrpcServer = () => {
    const server = new grpc.Server();
    
    server.addService(carbonProto.CarbonFootprintService.service, carbonService);
    
    const PORT = process.env.GRPC_PORT || 50051;
    server.bindAsync(
        `0.0.0.0:${PORT}`,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error('❌ gRPC Server başlatılamadı:', error);
                return;
            }
            server.start();
            console.log(`✅ gRPC Server başlatıldı: localhost:${port}`);
        }
    );
};

module.exports = { startGrpcServer };

