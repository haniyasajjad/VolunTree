import React from 'react';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Signup from './Signup.js';
import Login from './components/Login.js';
import './App.css';

function App() {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Router>
          <Routes>
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} /> {/* Replace with Login component when you have it */}
            <Route path="/" element={<Signup />} />
          </Routes>
        </Router>
      </Box>
    </>
  );
}

export default App;