const mongoose = require('mongoose');
const Invite = require('../models/Invite');
const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// Get all invites for a volunteer
exports.getInvitesForVolunteer = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;

    // Verify the volunteer exists
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.userType !== 'Volunteer') {
      return res.status(404).json({ error: 'Volunteer not found' });
    }

    // Fetch invites for this volunteer and populate related data
    const invites = await Invite.find({ volunteerId })
      .populate('organizationId', 'name')
      .populate('opportunityId', 'title date location')
      .lean();

    // Ensure populated fields are present, add fallbacks
    const enrichedInvites = invites.map(invite => ({
      ...invite,
      organizationId: {
        name: invite.organizationId?.name || 'Unknown Organization',
      },
      opportunityId: {
        title: invite.opportunityId?.title || 'No Title',
        date: invite.opportunityId?.date || new Date(),
        location: invite.opportunityId?.location || 'Unknown Location',
      },
    }));

    res.status(200).json({ invites: enrichedInvites });
  } catch (error) {
    console.error('Error fetching invites:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Accept an invite
exports.acceptInvite = async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    const volunteerId = req.user.id; // From authMiddleware

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    // Verify the invite belongs to this volunteer
    if (invite.volunteerId.toString() !== volunteerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invite already responded to' });
    }

    invite.status = 'accepted';
    await invite.save();

    // Add the opportunity to the volunteer's enrolledEvents
    const volunteer = await User.findById(volunteerId);
    if (!volunteer.enrolledEvents.includes(invite.opportunityId)) {
      volunteer.enrolledEvents.push(invite.opportunityId);
      await volunteer.save();
    }

    res.status(200).json({ message: 'Invite accepted successfully' });
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Decline an invite
exports.declineInvite = async (req, res) => {
  try {
    const inviteId = req.params.inviteId;
    const volunteerId = req.user.id; // From authMiddleware

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    // Verify the invite belongs to this volunteer
    if (invite.volunteerId.toString() !== volunteerId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (invite.status !== 'pending') {
      return res.status(400).json({ error: 'Invite already responded to' });
    }

    invite.status = 'declined';
    await invite.save();

    res.status(200).json({ message: 'Invite declined successfully' });
  } catch (error) {
    console.error('Error declining invite:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Send invites
exports.sendInvites = async (req, res) => {
  try {
    const { volunteerIds, opportunityId, message } = req.body;
    const organizationId = req.user.id;

    console.log('Request data:', { volunteerIds, opportunityId, organizationId });

    if (!volunteerIds || !Array.isArray(volunteerIds) || volunteerIds.length === 0) {
      return res.status(400).json({ error: 'Volunteer IDs are required' });
    }
    if (!opportunityId || !mongoose.Types.ObjectId.isValid(opportunityId)) {
      return res.status(400).json({ error: 'Valid opportunity ID is required' });
    }
    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const organization = await User.findById(organizationId);
    if (!organization) {
      console.log('Organization not found:', organizationId);
      return res.status(404).json({ error: 'Organization not found' });
    }
    if (organization.userType !== 'Organization Representative') {
      console.log('Unauthorized user type:', organization.userType);
      return res.status(403).json({ error: 'Only Organization Representatives can send invites' });
    }

    const opportunity = await Opportunity.findOne({ _id: opportunityId, createdBy: organizationId }); // Changed from organizationId to createdBy
    if (!opportunity) {
      console.log('Opportunity not found or not owned:', { opportunityId, createdBy: organizationId });
      return res.status(404).json({ error: 'Opportunity not found or not owned by this organization' });
    }

    const invites = volunteerIds.map(volunteerId => ({
      volunteerId,
      organizationId,
      opportunityId,
      message: message || `We would love for you to join our event: ${opportunity.title}!`,
      status: 'pending',
    }));

    await Invite.insertMany(invites);

    res.status(200).json({ message: 'Invites sent successfully' });
  } catch (error) {
    console.error('Error sending invites:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Fetch opportunities for the organization
exports.getOpportunitiesForOrganization = async (req, res) => {
  try {
    const organizationId = req.user.id;

    if (!organizationId || !mongoose.Types.ObjectId.isValid(organizationId)) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const organization = await User.findById(organizationId);
    if (!organization || organization.userType !== 'Organization Representative') {
      return res.status(403).json({ error: 'Only Organization Representatives can fetch opportunities' });
    }

    const opportunities = await Opportunity.find({ createdBy: organizationId }) // Changed from organizationId to createdBy
      .select('title date location')
      .lean();

    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
