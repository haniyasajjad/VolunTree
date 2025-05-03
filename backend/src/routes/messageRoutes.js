const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/auth');

// Existing routes
router.post('/send', authMiddleware, messageController.sendMessage);
router.get('/conversations', authMiddleware, messageController.getConversationsList);
router.get('/conversation/:otherUserId', authMiddleware, messageController.getConversation);

// New routes for Organization Representative
router.post('/org/send', authMiddleware, messageController.sendMessageToVolunteer);
router.get('/org/conversations', authMiddleware, messageController.getOrgConversationsList);
router.get('/org/conversation/:volunteerId', authMiddleware, messageController.getOrgConversation);
router.get('/opportunity-volunteers/:organizationId', authMiddleware, messageController.getOpportunityVolunteers);

module.exports = router;