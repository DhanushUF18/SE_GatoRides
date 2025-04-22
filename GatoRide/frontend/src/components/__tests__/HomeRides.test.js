import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import HomeRides from '../HomeRides';
import AuthContext from '../../context/AuthContext';

// Mock axios
jest.mock('axios');

// Mock data
const mockRides = {
  rides: [
    {
      _id: '1',
      pickup: { address: 'Test Pickup' },
      dropoff: { address: 'Test Dropoff' },
      price: 25,
      seats: 3,
      date: '2025-04-21T10:00:00.000Z',
      status: 'Active',
      driver_id: 'driver123'
    }
  ]
};

const mockUser = {
  token: 'mockToken'
};

describe('HomeRides Component', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  test('renders loading state initially', () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <HomeRides />
      </AuthContext.Provider>
    );
    
    expect(screen.getByText('Loading rides...')).toBeInTheDocument();
  });

  test('renders rides table when data is loaded', async () => {
    axios.get.mockResolvedValueOnce({ data: mockRides });
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <HomeRides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Available Rides')).toBeInTheDocument();
      expect(screen.getByText('Test Pickup')).toBeInTheDocument();
      expect(screen.getByText('Test Dropoff')).toBeInTheDocument();
      expect(screen.getByText('$25')).toBeInTheDocument();
    });
  });

  test('displays error message when API call fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <HomeRides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch rides data.')).toBeInTheDocument();
    });
  });

  test('shows "No rides available" when rides array is empty', async () => {
    axios.get.mockResolvedValueOnce({ data: { rides: [] } });
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <HomeRides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('No rides available.')).toBeInTheDocument();
    });
  });

  test('handles ride selection on click', async () => {
    axios.get.mockResolvedValueOnce({ data: mockRides });
    
    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <HomeRides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const rideRow = screen.getByText('Test Pickup').closest('tr');
      fireEvent.click(rideRow);
    });

    // Add more specific assertions based on what should happen when a ride is selected
  });
});