const express = require('express');
const router = express.Router();
const { login, getMe } = require('../controllers/authController');
const { register, requestPasswordReset, changePassword } = require('../controllers/userManageController');
const { auth } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/register', register);
router.post('/forgot-password', requestPasswordReset);
router.post('/change-password', changePassword);

module.exports = router;
