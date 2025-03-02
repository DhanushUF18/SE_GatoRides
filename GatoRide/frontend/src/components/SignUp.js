import React, { useState } from 'react';
import '../styles.css';
import OpenStreetMapSearch from './OpenStreetMapSearch';

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setServerResponse(null);

    try {
      const response = await fetch('http://localhost:5001/signup', { // Ensure backend URL is correct
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // ✅ Check if response is actually JSON
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error(`Invalid JSON response from server: ${text}`);
      }

      if (response.ok) {
        setServerResponse(data);
        alert('Sign up successful! Redirecting to login...');
        window.location.href = '/login';
      } else {
        throw new Error(data.error || 'Error during signup');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Join GatoRides</h2>
      <p>Create your account to start ride-sharing.</p>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      {serverResponse && <p style={{ color: 'green' }}>Server: {JSON.stringify(serverResponse)}</p>}

      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

      <OpenStreetMapSearch onSelect={handleLocationSelect} />

      <button type="submit" disabled={loading}>
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>
    </form>
  );
};

export default SignupForm;
