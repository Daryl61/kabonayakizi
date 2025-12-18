// Türkçe gün isimleri
const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];


// Gün ve saati güncelle
function updateDateTime() {
    const now = new Date();
    const day = dayNames[now.getDay()];
    const date = now.getDate();
    const month = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const datetimeDisplay = document.getElementById('datetimeDisplay');
    if (datetimeDisplay) {
        datetimeDisplay.textContent = `${day}, ${date} ${month} ${year} - ${hours}:${minutes}:${seconds}`;
    }
}

// Sayfa yüklendiğinde istatistikleri göster
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // API client'ı yükle
    if (typeof checkAuth === 'undefined') {
        const script = document.createElement('script');
        script.src = 'api-client.js';
        script.onload = loadStatistics;
        document.head.appendChild(script);
    } else {
        loadStatistics();
    }
});

async function loadStatistics() {
    // Giriş kontrolü
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    try {
        // Backend API'den verileri al
        const response = await carbonAPI.getRecords();
        
        if (!response.success || !response.data || response.data.length === 0) {
            document.getElementById('noData').classList.remove('hidden');
            document.getElementById('statisticsContent').classList.add('hidden');
            return;
        }
        
        // Veriyi LocalStorage formatına dönüştür
        const dailyData = {};
        response.data.forEach(record => {
            dailyData[record.record_date] = {
                total: parseFloat(record.total_carbon),
                transport: parseFloat(record.transport_carbon),
                energy: parseFloat(record.energy_carbon),
                food: parseFloat(record.food_carbon),
                shopping: parseFloat(record.shopping_carbon),
                date: record.record_date
            };
        });
        
        // Veri varsa içeriği göster
        document.getElementById('noData').classList.add('hidden');
        document.getElementById('statisticsContent').classList.remove('hidden');
        
        // 15 günlük takvimi oluştur
        createCalendar(dailyData);
        
        // Toplam karbon izini hesapla
        const totalResponse = await carbonAPI.getTotal();
        if (totalResponse.success) {
            document.getElementById('totalCarbonFootprint').textContent = 
                totalResponse.data.totalCarbon.toFixed(2);
        }
    } catch (error) {
        console.error('İstatistik yükleme hatası:', error);
        document.getElementById('noData').classList.remove('hidden');
        document.getElementById('statisticsContent').classList.add('hidden');
    }
}

function createCalendar(dailyData) {
    const calendarGrid = document.getElementById('calendarGrid');
    calendarGrid.innerHTML = '';
    
    const today = new Date();
    const dates = [];
    
    // İleri 15 günü oluştur (bugünden itibaren ileri doğru)
    for (let i = 0; i < 15; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date);
    }
    
    dates.forEach(date => {
        const dateStr = date.toISOString().split('T')[0];
        const dayData = dailyData[dateStr];
        const day = date.getDate();
        const dayName = dayNames[date.getDay()].substring(0, 3); // İlk 3 harf
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        
        const dayBox = document.createElement('div');
        dayBox.className = 'calendar-day';
        
        if (dayData) {
            // Veri varsa
            dayBox.classList.add('has-data');
            dayBox.style.cursor = 'pointer';
            // Tam gün adını al
            const fullDayName = dayNames[date.getDay()];
            dayBox.onclick = () => showDayDetail(dateStr, dayData, fullDayName, day, month, year);
            dayBox.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-name">${dayName}</div>
                <div class="calendar-day-carbon">${dayData.total.toFixed(1)} CO₂</div>
            `;
        } else {
            // Veri yoksa
            dayBox.innerHTML = `
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-name">${dayName}</div>
                <div class="calendar-day-carbon empty">-</div>
            `;
        }
        
        calendarGrid.appendChild(dayBox);
    });
}

function showDayDetail(dateStr, dayData, fullDayName, day, month, year) {
    const detailSection = document.getElementById('dayDetailSection');
    const detailTitle = document.getElementById('detailDayTitle');
    const detailContent = document.getElementById('dayDetailContent');
    
    // Gönderilen parametreleri doğrudan kullan
    detailTitle.textContent = `${fullDayName}, ${day} ${month} ${year}`;
    
    detailContent.innerHTML = `
        <div class="day-detail-card">
            <div class="detail-item">
                <span class="detail-label">📊 Toplam Karbon İzi:</span>
                <span class="detail-value">${dayData.total.toFixed(2)} kg CO₂</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">🚗 Ulaşım:</span>
                <span class="detail-value">${dayData.transport.toFixed(2)} kg CO₂</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">⚡ Enerji:</span>
                <span class="detail-value">${dayData.energy.toFixed(2)} kg CO₂</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">🍽️ Beslenme:</span>
                <span class="detail-value">${dayData.food.toFixed(2)} kg CO₂</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">🛒 Tüketim:</span>
                <span class="detail-value">${dayData.shopping.toFixed(2)} kg CO₂</span>
            </div>
        </div>
    `;
    
    detailSection.classList.remove('hidden');
    
    // Detay bölümüne yumuşak kaydırma
    detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}


