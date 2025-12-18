// Carbon Controller - Presentation Layer
const CarbonRecord = require('../models/CarbonRecord');
const CarbonCalculationService = require('../services/CarbonCalculationService');
const ExternalApiService = require('../services/ExternalApiService');

class CarbonController {
    // Yeni karbon kaydı oluştur
    static async createRecord(req, res) {
        try {
            const userId = req.userId;
            const { recordDate, transport, energy, food, shopping } = req.body;

            // Karbon hesaplama
            const carbonData = CarbonCalculationService.calculateTotalCarbon({
                transport,
                energy,
                food,
                shopping
            });

            // Veritabanına kaydet
            const recordId = await CarbonRecord.create(userId, {
                recordDate: recordDate || new Date().toISOString().split('T')[0],
                totalCarbon: carbonData.total,
                transportCarbon: carbonData.transport,
                energyCarbon: carbonData.energy,
                foodCarbon: carbonData.food,
                shoppingCarbon: carbonData.shopping
            });

            res.status(201).json({
                success: true,
                message: 'Karbon kaydı oluşturuldu',
                data: {
                    recordId,
                    ...carbonData
                }
            });
        } catch (error) {
            console.error('Kayıt oluşturma hatası:', error);
            res.status(500).json({ error: 'Kayıt oluşturulamadı', details: error.message });
        }
    }

    // Kullanıcının kayıtlarını getir
    static async getRecords(req, res) {
        try {
            const userId = req.userId;
            const { startDate, endDate } = req.query;

            const records = await CarbonRecord.findByUser(userId, startDate, endDate);
            
            res.json({
                success: true,
                data: records
            });
        } catch (error) {
            console.error('Kayıt getirme hatası:', error);
            res.status(500).json({ error: 'Kayıtlar getirilemedi' });
        }
    }

    // Toplam karbon izini getir
    static async getTotalCarbon(req, res) {
        try {
            const userId = req.userId;
            const { startDate, endDate } = req.query;

            const start = startDate || '2020-01-01';
            const end = endDate || new Date().toISOString().split('T')[0];

            const total = await CarbonRecord.getTotalCarbon(userId, start, end);
            
            res.json({
                success: true,
                data: { totalCarbon: total }
            });
        } catch (error) {
            console.error('Toplam karbon hesaplama hatası:', error);
            res.status(500).json({ error: 'Hesaplama yapılamadı' });
        }
    }

    // Kategorilere göre dağılım getir
    static async getBreakdown(req, res) {
        try {
            const userId = req.userId;
            const { startDate, endDate } = req.query;

            const start = startDate || '2020-01-01';
            const end = endDate || new Date().toISOString().split('T')[0];

            const breakdown = await CarbonRecord.getBreakdown(userId, start, end);
            
            res.json({
                success: true,
                data: breakdown
            });
        } catch (error) {
            console.error('Dağılım getirme hatası:', error);
            res.status(500).json({ error: 'Dağılım getirilemedi' });
        }
    }

    // AI tabanlı önerileri getir (ExternalApiService üzerinden - Integration Layer)
    static async getAIRecommendations(req, res) {
        try {
            const { total, transport, energy, food, shopping } = req.body;

            if (
                typeof total !== 'number' ||
                typeof transport !== 'number' ||
                typeof energy !== 'number' ||
                typeof food !== 'number' ||
                typeof shopping !== 'number'
            ) {
                return res.status(400).json({ error: 'Geçersiz veri formatı' });
            }

            const adviceText = await ExternalApiService.getAIRecommendations({
                total,
                transport,
                energy,
                food,
                shopping
            });

            res.json({
                success: true,
                data: {
                    advice: adviceText
                }
            });
        } catch (error) {
            console.error('AI öneri hatası:', error);
            res.status(500).json({
                error: 'AI önerileri alınamadı',
                details: error.message
            });
        }
    }
}

module.exports = CarbonController;

