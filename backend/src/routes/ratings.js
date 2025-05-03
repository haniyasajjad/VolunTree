const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Submit a rating
router.post('/', auth, async (req, res) => {
  try {
    const { eventId, volunteerId, organizationId, rating, feedback, type } = req.body;

    // Validate input
    if (!eventId || !volunteerId || !organizationId || !rating || !type) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    if (rating < 0 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 0 and 5' });
    }

    if (!['volunteer-to-org', 'org-to-volunteer'].includes(type)) {
      return res.status(400).json({ error: 'Invalid rating type' });
    }

    const newRating = new Rating({
      eventId,
      volunteerId,
      organizationId,
      rating,
      feedback,
      type,
    });

    await newRating.save();
    res.status(201).json({ message: 'Rating submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ratings for an organization (volunteer-to-org)
router.get('/organization/:organizationId', auth, async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Fetch ratings for the organization
    const ratings = await Rating.find({
      organizationId,
      type: 'volunteer-to-org',
    });

    // Fetch additional details (volunteer name, event title)
    const enrichedRatings = await Promise.all(ratings.map(async (rating) => {
      const volunteer = await User.findById(rating.volunteerId);
      const event = await Opportunity.findById(rating.eventId);
      return {
        _id: rating._id,
        volunteerName: volunteer ? volunteer.name : 'Unknown',
        eventTitle: event ? event.title : 'Unknown Event',
        rating: rating.rating,
        feedback: rating.feedback,
      };
    }));

    res.status(200).json({ ratings: enrichedRatings });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get volunteers who participated in the organization's events
router.get('/volunteers/:organizationId', auth, async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Find all events created by the organization
    const events = await Opportunity.find({ createdBy: organizationId });

    // Get all volunteer IDs from the assignedVolunteers field of these events
    const volunteerIds = [...new Set(events.flatMap(event => event.assignedVolunteers))];

    // Fetch volunteer details
    const volunteers = await User.find({
      _id: { $in: volunteerIds },
      userType: { $in: ['Student', 'Volunteer'] },
    }).select('name _id');

    res.status(200).json({ volunteers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;