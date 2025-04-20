import React, { useEffect, useState, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import axios from 'axios';

const Rides = () => {
  const { user } = useContext(AuthContext);
  const [ridesOffered, setRidesOffered] = useState([]);
  const [ridesTaken, setRidesTaken] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await axios.post('http://localhost:5001/user/rides',{}, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        setRidesOffered(response.data.rides_offered || []);
        setRidesTaken(response.data.rides_taken || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch rides');
      }
    };

    if (user?.token) {
      fetchRides();
    }
  }, [user?.token]);

  if (error) return <div className="bottom-section"><p className="error">Error: {error}</p></div>;

  return (
    <div className="bottom-section ">
      <h2>Your Rides</h2>

      <div className="rides-section">
        <h3>Rides Offered</h3>
        {ridesOffered.length > 0 ? (
          <table className="rides-table">
            <thead>
              <tr>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Date</th>
                <th>Seats</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ridesOffered.map((ride) => (
                <tr key={ride.id}>
                  <td>{ride.pickup.address}</td>
                  <td>{ride.dropoff.address}</td>
                  <td>{new Date(ride.date).toLocaleDateString()}</td>
                  <td>{ride.seats}</td>
                  <td>${ride.price}</td>
                  <td>{ride.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No rides offered.</p>
        )}
      </div>

      <div className="rides-section">
        <h3>Rides Taken</h3>
        {ridesTaken && ridesTaken.length > 0 ? (
          <table className="rides-table">
            <thead>
              <tr>
                <th>Pickup</th>
                <th>Dropoff</th>
                <th>Date</th>
                <th>Driver</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {ridesTaken.map((ride) => (
                <tr key={ride.id}>
                  <td>{ride.pickup.address}</td>
                  <td>{ride.dropoff.address}</td>
                  <td>{new Date(ride.date).toLocaleDateString()}</td>
                  <td>{ride.driver_name}</td>
                  <td>${ride.price}</td>
                  <td>{ride.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No rides taken.</p>
        )}
      </div>
    </div>
  );
};

export default Rides;