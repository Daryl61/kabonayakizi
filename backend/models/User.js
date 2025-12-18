// User Model - Data Access Layer (JSON File Storage)
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');

const DATA_FILE = path.join(__dirname, '../data/users.json');

// Veri dosyasını yükle
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { users: [] };
    }
}

// Veri dosyasını kaydet
async function saveData(data) {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

class User {
    // Yeni kullanıcı oluştur
    static async create(userData) {
        const data = await loadData();
        const { username, email, password } = userData;
        const passwordHash = await bcrypt.hash(password, 10);

        const userId = data.users.length > 0 
            ? Math.max(...data.users.map(u => u.user_id)) + 1 
            : 1;

        const newUser = {
            user_id: userId,
            username,
            email,
            password_hash: passwordHash,
            created_at: new Date().toISOString()
        };

        data.users.push(newUser);
        await saveData(data);
        return userId;
    }

    // Kullanıcıyı email ile bul
    static async findByEmail(email) {
        const data = await loadData();
        return data.users.find(u => u.email === email);
    }

    // Kullanıcıyı ID ile bul
    static async findById(userId) {
        const data = await loadData();
        const user = data.users.find(u => u.user_id === parseInt(userId));
        if (!user) return null;
        
        return {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
        };
    }

    // Şifre doğrulama
    static async verifyPassword(password, hash) {
        return await bcrypt.compare(password, hash);
    }
}

module.exports = User;

