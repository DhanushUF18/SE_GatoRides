import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const HomeRides = ({ rides: searchRides }) => {
  const [rides, setRides] = useState([]); // State for default rides from /home API
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRide, setSelectedRide] = useState(null);
  const { user } = useContext(AuthContext);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
  };
  useEffect(() => {
    const fetchRides = async () => {
      const token = user?.token;
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

        // Safely handle cases where response.data.rides might be null or undefined
        setRides(response.data.rides || []); // Default to an empty array if rides is null/undefined
        setLoading(false);
        // console.log('Default /home API rides:', response.data.rides || []); // Log the /home API response
      } catch (err) {
        setError('Failed to fetch rides data.');
        setLoading(false);
      }
    };

    fetchRides();
  }, [user]);

  // Use searchRides if provided, otherwise fallback to default rides
  const displayedRides = searchRides && searchRides.rides && searchRides.rides.length > 0 
    ? searchRides.rides 
    : rides;

  // console.log('searchRides prop:', searchRides); // Log the searchRides prop
  // console.log('displayedRides:', displayedRides); // Log the displayedRides variable

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
    setSelectedRide(selectedRide?.id === ride.id ? null : ride);
  };

  const handleBookRide = async (rideId) => {
    try {
      await axios.post(`http://localhost:5001/user/book-ride?ride_id=${rideId}`, {}, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

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
      {displayedRides.length > 0 ? (
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
            {displayedRides.map((ride) => (
              <React.Fragment key={ride._id}>
                <tr
                  onClick={() => handleRideClick(ride)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{ride.pickup.address}</td>
                  <td>{ride.dropoff.address}</td>
                  <td>${ride.price}</td>
                  <td>{ride.seats}</td>
                  <td>{formatDate(ride.date)}</td>
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
                        {!user
                          ? 'Login to Book'
                          : ride.driver_id === getUserIdFromToken(user?.token)
                          ? 'Cannot book own ride'
                          : 'Book This Ride'}
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