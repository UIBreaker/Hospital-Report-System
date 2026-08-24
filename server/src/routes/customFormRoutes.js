const express = require('express');
const router = express.Router();
const {
  getAllForms,
  getFormByCode,
  createForm,
  updateForm,
  deleteForm,
  submitFormData,
  getFormSubmissions,
  getTrackerData
} = require('../controllers/customFormController');
const { auth, adminOnly: requireAdmin } = require('../middleware/auth');

router.get('/', auth, getAllForms);
router.get('/:code', auth, getFormByCode);
router.post('/', auth, requireAdmin, createForm);
router.put('/:id', auth, requireAdmin, updateForm);
router.delete('/:id', auth, requireAdmin, deleteForm);

router.post('/:code/submit', auth, submitFormData);
router.get('/:code/submissions', auth, getFormSubmissions);
router.get('/:code/tracker', auth, getTrackerData);

module.exports = router;
