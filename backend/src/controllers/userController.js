const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Opportunity = require('../models/Opportunity');

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phoneNumber,
      userType,
      interests,
      skills,
      organizationId,
      organizationName,
      locationPreferences,
      timePreferences,
      dayPreferences,
    } = req.body;

    console.log('Signup request received:', {
      name,
      email,
      userType,
      interests,
      skills,
      organizationName,
      locationPreferences,
      timePreferences,
      dayPreferences,
    });

    const validTypes = ['Student', 'Volunteer', 'Organization Representative'];
    if (!validTypes.includes(userType)) {
      console.log('Invalid user type:', userType);
      return res.status(400).json({ error: 'Invalid user type' });
    }

    console.log('Checking for existing user with email:', email);
    const existingUser = await User.findOne({ email });
    console.log('Existing user check result:', existingUser ? 'User exists' : 'No user found');

    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ error: 'Email already exists' });
    }

    if (interests && (!Array.isArray(interests) || !interests.every(item => Number.isInteger(item) && item >= 0))) {
      console.log('Invalid interests:', interests);
      return res.status(400).json({ error: 'Interests must be an array of non-negative integers' });
    }
    if (skills && (!Array.isArray(skills) || !skills.every(item => Number.isInteger(item) && item >= 0))) {
      console.log('Invalid skills:', skills);
      return res.status(400).json({ error: 'Skills must be an array of non-negative integers' });
    }

    if (locationPreferences && (!Array.isArray(locationPreferences) || !locationPreferences.every(item => typeof item === 'string'))) {
      console.log('Invalid locationPreferences:', locationPreferences);
      return res.status(400).json({ error: 'locationPreferences must be an array of strings' });
    }

    if (timePreferences) {
      if (!Array.isArray(timePreferences)) {
        console.log('Invalid timePreferences:', timePreferences);
        return res.status(400).json({ error: 'timePreferences must be an array' });
      }
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const pref of timePreferences) {
        if (
          (pref.date !== undefined && typeof pref.date !== 'string') ||
          (pref.day !== undefined && !validDays.includes(pref.day)) ||
          typeof pref.startHour !== 'number' ||
          !Number.isInteger(pref.startHour) ||
          pref.startHour < 0 ||
          pref.startHour > 24 ||
          typeof pref.endHour !== 'number' ||
          !Number.isInteger(pref.endHour) ||
          pref.endHour < 0 ||
          pref.endHour > 24 ||
          pref.endHour <= pref.startHour
        ) {
          console.log('Invalid timePreference:', pref);
          return res.status(400).json({
            error: 'timePreferences must contain objects with optional date (string) or day (Monday-Sunday), startHour, and endHour (integers 0-24, endHour > startHour)',
          });
        }
      }
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (dayPreferences && (!Array.isArray(dayPreferences) || !dayPreferences.every(day => validDays.includes(day)))) {
      console.log('Invalid dayPreferences:', dayPreferences);
      return res.status(400).json({ error: 'dayPreferences must be an array of valid days (Monday-Sunday)' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    console.log('Creating new user...');
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      userType,
      interests: interests || [],
      skills: skills || [],
      organizationId,
      organizationName: userType === 'Organization Representative' ? organizationName : undefined,
      locationPreferences: locationPreferences || [],
      timePreferences: timePreferences || [],
      dayPreferences: dayPreferences || [],
      createdOpportunities: [],
      enrolledEvents: [],
    });
    console.log('User created successfully:', user);

    console.log('Generating JWT...');
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('JWT generated successfully');

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name,
        email,
        userType,
        interests: user.interests,
        skills: user.skills,
        organizationName: user.organizationName,
        locationPreferences: user.locationPreferences,
        timePreferences: user.timePreferences,
        dayPreferences: user.dayPreferences,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login request received:', { email });

    console.log('Checking for user with email:', email);
    const user = await User.findOne({ email });
    console.log('User check result:', user ? 'User found' : 'No user found');

    if (!user) {
      console.log('Invalid email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log('Comparing passwords...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch ? 'Match' : 'No match');

    if (!isMatch) {
      console.log('Invalid password for email:', email);
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    console.log('Generating JWT...');
    const token = jwt.sign(
      { id: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    console.log('JWT generated successfully');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email,
        userType: user.userType,
        interests: user.interests,
        skills: user.skills,
        organizationName: user.organizationName,
        locationPreferences: user.locationPreferences,
        timePreferences: user.timePreferences,
        dayPreferences: user.dayPreferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateInterests = async (req, res) => {
  try {
    const { id } = req.params;
    const { interests } = req.body;

    console.log('Update interests request:', { id, interests });

    if (!mongoose.isValidObjectId(id)) {
      console.log('Invalid user ID:', id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!Array.isArray(interests) || !interests.every(item => Number.isInteger(item) && item >= 0)) {
      console.log('Invalid interests:', interests);
      return res.status(400).json({ error: 'Interests must be an array of non-negative integers' });
    }

    if (req.user.id !== id) {
      console.log('Unauthorized attempt to update user:', { userId: req.user.id, targetId: id });
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    console.log('Updating user interests...');
    const user = await User.findByIdAndUpdate(
      id,
      { interests },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User interests updated:', user.interests);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        interests: user.interests,
        skills: user.skills,
        organizationName: user.organizationName,
        locationPreferences: user.locationPreferences,
        timePreferences: user.timePreferences,
        dayPreferences: user.dayPreferences,
      },
    });
  } catch (error) {
    console.error('Update interests error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updateSkills = async (req, res) => {
  try {
    const { id } = req.params;
    const { skills } = req.body;

    console.log('Update skills request:', { id, skills });

    if (!mongoose.isValidObjectId(id)) {
      console.log('Invalid user ID:', id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (!Array.isArray(skills) || !skills.every(item => Number.isInteger(item) && item >= 0)) {
      console.log('Invalid skills:', skills);
      return res.status(400).json({ error: 'Skills must be an array of non-negative integers' });
    }

    if (req.user.id !== id) {
      console.log('Unauthorized attempt to update user:', { userId: req.user.id, targetId: id });
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    console.log('Updating user skills...');
    const user = await User.findByIdAndUpdate(
      id,
      { skills },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User skills updated:', user.skills);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        interests: user.interests,
        skills: user.skills,
        organizationName: user.organizationName,
        locationPreferences: user.locationPreferences,
        timePreferences: user.timePreferences,
        dayPreferences: user.dayPreferences,
      },
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ error: error.message });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const { id } = req.params;
    const { interests, skills, locationPreferences, timePreferences, dayPreferences } = req.body;

    console.log('Update preferences request:', {
      id,
      interests,
      skills,
      locationPreferences,
      timePreferences,
      dayPreferences,
    });

    if (!mongoose.isValidObjectId(id)) {
      console.log('Invalid user ID:', id);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (req.user.id !== id) {
      console.log('Unauthorized attempt to update user:', { userId: req.user.id, targetId: id });
      return res.status(403).json({ error: 'Unauthorized to update this user' });
    }

    if (interests && (!Array.isArray(interests) || !interests.every(item => Number.isInteger(item) && item >= 0))) {
      console.log('Invalid interests:', interests);
      return res.status(400).json({ error: 'Interests must be an array of non-negative integers' });
    }

    if (skills && (!Array.isArray(skills) || !skills.every(item => Number.isInteger(item) && item >= 0))) {
      console.log('Invalid skills:', skills);
      return res.status(400).json({ error: 'Skills must be an array of non-negative integers' });
    }

    if (locationPreferences && (!Array.isArray(locationPreferences) || !locationPreferences.every(item => typeof item === 'string'))) {
      console.log('Invalid locationPreferences:', locationPreferences);
      return res.status(400).json({ error: 'locationPreferences must be an array of strings' });
    }

    if (timePreferences) {
      if (!Array.isArray(timePreferences)) {
        console.log('Invalid timePreferences:', timePreferences);
        return res.status(400).json({ error: 'timePreferences must be an array' });
      }
      const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      for (const pref of timePreferences) {
        if (
          (pref.date !== undefined && typeof pref.date !== 'string') ||
          (pref.day !== undefined && !validDays.includes(pref.day)) ||
          typeof pref.startHour !== 'number' ||
          !Number.isInteger(pref.startHour) ||
          pref.startHour < 0 ||
          pref.startHour > 24 ||
          typeof pref.endHour !== 'number' ||
          !Number.isInteger(pref.endHour) ||
          pref.endHour < 0 ||
          pref.endHour > 24 ||
          pref.endHour <= pref.startHour
        ) {
          console.log('Invalid timePreference:', pref);
          return res.status(400).json({
            error: 'timePreferences must contain objects with optional date (string) or day (Monday-Sunday), startHour, and endHour (integers 0-24, endHour > startHour)',
          });
        }
      }
    }

    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    if (dayPreferences && (!Array.isArray(dayPreferences) || !dayPreferences.every(day => validDays.includes(day)))) {
      console.log('Invalid dayPreferences:', dayPreferences);
      return res.status(400).json({ error: 'dayPreferences must be an array of valid days (Monday-Sunday)' });
    }

    console.log('Updating user preferences...');
    const user = await User.findByIdAndUpdate(
      id,
      {
        interests,
        skills,
        locationPreferences,
        timePreferences,
        dayPreferences,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      console.log('User not found:', id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User preferences updated:', {
      interests: user.interests,
      skills: user.skills,
      locationPreferences: user.locationPreferences,
      timePreferences: user.timePreferences,
      dayPreferences: user.dayPreferences,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        interests: user.interests,
        skills: user.skills,
        organizationName: user.organizationName,
        locationPreferences: user.locationPreferences,
        timePreferences: user.timePreferences,
        dayPreferences: user.dayPreferences,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    console.log('Get user by ID request:', { id: req.params.id });

    if (!req.user) {
      console.log('No user in request (authMiddleware issue)');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.params.id;
    if (!mongoose.isValidObjectId(userId)) {
      console.log('Invalid user ID:', userId);
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    console.log('Fetching user...');
    const user = await User.findById(userId).select('-password');
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User fetched successfully:', user._id);
    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

const getAllOpportunities = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const opportunities = await Opportunity.find();
    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
};

const filterOpportunities = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = req.user.id;
    const user = await User.findById(userId).select('interests');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('User interests:', user.interests);

    const { interest, skill, date, ngo } = req.query;
    const query = {};

    // Initially filter only by user's interests (category)
    if (!interest && !skill && !date && !ngo) {
      if (user.interests && user.interests.length > 0) {
        const interestCategories = user.interests.map(index => [
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
        ][index]).filter(Boolean);
        if (interestCategories.length > 0) {
          query.category = { $in: interestCategories };
        }
      }
    }

    // Apply manual filters individually
    if (interest && interest !== 'Interest Tag') {
      query.category = interest;
    }
    if (skill && skill !== 'Skill Tag') {
      query.skills = skill;
    }
    if (date && date !== 'Date') {
      const dateParts = date.split('/');
      if (dateParts.length !== 3) {
        return res.status(400).json({ error: 'Invalid date format. Use MM/DD/YYYY' });
      }
      const [month, day, year] = dateParts.map(Number);
      if (isNaN(month) || isNaN(day) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
        return res.status(400).json({ error: 'Invalid date values' });
      }
      query.date = {
        $gte: new Date(year, month - 1, day),
        $lte: new Date(year, month - 1, day, 23, 59, 59),
      };
    }
    if (ngo && ngo !== 'NGO Name') {
      query.organizationName = ngo;
    }

    console.log('Filter opportunities query:', JSON.stringify(query, null, 2));
    const opportunities = await Opportunity.find(query);
    res.status(200).json({ opportunities });
  } catch (error) {
    console.error('Error filtering opportunities:', error);
    res.status(500).json({ error: 'Failed to filter opportunities: ' + error.message });
  }
};

const getVolunteers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.user.userType !== 'Organization Representative') {
      return res.status(403).json({ error: 'Only Organization Representatives can access volunteers' });
    }

    const volunteers = await User.find({ userType: 'Volunteer' }).select('-password');
    res.status(200).json({ volunteers });
  } catch (error) {
    console.error('Error fetching volunteers:', error);
    res.status(500).json({ error: 'Failed to fetch volunteers' });
  }
};

module.exports = {
  signup,
  login,
  updateInterests,
  updateSkills,
  updatePreferences,
  getUserById,
  getAllOpportunities,
  filterOpportunities,
  getVolunteers,
};