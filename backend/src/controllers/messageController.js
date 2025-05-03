const mongoose = require('mongoose');
const Message = require('../models/Message');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

// Existing functions remain unchanged
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // From authMiddleware

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ error: 'Invalid sender or receiver ID' });
    }

    // Verify receiver exists and is an Organization Representative
    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.userType !== 'Organization Representative') {
      return res.status(400).json({ error: 'Receiver must be an Organization Representative' });
    }

    // Create and save the message
    const message = await Message.create({
      senderId,
      receiverId,
      content,
    });

    // Fetch the created message with populated fields
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    if (!populatedMessage) {
      return res.status(500).json({ error: 'Failed to retrieve created message' });
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Server error while sending message' });
  }
};

const getConversation = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user.id;

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Verify otherUserId is an Organization Representative
    const otherUser = await User.findById(otherUserId);
    if (!otherUser || otherUser.userType !== 'Organization Representative') {
      return res.status(400).json({ error: 'Selected user must be an Organization Representative' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    // Mark messages as read
    await Message.updateMany(
      { receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ error: 'Server error while fetching conversation' });
  }
};

const getConversationsList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Fetch all Organization Representatives
    const representatives = await User.find({
      userType: 'Organization Representative',
    }).select('name userType organizationName');

    console.log('Found representatives:', representatives);

    // For each representative, check for messages with the logged-in user
    const conversations = await Promise.all(
      representatives.map(async (rep) => {
        if (!mongoose.isValidObjectId(rep._id)) {
          console.warn('Invalid representative ID:', rep);
          return null;
        }

        const messages = await Message.find({
          $or: [
            { senderId: userId, receiverId: rep._id },
            { senderId: rep._id, receiverId: userId },
          ],
        })
          .sort({ timestamp: -1 })
          .limit(1) // Get the most recent message
          .populate('senderId', 'name')
          .populate('receiverId', 'name');

        return {
          userId: rep._id,
          name: rep.name,
          organizationName: rep.organizationName || 'Unnamed Organization',
          lastMessage: messages.length > 0 ? messages[0] : null,
        };
      })
    );

    // Filter out null entries and ensure organizationName is non-empty
    const filteredConversations = conversations
      .filter((conv) => conv && conv.organizationName)
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

    console.log('Returning conversations:', filteredConversations);

    res.status(200).json({ conversations: filteredConversations });
  } catch (error) {
    console.error('Get conversations list error:', error);
    res.status(500).json({ error: 'Server error while fetching representatives' });
  }
};

// New function: Send a message from Organization Representative to Volunteer
const sendMessageToVolunteer = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id; // From authMiddleware

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(senderId) || !mongoose.isValidObjectId(receiverId)) {
      return res.status(400).json({ error: 'Invalid sender or receiver ID' });
    }

    // Verify sender is an Organization Representative
    const sender = await User.findById(senderId);
    if (!sender || sender.userType !== 'Organization Representative') {
      return res.status(400).json({ error: 'Sender must be an Organization Representative' });
    }

    // Verify receiver is a Volunteer or Student
    const receiver = await User.findById(receiverId);
    if (!receiver || !['Volunteer', 'Student'].includes(receiver.userType)) {
      return res.status(400).json({ error: 'Receiver must be a Volunteer or Student' });
    }

    // Create and save the message
    const message = await Message.create({
      senderId,
      receiverId,
      content,
    });

    // Fetch the created message with populated fields
    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    if (!populatedMessage) {
      return res.status(500).json({ error: 'Failed to retrieve created message' });
    }

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error('Send message to volunteer error:', error);
    res.status(500).json({ error: 'Server error while sending message' });
  }
};

// New function: Get conversation between Organization Representative and Volunteer
const getOrgConversation = async (req, res) => {
  try {
    const { volunteerId } = req.params;
    const orgId = req.user.id;

    // Validate ObjectIds
    if (!mongoose.isValidObjectId(orgId) || !mongoose.isValidObjectId(volunteerId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Verify the logged-in user is an Organization Representative
    const orgUser = await User.findById(orgId);
    if (!orgUser || orgUser.userType !== 'Organization Representative') {
      return res.status(400).json({ error: 'User must be an Organization Representative' });
    }

    // Verify the other user is a Volunteer or Student
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || !['Volunteer', 'Student'].includes(volunteer.userType)) {
      return res.status(400).json({ error: 'Selected user must be a Volunteer or Student' });
    }

    const messages = await Message.find({
      $or: [
        { senderId: orgId, receiverId: volunteerId },
        { senderId: volunteerId, receiverId: orgId },
      ],
    })
      .sort({ timestamp: 1 })
      .populate('senderId', 'name')
      .populate('receiverId', 'name');

    // Mark messages as read for the Organization Representative
    await Message.updateMany(
      { receiverId: orgId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get org conversation error:', error);
    res.status(500).json({ error: 'Server error while fetching conversation' });
  }
};

// New function: Get list of Volunteers who messaged the Organization Representative
const getOrgConversationsList = async (req, res) => {
  try {
    const orgId = req.user.id;

    // Validate userId
    if (!mongoose.isValidObjectId(orgId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Verify the logged-in user is an Organization Representative
    const orgUser = await User.findById(orgId);
    if (!orgUser || orgUser.userType !== 'Organization Representative') {
      return res.status(400).json({ error: 'User must be an Organization Representative' });
    }

    // Fetch all Volunteers and Students
    const volunteers = await User.find({
      userType: { $in: ['Volunteer', 'Student'] },
    }).select('name userType');

    // For each volunteer, check for messages with the Organization Representative
    const conversations = await Promise.all(
      volunteers.map(async (vol) => {
        if (!mongoose.isValidObjectId(vol._id)) {
          console.warn('Invalid volunteer ID:', vol);
          return null;
        }

        const messages = await Message.find({
          $or: [
            { senderId: orgId, receiverId: vol._id },
            { senderId: vol._id, receiverId: orgId },
          ],
        })
          .sort({ timestamp: -1 })
          .limit(1) // Get the most recent message
          .populate('senderId', 'name')
          .populate('receiverId', 'name');

        if (messages.length === 0) return null;

        return {
          userId: vol._id,
          name: vol.name,
          lastMessage: messages[0],
        };
      })
    );

    // Filter out null entries (no messages) and sort by name
    const filteredConversations = conversations
      .filter((conv) => conv)
      .sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).json({ conversations: filteredConversations });
  } catch (error) {
    console.error('Get org conversations list error:', error);
    res.status(500).json({ error: 'Server error while fetching conversations' });
  }
};

// New function: Get volunteers enrolled in opportunities created by the organization
const getOpportunityVolunteers = async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Validate ObjectId
    if (!mongoose.isValidObjectId(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    // Verify the organizationId belongs to an Organization Representative
    const orgUser = await User.findById(organizationId);
    if (!orgUser || orgUser.userType !== 'Organization Representative') {
      return res.status(400).json({ error: 'User must be an Organization Representative' });
    }

    // Find all opportunities created by the organization
    const opportunities = await Opportunity.find({ createdBy: organizationId });

    // Get all volunteer IDs from the assignedVolunteers field
    const volunteerIds = [...new Set(opportunities.flatMap(opportunity => opportunity.assignedVolunteers || []))];

    // Fetch volunteer details
    const volunteers = await User.find({
      _id: { $in: volunteerIds },
      userType: { $in: ['Student', 'Volunteer'] },
    }).select('name _id');

    res.status(200).json({ volunteers });
  } catch (error) {
    console.error('Get opportunity volunteers error:', error);
    res.status(500).json({ error: 'Server error while fetching opportunity volunteers' });
  }
};

module.exports = { 
  sendMessage, 
  getConversation, 
  getConversationsList, 
  sendMessageToVolunteer, 
  getOrgConversation, 
  getOrgConversationsList, 
  getOpportunityVolunteers 
};