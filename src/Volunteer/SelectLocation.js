import React, { useState, useEffect } from 'react';
import './SelectLocation.css';
import { useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, TextField } from '@mui/material';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        const city = data.address.city || data.address.town || data.address.village || 'Unknown';
        const state = data.address.state || '';
        const location = `${city}, ${state}`;
        onLocationSelect({ name: location, lat, lng });
      } catch (error) {
        console.error('Error reverse geocoding:', error);
        onLocationSelect({ name: 'Unknown Location', lat, lng });
      }
    },
  });
  return null;
};

const SelectLocation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [markerPosition, setMarkerPosition] = useState([40.7128, -74.0060]); // Default: New York, NY
  const navigate = useNavigate();

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a city name.');
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const city = display_name.split(',')[0];
        const state = display_name.split(',')[1] || '';
        const location = `${city.trim()}, ${state.trim()}`;
        setSelectedLocations([...selectedLocations, { name: location, lat: parseFloat(lat), lng: parseFloat(lon) }]);
        setMarkerPosition([parseFloat(lat), parseFloat(lon)]);
        setSearchQuery('');
      } else {
        alert('Location not found. Try another city.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('Error searching location. Please try again.');
    }
  };

  // Handle manual add
  const handleAddLocation = () => {
    if (selectedLocations.length >= 5) {
      alert('You can add up to 5 locations.');
      return;
    }
    const currentLocation = selectedLocations.find(loc => loc.lat === markerPosition[0] && loc.lng === markerPosition[1]);
    if (currentLocation) {
      setSelectedLocations([...selectedLocations, currentLocation]);
    } else {
      alert('Please search or click on the map to select a location.');
    }
  };

  // Handle remove location
  const handleRemoveLocation = (index) => {
    setSelectedLocations(selectedLocations.filter((_, i) => i !== index));
  };

  // Handle location select from map click
  const handleLocationSelect = (location) => {
    if (selectedLocations.length >= 5) {
      alert('You can add up to 5 locations.');
      return;
    }
    setSelectedLocations([...selectedLocations, location]);
    setMarkerPosition([location.lat, location.lng]);
  };

  // Handle next
  const handleNext = async () => {
    try {
      console.log('Selected locations:', selectedLocations);

      if (selectedLocations.length === 0) {
        alert('Please select at least one location.');
        return;
      }

      const userString = localStorage.getItem('user');
      console.log('Raw user string from localStorage:', userString);

      if (!userString) {
        console.error('No user data found in localStorage');
        alert('Error: User data not found. Please log in again.');
        navigate('/login');
        return;
      }

      let user;
      try {
        user = JSON.parse(userString);
        console.log('Parsed user object:', user);
      } catch (parseError) {
        console.error('Failed to parse user data from localStorage:', parseError);
        alert('Error: Invalid user data in storage. Please log in again.');
        navigate('/login');
        return;
      }

      if (!user || !user.id) {
        console.error('User object is invalid or missing id:', user);
        alert('Error: Invalid user data (missing ID). Please log in again.');
        navigate('/login');
        return;
      }

      const token = localStorage.getItem('token');
      console.log('Retrieved token from localStorage:', token);

      if (!token) {
        console.error('No token found in localStorage');
        alert('Error: Authentication token not found. Please log in again.');
        navigate('/login');
        return;
      }

      const url = `http://localhost:5000/api/users/${user.id}/preferences`;
      console.log('Making PATCH request to:', url);
      console.log('Request headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      });
      console.log('Request body:', { locationPreferences: selectedLocations.map(loc => loc.name) });

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ locationPreferences: selectedLocations.map(loc => loc.name) }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Error response from server:', errorData);
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          errorData = { error: 'Unknown server error' };
        }

        const errorMessage = errorData.error || `Server responded with status ${response.status}`;
        console.error('Failed to update preferences:', errorMessage);
        alert(`Failed to update preferences: ${errorMessage}`);
        return;
      }

      const updatedUser = await response.json();
      console.log('Updated user data from server:', updatedUser);

      if (!updatedUser.user) {
        console.error('Updated user data is missing user object:', updatedUser);
        alert('Error: Invalid response from server. Please try again.');
        return;
      }

      localStorage.setItem('user', JSON.stringify(updatedUser.user));
      console.log('Updated localStorage with new user data');

      navigate('/volundashboard');
      console.log('Navigated to /volundashboard');
    } catch (error) {
      console.error('Error updating preferences:', error);
      console.error('Error stack:', error.stack);
      let errorMessage = 'An error occurred. Please try again.';

      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running on http://localhost:5000.';
      } else if (error.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `Error: ${error.message}`;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="select-location-container">
      <nav className="navbar">
        <a href="/" className="navbar-brand">VolunTree</a>
        <div className="navbar-links">
          <a href="/about" className="navbar-link">About</a>
          <a href="/contact" className="navbar-link">Contact</a>
          <a href="/select-role" className="navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="content-box animate-slideDown">
        <h1 className="select-location-title animate-slideDown">
          Choose Your Location Preferences
        </h1>
        <div className="title-underline animate-slideDown"></div>
        <div className="location-section animate-slideDown">
          <h2 className="section-title">Select Locations</h2>
          <div className="search-bar">
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a city (e.g., New York, NY)"
              variant="outlined"
              className="search-input"
            />
            <Button
              className="search-button"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
          <MapContainer
            center={markerPosition}
            zoom={10}
            style={{ height: '600px', width: '100%', borderRadius: '10px' }}
            className="map-container"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={markerPosition} />
            <MapClickHandler onLocationSelect={handleLocationSelect} />
          </MapContainer>
          <Button
            className="add-location-button"
            onClick={handleAddLocation}
          >
            Add Selected Location
          </Button>
          {selectedLocations.length > 0 && (
            <div className="added-locations">
              <h3 className="added-locations-title">Selected Locations</h3>
              {selectedLocations.map((location, index) => (
                <div key={index} className="added-location-item">
                  <span>{location.name}</span>
                  <FaTrash
                    className="remove-location-icon"
                    onClick={() => handleRemoveLocation(index)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="cta-button animate-slideDown"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SelectLocation;