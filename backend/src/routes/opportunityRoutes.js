const express = require('express');
const router = express.Router();
const { createOpportunity, getAllOpportunities, registerForOpportunity, getEventAnalytics, updateOpportunity, deleteOpportunity, unregisterFromOpportunity, getOpportunityById } = require('../controllers/opportunityController');
const authMiddleware = require('../middleware/auth');

// Route to create a new opportunity
router.post('/', authMiddleware, createOpportunity);

// Route to get all opportunities
router.get('/', authMiddleware, getAllOpportunities);

// Route to register for an opportunity
router.patch('/:id/register', authMiddleware, registerForOpportunity);

// Route to get event analytics
router.get('/analytics', authMiddleware, getEventAnalytics);

// Route to update an opportunity
router.put('/:id', authMiddleware, updateOpportunity);

// Route to delete an opportunity
router.delete('/:id', authMiddleware, deleteOpportunity);

router.post('/unregister/:id', authMiddleware, unregisterFromOpportunity);

router.get('/:id', authMiddleware, getOpportunityById);

module.exports = router;