const Opportunity = require('../models/Opportunity');
const User = require('../models/User');

// Create a new opportunity (only for Organization Representatives)
const createOpportunity = async (req, res) => {
  try {
    // authMiddleware should have already verified the token and set req.user
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;

    // Fetch the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is an Organization Representative
    if (user.userType !== 'Organization Representative') {
      return res.status(403).json({ error: 'Only Organization Representatives can post opportunities' });
    }

    // Extract opportunity data from request body
    const { title, description, location, date, duration, maxVolunteers, category, skills, requirements } = req.body;

    // Validate required fields
    if (!title || !description || !location || !date || !duration || !maxVolunteers || !category) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Classify as Event if duration > 24 hours
    const type = duration > 24 ? 'Event' : 'Opportunity';

    // Create the opportunity
    const opportunityData = {
      title,
      description,
      location,
      date: new Date(date), // Ensure date is properly formatted
      duration,
      maxVolunteers,
      category,
      skills: skills || [],
      requirements: requirements || '',
      assignedVolunteers: [],
      createdBy: userId,
      organizationName: user.organizationName,
      type,
    };

    const opportunity = new Opportunity(opportunityData);
    await opportunity.save();

    // Add the opportunity ID to the user's createdOpportunities
    user.createdOpportunities = user.createdOpportunities || [];
    user.createdOpportunities.push(opportunity._id);
    await user.save();

    res.status(201).json({
      message: 'Opportunity created successfully',
      opportunity: {
        id: opportunity._id,
        title,
        description,
        location,
        date: opportunity.date,
        duration,
        maxVolunteers,
        category,
        skills: opportunity.skills,
        requirements: opportunity.requirements,
        organizationName: opportunity.organizationName,
        type: opportunity.type,
        createdBy: userId,
        createdAt: opportunity.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating opportunity:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all opportunities
const getAllOpportunities = async (req, res) => {
  try {
    // authMiddleware should have already verified the token and set req.user
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Fetch all opportunities from the database
    const opportunities = await Opportunity.find();
    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

// Register for an opportunity
const registerForOpportunity = async (req, res) => {
  try {
    console.log('Register for opportunity request:', { user: req.user, params: req.params });

    // authMiddleware should have already verified the token and set req.user
    if (!req.user) {
      console.log('No req.user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const opportunityId = req.params.id;
    console.log('User ID:', userId, 'Opportunity ID:', opportunityId);

    // Find the opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      console.log('Opportunity not found');
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    console.log('Found opportunity:', opportunity);

    // Check if user is a Volunteer or Student
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Found user:', user);

    if (!['Volunteer', 'Student'].includes(user.userType)) {
      console.log('User type not allowed:', user.userType);
      return res.status(403).json({ error: 'Only Volunteers and Students can register for opportunities' });
    }

    // Check if user is already registered
    if (opportunity.assignedVolunteers.includes(userId)) {
      console.log('User already registered');
      return res.status(400).json({ error: 'You are already registered for this opportunity' });
    }

    // Check if the opportunity has reached max volunteers
    console.log('Assigned volunteers:', opportunity.assignedVolunteers.length, 'Max volunteers:', opportunity.maxVolunteers);
    if (opportunity.assignedVolunteers.length >= opportunity.maxVolunteers) {
      console.log('Max volunteers reached');
      return res.status(400).json({ error: 'This opportunity has reached its maximum number of volunteers' });
    }

    // Add user to assignedVolunteers in the Opportunity
    opportunity.assignedVolunteers.push(userId);
    await opportunity.save();
    console.log('Updated opportunity:', opportunity);

    // Add the opportunity to the user's enrolledEvents
    user.enrolledEvents = user.enrolledEvents || [];
    user.enrolledEvents.push(opportunityId);
    await user.save();
    console.log('Updated user:', user);

    res.status(200).json({ message: 'Successfully registered for the opportunity' });
  } catch (error) {
    console.error('Error registering for opportunity:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to register for the opportunity' });
  }
};

// Get event analytics for an organization representative
const getEventAnalytics = async (req, res) => {
  try {
    // authMiddleware should have already verified the token and set req.user
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orgId = req.user.id; // Assuming orgId is the user ID of the representative

    // Fetch all opportunities created by the organization representative
    const opportunities = await Opportunity.find({ createdBy: orgId });

    if (!opportunities || opportunities.length === 0) {
      return res.status(404).json({ error: 'No opportunities found for this organization' });
    }

    // Calculate unique volunteers
    const allVolunteers = opportunities.reduce((acc, opp) => {
      return acc.concat(opp.assignedVolunteers || []);
    }, []);
    const uniqueVolunteers = [...new Set(allVolunteers)].length;

    // Calculate total hours
    const totalHours = opportunities.reduce((sum, opp) => sum + (opp.duration || 0), 0);

    // Prepare event data for the table with status
    const currentTime = new Date();
    const eventData = opportunities.map(opp => {
      const startTime = opp.date;
      const endTime = new Date(startTime.getTime() + opp.duration * 60 * 60 * 1000); // Convert hours to milliseconds
      const status = currentTime > endTime ? 'Completed' : 'Ongoing';

      return {
        eventId: opp._id,
        eventName: opp.title,
        date: opp.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        volunteersAttended: opp.assignedVolunteers.length,
        totalHours: opp.duration,
        status,
        description: opp.description,
      };
    });

    res.status(200).json({
      uniqueVolunteers,
      totalHours,
      events: eventData,
    });
  } catch (error) {
    console.error('Error fetching event analytics:', error.message, error.stack);
    res.status(500).json({ error: 'Server error while fetching event analytics' });
  }
};

// Update an opportunity
const updateOpportunity = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const opportunityId = req.params.id;

    // Find the opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check if the user is the creator
    if (opportunity.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this opportunity' });
    }

    // Update fields
    const { title, description, location, date, duration, maxVolunteers, category, skills, requirements } = req.body;

    // Validate required fields
    if (!title || !description || !location || !date || !duration || !maxVolunteers || !category) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    opportunity.title = title;
    opportunity.description = description;
    opportunity.location = location;
    opportunity.date = new Date(date);
    opportunity.duration = duration;
    opportunity.maxVolunteers = maxVolunteers;
    opportunity.category = category;
    opportunity.skills = skills || [];
    opportunity.requirements = requirements || '';
    opportunity.type = duration > 24 ? 'Event' : 'Opportunity';

    await opportunity.save();

    res.status(200).json({
      message: 'Opportunity updated successfully',
      opportunity,
    });
  } catch (error) {
    console.error('Error updating opportunity:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
};

// Delete an opportunity
const deleteOpportunity = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const opportunityId = req.params.id;

    // Find the opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    // Check if the user is the creator
    if (opportunity.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this opportunity' });
    }

    // Remove the opportunity ID from the creator's createdOpportunities
    const creator = await User.findById(userId);
    if (creator) {
      creator.createdOpportunities = creator.createdOpportunities.filter(
        oppId => oppId.toString() !== opportunityId
      );
      await creator.save();
    }

    // Remove the opportunity ID from enrolledEvents of assigned volunteers
    const assignedVolunteers = opportunity.assignedVolunteers || [];
    if (assignedVolunteers.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedVolunteers } },
        { $pull: { enrolledEvents: opportunityId } }
      );
    }

    // Delete the opportunity
    await Opportunity.findByIdAndDelete(opportunityId);

    res.status(200).json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting opportunity:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
};

// Unregister from an opportunity
const unregisterFromOpportunity = async (req, res) => {
  try {
    console.log('Unregister from opportunity request:', { user: req.user, params: req.params });

    // authMiddleware should have already verified the token and set req.user
    if (!req.user) {
      console.log('No req.user found');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const opportunityId = req.params.id;
    console.log('User ID:', userId, 'Opportunity ID:', opportunityId);

    // Find the opportunity
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      console.log('Opportunity not found');
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    console.log('Found opportunity:', opportunity);

    // Check if user is a Volunteer or Student
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('Found user:', user);

    if (!['Volunteer', 'Student'].includes(user.userType)) {
      console.log('User type not allowed:', user.userType);
      return res.status(403).json({ error: 'Only Volunteers and Students can unregister from opportunities' });
    }

    // Check if user is registered
    if (!opportunity.assignedVolunteers.includes(userId)) {
      console.log('User not registered for this opportunity');
      return res.status(400).json({ error: 'You are not registered for this opportunity' });
    }

    // Remove user from assignedVolunteers in the Opportunity
    opportunity.assignedVolunteers = opportunity.assignedVolunteers.filter(
      volunteerId => volunteerId.toString() !== userId
    );
    await opportunity.save();
    console.log('Updated opportunity:', opportunity);

    // Remove the opportunity from the user's enrolledEvents
    user.enrolledEvents = user.enrolledEvents.filter(
      eventId => eventId.toString() !== opportunityId
    );
    await user.save();
    console.log('Updated user:', user);

    res.status(200).json({ message: 'Successfully unregistered from the opportunity' });
  } catch (error) {
    console.error('Error unregistering from opportunity:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to unregister from the opportunity' });
  }
};

// Get a single opportunity by ID
const getOpportunityById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const opportunityId = req.params.id;
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }

    res.status(200).json({ opportunity });
  } catch (error) {
    console.error('Error fetching opportunity:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
};

module.exports = { createOpportunity, getAllOpportunities, registerForOpportunity, getEventAnalytics, updateOpportunity, deleteOpportunity, unregisterFromOpportunity, getOpportunityById };