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
  toggleLockAllReports
} = require('../controllers/adminController');
const {
  getAllSystemUsers,
  approveUser,
  rejectUser,
  toggleUserStatus,
  adminResetPassword,
  deleteSystemUser
} = require('../controllers/userManageController');
const { auth, adminOnly: requireAdmin } = require('../middleware/auth');

router.get('/departments/:date', auth, requireAdmin, getDepartmentStatus);
router.get('/presentation/:date', auth, requireAdmin, getPresentationData);
router.get('/database-stats', auth, requireAdmin, getDatabaseStats);
router.get('/reports-payload-size', auth, requireAdmin, getReportsPayloadSize);
router.get('/audit-logs', auth, requireAdmin, getAuditLogs);
router.get('/export-reports', auth, requireAdmin, exportReports);

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

// Locks
router.put('/reports/:departmentCode/:date/toggle-lock', auth, requireAdmin, toggleReportLock);
router.put('/reports/toggle-lock-all/:date', auth, requireAdmin, toggleLockAllReports);

module.exports = router;
