const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/users');
const opportunityRoutes = require('./routes/opportunityRoutes');
const messageRoutes = require('./routes/messageRoutes');
const inviteRoutes = require('./routes/invites');
const ratingRoutes = require('./routes/ratings');
const notificationRoutes = require('./routes/notificationRoutes');
const urgentNeedRoutes = require('./routes/urgentNeedRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invites', inviteRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/urgent-needs', urgentNeedRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
