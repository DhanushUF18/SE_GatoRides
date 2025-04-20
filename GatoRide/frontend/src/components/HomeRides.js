import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const HomeRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchRides = async () => {
      const token = user?.token;
      console.log('Full user object structure:', {
        id: user?.id,
        _id: user?._id,
        token: user?.token,
        fullUser: user
      });
      if (!token) {
        setError('Authorization token is missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5001/home', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Full user object:', user);
        console.log('Full response:', response.data);
        console.log('First ride:', response.data.rides[0]);
        setRides(response.data.rides);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch rides data.');
        setLoading(false);
      }
    };

    fetchRides();
  }, [user]);

  // Add this function to decode JWT token
  const getUserIdFromToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.user_id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleRideClick = (ride) => {
    const userId = getUserIdFromToken(user?.token);
    console.log('Ride click debug:', {
      rideDriverId: ride.driver_id,
      currentUserId: userId,
      isOwnRide: ride.driver_id === userId
    });
    setSelectedRide(selectedRide?.id === ride.id ? null : ride);
  };

  const handleBookRide = async (rideId) => {
    try {
      await axios.post(`http://localhost:5001/user/book-ride/${rideId}`, {}, {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      });
      
      // Update the rides array to decrease the seats count
      setRides(rides.map(ride => {
        if (ride.id === rideId) {
          // If no seats left after booking, remove the ride
          if (ride.seats <= 1) {
            return null;
          }
          // Otherwise decrease the seats count
          return {
            ...ride,
            seats: ride.seats - 1
          };
        }
        return ride;
      }).filter(Boolean)); // Remove null entries (rides with no seats left)

      setSelectedRide(null);
      alert('Ride booked successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to book ride');
    }
  };

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
              <React.Fragment key={ride._id}>
                <tr 
                  onClick={() => handleRideClick(ride)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{ride.pickup.address}</td>
                  <td>{ride.dropoff.address}</td>
                  <td>${ride.price}</td>
                  <td>{ride.seats}</td>
                  <td>{new Date(ride.date).toLocaleDateString()}</td>
                  <td>{ride.status}</td>
                </tr>
                {selectedRide?.id === ride.id && (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>
                      <button 
                        onClick={() => handleBookRide(ride.id)}
                        disabled={!user || ride.driver_id === getUserIdFromToken(user?.token)}
                        className="book-button"
                      >
                        {!user ? 'Login to Book' : 
                         ride.driver_id === getUserIdFromToken(user?.token) ? 'Cannot book own ride' : 
                         'Book This Ride'}
                      </button>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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