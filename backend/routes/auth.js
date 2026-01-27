const express = require('express');
const {register, login, getMe} = require('../controllers/authController');
const {protect} = require('../middleware/auth');
const { validate } = require('../utils/validation');
const router = express.Router();

// Auth routes
router.post('/register', validate('register'), register);
router.post('/login', validate('login'), login);
router.get('/me', protect, getMe);

//email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);

//password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;


