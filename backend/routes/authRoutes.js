const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// DIP: injetamos as dependências no controller ao instanciá-lo aqui (Composition Root do backend)
const AuthController = require('../controllers/authController');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const authController = new AuthController(User, bcrypt, jwt);

router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);
router.post('/logout', protect, authController.logout);
router.post('/register', protect, adminOnly, authController.register);
router.get('/responsibles', protect, adminOnly, authController.getResponsibles);
router.put('/profile', protect, authController.updateProfile);
router.put('/users/:id/password', protect, adminOnly, authController.adminChangePassword);
router.delete('/users/:id', protect, authController.deleteUser);

module.exports = router;
