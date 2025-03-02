import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, signup, verifyEmail } from "../services/AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Load user from localStorage on startup
    return JSON.parse(localStorage.getItem("user")) || null;
  });
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
      const response = await fetch("http://localhost:5001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log("Login Response:", data); // ✅ Debugging

      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user)); // ✅ Save user in localStorage
        navigate("/"); // ✅ Redirect to Home (Dashboard)
      } else {
        throw new Error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error.message);
    }
  };

  // ✅ Handle Signup Correctly
  const handleSignup = async (name, email, username, password) => {
    try {
      const userData = { name, email, username, password };
      const response = await signup(userData); // ✅ Ensure signup function correctly sends JSON

      if (response.ok) {
        alert("Signup successful! Please check your email for verification.");
        navigate("/login");
      } else {
        throw new Error(response.message || "Signup failed");
      }
    } catch (error) {
      console.error("Signup Error:", error.message);
    }
  };

  // ✅ Verify Email & Update User State
  const handleVerifyEmail = async (token) => {
    try {
      await verifyEmail(token);
      const updatedUser = { ...user, verified: true };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      alert("Email verified successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Verification Error:", error.message);
    }
  };

  // ✅ Handle Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/"); // ✅ Redirect to Home page after logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        handleLogin,
        handleSignup,
        handleVerifyEmail,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
