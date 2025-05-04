import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DisplayEvents.css';

const interestsData = [
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
];

const DisplayEvents = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [allOpportunities, setAllOpportunities] = useState([]);
  const [filters, setFilters] = useState({
    interest: '',
    skill: '',
    date: '',
    ngo: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view opportunities');
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/users/opportunities/filter', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const text = await response.text();
        console.log('Initial fetch raw response:', text);
        const data = JSON.parse(text);
        if (response.ok) {
          setAllOpportunities(data.opportunities || []);
          setOpportunities(data.opportunities || []); // Set initial opportunities based on interests
        } else {
          setError(data.error || 'Failed to fetch initial opportunities');
        }
      } catch (err) {
        console.error('Initial fetch error:', err);
        setError('An error occurred while fetching initial opportunities: ' + err.message);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to apply filters');
      navigate('/login');
      return;
    }

    try {
      const query = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:5000/api/users/opportunities/filter?${query}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const text = await response.text();
      console.log('Apply filters raw response:', text);
      const data = JSON.parse(text);
      if (response.ok) {
        setOpportunities(data.opportunities || []);
      } else {
        setError(data.error || 'Failed to apply filters');
      }
    } catch (err) {
      console.error('Filter error:', err);
      setError('An error occurred while applying filters: ' + err.message);
    }
  };

  const handleCardClick = (event) => {
    navigate('/register-for-events', { state: { event } });
  };

  return (
    <div className="de-edit-preference-wrapper">
      <nav className="de-navbar">
        <a href="/" className="de-navbar-brand">VolunTree</a>
        <div className="de-navbar-links">
          <a href="/about" className="de-navbar-link">About</a>
          <a href="/contact" className="de-navbar-link">Contact</a>
          <a href="/select-role" className="de-navbar-link">Get Started</a>
        </div>
      </nav>
      <div className="de-events-container">
        <div className="de-events-filter-bar">
          <select
            className="de-filter-dropdown"
            name="interest"
            value={filters.interest}
            onChange={handleFilterChange}
          >
            <option>Interest Tag</option>
            {interestsData.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
          <select
            className="de-filter-dropdown"
            name="skill"
            value={filters.skill}
            onChange={handleFilterChange}
          >
            <option>Skill Tag</option>
            {allOpportunities.length > 0 &&
              [...new Set(allOpportunities.flatMap(opp => opp.skills))].map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
          </select>
          <select
            className="de-filter-dropdown"
            name="date"
            value={filters.date}
            onChange={handleFilterChange}
          >
            <option>Date</option>
            {allOpportunities.length > 0 &&
              [...new Set(allOpportunities.map(opp => new Date(opp.date).toLocaleDateString()))].map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
          </select>
          <select
            className="de-filter-dropdown"
            name="ngo"
            value={filters.ngo}
            onChange={handleFilterChange}
          >
            <option>NGO Name</option>
            {allOpportunities.length > 0 &&
              [...new Set(allOpportunities.map(opp => opp.organizationName))].map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
          <button className="de-apply-filter-button" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
        {error && <p style={{ color: 'red', textAlign: 'center', padding: '10px' }}>{error}</p>}
        <div className="de-events-grid">
          {opportunities.length > 0 ? (
            opportunities.map((opp) => {
              const oppDate = new Date(opp.date);
              return (
                <div
                  key={opp._id}
                  className="de-event-card"
                  onClick={() => handleCardClick(opp)}
                >
                  <div className="de-event-header">
                    <span className="de-event-initial">{opp.organizationName.charAt(0)}</span>
                    <div className="de-event-details">
                      <h3>{opp.title}</h3>
                      <p>{opp.organizationName} | {opp.location}</p>
                    </div>
                  </div>
                  <div className="de-event-date-duration">
                    <span className="de-label">Date</span>
                    <span>{oppDate.toLocaleDateString()}</span>
                    <span className="de-label">Time</span>
                    <span>{oppDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="de-label">Duration</span>
                    <span>{opp.duration} hours</span>
                  </div>
                  <div className="de-event-tags">
                    <span className="de-tags-label">Interest</span>
                    <span className="de-tag">{opp.category}</span>
                    <span className="de-tags-label">Skills</span>
                    {opp.skills.length > 0 ? (
                      opp.skills.map((skill, index) => (
                        <span key={index} className="de-tag">{skill}</span>
                      ))
                    ) : (
                      <span className="de-tag">None</span>
                    )}
                  </div>
                  <div className="de-event-description">
                    <span className="de-label">Description</span>
                    <p>{opp.description}</p>
                  </div>
                  <div className="de-event-type">
                    <span className="de-label">Type: </span>
                    <span>{opp.type}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ gridColumn: 'span 4', textAlign: 'center', padding: '20px' }}>
              No opportunities found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisplayEvents;
