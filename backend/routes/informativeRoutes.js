const express = require('express');
const router = express.Router();
const { getInformatives, createInformative, updateInformative, togglePinInformative, deleteInformative } = require('../controllers/informativeController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getInformatives)
    .post(protect, adminOnly, createInformative);

router.route('/:id')
    .put(protect, adminOnly, updateInformative)
    .delete(protect, adminOnly, deleteInformative);

router.put('/:id/pin', protect, adminOnly, togglePinInformative);

module.exports = router;
