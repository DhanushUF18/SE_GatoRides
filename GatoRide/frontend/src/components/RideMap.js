import React, { useState, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const RideMap = ({ setRides }) => {
    const [fromLocation, setFromLocation] = useState(null);
    const [toLocation, setToLocation] = useState(null);
    const [fromSuggestions, setFromSuggestions] = useState([]);
    const [toSuggestions, setToSuggestions] = useState([]);
    const [error, setError] = useState('');
    const [availableRides, setAvailableRides] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const token = user?.token;
    const handleCreateRide = () => {
        navigate('/ride-request'); // No need to pass setRidePayload
      };
    // Updated fetchLocationSuggestions function to use Photon API
    const fetchLocationSuggestions = async (query, setSuggestions) => {
        if (!query) {
            setSuggestions([]);
            return;
        }
    
        try {
            const response = await fetch(
                `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`,
                {
                    headers: {
                        'Accept': 'application/json',
                    }
                }
            );
            const data = await response.json();
    
            // Check if data contains features
            if (data && Array.isArray(data.features) && data.features.length > 0) {
                setSuggestions(data.features.map((feature) => {
                    const properties = feature.properties;
                    const fullAddress = [
                        properties.name,
                        properties.street,
                        properties.postcode,
                        properties.city,
                        properties.country
                    ]
                        .filter(Boolean) // Remove undefined or null values
                        .join(', '); // Join with commas
    
                    return {
                        lat: feature.geometry.coordinates[1], // Latitude
                        lon: feature.geometry.coordinates[0], // Longitude
                        display_name: fullAddress || 'Unknown Location'
                    };
                }));
            } else {
                setSuggestions([]); // Clear suggestions if no results
            }
        } catch (error) {
            console.error('Error fetching location suggestions:', error);
            setSuggestions([]); // Clear suggestions in case of an error
        }
    };
    
    // Handle user typing in input fields
    const handleInputChange = (e, setSuggestions) => {
        fetchLocationSuggestions(e.target.value, setSuggestions);
    };

    // Handle selecting a location from the suggestions
    const handleSelectLocation = (selectedLocation, setLocation, setSuggestions, inputId) => {
        setLocation(selectedLocation);
        setSuggestions([]);
        document.getElementById(inputId).value = selectedLocation.display_name;

        // Check if both locations are selected and fetch route
        if (inputId === 'to' && fromLocation) {
            fetchRoute(fromLocation, selectedLocation);
        } else if (inputId === 'from' && toLocation) {
            fetchRoute(selectedLocation, toLocation);
        }
    };

    // Handle search submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!fromLocation || !toLocation || !selectedDate) {
            setError('Please select valid locations and date.');
            setIsLoading(false);
            return;
        }

        // Format the date as YYYY-MM-DD
        const formattedDate = new Date(selectedDate).toISOString().split('T')[0];

        const payload = {
            pickup: {
                address: fromLocation.display_name,
                latitude: parseFloat(fromLocation.lat),
                longitude: parseFloat(fromLocation.lon),
            },
            dropoff: {
                address: toLocation.display_name,
                latitude: parseFloat(toLocation.lat),
                longitude: parseFloat(toLocation.lon),
            },
            date: formattedDate, // Use the correctly formatted date
            seats: 1,
        };

        console.log('Payload:', payload); // Log the payload for debugging

        try {
            const response = await axios.post('http://localhost:5001/user/search-ride', payload, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status !== 200) {
                throw new Error('Failed to fetch rides');
            }

            setRides(response.data); // Update the shared rides state with the search results
        } catch (error) {
            setError('Failed to fetch available rides. Please try again.');
            console.error('Error fetching rides:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookRide = async (rideId) => {
        try {
            // Replace with your actual booking API endpoint
            const response = await axios.post('http://localhost:5001/user/book-ride', {}, {
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rideId }),
              });

            if (!response.ok) {
                throw new Error('Failed to book ride');
            }
    
            // Refresh the available rides list
            handleSubmit(new Event('submit'));
            alert('Ride booked successfully!');
        } catch (error) {
            setError('Failed to book ride. Please try again.');
            console.error('Error booking ride:', error);
        }
    };

    const fetchRoute = async (from, to) => {
        try {
            const response = await axios.get(
                `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`
            );
    
            if (response.data.routes && response.data.routes.length > 0) {
                const coordinates = response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                setRouteCoordinates(coordinates);
            }
        } catch (error) {
            console.error('Error fetching route:', error);
            setError('Failed to load route');
        }
    };

    return (
        <div className="ride-map-container" >
            <form onSubmit={handleSubmit} className="location-form">
                <div className="input-group">
                    <label htmlFor="from">From:</label>
                    <input
                        type="text"
                        id="from"
                        name="from"
                        placeholder="Enter pickup location"
                        onChange={(e) => handleInputChange(e, setFromSuggestions)}
                        required
                    />
                    {fromSuggestions.length > 0 && (
                        <div className="dropdown-menu">
                            {fromSuggestions.map((location, index) => (
                                <div
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => handleSelectLocation(location, setFromLocation, setFromSuggestions, 'from')}
                                >
                                    {location.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="to">To:</label>
                    <input
                        type="text"
                        id="to"
                        name="to"
                        placeholder="Enter destination"
                        onChange={(e) => handleInputChange(e, setToSuggestions)}
                        required
                    />
                    {toSuggestions.length > 0 && (
                        <div className="dropdown-menu">
                            {toSuggestions.map((location, index) => (
                                <div
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => handleSelectLocation(location, setToLocation, setToSuggestions, 'to')}
                                >
                                    {location.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="input-group">
                    <label htmlFor="date">Date:</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]} // This sets minimum date to today
                        required
                    />
                </div>

                <button type="submit" className="search-button">Search Route</button>
            <div className="actions">
                <button onClick={handleCreateRide} className="btn btn-primary">Create Ride</button>
            </div>
            </form>

            {error && <div className="error-message" role="alert">{error}</div>}

            {isLoading && <div className="loading-spinner">Loading available rides...</div>}

            {!isLoading && availableRides.length > 0 && (
                <div className="available-rides-section">
                    <h2>Available Rides</h2>
                    <div className="rides-list">
                        {availableRides.map((ride, index) => (
                            <div key={index} className="ride-card">
                                <div className="ride-info">
                                    <h3>Driver: {ride.driverName}</h3>
                                    <p>Departure: {new Date(ride.departureTime).toLocaleString()}</p>
                                    <p>Available Seats: {ride.availableSeats}</p>
                                    <p>Price: ${ride.price}</p>
                                </div>
                                <button 
                                    className="book-ride-btn"
                                    onClick={() => handleBookRide(ride.id)}
                                >
                                    Book Ride
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!isLoading && availableRides.length === 0 && fromLocation && toLocation && selectedDate && (
                <div className="no-rides-message">
                    No rides available for this route on {new Date(selectedDate).toLocaleDateString()}. Please try different locations or date.
                </div>
            )}

            <div className="map-container" data-testid="map-container">
                <MapContainer center={[29.6516, -82.3248]} zoom={13} style={{ height: '400px', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {fromLocation && parseFloat(fromLocation.lat) && parseFloat(fromLocation.lon) && (
                        <Marker position={[parseFloat(fromLocation.lat), parseFloat(fromLocation.lon)]}>
                            <Popup>{fromLocation.display_name}</Popup>
                        </Marker>
                    )}
                    {toLocation && parseFloat(toLocation.lat) && parseFloat(toLocation.lon) && (
                        <Marker position={[parseFloat(toLocation.lat), parseFloat(toLocation.lon)]}>
                            <Popup>{toLocation.display_name}</Popup>
                        </Marker>
                    )}
                    {routeCoordinates.length > 0 && (
                        <Polyline
                            positions={routeCoordinates}
                            color="#0066cc"
                            weight={4}
                            opacity={0.7}
                        />
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default RideMap;
