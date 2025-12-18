// Auth Controller - Presentation Layer
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

class AuthController {
    // Kullanıcı kaydı
    static async register(req, res) {
        try {
            const { username, email, password } = req.body;

            // Validasyon
            if (!username || !email || !password) {
                return res.status(400).json({ error: 'Tüm alanlar doldurulmalıdır' });
            }

            // Email kontrolü
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ error: 'Bu email zaten kullanılıyor' });
            }

            // Kullanıcı oluştur
            const userId = await User.create({ username, email, password });
            const token = generateToken(userId);

            res.status(201).json({
                success: true,
                message: 'Kullanıcı oluşturuldu',
                data: {
                    userId,
                    token
                }
            });
        } catch (error) {
            console.error('Kayıt hatası:', error);
            res.status(500).json({ error: 'Kayıt yapılamadı', details: error.message });
        }
    }

    // Kullanıcı girişi
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ error: 'Email ve şifre gereklidir' });
            }

            // Kullanıcıyı bul
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Geçersiz email veya şifre' });
            }

            // Şifre kontrolü
            const isValid = await User.verifyPassword(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Geçersiz email veya şifre' });
            }

            // Token oluştur
            const token = generateToken(user.user_id);

            res.json({
                success: true,
                message: 'Giriş başarılı',
                data: {
                    userId: user.user_id,
                    username: user.username,
                    email: user.email,
                    token
                }
            });
        } catch (error) {
            console.error('Giriş hatası:', error);
            res.status(500).json({ error: 'Giriş yapılamadı' });
        }
    }
}

module.exports = AuthController;

