import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  Business,
} from '@mui/icons-material';
import './Signup.css';
import signupImage from './signup-modified.png';

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const selectedRole = location.state?.selectedRole || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    userType: selectedRole,
    organizationName: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userType: selectedRole,
    }));
  }, [selectedRole]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.userType === 'Organization Representative' && !formData.organizationName) {
      setError('Please enter the name of your organization');
      return;
    }

    const signupData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phoneNumber,
      userType: formData.userType,
      ...(formData.userType === 'Organization Representative' && {
        organizationName: formData.organizationName,
      }),
    };

    // Debug: Log the signupData to confirm organizationName is included
    console.log('Sending signup data:', signupData);

    try {
      const response = await fetch('http://localhost:5000/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        if (formData.userType === 'Organization Representative') {
          navigate('/dashboard');
        } else {
          navigate('/select-interest');
        }
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  const handleAboutClick = (e) => {
    e.preventDefault();
    setAboutOpen(true);
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    setContactOpen(true);
  };

  const handleCloseAbout = () => {
    setAboutOpen(false);
  };

  const handleCloseContact = () => {
    setContactOpen(false);
  };

  return (
    <Container component="main" className="signup-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link" onClick={handleAboutClick}>About</a>
          <a href="/contact" className="navbar-link" onClick={handleContactClick}>Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <Box className="signup-wrapper">
        <Box className="signup-image-section">
          <img src={signupImage} alt="Signup Illustration" className="signup-image" />
        </Box>

        <Box className="signup-form-section">
          <Paper elevation={3} className="signup-paper">
            <Typography component="h1" variant="h4" className="signup-title">
              Sign Up
            </Typography>
            <Typography variant="body2" className="signup-subtitle">
              Create an account to join Voluntree
            </Typography>

            {error && (
              <Typography color="error" variant="body2" className="signup-subtitle">
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} className="signup-form">
              <TextField
                margin="normal"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                autoFocus
                value={formData.name}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
                className="signup-textfield"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                className="signup-textfield"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone color="action" />
                    </InputAdornment>
                  ),
                }}
                className="signup-textfield"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="password"
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className="signup-textfield"
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                className="signup-textfield"
              />
              <FormControl fullWidth margin="normal" className="signup-textfield">
                <InputLabel id="userType-label">User Type</InputLabel>
                <Select
                  labelId="userType-label"
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  label="User Type"
                  required
                  disabled={!!selectedRole}
                >
                  <MenuItem value="Student">Student</MenuItem>
                  <MenuItem value="Volunteer">Volunteer</MenuItem>
                  <MenuItem value="Organization Representative">Organization Representative</MenuItem>
                </Select>
              </FormControl>
              {formData.userType === 'Organization Representative' && (
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="organizationName"
                  label="Organization Name"
                  name="organizationName"
                  autoComplete="organization"
                  value={formData.organizationName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Business color="action" />
                      </InputAdornment>
                    ),
                  }}
                  className="signup-textfield"
                />
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="signup-button"
              >
                Sign Up
              </Button>

              <Box className="signup-login">
                <Typography variant="body2" className="signup-login-text">
                  Already have an account?{' '}
                  <Link href="/login" variant="body2" className="signup-link">
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* About Popup */}
      <Dialog
        open={aboutOpen}
        onClose={handleCloseAbout}
        PaperProps={{
          style: {
            borderRadius: '16px',
            backgroundColor: '#EFDED4',
            padding: '16px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#FBBF24',
            textAlign: 'center',
            paddingBottom: '8px',
          }}
        >
          About VolunTree 🌳
        </DialogTitle>
        <DialogContent>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontSize: '1rem',
              color: '#5D4037',
              textAlign: 'center',
            }}
          >
            VolunTree connects volunteers and NGOs to grow opportunities for positive impact! 🌱
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingTop: '8px' }}>
          <Button
            onClick={handleCloseAbout}
            sx={{
              backgroundColor: '#FBBF24',
              color: '#fff',
              borderRadius: '9999px',
              padding: '8px 24px',
              textTransform: 'none',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#D97706',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Popup */}
      <Dialog
        open={contactOpen}
        onClose={handleCloseContact}
        PaperProps={{
          style: {
            borderRadius: '16px',
            backgroundColor: '#EFDED4',
            padding: '16px',
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontFamily: '"Inter", sans-serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            color: '#FBBF24',
            textAlign: 'center',
            paddingBottom: '8px',
          }}
        >
          Contact Us 📧
        </DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '1rem',
                color: '#5D4037',
                marginBottom: '8px',
              }}
            >
              📧 Email: contact@voluntree.org
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '1rem',
                color: '#5D4037',
              }}
            >
              📍 Location: 123 Community Lane, Green City
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', paddingTop: '8px' }}>
          <Button
            onClick={handleCloseContact}
            sx={{
              backgroundColor: '#FBBF24',
              color: '#fff',
              borderRadius: '9999px',
              padding: '8px 24px',
              textTransform: 'none',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#D97706',
              },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Signup;