import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

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
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch profile');
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user?.token]);

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
        <p><strong>Latitude:</strong> <span>{profile.location?.latitude}</span></p>
        <p><strong>Longitude:</strong> <span>{profile.location?.longitude}</span></p>
      </div>
    </div>
  );
};

export default Profile;
