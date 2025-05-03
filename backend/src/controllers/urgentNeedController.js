// controllers/urgentNeedController.js
const UrgentNeed = require('../models/UrgentNeed');

exports.getUrgentNeeds = async (req, res) => {
  try {
    const urgentNeeds = await UrgentNeed.find().populate('createdBy', 'name');
    res.status(200).json(urgentNeeds);
  } catch (error) {
    console.error('Error fetching urgent needs:', error);
    res.status(500).json({ error: 'Failed to fetch urgent needs' });
  }
};

exports.createUrgentNeed = async (req, res) => {
  try {
    const { title, description, urgent, notified, createdBy } = req.body;
    const newUrgentNeed = new UrgentNeed({
      title,
      description,
      urgent,
      notified,
      createdBy,
    });
    const savedUrgentNeed = await newUrgentNeed.save();
    res.status(201).json(savedUrgentNeed);
  } catch (error) {
    console.error('Error creating urgent need:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.updateUrgentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { urgent } = req.body;
    const urgentNeed = await UrgentNeed.findByIdAndUpdate(
      id,
      { urgent },
      { new: true, runValidators: true }
    );
    if (!urgentNeed) {
      return res.status(404).json({ error: 'Urgent need not found' });
    }
    res.status(200).json(urgentNeed);
  } catch (error) {
    console.error('Error updating urgent status:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.notifyVolunteers = async (req, res) => {
  try {
    const { id } = req.params;
    const urgentNeed = await UrgentNeed.findByIdAndUpdate(
      id,
      { notified: true },
      { new: true, runValidators: true }
    );
    if (!urgentNeed) {
      return res.status(404).json({ error: 'Urgent need not found' });
    }
    res.status(200).json({ message: 'Volunteers notified successfully', urgentNeed });
  } catch (error) {
    console.error('Error notifying volunteers:', error);
    res.status(400).json({ error: error.message });
  }
};