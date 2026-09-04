const express = require('express');
const router = express.Router();
const { 
  getDepartmentStatus, 
  getPresentationData,
  getDatabaseStats,
  getReportsPayloadSize,
  getAuditLogs,
  exportReports,
  getAllAccounts,
  updateAccountPassword,
  createAccount,
  toggleReportLock,
  toggleLockAllReports,
  checkTargetDate,
  moveReportDate
} = require('../controllers/adminController');
const {
  getAllSystemUsers,
  approveUser,
  rejectUser,
  toggleUserStatus,
  adminResetPassword,
  deleteSystemUser
} = require('../controllers/userManageController');
const { getHospitalAnalytics } = require('../controllers/analyticsController');
const { getShiftReportHistory, getCustomFormsHistory } = require('../controllers/submissionHistoryController');
const { auth, adminOnly: requireAdmin } = require('../middleware/auth');

router.get('/departments/:date', auth, requireAdmin, getDepartmentStatus);
router.get('/presentation/:date', auth, requireAdmin, getPresentationData);
router.get('/analytics/stats', auth, requireAdmin, getHospitalAnalytics);
router.get('/database-stats', auth, requireAdmin, getDatabaseStats);
router.get('/reports-payload-size', auth, requireAdmin, getReportsPayloadSize);
router.get('/audit-logs', auth, requireAdmin, getAuditLogs);
router.get('/export-reports', auth, requireAdmin, exportReports);

// Submission History & Realtime Monitoring
router.get('/submission-history/shift-reports', auth, requireAdmin, getShiftReportHistory);
router.get('/submission-history/custom-forms', auth, requireAdmin, getCustomFormsHistory);

// Core 13 Accounts
router.get('/accounts', auth, requireAdmin, getAllAccounts);
router.put('/accounts/:id/password', auth, requireAdmin, updateAccountPassword);
router.post('/accounts', auth, requireAdmin, createAccount);
router.delete('/accounts/:id', auth, requireAdmin, (req, res) => {
  res.status(403).json({ success: false, error: 'Không thể xóa 13 tài khoản cốt lõi của hệ thống.' });
});

// Extended System Users (Pending, Approval, Temporary Reset Password)
router.get('/system-users', auth, requireAdmin, getAllSystemUsers);
router.put('/system-users/:id/approve', auth, requireAdmin, approveUser);
router.put('/system-users/:id/reject', auth, requireAdmin, rejectUser);
router.put('/system-users/:id/status', auth, requireAdmin, toggleUserStatus);
router.post('/system-users/:id/reset-password', auth, requireAdmin, adminResetPassword);
router.delete('/system-users/:id', auth, requireAdmin, deleteSystemUser);

// Locks & Date Movement
router.put('/reports/:departmentCode/:date/toggle-lock', auth, requireAdmin, toggleReportLock);
router.put('/reports/toggle-lock-all/:date', auth, requireAdmin, toggleLockAllReports);
router.get('/reports/check-target-date', auth, requireAdmin, checkTargetDate);
router.post('/reports/move-date', auth, requireAdmin, moveReportDate);

// Version Changelog Management
const { getChangelogHistory, publishChangelog, deleteChangelog } = require('../controllers/changelogController');
router.get('/changelog/history', auth, requireAdmin, getChangelogHistory);
router.post('/changelog', auth, requireAdmin, publishChangelog);
router.delete('/changelog/:id', auth, requireAdmin, deleteChangelog);

// Hospital Data Archive & Explorer
const { getArchiveTree, getArchiveDayDetails, sendArchiveEmail } = require('../controllers/dataArchiveController');
router.get('/data-archive/tree', auth, requireAdmin, getArchiveTree);
router.get('/data-archive/day/:date', auth, requireAdmin, getArchiveDayDetails);
router.post('/data-archive/send-email', auth, requireAdmin, sendArchiveEmail);

module.exports = router;
