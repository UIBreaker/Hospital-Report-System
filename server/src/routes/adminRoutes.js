const express = require('express');
const router = express.Router();
const { 
  getPresentationData, 
  getDepartmentStatus, 
  getDatabaseStats, 
  exportReports,
  getAllAccounts,
  updateAccountPassword,
  resetAccountPassword,
  updateAccountDetails,
  createAccount
} = require('../controllers/adminController');
const { auth, adminOnly } = require('../middleware/auth');
const { getReportsByDate } = require('../controllers/reportController');

router.get('/presentation/:date', auth, adminOnly, getPresentationData);
router.get('/departments/:date', auth, adminOnly, getDepartmentStatus);
router.get('/reports/:date', auth, adminOnly, getReportsByDate);
router.get('/database-stats', auth, adminOnly, getDatabaseStats);
router.get('/export-reports', auth, adminOnly, exportReports);
router.get('/export-reports/:date', auth, adminOnly, exportReports);

// User Accounts Management
router.get('/accounts', auth, adminOnly, getAllAccounts);
router.put('/accounts/:id/password', auth, adminOnly, updateAccountPassword);
router.post('/accounts/:id/reset-password', auth, adminOnly, resetAccountPassword);
router.put('/accounts/:id', auth, adminOnly, updateAccountDetails);
router.post('/accounts', auth, adminOnly, createAccount);

module.exports = router;

