const express = require('express');
const router = express.Router();
const { getPresentationData, getDepartmentStatus, getDatabaseStats, exportReports } = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');
const { getReportsByDate } = require('../controllers/reportController');

router.get('/presentation/:date', auth, adminOnly, getPresentationData);
router.get('/departments/:date', auth, adminOnly, getDepartmentStatus);
router.get('/reports/:date', auth, adminOnly, getReportsByDate);
router.get('/database-stats', auth, adminOnly, getDatabaseStats);
router.get('/export-reports', auth, adminOnly, exportReports);
router.get('/export-reports/:date', auth, adminOnly, exportReports);

module.exports = router;
