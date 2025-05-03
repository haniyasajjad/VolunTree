const express = require('express');
const router = express.Router();
const inviteController = require('../controllers/inviteController');
const authMiddleware = require('../middleware/auth');

// Existing routes
router.get('/volunteer/:volunteerId', authMiddleware, inviteController.getInvitesForVolunteer);
router.patch('/:inviteId/accept', authMiddleware, inviteController.acceptInvite);
router.patch('/:inviteId/decline', authMiddleware, inviteController.declineInvite);
router.post('/', authMiddleware, inviteController.sendInvites);

// New route for fetching opportunities
router.get('/organization/opportunities', authMiddleware, inviteController.getOpportunitiesForOrganization);

module.exports = router;
