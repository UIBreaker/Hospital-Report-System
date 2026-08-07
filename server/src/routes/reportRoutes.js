const express = require('express');
const router = express.Router();
const { createOrUpdateReport, getReport, deleteReport } = require('../controllers/reportController');
const { auth } = require('../middleware/auth');

router.post('/', auth, createOrUpdateReport);
router.get('/:departmentCode/:date', auth, getReport);
router.delete('/:departmentCode/:date', auth, deleteReport);

module.exports = router;
