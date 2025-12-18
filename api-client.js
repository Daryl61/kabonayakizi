// API Client - Frontend için
const API_BASE_URL = 'http://localhost:3000/api';

// Token yönetimi
const getToken = () => localStorage.getItem('carbon_footprint_token');
const getUserId = () => localStorage.getItem('carbon_footprint_user_id');

// API çağrısı yapan genel fonksiyon
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    // Token varsa header'a ekle
    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Body varsa ekle
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API hatası');
        }

        return data;
    } catch (error) {
        console.error('API çağrısı hatası:', error);
        throw error;
    }
}

// Auth API fonksiyonları
const authAPI = {
    register: async (userData) => {
        return await apiCall('/auth/register', 'POST', userData);
    },
    login: async (email, password) => {
        const response = await apiCall('/auth/login', 'POST', { email, password });
        // Token'ı kaydet
        if (response.data && response.data.token) {
            localStorage.setItem('carbon_footprint_token', response.data.token);
            localStorage.setItem('carbon_footprint_user_id', response.data.userId);
            localStorage.setItem('carbon_footprint_username', response.data.username);
        }
        return response;
    },
    logout: () => {
        localStorage.removeItem('carbon_footprint_token');
        localStorage.removeItem('carbon_footprint_user_id');
        localStorage.removeItem('carbon_footprint_username');
    }
};

// Carbon API fonksiyonları
const carbonAPI = {
    calculate: async (calculationData) => {
        return await apiCall('/carbon/calculate', 'POST', calculationData);
    },
    getRecommendations: async (recommendationData) => {
        return await apiCall('/carbon/recommendations', 'POST', recommendationData);
    },
    getRecords: async (startDate = null, endDate = null) => {
        let endpoint = '/carbon/records';
        if (startDate && endDate) {
            endpoint += `?startDate=${startDate}&endDate=${endDate}`;
        }
        return await apiCall(endpoint, 'GET');
    },
    getTotal: async (startDate = null, endDate = null) => {
        let endpoint = '/carbon/total';
        if (startDate && endDate) {
            endpoint += `?startDate=${startDate}&endDate=${endDate}`;
        }
        return await apiCall(endpoint, 'GET');
    },
    getBreakdown: async (startDate = null, endDate = null) => {
        let endpoint = '/carbon/breakdown';
        if (startDate && endDate) {
            endpoint += `?startDate=${startDate}&endDate=${endDate}`;
        }
        return await apiCall(endpoint, 'GET');
    }
};

// Kullanıcı giriş kontrolü
function checkAuth() {
    const token = getToken();
    return !!token;
}

