import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles.css';  // Import the global styles

const Dashboard = () => {
  const { user, handleLogout } = useContext(AuthContext);
  const navigate = useNavigate();

  const logoutHandler = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div className="container">
      <h1>GatoRides Dashboard</h1>
      <p>Manage your ride-sharing experience effortlessly.</p>
      {user ? (
        <div>
          <h2>User Details</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Status:</strong> {user.verified ? 'Verified ✅' : 'Not Verified ❌'}</p>
        </div>
      ) : (
        <p>Loading user information...</p>
      )}
      <button onClick={logoutHandler}>Logout</button>
    </div>
    
  );
};

export default Dashboard;
