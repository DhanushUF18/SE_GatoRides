import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    address: '',
  });
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const navigate = useNavigate();

  const logoutHandler = () => {
    handleLogout();
    navigate('/');
  };
  const navigateToRides = () => {
    navigate('/rides');
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.post('http://localhost:5001/user/profile', {}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        setProfile(response.data.user);
        setFormData({
          name: response.data.user.name || '',
          username: response.data.user.username || '',
          address: response.data.user.location?.address || '',
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'address') {
      fetchAddressSuggestions(value);
    }
  };

  const fetchAddressSuggestions = async (query) => {
    if (!query) {
      setAddressSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      const data = await response.json();

      if (data && Array.isArray(data.features) && data.features.length > 0) {
        setAddressSuggestions(data.features.map((feature) => {
          const properties = feature.properties;
          const fullAddress = [
            properties.name,
            properties.street,
            properties.postcode,
            properties.city,
            properties.country,
          ]
            .filter(Boolean)
            .join(', ');

          return {
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            display_name: fullAddress || 'Unknown Location',
          };
        }));
      } else {
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
    }
  };

  const handleSelectAddress = (selectedAddress) => {
    setFormData((prev) => ({
      ...prev,
      address: selectedAddress.display_name,
    }));
    setAddressSuggestions([]);
  };

  const fetchCoordinates = async (address) => {
    try {
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(address)}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const { coordinates } = data.features[0].geometry;
        return { latitude: coordinates[1], longitude: coordinates[0] };
      }
      throw new Error('No coordinates found for the given address');
    } catch (error) {
      console.error('Error fetching coordinates:', error);
      throw error;
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdateError('');
    setSuccessMessage('');
    try {
      // Get coordinates first
      const { latitude, longitude } = await fetchCoordinates(formData.address);
      
      const response = await axios.post(
        'http://localhost:5001/user/update-profile',
        {
          name: formData.name,
          username: formData.username,
          location: {
            address: formData.address,
            latitude,
            longitude,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );
      
      setSuccessMessage('Profile updated successfully!');
      setProfile(response.data.user);
      setIsUpdating(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (error) return <div className="profile-container"><p className="error">Error: {error}</p></div>;
  if (!profile) return <div className="profile-container"><p className="loading">Loading profile...</p></div>;

  return (
    <div className="profile-container">
      <h2>Welcome, {profile.name}!</h2>
      <div className="profile-details">
        <p><strong>Username:</strong> <span>{profile.username}</span></p>
        <p><strong>Email:</strong> <span>{profile.email}</span></p>
        <p><strong>Verified:</strong> <span>{profile.is_verified ? 'Yes' : 'No'}</span></p>
        <p><strong>Location:</strong> <span>{profile.location?.address}</span></p>
        <button onClick={logoutHandler} className="btn btn-secondary">Logout</button>
        <button onClick={() => setIsUpdating(!isUpdating)} className="btn btn-primary">
          {isUpdating ? 'Cancel' : 'Update Profile'}
        </button>
        <button onClick={navigateToRides} className="btn btn-info">View Rides</button>
      </div>

      {isUpdating && (
        <form onSubmit={handleUpdateProfile} className="update-profile-form">
          <div>
            <label htmlFor="name">Name:</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor="address">Address:</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
            {addressSuggestions.length > 0 && (
              <div className="dropdown-menu">
                {addressSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="dropdown-item"
                    onClick={() => handleSelectAddress(suggestion)}
                  >
                    {suggestion.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn btn-success">Save Changes</button>
        </form>
      )}

      {updateError && <p className="error">Error: {updateError}</p>}
      {successMessage && <p className="success">{successMessage}</p>}
    </div>
  );
};

export default Profile;
