import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="nav-logo">
          GatoRides
        </Link>
      </div>
      <div className="nav-links">
        {/* <Link to="/" className="nav-item">Home</Link> */}
        {/* <Link to="/dashboard" className="nav-item">Dashboard</Link> */}
        {/* <Link to="/login" className="nav-item">Login</Link>
        <Link to="/signup" className="nav-item">Sign Up</Link> */}
      </div>
    </nav>
  );
};

export default NavBar;