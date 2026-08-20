const express = require('express');
const router = express.Router();
const { 
  getPresentationData, 
  getDepartmentStatus, 
  getDatabaseStats, 
  getReportsPayloadSize,
  getAuditLogs,
  exportReports,
  getAllAccounts,
  updateAccountPassword,
  resetAccountPassword,
  updateAccountDetails,
  createAccount,
  toggleReportLock,
  toggleLockAllReports
} = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');
const { getReportsByDate } = require('../controllers/reportController');

router.get('/presentation/:date', auth, adminOnly, getPresentationData);
router.get('/departments/:date', auth, adminOnly, getDepartmentStatus);
router.get('/reports/:date', auth, adminOnly, getReportsByDate);
router.get('/database-stats', auth, adminOnly, getDatabaseStats);
router.get('/reports-payload-size', auth, adminOnly, getReportsPayloadSize);
router.get('/reports-payload-size/:date', auth, adminOnly, getReportsPayloadSize);
router.get('/audit-logs', auth, adminOnly, getAuditLogs);
router.get('/export-reports', auth, adminOnly, exportReports);
router.get('/export-reports/:date', auth, adminOnly, exportReports);

// Briefing Report Lock / Unlock Management
router.put('/reports/:departmentCode/:date/toggle-lock', auth, adminOnly, toggleReportLock);
router.put('/reports/toggle-lock-all/:date', auth, adminOnly, toggleLockAllReports);

// User Accounts Management
router.get('/accounts', auth, adminOnly, getAllAccounts);
router.put('/accounts/:id/password', auth, adminOnly, updateAccountPassword);
router.post('/accounts/:id/reset-password', auth, adminOnly, resetAccountPassword);
router.put('/accounts/:id', auth, adminOnly, updateAccountDetails);
router.post('/accounts', auth, adminOnly, createAccount);

module.exports = router;

