const express = require('express');
const router = express.Router();

// DIP: injetamos o Model no controller ao instanciá-lo aqui (Composition Root do backend)
const EventController = require('../controllers/eventController');
const Event = require('../models/Event');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const eventController = new EventController(Event);

router.route('/')
    .get(protect, eventController.getEvents)
    .post(protect, adminOnly, eventController.createEvent);

router.route('/:id')
    .delete(protect, adminOnly, eventController.deleteEvent);

module.exports = router;
