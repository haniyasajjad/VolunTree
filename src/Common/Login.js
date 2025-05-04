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
  CircularProgress,
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
} from '@mui/icons-material';
import './Login.css';
import loginImage from './download.png';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [aboutOpen, setAboutOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const fromSignup = location.state?.fromSignup || false;

  // Check for existing session on component mount
  useEffect(() => {
    if (fromSignup) {
      console.log('Coming from signup, skipping session check redirect');
      return; // Skip redirect if coming from signup
    }

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        console.log('Stored user data on mount:', user);
        if (user && user.userType) {
          console.log('Redirecting based on userType:', user.userType);
          if (user.userType === 'Organization Representative') {
            navigate('/dashboard', { replace: true });
          } else if (user.userType === 'Student' || user.userType === 'Volunteer') {
            navigate('/volundashboard', { replace: true });
          }
        }
      } catch (err) {
        console.error('Error parsing stored user data:', err);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else {
      console.log('No stored user found in localStorage, staying on login page');
    }
  }, [navigate, fromSignup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    try {
      console.log('Manual login attempt with:', { email: formData.email });

      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        setError(errorData.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Login response data:', data);

      if (!data.user) {
        console.error('User data missing in login response:', data);
        setError('Invalid response from server: User data missing');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      console.log('Stored token:', localStorage.getItem('token'));
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Login successful:', data.user);

      const userType = data.user.userType;
      console.log('User type after login:', userType);

      if (userType === 'Organization Representative') {
        console.log('Navigating to /dashboard for Organization Representative');
        navigate('/dashboard', { replace: true });
      } else if (userType === 'Student' || userType === 'Volunteer') {
        console.log('Navigating to /volundashboard for Student/Volunteer');
        navigate('/volundashboard', { replace: true });
      } else {
        console.error('Unknown user type:', userType);
        setError('Unknown user type. Please contact support.');
      }
    } catch (err) {
      console.error('Login error:', err);
      let errorMessage = 'An error occurred. Please try again.';
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running on http://localhost:5000.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
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
    <Container component="main" className="login-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link" onClick={handleAboutClick}>About</a>
          <a href="/contact" className="navbar-link" onClick={handleContactClick}>Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <Box className="login-wrapper">
        <Box className="login-image-section">
          <img src={loginImage} alt="Login Illustration" className="login-image" />
        </Box>

        <Box className="login-form-section">
          <Paper elevation={3} className="login-paper">
            <Typography component="h1" variant="h4" className="login-title">
              Welcome Back
            </Typography>
            <Typography variant="body2" className="login-subtitle">
              Sign in to continue to Voluntree
            </Typography>

            {error && (
              <Typography color="error" variant="body2" className="login-subtitle">
                {error}
              </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit} className="login-form">
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                className="login-textfield"
                error={!!error && formData.email.trim() === ''}
                helperText={error && formData.email.trim() === '' ? 'Email is required' : ''}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
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
                className="login-textfield"
                error={!!error && formData.password.trim() === ''}
                helperText={error && formData.password.trim() === '' ? 'Password is required' : ''}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="login-button"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </Button>

              <Box className="login-links">
                <Link href="#" variant="body2" className="login-link">
                  Forgot password?
                </Link>
              </Box>
              <Box className="login-signup">
                <Typography variant="body2" className="login-signup-text">
                  Don't have an account?{' '}
                  <Link href="/signup" variant="body2" className="login-link">
                    Sign Up
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
              backgroundColor: '#ff8a00',
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
};

export default Login;