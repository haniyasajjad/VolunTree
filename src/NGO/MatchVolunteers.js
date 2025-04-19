import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  CircularProgress,
  Tooltip,
  Badge,
  Alert,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  Favorite as FavoriteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import '../styles/NGO/MatchVolunteers.css';

const MatchVolunteers = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    skills: [],
    interests: [],
    availability: '',
    location: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  // Mock data for skills and interests
  const allSkills = [
    'Teaching', 'Mentoring', 'Event Planning', 'Fundraising', 
    'Social Media', 'Graphic Design', 'Web Development', 
    'Data Analysis', 'Project Management', 'Public Speaking',
    'First Aid', 'Language Translation', 'Childcare', 'Elderly Care',
    'Animal Care', 'Environmental Conservation', 'Food Preparation'
  ];

  const allInterests = [
    'Education', 'Environment', 'Healthcare', 'Social Justice',
    'Arts & Culture', 'Sports & Recreation', 'Animal Welfare',
    'Community Development', 'Youth Services', 'Elderly Services',
    'Disaster Relief', 'International Aid', 'Technology', 'Food Security'
  ];

  // Mock data for volunteers
  useEffect(() => {
    // Simulate API call to fetch volunteers
    const fetchVolunteers = async () => {
      try {
        // In a real application, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
        setLoading(false);
      }
    };

    fetchVolunteers();
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    filterVolunteers(e.target.value, filters);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = {
      ...filters,
      [name]: value
    };
    setFilters(updatedFilters);
    filterVolunteers(searchTerm, updatedFilters);
  };

  const filterVolunteers = (term, filterSettings) => {
    let filtered = [...volunteers];
    
    // Apply search term filter
    if (term) {
      filtered = filtered.filter(volunteer => 
        volunteer.name.toLowerCase().includes(term.toLowerCase()) ||
        volunteer.skills.some(skill => skill.toLowerCase().includes(term.toLowerCase())) ||
        volunteer.interests.some(interest => interest.toLowerCase().includes(term.toLowerCase()))
      );
    }
    
    // Apply skills filter
    if (filterSettings.skills.length > 0) {
      filtered = filtered.filter(volunteer => 
        filterSettings.skills.some(skill => volunteer.skills.includes(skill))
      );
    }
    
    // Apply availability filter
    if (filterSettings.availability !== 'any') {
      filtered = filtered.filter(volunteer => 
        volunteer.availability === filterSettings.availability
      );
    }
    
    // Apply interests filter
    if (filterSettings.interests.length > 0) {
      filtered = filtered.filter(volunteer => 
        filterSettings.interests.some(interest => volunteer.interests.includes(interest))
      );
    }
    
    // Apply location filter
    if (filterSettings.location !== '') {
      filtered = filtered.filter(volunteer => 
        volunteer.location.toLowerCase().includes(filterSettings.location.toLowerCase())
      );
    }
    
    setFilteredVolunteers(filtered);
  };

  const toggleVolunteerSelection = (volunteerId) => {
    if (selectedVolunteers.includes(volunteerId)) {
      setSelectedVolunteers(selectedVolunteers.filter(id => id !== volunteerId));
    } else {
      setSelectedVolunteers([...selectedVolunteers, volunteerId]);
    }
  };

  const handleSendInvites = async () => {
    if (selectedVolunteers.length === 0) return;
    
    setSendingInvites(true);
    
    // Simulate API call to send invites
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSendingInvites(false);
    setInviteSuccess(true);
    setSelectedVolunteers([]);
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setInviteSuccess(false);
    }, 3000);
  };

  const handleBack = () => {
    navigate('/ngo/dashboard');
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
        <Typography variant="body1">Loading volunteers...</Typography>
      </Box>
    );
  }

  return (
    <Box className="match-volunteers-container">
      <Paper className="match-volunteers-header" elevation={0}>
        <IconButton className="back-button" onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" className="page-title">
          Match <span className="highlight">Volunteers</span>
        </Typography>
        <Typography variant="body1" className="page-subtitle">
          Find the perfect volunteers for your opportunities
        </Typography>
      </Paper>

      {inviteSuccess && (
        <Alert 
          icon={<CheckCircleIcon className="success-icon" />}
          className="success-message"
          severity="success"
        >
          Invitations sent successfully to {selectedVolunteers.length} volunteer(s)!
        </Alert>
      )}

      <Paper className="search-filters-section" elevation={1}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search by name, skills, or interests..."
              value={searchTerm}
              onChange={handleSearchChange}
              variant="outlined"
              className="search-field"
              InputProps={{
                startAdornment: (
                  <SearchIcon className="search-icon" />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} className="filter-actions">
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              className="filter-button"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {selectedVolunteers.length > 0 && (
              <Button
                variant="contained"
                startIcon={sendingInvites ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                onClick={handleSendInvites}
                disabled={sendingInvites}
                className="send-invites-button"
              >
                {sendingInvites ? 'Sending...' : `Send Invites (${selectedVolunteers.length})`}
              </Button>
            )}
          </Grid>
        </Grid>

        {showFilters && (
          <Box className="filters-container">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth className="filter-field">
                  <InputLabel>Skills</InputLabel>
                  <Select
                    multiple
                    name="skills"
                    value={filters.skills}
                    onChange={handleFilterChange}
                    renderValue={(selected) => (
                      <Box className="chips-container">
                        {selected.map((value) => (
                          <Chip key={value} label={value} className="skill-chip" />
                        ))}
                      </Box>
                    )}
                  >
                    {allSkills.map((skill) => (
                      <MenuItem key={skill} value={skill}>
                        {skill}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth className="filter-field">
                  <InputLabel>Interests</InputLabel>
                  <Select
                    multiple
                    name="interests"
                    value={filters.interests}
                    onChange={handleFilterChange}
                    renderValue={(selected) => (
                      <Box className="chips-container">
                        {selected.map((value) => (
                          <Chip 
                            key={value} 
                            label={value} 
                            className="interest-chip"
                            icon={<PersonIcon />}
                          />
                        ))}
                      </Box>
                    )}
                  >
                    {allInterests.map((interest) => (
                      <MenuItem key={interest} value={interest}>
                        {interest}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth className="filter-field">
                  <InputLabel>Availability</InputLabel>
                  <Select
                    name="availability"
                    value={filters.availability}
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="Weekdays">Weekdays</MenuItem>
                    <MenuItem value="Weekday Evenings">Weekday Evenings</MenuItem>
                    <MenuItem value="Weekends">Weekends</MenuItem>
                    <MenuItem value="Flexible">Flexible</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth className="filter-field">
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={filters.location}
                    onChange={handleFilterChange}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="New York">New York</MenuItem>
                    <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                    <MenuItem value="Chicago">Chicago</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      <Typography variant="h5" className="section-title">
        Matched Volunteers
      </Typography>

      {filteredVolunteers.length === 0 ? (
        <Paper className="no-results" elevation={1}>
          <Typography variant="body1">No volunteers match your criteria. Try adjusting your filters.</Typography>
        </Paper>
      ) : (
        <Grid container spacing={3} className="volunteers-grid">
          {filteredVolunteers.map((volunteer) => (
            <Grid item xs={12} sm={6} md={4} key={volunteer.id}>
              <Card 
                className={`volunteer-card ${selectedVolunteers.includes(volunteer.id) ? 'selected' : ''}`}
                onClick={() => toggleVolunteerSelection(volunteer.id)}
              >
                <CardContent>
                  <Box className="volunteer-header">
                    <Avatar className="volunteer-avatar">{volunteer.avatar}</Avatar>
                    <Box className="volunteer-info">
                      <Typography variant="h6" className="volunteer-name">
                        {volunteer.name}
                      </Typography>
                      <Box className="match-score">
                        <Typography variant="body2" className="match-score-label">
                          Match Score
                        </Typography>
                        <Typography variant="h6" className="match-score-value">
                          {volunteer.matchScore}%
                        </Typography>
                      </Box>
                    </Box>
                    <Checkbox
                      checked={selectedVolunteers.includes(volunteer.id)}
                      onChange={() => toggleVolunteerSelection(volunteer.id)}
                      color="primary"
                      className="select-checkbox"
                    />
                  </Box>
                  
                  <Box className="volunteer-details">
                    <Box className="detail-item">
                      <EmailIcon className="detail-icon" />
                      <Typography variant="body2">{volunteer.email}</Typography>
                    </Box>
                    <Box className="detail-item">
                      <LocationIcon className="detail-icon" />
                      <Typography variant="body2">{volunteer.location}</Typography>
                    </Box>
                    <Box className="detail-item">
                      <AccessTimeIcon className="detail-icon" />
                      <Typography variant="body2">{volunteer.availability}</Typography>
                    </Box>
                    <Box className="detail-item">
                      <SchoolIcon className="detail-icon" />
                      <Typography variant="body2">{volunteer.education}</Typography>
                    </Box>
                    <Box className="detail-item">
                      <WorkIcon className="detail-icon" />
                      <Typography variant="body2">{volunteer.experience} experience</Typography>
                    </Box>
                  </Box>
                  
                  <Divider className="volunteer-divider" />
                  
                  <Box className="skills-section">
                    <Typography variant="subtitle2" className="section-label">
                      Skills
                    </Typography>
                    <Box className="chips-container">
                      {volunteer.skills.map((skill) => (
                        <Chip 
                          key={skill} 
                          label={skill} 
                          size="small" 
                          className="skill-chip"
                        />
                      ))}
                    </Box>
                  </Box>
                  
                  <Box className="interests-section">
                    <Typography variant="subtitle2" className="section-label">
                      Interests
                    </Typography>
                    <Box className="chips-container">
                      {volunteer.interests.map((interest) => (
                        <Chip 
                          key={interest} 
                          label={interest} 
                          size="small" 
                          className="interest-chip"
                          icon={<FavoriteIcon />}
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
                <CardActions className="card-actions">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    className="view-profile-button"
                  >
                    View Profile
                  </Button>
                  <Button 
                    variant="contained" 
                    size="small" 
                    className="send-invite-button"
                    startIcon={<SendIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVolunteerSelection(volunteer.id);
                    }}
                  >
                    Send Invite
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default MatchVolunteers; 