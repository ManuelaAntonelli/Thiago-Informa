const express = require('express');
const router = express.Router();
const {
    login,
    getMe,
    logout,
    register,
    getResponsibles,
    deleteUser,
    adminChangePassword,
    updateProfile
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.post('/register', protect, adminOnly, register);
router.get('/responsibles', protect, adminOnly, getResponsibles);
router.put('/profile', protect, updateProfile);
router.put('/users/:id/password', protect, adminOnly, adminChangePassword);
router.delete('/users/:id', protect, deleteUser);

module.exports = router;
