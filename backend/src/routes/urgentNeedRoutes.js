// routes/urgentNeedRoutes.js
const express = require('express');
const router = express.Router();
const { getUrgentNeeds, createUrgentNeed, updateUrgentStatus, notifyVolunteers } = require('../controllers/urgentNeedController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/', getUrgentNeeds);
router.post('/', createUrgentNeed);
router.put('/:id', updateUrgentStatus);
router.post('/:id/notify', notifyVolunteers);

module.exports = router;