const express = require('express');
const router = express.Router();

// DIP: injetamos o Model no controller ao instanciá-lo aqui (Composition Root do backend)
const InformativeController = require('../controllers/informativeController');
const Informative = require('../models/Informative');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const informativeController = new InformativeController(Informative);

router.route('/')
    .get(protect, informativeController.getInformatives)
    .post(protect, adminOnly, informativeController.createInformative);

router.route('/:id')
    .put(protect, adminOnly, informativeController.updateInformative)
    .delete(protect, adminOnly, informativeController.deleteInformative);

router.put('/:id/pin', protect, adminOnly, informativeController.togglePinInformative);

module.exports = router;
