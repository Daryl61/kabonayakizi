// API Routes - Presentation Layer
const express = require('express');
const router = express.Router();
const CarbonController = require('../controllers/CarbonController');
const AuthController = require('../controllers/AuthController');
const { verifyToken } = require('../middleware/auth');

// Auth routes
router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);

// Carbon routes (authenticated)
router.post('/carbon/calculate', verifyToken, CarbonController.createRecord);
router.get('/carbon/records', verifyToken, CarbonController.getRecords);
router.get('/carbon/total', verifyToken, CarbonController.getTotalCarbon);
router.get('/carbon/breakdown', verifyToken, CarbonController.getBreakdown);
router.post('/carbon/recommendations', verifyToken, CarbonController.getAIRecommendations);

module.exports = router;

