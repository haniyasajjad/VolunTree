// models/UrgentNeed.js
const mongoose = require('mongoose');

const urgentNeedSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  urgent: { type: Boolean, default: true },
  notified: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('UrgentNeed', urgentNeedSchema);