// Karbon emisyon katsayıları (kg CO₂ birimi başına)
const EMISSION_FACTORS = {
    // Ulaşım (kg CO₂/km)
    car: 0.21,           // Ortalama benzinli araba
    bus: 0.089,          // Otobüs
    train: 0.014,        // Tren
    plane: 0.255,        // Uçak
    
    // Enerji - Saatlik tüketim ve emisyon faktörleri
    // Ortalama ev elektrik tüketimi: ~1.2 kWh/saat (ışık, cihazlar, buzdolabı vb.)
    electricityHourlyConsumption: 1.2,  // kWh/saat
    electricityEmissionFactor: 0.5,     // kg CO₂/kWh (Türkiye ortalaması)
    
    // Ortalama ev doğalgaz tüketimi: ~0.3 m³/saat (ısınma, sıcak su vb.)
    gasHourlyConsumption: 0.3,          // m³/saat
    gasEmissionFactor: 1.96,             // kg CO₂/m³
    
    // Beslenme (kg CO₂/öğün)
    meatMeal: 3.5,       // Et içeren öğün
    vegetarianMeal: 1.0, // Vejetaryen öğün
    
    // Tüketim (kg CO₂/100 TL)
    shopping: 0.5        // Her 100 TL harcama için
};

// Ortalama günlük karbon izi (kg CO₂)
const AVERAGE_DAILY_CARBON = 16; // Dünya ortalaması yaklaşık 16 kg/gün

// Türkçe gün ve ay isimleri
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

// Sayfa yüklendiğinde ve her saniyede güncelle
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Giriş kontrolü
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        if (!checkAuth()) {
            window.location.href = 'login.html';
        }
    }
});

document.getElementById('carbonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    calculateCarbonFootprint();
});

async function calculateCarbonFootprint() {
    // Giriş kontrolü
    if (!checkAuth()) {
        alert('Lütfen önce giriş yapın!');
        window.location.href = 'login.html';
        return;
    }

    // Form değerlerini al
    const carKm = parseFloat(document.getElementById('carKm').value) || 0;
    const busKm = parseFloat(document.getElementById('busKm').value) || 0;
    const trainKm = parseFloat(document.getElementById('trainKm').value) || 0;
    const planeKm = parseFloat(document.getElementById('planeKm').value) || 0;
    const electricityHours = parseFloat(document.getElementById('electricity').value) || 0;
    const gasHours = parseFloat(document.getElementById('gas').value) || 0;
    const meatMeals = parseInt(document.getElementById('meatMeals').value) || 0;
    const vegetarianMeals = parseInt(document.getElementById('vegetarianMeals').value) || 0;
    const shopping = parseFloat(document.getElementById('shopping').value) || 0;
    
    // Backend API'ye gönder
    try {
        const calculationData = {
            recordDate: new Date().toISOString().split('T')[0],
            transport: {
                carKm,
                busKm,
                trainKm,
                planeKm
            },
            energy: {
                electricityHours,
                gasHours
            },
            food: {
                meatMeals,
                vegetarianMeals
            },
            shopping: {
                amount: shopping
            }
        };

        const response = await carbonAPI.calculate(calculationData);
        
        if (response.success) {
            const { total, transport, energy, food, shopping: shoppingCarbon } = response.data;
            displayResults(total, transport, energy, food, shoppingCarbon);
        } else {
            alert('Hesaplama yapılamadı: ' + (response.error || 'Bilinmeyen hata'));
        }
    } catch (error) {
        console.error('Hesaplama hatası:', error);
        alert('Backend bağlantı hatası. Lütfen backend sunucusunun çalıştığından emin olun.');
    }
}

function saveDailyData(total, transport, energy, food, shopping) {
    // Bugünün tarihini al (YYYY-MM-DD formatında)
    const today = new Date().toISOString().split('T')[0];
    
    // LocalStorage'dan mevcut verileri al
    let dailyData = JSON.parse(localStorage.getItem('carbonFootprintData')) || {};
    
    // Aynı gün için zaten veri varsa kaydetme
    if (dailyData[today]) {
        alert('Bu gün için zaten karbon izi hesaplanmış. Lütfen başka bir gün için hesaplama yapın veya istatistikler sayfasından mevcut verileri görüntüleyin.');
        return false;
    }
    
    // Bugünün verisini kaydet
    dailyData[today] = {
        total: total,
        transport: transport,
        energy: energy,
        food: food,
        shopping: shopping,
        date: today
    };
    
    // LocalStorage'a kaydet
    localStorage.setItem('carbonFootprintData', JSON.stringify(dailyData));
    
    console.log('Günlük veri kaydedildi:', dailyData[today]);
    return true;
}

function displayResults(total, transport, energy, food, shopping) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.classList.remove('hidden');
    
    // Toplam karbon izi
    document.getElementById('totalCarbon').textContent = total.toFixed(2);
    
    // Detaylı dağılım
    document.getElementById('transportCarbon').textContent = transport.toFixed(2) + ' kg CO₂';
    document.getElementById('energyCarbon').textContent = energy.toFixed(2) + ' kg CO₂';
    document.getElementById('foodCarbon').textContent = food.toFixed(2) + ' kg CO₂';
    document.getElementById('shoppingCarbon').textContent = shopping.toFixed(2) + ' kg CO₂';
    
    // Karbon bar'ı güncelle
    const maxCarbon = 50; // Maksimum gösterim değeri (kg)
    const percentage = Math.min((total / maxCarbon) * 100, 100);
    const carbonBar = document.getElementById('carbonBar');
    carbonBar.style.width = percentage + '%';
    
    // Karşılaştırma metni
    const comparisonText = generateComparisonText(total);
    document.getElementById('comparisonText').textContent = comparisonText;
    
    // AI tavsiyelerini al
    getAIRecommendations(total, transport, energy, food, shopping);
    
    // Sayfayı sonuçlara kaydır
    resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// AI tavsiyelerini backend üzerinden al
async function getAIRecommendations(total, transport, energy, food, shopping) {
    const loadingDiv = document.getElementById('loadingRecommendations');
    const contentDiv = document.getElementById('recommendationsContent');
    const adviceText = document.getElementById('aiAdviceText');
    
    // Loading göster
    loadingDiv.classList.remove('hidden');
    contentDiv.classList.add('hidden');
    
    try {
        const recommendationData = {
            total,
            transport,
            energy,
            food,
            shopping
        };

        const response = await carbonAPI.getRecommendations(recommendationData);

        if (!response.success || !response.data || !response.data.advice) {
            throw new Error(response.error || 'AI önerileri alınamadı');
        }

        const advice = response.data.advice;
        
        // Loading'i gizle, içeriği göster
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
        adviceText.textContent = advice;
        
    } catch (error) {
        console.error('AI tavsiyeleri alınırken hata:', error);
        
        // Hata durumunda varsayılan tavsiyeler göster
        loadingDiv.classList.add('hidden');
        contentDiv.classList.remove('hidden');
        adviceText.textContent = getDefaultRecommendations(total, transport, energy, food, shopping);
    }
}

// API çalışmazsa varsayılan tavsiyeler
function getDefaultRecommendations(total, transport, energy, food, shopping) {
    let recommendations = [];
    
    if (transport > 5) {
        recommendations.push('🚗 Ulaşım karbon iziniz yüksek. Toplu taşıma kullanmayı veya bisiklet kullanmayı düşünün.');
    }
    if (energy > 10) {
        recommendations.push('⚡ Enerji tüketiminizi azaltın. LED ampuller kullanın ve gereksiz cihazları kapatın.');
    }
    if (food > 8) {
        recommendations.push('🍽️ Daha az et tüketin. Haftada bir gün vejetaryen beslenmeyi deneyin.');
    }
    if (shopping > 2) {
        recommendations.push('🛒 İhtiyacınız olmayan ürünleri satın almayın. İkinci el alışveriş yapmayı düşünün.');
    }
    
    if (recommendations.length === 0) {
        recommendations.push('✅ Karbon iziniz düşük seviyede! Bu şekilde devam edin.');
    }
    
    return recommendations.join('\n\n');
}

function generateComparisonText(total) {
    const ratio = total / AVERAGE_DAILY_CARBON;
    let text = '';
    
    if (total === 0) {
        text = 'Henüz veri girmediniz. Formu doldurarak karbon izinizi hesaplayabilirsiniz.';
    } else if (ratio < 0.5) {
        text = `Harika! Günlük karbon iziniz (${total.toFixed(2)} kg CO₂) dünya ortalamasının (${AVERAGE_DAILY_CARBON} kg CO₂) çok altında. Çevre dostu bir yaşam tarzınız var! 🌱`;
    } else if (ratio < 0.8) {
        text = `İyi gidiyorsunuz! Günlük karbon iziniz (${total.toFixed(2)} kg CO₂) dünya ortalamasından düşük. Küçük iyileştirmelerle daha da azaltabilirsiniz. 👍`;
    } else if (ratio < 1.2) {
        text = `Günlük karbon iziniz (${total.toFixed(2)} kg CO₂) dünya ortalamasına (${AVERAGE_DAILY_CARBON} kg CO₂) yakın. Toplu taşıma kullanarak ve enerji tasarrufu yaparak azaltabilirsiniz. 💡`;
    } else {
        text = `Günlük karbon iziniz (${total.toFixed(2)} kg CO₂) dünya ortalamasının (${AVERAGE_DAILY_CARBON} kg CO₂) üzerinde. Ulaşım, enerji ve beslenme alışkanlıklarınızı gözden geçirerek önemli ölçüde azaltabilirsiniz. 🌍`;
    }
    
    // Yıllık tahmin
    const yearly = total * 365;
    text += ` Yıllık tahmini karbon iziniz: ${yearly.toFixed(0)} kg CO₂ (yaklaşık ${(yearly / 1000).toFixed(1)} ton CO₂).`;
    
    return text;
}

function resetForm() {
    document.getElementById('carbonForm').reset();
    document.getElementById('results').classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

