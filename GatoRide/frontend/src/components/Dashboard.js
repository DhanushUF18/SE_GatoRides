import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import AuthContext from '../context/AuthContext';
// import RideContext from '../context/RideContext';
import RideMap from './RideMap';
import HomeRides from './HomeRides'; // Import the new component
import '../styles.css';  // Import global styles

const Dashboard = () => {
  // const { user } = useContext(AuthContext);
  // const { ridePayload } = useContext(RideContext);
  // const navigate = useNavigate();
  

  // const handleBookRide = (ride) => {
  //   console.log(`Booking ride from ${ride.pickup.address} to ${ride.dropoff.address}`);
  //   // Add booking logic here
  // };

  return (
    <div className="dashboard-container">
      

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
