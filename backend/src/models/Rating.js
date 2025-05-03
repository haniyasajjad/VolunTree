const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
  },
  volunteerId: {
    type: String,
    required: true,
  },
  organizationId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  feedback: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['volunteer-to-org', 'org-to-volunteer'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rating', ratingSchema);