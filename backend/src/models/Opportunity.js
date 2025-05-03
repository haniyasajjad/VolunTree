const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  maxVolunteers: {
    type: Number,
    required: true,
    min: 1,
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Environmental Conservation',
      'Education',
      'Food Security',
      'Health Care',
      'Animal Welfare',
      'Disaster Relief',
      'Senior Care',
      'Civic Engagement',
      'Housing Support',
      'Arts and Culture',
    ],
  },
  skills: {
    type: [String],
    default: [],
  },
  requirements: {
    type: String,
    trim: true,
    default: '',
  },
  assignedVolunteers: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: [],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  organizationName: {
    type: String,
    trim: true,
    required: true,
  },
  type: {
    type: String,
    enum: ['Opportunity', 'Event'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Opportunity', opportunitySchema);