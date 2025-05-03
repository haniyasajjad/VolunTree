const express = require('express');
const router = express.Router();
const { createNotification, getNotifications, deleteNotification, getOpportunities, getMatchingOpportunities, getAllVolunteers } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/', createNotification);
router.get('/', getNotifications);
router.delete('/:id', deleteNotification);
router.get('/opportunities', getOpportunities);
router.get('/volunteers', getAllVolunteers);

// Fetch matching opportunities for alerts
router.get('/matching-opportunities', getMatchingOpportunities);

module.exports = router;