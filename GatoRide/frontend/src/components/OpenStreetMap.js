import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const OpenStreetMapSearch = ({ onSelect, placeholder = "Search location" }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  let cancelTokenSource = axios.CancelToken.source();

  // Debounce function to limit API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchLocations = async (searchValue) => {
    if (searchValue.length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);

    // Cancel previous request if a new one is triggered
    if (cancelTokenSource) {
      cancelTokenSource.cancel('Operation canceled due to new request.');
    }
    cancelTokenSource = axios.CancelToken.source();

    try {
      const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          format: 'json',
          q: searchValue,
          addressdetails: 1,
          limit: 10, // Reduce response size for faster processing
        },
        cancelToken: cancelTokenSource.token,
      });

      // Process and filter results
      const filteredResults = response.data.map((location) => {
        const road = location.address.road || '';
        const city = location.address.city || location.address.town || location.address.village || '';
        const state = location.address.state || '';
        const country = location.address.country || '';

        const displayLocation = [road, city, state, country].filter(Boolean).join(', ');

        return { display: displayLocation };
      });

      setResults(filteredResults);
      setShowDropdown(true);
      setLoading(false);
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error fetching location data', error);
      }
      setLoading(false);
    }
  };

  const debouncedFetchLocations = useCallback(debounce(fetchLocations, 100), []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedFetchLocations(value);
  };

  const handleSelect = (location) => {
    setQuery(location);
    setShowDropdown(false);
    onSelect(location);
  };

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder={placeholder}
        onFocus={() => setShowDropdown(results.length > 0)}
      />
      {loading && <p style={{ color: 'white' }}>Loading...</p>}
      {showDropdown && results.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          background: 'black',
          color: 'white',
          border: '1px solid #ccc',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000,
        }}>
          {results.map((location, index) => (
            <li 
              key={index}
              onClick={() => handleSelect(location.display)}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {location.display}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OpenStreetMapSearch;
