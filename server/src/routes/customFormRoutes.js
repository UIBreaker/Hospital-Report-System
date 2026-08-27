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
  deleteFormSubmission,
  updateFormSubmission,
  getTrackerData,
  getUniversalTrackerFeed
} = require('../controllers/customFormController');
const { auth, adminOnly: requireAdmin } = require('../middleware/auth');

router.get('/', auth, getAllForms);
router.get('/feed/tracker-data', auth, getUniversalTrackerFeed);
router.get('/:code', auth, getFormByCode);
router.post('/', auth, requireAdmin, createForm);
router.put('/:id', auth, requireAdmin, updateForm);
router.delete('/:id', auth, requireAdmin, deleteForm);

router.post('/:code/submit', auth, submitFormData);
router.get('/:code/submissions', auth, getFormSubmissions);
router.put('/:code/submissions/:submissionId', auth, updateFormSubmission);
router.delete('/:code/submissions/:submissionId', auth, deleteFormSubmission);
router.get('/:code/tracker', auth, getTrackerData);

module.exports = router;
