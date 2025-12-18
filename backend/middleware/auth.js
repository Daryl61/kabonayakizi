// Authentication Middleware - Infrastructure Layer
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// JWT token oluştur
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};

// Token doğrula
const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer token
        
        if (!token) {
            return res.status(401).json({ error: 'Token bulunamadı' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        
        // Kullanıcının var olup olmadığını kontrol et
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'Geçersiz kullanıcı' });
        }

        next();
    } catch (error) {
        return res.status(401).json({ error: 'Geçersiz token' });
    }
};

module.exports = {
    generateToken,
    verifyToken
};

