const express = require('express');
const router = express.Router();

// DIP: injetamos o Model no controller ao instanciá-lo aqui (Composition Root do backend)
const ProjectController = require('../controllers/projectController');
const Project = require('../models/Project');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const projectController = new ProjectController(Project);

router.route('/')
    .get(protect, projectController.getProjects)
    .post(protect, adminOnly, projectController.createProject);

router.route('/:id')
    .put(protect, adminOnly, projectController.updateProject)
    .delete(protect, adminOnly, projectController.deleteProject);

module.exports = router;
