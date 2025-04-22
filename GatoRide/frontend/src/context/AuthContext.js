import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, verifyEmail } from '../services/AuthService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          localStorage.removeItem('user'); // Remove invalid data
        }
      }
      setLoading(false);
    };
    
    fetchUser();
  }, []);

  const handleLogin = async (email, password) => {
    try {
      const loginData = {
        email: email,
        password: password
      };
      //console.log('Attempting login with:', { email });
      const response = await login(loginData);
      //console.log('Login response:', response);
      
      if (!response || !response.data || !response.data.token) {
        console.error('Invalid login response structure:', response);
        return;
      }

      // Extract token from response
      const { token } = response.data;
      
      // Create user object from token payload
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      //console.log('Token payload:', tokenPayload); // Debug log

      const user = {
        username: tokenPayload.username, // Changed from email to username
        email: email, // Add email from login attempt
        token: token
      };

      //console.log('Setting user state with:', user);
      setUser(user);
      localStorage.setItem('user', JSON.stringify(user));
      //console.log('LocalStorage after login:', localStorage.getItem('user'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error details:', error);
    }
  };

  const handleSignup = async (name, email, username, password, location) => {
    try {
      const userData = {
        name: name,
        email: email,
        username: username,
        password: password,
        location: location 
      };
  
      await signup(userData); // Ensure signup function correctly sends JSON
      navigate('/login');
    } catch (error) {
      console.error("Signup Error:", error);
    }
  };
  

  const handleVerifyEmail = async (token) => {
    try {
      await verifyEmail(token);
      setUser({ ...user, verified: true });
      localStorage.setItem('user', JSON.stringify({ ...user, verified: true }));
      navigate('/login');
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      handleLogin,
      handleSignup,
      handleVerifyEmail,
      handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
