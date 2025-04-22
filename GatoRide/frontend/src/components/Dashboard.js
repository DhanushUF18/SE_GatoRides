import React, { useState } from 'react';
import RideMap from './RideMap';
import HomeRides from './HomeRides';
import '../styles.css';

const Dashboard = () => {
  const [rides, setRides] = useState([]); // Shared state for rides

  return (
    <div className="dashboard-container">
      <div className="right-column">
        <RideMap setRides={setRides} /> {/* Pass setRides to RideMap */}
      </div>
      <div className="bottom-section">
        <HomeRides rides={rides} /> {/* Pass rides to HomeRides */}
      </div>
    </div>
  );
};

export default Dashboard;
