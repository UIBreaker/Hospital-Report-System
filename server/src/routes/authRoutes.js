const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { register, requestPasswordReset, changePassword } = require('../controllers/userManageController');
const { getProfile, updateProfile, updateAvatar, updateSignature } = require('../controllers/profileController');
const { auth } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/register', register);
router.post('/forgot-password', requestPasswordReset);
router.post('/change-password', changePassword);

// User Profile Endpoints
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/profile/avatar', auth, updateAvatar);
router.post('/profile/signature', auth, updateSignature);

module.exports = router;
