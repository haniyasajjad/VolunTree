const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Specific routes first
router.get('/volunteers', authMiddleware, userController.getVolunteers);
router.get('/opportunities', authMiddleware, userController.getAllOpportunities);
router.get('/opportunities/filter', authMiddleware, userController.filterOpportunities);

// General routes with parameters after specific routes
router.get('/:id', authMiddleware, userController.getUserById);
router.patch('/:id/interests', authMiddleware, userController.updateInterests);
router.patch('/:id/skills', authMiddleware, userController.updateSkills);
router.patch('/:id/preferences', authMiddleware, userController.updatePreferences);

// Authentication routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);

module.exports = router;