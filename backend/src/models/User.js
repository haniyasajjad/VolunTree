const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  userType: {
    type: String,
    enum: ['Student', 'Volunteer', 'Organization Representative'],
    required: true,
  },
  interests: [
    {
      type: Number,
      min: 0,
    },
  ],
  skills: [
    {
      type: Number,
      min: 0,
    },
  ],
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
  organizationName: {
    type: String,
    trim: true,
  },
  locationPreferences: [
    {
      type: String,
    },
  ],
  timePreferences: [
    {
      date: {
        type: String,
        required: false,
      },
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: false,
      },
      startHour: {
        type: Number,
        min: 0,
        max: 24,
        required: true,
      },
      endHour: {
        type: Number,
        min: 0,
        max: 24,
        required: true,
      },
    },
  ],
  dayPreferences: [
    {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    },
  ],
  createdOpportunities: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Opportunity',
    default: [],
  },
  enrolledEvents: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Opportunity',
    default: [],
  },
});

module.exports = mongoose.model('User', userSchema);