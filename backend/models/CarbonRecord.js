// Carbon Record Model - Data Access Layer (JSON File Storage)
const fs = require('fs').promises;
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/carbon_records.json');

// Veri dosyasını yükle
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Dosya yoksa boş veri döndür
        return { records: [] };
    }
}

// Veri dosyasını kaydet
async function saveData(data) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

class CarbonRecord {
    // Yeni karbon kaydı oluştur
    static async create(userId, recordData) {
        const data = await loadData();
        const {
            recordDate,
            totalCarbon,
            transportCarbon,
            energyCarbon,
            foodCarbon,
            shoppingCarbon
        } = recordData;

        const recordId = data.records.length > 0 
            ? Math.max(...data.records.map(r => r.record_id)) + 1 
            : 1;

        const newRecord = {
            record_id: recordId,
            user_id: userId,
            record_date: recordDate || new Date().toISOString().split('T')[0],
            total_carbon: totalCarbon,
            transport_carbon: transportCarbon,
            energy_carbon: energyCarbon,
            food_carbon: foodCarbon,
            shopping_carbon: shoppingCarbon,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        data.records.push(newRecord);
        await saveData(data);

        return recordId;
    }

    // Kullanıcının kayıtlarını getir
    static async findByUser(userId, startDate = null, endDate = null) {
        const data = await loadData();
        let records = data.records.filter(r => r.user_id === userId);

        if (startDate && endDate) {
            records = records.filter(r => 
                r.record_date >= startDate && r.record_date <= endDate
            );
        }

        return records.sort((a, b) => 
            new Date(b.record_date) - new Date(a.record_date)
        );
    }

    // Belirli bir kaydı getir
    static async findById(recordId) {
        const data = await loadData();
        return data.records.find(r => r.record_id === parseInt(recordId));
    }

    // Kullanıcının toplam karbon izini hesapla
    static async getTotalCarbon(userId, startDate, endDate) {
        const records = await this.findByUser(userId, startDate, endDate);
        return records.reduce((sum, r) => sum + parseFloat(r.total_carbon || 0), 0);
    }

    // Kategorilere göre dağılım
    static async getBreakdown(userId, startDate, endDate) {
        const records = await this.findByUser(userId, startDate, endDate);
        
        return {
            total_transport: records.reduce((sum, r) => sum + parseFloat(r.transport_carbon || 0), 0),
            total_energy: records.reduce((sum, r) => sum + parseFloat(r.energy_carbon || 0), 0),
            total_food: records.reduce((sum, r) => sum + parseFloat(r.food_carbon || 0), 0),
            total_shopping: records.reduce((sum, r) => sum + parseFloat(r.shopping_carbon || 0), 0),
            grand_total: records.reduce((sum, r) => sum + parseFloat(r.total_carbon || 0), 0)
        };
    }
}

module.exports = CarbonRecord;

