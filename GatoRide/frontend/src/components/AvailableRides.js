import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

const AvailableRides = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [availableRides, setAvailableRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await axios.get('http://localhost:5001/user/available-rides', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`
                    }
                });
                
                const activeRides = response.data.filter(ride => 
                    ride.status === 'active' && 
                    new Date(ride.date) >= new Date() && 
                    ride.seats > 0
                );
                
                setAvailableRides(activeRides);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching rides:', error);
                setError('Failed to load rides. Please try again later.');
                setLoading(false);
            }
        };

        fetchRides();
        const interval = setInterval(fetchRides, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [user]);

    const handleBookRide = async (rideId) => {
        try {
            await axios.post(`http://localhost:5001/user/book-ride/${rideId}`, {}, {
                headers: {
                    Authorization: `Bearer ${user?.token}`
                }
            });
            
            // Refresh rides after booking
            const updatedRides = availableRides.filter(ride => ride._id !== rideId);
            setAvailableRides(updatedRides);
            alert('Ride booked successfully!');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to book ride');
        }
    };

    if (loading) {
        return <div className="loading">Loading available rides...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="available-rides-container">
            <h2>Available Rides</h2>
            <div className="filters">
                <button onClick={() => navigate('/provide-ride')}>
                    Provide a Ride
                </button>
            </div>
            
            {availableRides.length === 0 ? (
                <div className="no-rides">
                    <p>No rides available at the moment</p>
                </div>
            ) : (
                <div className="rides-grid">
                    {availableRides.map(ride => (
                        <div key={ride._id} className="ride-card">
                            <div className="ride-info">
                                <h3>From: {ride.pickup.address}</h3>
                                <h3>To: {ride.dropoff.address}</h3>
                                <p>Date: {new Date(ride.date).toLocaleDateString()}</p>
                                <p>Time: {new Date(ride.date).toLocaleTimeString()}</p>
                                <p>Price: ${ride.price}</p>
                                <p>Available Seats: {ride.seats}</p>
                            </div>
                            <div className="ride-actions">
                                <button 
                                    onClick={() => handleBookRide(ride._id)}
                                    disabled={!user || ride.providerId === user.id}
                                    className="book-button"
                                >
                                    {!user ? 'Login to Book' : 
                                     ride.providerId === user.id ? 'Your Ride' : 
                                     'Book This Ride'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AvailableRides;