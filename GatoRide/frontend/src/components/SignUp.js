import React, { useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import '../styles.css';  // Import the global styles

const SignupForm = () => {
  const { handleSignup } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.warn(formData);
      console.warn(handleSignup);
      await handleSignup(formData.name, formData.email, formData.username, formData.password);
      alert('Sign up successful! Please check your email for verification.');
    } catch (error) {
      alert('Error during signup');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Join GatoRides</h2>
      <p>Create your account to start ride-sharing.</p>
      <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
      <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignupForm;