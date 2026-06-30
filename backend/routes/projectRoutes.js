const express = require('express');
const router = express.Router();
const { getProjects, createProject, updateProject, deleteProject } = require('../controllers/projectController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getProjects)
    .post(protect, adminOnly, createProject);

router.route('/:id')
    .put(protect, adminOnly, updateProject)
    .delete(protect, adminOnly, deleteProject);

module.exports = router;
