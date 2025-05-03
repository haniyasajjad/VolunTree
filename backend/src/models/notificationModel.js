const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true, enum: [
    'Event Update', 'Event Cancellation', 'Event Reminder', 'Volunteer Request',
    'General Announcement', 'Emergency Alert', 'Thank You Message', 'Feedback Request'
  ] },
  recipients: { type: [String], required: true },
  priority: { type: String, required: true, enum: ['low', 'normal', 'high'], default: 'normal' },
  created_at: { type: Date, default: Date.now },
  scheduled_at: { type: Date },
  read_count: { type: Number, default: 0 },
  total_recipients: { type: Number, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  opportunityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Opportunity' },
  sentTo: { type: [mongoose.Schema.Types.ObjectId], ref: 'User', default: [] },
});

module.exports = mongoose.model('Notification', notificationSchema);