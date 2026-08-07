const express = require('express');
const router = express.Router();
const { createOrUpdateReport, getReport } = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createOrUpdateReport);
router.get('/:departmentCode/:date', auth, getReport);

module.exports = router;
