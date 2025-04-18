import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Add this import
import '../styles.css';  // Import the global styles
import axios from 'axios';

const SignupForm = () => {
  const navigate = useNavigate();  // Add this line
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    latitude: null,
    longitude: null,
    location: ''
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'location' && value.length > 2) {
        // Fetch location suggestions from Photon API
        fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(value)}`)
            .then(response => response.json())
            .then(data => {
                if (data && Array.isArray(data.features)) {
                    setSuggestions(data.features.map((feature) => {
                        const properties = feature.properties;
                        const fullAddress = [
                            properties.name,
                            properties.street,
                            properties.postcode,
                            properties.city,
                            properties.country
                        ]
                            .filter(Boolean) // Remove undefined or null values
                            .join(', '); // Join with commas

                        return {
                            display_name: fullAddress || 'Unknown Location',
                            lat: feature.geometry.coordinates[1],
                            lon: feature.geometry.coordinates[0]
                        };
                    }));
                    setShowDropdown(data.features.length > 0);
                }
            })
            .catch(error => console.error("Error fetching location data:", error));
    } else if (name === 'location') {
        setSuggestions([]);
        setShowDropdown(false);
    }
};

const handleLocationSelect = (location) => {
    const latitude = parseFloat(location.lat);
    const longitude = parseFloat(location.lon);

    setFormData({
        ...formData,
        latitude: latitude,
        longitude: longitude,
        location: location.display_name
    });

    setSuggestions([]);
    setShowDropdown(false);
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      location: {
        address: formData.location,
        latitude: formData.latitude || 0,
        longitude: formData.longitude || 0
      }
    };

    console.log("🔹 Sending Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await axios.post("http://localhost:5001/signup", payload, {
        headers: { "Content-Type": "application/json" }
      });

      console.log("✅ Signup Response:", response.data);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("🔑 Token stored in localStorage:", response.data.token);
      }
      alert("Sign up successful! Please verify email");
      navigate('/login');  // Add this line to redirect to login page
    } catch (error) {
      console.error("❌ Signup Error:", error.response?.data || error);
      alert(`Error during signup: ${error.response?.data?.error || "Unknown error"}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <h2>Join GatoRides</h2>
      <p>Create your account to start ride-sharing.</p>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

      <div className="dropdown">
        <input
          type="text"
          name="location"
          placeholder="Enter your location"
          value={formData.location}
          onChange={handleChange}
          onFocus={() => setShowDropdown(suggestions.length > 0)}
          required
        />
        {showDropdown && (
          <div className="dropdown-menu">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="dropdown-item"
                onClick={() => handleLocationSelect(suggestion)}
              >
                {suggestion.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;
