import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext'; // Import AuthContext

const HomeRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext); // Get user data from AuthContext

  useEffect(() => {
    const fetchRides = async () => {
      const token = user?.token; // Retrieve the token from the user object
      if (!token) {
        setError('Authorization token is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/home', {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
          },
        });
        console.log(response.data); // Log the response data for debugging
        setRides(response.data.rides); // Extract the rides array from the response
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rides data.');
        setLoading(false);
      }
    };

    fetchRides();
  }, [user]);

  if (loading) return <p>Loading rides...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="home-rides">
      <h3>Available Rides</h3>
      {rides.length > 0 ? (
        <table className="rides-table">
          <thead>
            <tr>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Price</th>
              <th>Seats Available</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id}>
                <td>{ride.pickup.address}</td>
                <td>{ride.dropoff.address}</td>
                <td>${ride.price}</td>
                <td>{ride.seats}</td>
                <td>{new Date(ride.date).toLocaleDateString()}</td>
                <td>{ride.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No rides available.</p>
      )}
    </div>
  );
};

export default HomeRides;