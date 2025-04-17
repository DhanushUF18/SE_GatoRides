import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';  // Ensure axios is imported
import AuthContext from '../context/AuthContext';
// import { useLocation } from 'react-router-dom';
import '../styles.css';
import RideContext from '../context/RideContext';

const ProvideRide = () => {
  const { user } = useContext(AuthContext); // Fetch user data from context
  const { setRidePayload } = useContext(RideContext); // Use setRidePayload from RideContext

  // Initialize ride details with date
  const [rideDetails, setRideDetails] = useState({
    pickup: { address: '', latitude: '', longitude: '' }, // Initialize with empty lat/lng
    dropoff: { address: '', latitude: '', longitude: '' },
    price: '',
    seats: '',
    date: '', // Add date field
  });

  const [pickupSuggestions, setPickupSuggestions] = useState([]); // Pickup location suggestions
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]); // Dropoff location suggestions
  const [showPickupDropdown, setShowPickupDropdown] = useState(false); // Pickup location dropdown
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false); // Dropoff location dropdown

  // Set the pickup location from user data when the component mounts
  useEffect(() => {
    if (user?.location?.address) {
      setRideDetails((prevDetails) => ({
        ...prevDetails,
        pickup: { address: user.location.address, latitude: user.location.latitude, longitude: user.location.longitude },
      }));
    }
  }, [user]);

  // Fetch location suggestions for dropoff address
  const fetchLocationSuggestions = async (query, type) => {
    if (!query) {
        if (type === 'pickup') {
            setPickupSuggestions([]);
        } else {
            setDropoffSuggestions([]);
        }
        return;
    }

    try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data && Array.isArray(data.features)) {
            const suggestions = data.features.map((feature) => {
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
                    display_name: fullAddress || 'Unknown Location',
                    lat: feature.geometry.coordinates[1],
                    lon: feature.geometry.coordinates[0]
                };
            });

            if (type === 'pickup') {
                setPickupSuggestions(suggestions);
                setShowPickupDropdown(suggestions.length > 0);
            } else {
                setDropoffSuggestions(suggestions);
                setShowDropoffDropdown(suggestions.length > 0);
            }
        }
    } catch (error) {
        console.error('Error fetching location suggestions:', error);
    }
};

  // Handle pickup location input change
  const handlePickupLocationChange = (e) => {
    const { value } = e.target;
    setRideDetails((prevDetails) => ({
      ...prevDetails,
      pickup: { address: value, latitude: '', longitude: '' }, // Empty lat/lng on change
    }));

    fetchLocationSuggestions(value, 'pickup');
  };

  // Handle dropoff location input change
  const handleDropoffLocationChange = (e) => {
    const { value } = e.target;
    setRideDetails((prevDetails) => ({
      ...prevDetails,
      dropoff: { address: value, latitude: '', longitude: '' }, // Empty lat/lng on change
    }));

    fetchLocationSuggestions(value, 'dropoff');
  };

  // Handle selecting a location from suggestions (pickup or dropoff)
  const handleLocationSelect = (selectedLocation, type) => {
    const { display_name, lat, lon } = selectedLocation;

    if (type === 'pickup') {
        setRideDetails((prevDetails) => ({
            ...prevDetails,
            pickup: { address: display_name, latitude: lat, longitude: lon },
        }));
        setPickupSuggestions([]);
        setShowPickupDropdown(false);
    } else {
        setRideDetails((prevDetails) => ({
            ...prevDetails,
            dropoff: { address: display_name, latitude: lat, longitude: lon },
        }));
        setDropoffSuggestions([]);
        setShowDropoffDropdown(false);
    }
};

  // Fetch location data (latitude, longitude) from OpenStreetMap API
  const fetchLocationData = async (address) => {
    try {
        const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(address)}`);
        const data = await response.json();

        if (data && data.features && data.features[0]) {
            const { geometry } = data.features[0];
            return { latitude: geometry.coordinates[1], longitude: geometry.coordinates[0] };
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
    }
    return { latitude: '', longitude: '' };
};

  // Handle price input change
  const handleChange = (e) => {
    setRideDetails((prevDetails) => ({
      ...prevDetails,
      price: e.target.value,
    }));
  };

  // Add this handler after the handleChange function
  const handleSeatsChange = (e) => {
    setRideDetails((prevDetails) => ({
      ...prevDetails,
      seats: e.target.value,
    }));
  };

  // Handle date input change
  const handleDateChange = (e) => {
    setRideDetails((prevDetails) => ({
      ...prevDetails,
      date: e.target.value,
    }));
  };

  // Submit ride request
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get token from user context
    const token = user?.token; 
    //console.log("Token:", token);

    if (!token) {
        alert("User is not authenticated");
        return;
    }

    // Ensure latitude and longitude are numbers
    const formattedDate = new Date(rideDetails.date).toISOString();
    const payload = {
        pickup: {
            ...rideDetails.pickup,
            latitude: parseFloat(rideDetails.pickup.latitude),
            longitude: parseFloat(rideDetails.pickup.longitude),
        },
        dropoff: {
            ...rideDetails.dropoff,
            latitude: parseFloat(rideDetails.dropoff.latitude),
            longitude: parseFloat(rideDetails.dropoff.longitude),
        },
        price: parseFloat(rideDetails.price),
        seats: parseFloat(rideDetails.seats),
        date: formattedDate,
    };

    try {
        const response = await axios.post("http://localhost:5001/user/provide-ride", payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`  // Pass token in Authorization header
            }
        });

        console.log("✅ Ride Provided:", response.data);
        alert("Ride provided successfully!");

        // Pass the payload back to the Dashboard
        setRidePayload(payload);
    } catch (error) {
        console.error("❌ Error:", error.response?.data || error);
        alert(`Error: ${error.response?.data?.message || "Unknown error"}`);
    }
  };

  return (
    <div className="ride-request-container">
      <form onSubmit={handleSubmit}>
        <h2>Request a Ride</h2>

        <h3>Pickup Location</h3>
        <div className="dropdown">
          <input
            type="text"
            name="pickup"
            value={rideDetails.pickup.address}
            onChange={handlePickupLocationChange}
            placeholder="Enter pickup location"
            required
          />
          {showPickupDropdown && pickupSuggestions.length > 0 && (
            <div className="dropdown-menu">
                {pickupSuggestions.map((location, index) => (
                    <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => handleLocationSelect(location, 'pickup')}
                    >
                        {location.display_name} {/* Render the display_name property */}
                    </div>
                ))}
            </div>
          )}
        </div>

        <h3>Dropoff Location</h3>
        <div className="dropdown">
          <input
            type="text"
            name="dropoff"
            placeholder="Enter dropoff address"
            value={rideDetails.dropoff.address}
            onChange={handleDropoffLocationChange}
            required
          />
          {showDropoffDropdown && dropoffSuggestions.length > 0 && (
            <div className="dropdown-menu">
                {dropoffSuggestions.map((location, index) => (
                    <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => handleLocationSelect(location, 'dropoff')}
                    >
                        {location.display_name} {/* Render the display_name property */}
                    </div>
                ))}
            </div>
          )}
        </div>

        <h3>Price</h3>
        <input
          type="number"
          name="price"
          placeholder="Enter price"
          value={rideDetails.price}
          onChange={handleChange}
          required
        />

        <h3>Available Seats</h3>
        <input
          type="number"
          name="seats"
          placeholder="Enter number of available seats"
          value={rideDetails.seats}
          onChange={handleSeatsChange}
          min="1"
          max="8"
          required
        />

        <h3>Date</h3>
        <input
          type="date"
          name="date"
          placeholder="Enter date"
          value={rideDetails.date}
          onChange={handleDateChange}
          required
        />

        <button type="submit">Submit Ride Request</button>
      </form>
    </div>
  );
};

export default ProvideRide;
