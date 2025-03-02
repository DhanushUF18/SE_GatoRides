import React, { useContext, useState } from "react";
import AuthContext from "../context/AuthContext";
import OpenStreetMapSearch from "./OpenStreetMapSearch";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../styles.css";

const Dashboard = () => {
  const { user } = useContext(AuthContext); // ✅ Get user data from AuthContext
  const [rideDetails, setRideDetails] = useState({
    startLocation: "",
    destination: "",
    travelDate: new Date(),
  });

  const handleLocationSelect = (field, value) => {
    setRideDetails({ ...rideDetails, [field]: value });
  };

  const handleDateChange = (date) => {
    setRideDetails({ ...rideDetails, travelDate: date });
  };

  const searchRides = () => {
    alert(
      `Searching rides from ${rideDetails.startLocation} to ${rideDetails.destination} on ${rideDetails.travelDate.toDateString()}`
    );
  };

  return (
    <div className="dashboard-container">
      <h2 className="dashboard-title">🚗 Welcome to GatoRides Dashboard</h2>

      {/* ✅ User Profile Section */}
      <div className="profile-card">
        <h3>👤 User Profile</h3>
        {user ? (
          <div className="profile-info">
            <p><strong>Name:</strong> {user.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Username:</strong> {user.username || "N/A"}</p>
          </div>
        ) : (
          <p>Loading user information...</p>
        )}
      </div>

      {/* ✅ Ride Search Section */}
      <div className="ride-search-card">
        <h3>🔍 Find a Ride</h3>
        <label>📍 Source:</label>
        <OpenStreetMapSearch
          onSelect={(value) => handleLocationSelect("startLocation", value)}
          placeholder="Enter starting location"
        />

        <label>🎯 Destination:</label>
        <OpenStreetMapSearch
          onSelect={(value) => handleLocationSelect("destination", value)}
          placeholder="Enter destination"
        />

        <label>📅 Travel Date:</label>
        <DatePicker
          selected={rideDetails.travelDate}
          onChange={handleDateChange}
          className="date-picker"
        />

        <button className="search-button" onClick={searchRides}>
          Search Rides
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
