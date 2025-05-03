const Notification = require('../models/notificationModel');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// Create a new notification
exports.createNotification = async (req, res) => {
  const { title, message, type, recipients, priority, scheduled_at, organizationId, opportunityId, sentTo } = req.body;
  const totalRecipients = sentTo.length;

  try {
    const notification = new Notification({
      title,
      message,
      type,
      recipients,
      priority,
      scheduled_at,
      organizationId,
      opportunityId,
      sentTo,
      total_recipients: totalRecipients,
    });
    const savedNotification = await notification.save();
    res.status(201).json({ message: 'Notification created', notification: savedNotification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

// New function to get all volunteer user IDs
exports.getAllVolunteers = async (req, res) => {
  try {
    // Assuming 'userType' is 'Volunteer' in your User model to identify volunteers
    const volunteers = await User.find({ userType: 'Volunteer' }, '_id');
    const volunteerIds = volunteers.map(user => user._id);
    res.status(200).json({ volunteerIds });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

// Fetch notifications for the specified user
exports.getNotifications = async (req, res) => {
  try {
    // Use userId from query parameter if provided, otherwise fall back to req.user.id
    const userId = req.query.userId || req.user.id;
    console.log('Fetching notifications for user ID:', userId); // Debug log
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const notifications = await Notification.find({
      sentTo: userId, // Filter notifications where the user is a recipient
      $or: [
        { scheduled_at: { $exists: false } }, // Not scheduled (field doesn't exist)
        { scheduled_at: null }, // Not scheduled (field is null)
        { scheduled_at: { $lte: new Date() } } // Scheduled and the time has passed
      ]
    }).sort({ created_at: -1 });
    console.log('Found notifications:', notifications); // Debug log
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) return res.status(404).json({ error: 'Notification not found' });
    res.status(200).json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

// Fetch opportunities created by a specific user
exports.getOpportunities = async (req, res) => {
  try {
    const { createdBy } = req.query;
    const query = createdBy ? { createdBy } : {};
    const opportunities = await Opportunity.find(query).populate('createdBy', 'name');
    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

// Fetch opportunities matching the user's interests or event dates for alerts
exports.getMatchingOpportunities = async (req, res) => {
  try {
    const userId = req.query.userId || req.user.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Fetch the user's data to get their interests and enrolled events
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userInterests = user.interests || []; // Array of interest indices
    const enrolledEventIds = user.enrolledEvents || []; // Array of enrolled event IDs

    // Map interest indices to category names (as defined in VolunteerDashboard.js)
    const interestsData = [
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
    ];
    const userCategories = userInterests.map(index => interestsData[index]).filter(Boolean);

    // Fetch the user's enrolled events to get their dates
    const enrolledOpportunities = await Opportunity.find({
      _id: { $in: enrolledEventIds }
    });
    const enrolledDates = enrolledOpportunities.map(opp => {
      const date = new Date(opp.date);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });

    // Fetch opportunities that are recently created (e.g., within the last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const opportunities = await Opportunity.find({
      createdAt: { $gte: oneWeekAgo }
    }).populate('createdBy', 'name');

    // Filter opportunities that match either the user's interests or event dates
    const matchingOpportunities = opportunities.filter(opp => {
      const oppDate = new Date(opp.date);
      const normalizedOppDate = new Date(oppDate.getFullYear(), oppDate.getMonth(), oppDate.getDate());

      const matchesCategory = userCategories.includes(opp.category);
      const matchesDate = enrolledDates.some(enrolledDate =>
        enrolledDate.getTime() === normalizedOppDate.getTime()
      );

      return matchesCategory || matchesDate;
    });

    res.status(200).json(matchingOpportunities);
  } catch (error) {
    console.error('Error fetching matching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch matching opportunities' });
  }
};