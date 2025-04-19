import React, { useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
import RideContext from '../context/RideContext';
import RideMap from './RideMap';
import HomeRides from './HomeRides'; // Import the new component
import '../styles.css';  // Import global styles

const Dashboard = () => {
  // const { user } = useContext(AuthContext);
  const { ridePayload } = useContext(RideContext);
  // const navigate = useNavigate();
  

  const handleBookRide = (ride) => {
    console.log(`Booking ride from ${ride.pickup.address} to ${ride.dropoff.address}`);
    // Add booking logic here
  };

  return (
    <div className="dashboard-container">
      <div className="left-column">
        
        {/* <div className="user-details">
          <h2>User Details</h2>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Username:</strong> {user.username}</p>
        </div> */}

        <div className="additional-element">
          {/* <h3>Ride Details</h3> */}
          {ridePayload ? (
            <div>
              <p><strong>Pickup:</strong> {ridePayload.pickup.address}</p>
              <p><strong>Dropoff:</strong> {ridePayload.dropoff.address}</p>
              <p><strong>Price:</strong> ${ridePayload.price}</p>
              <p><strong>Seats:</strong> {ridePayload.seats}</p>
              <p><strong>Date:</strong> {ridePayload.date}</p>
              <button onClick={() => handleBookRide(ridePayload)} className="btn btn-success">Book Ride</button>
            </div>
          ) : (
            <p>No ride details available.</p>
          )}
        </div>

        
      </div>

      <div className="right-column">
        <RideMap />
      </div>

      {/* Add the HomeRides component below the columns */}
      <div className="bottom-section">
        <HomeRides />
      </div>
    </div>
  );
};

export default Dashboard;
