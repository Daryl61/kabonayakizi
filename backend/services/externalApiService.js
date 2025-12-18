// External API Service - Integration Layer
// Bu servis şu anda sadece Anthropic Claude API üzerinden AI tabanlı öneriler üretmek için kullanılıyor.
const axios = require('axios');

class ExternalApiService {
    // Claude API çağrısı (backend'den)
    static async getAIRecommendations(carbonData) {
        try {
            const API_KEY = process.env.ANTHROPIC_API_KEY;
            if (!API_KEY) {
                throw new Error('API key bulunamadı');
            }

            const response = await axios.post(
                'https://api.anthropic.com/v1/messages',
                {
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1000,
                    messages: [{
                        role: 'user',
                        content: `Kullanıcının günlük karbon ayak izi: ${carbonData.total} kg CO₂. Detaylı dağılım: Ulaşım: ${carbonData.transport}, Enerji: ${carbonData.energy}, Beslenme: ${carbonData.food}, Tüketim: ${carbonData.shopping}. Bu karbon ayak izini azaltmak için pratik ve uygulanabilir 5-7 Türkçe tavsiye ver.`
                    }]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                        'anthropic-version': '2023-06-01'
                    }
                }
            );

            return response.data.content[0].text;
        } catch (error) {
            console.error('Claude API hatası:', error.message);
            throw error;
        }
    }
}

module.exports = ExternalApiService;

