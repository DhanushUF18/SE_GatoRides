import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext'; // Changed this line
import '../styles.css';

const NavBar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="nav-logo">
          GatoRides
        </Link>
      </div>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/profile" className="nav-item">Profile</Link>
            {/* <button onClick={logout} className="nav-item logout-btn">Logout</button> */}
          </>
        ) : (
          <>
            {/* <Link to="/login" className="nav-item">Login</Link>
            <Link to="/signup" className="nav-item">Sign Up</Link> */}
          </>
        )}
      </div>
    </nav>
  );
};

export default NavBar;