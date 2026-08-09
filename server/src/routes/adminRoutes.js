const express = require('express');
const router = express.Router();
const { getPresentationData, getDepartmentStatus, getDatabaseStats } = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');
const { getReportsByDate } = require('../controllers/reportController');

router.get('/presentation/:date', auth, adminOnly, getPresentationData);
router.get('/departments/:date', auth, adminOnly, getDepartmentStatus);
router.get('/reports/:date', auth, adminOnly, getReportsByDate);
router.get('/database-stats', auth, adminOnly, getDatabaseStats);

module.exports = router;
