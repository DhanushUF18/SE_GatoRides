import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import Rides from '../Rides';
import AuthContext from '../../context/AuthContext';

// Mock axios
jest.mock('axios');

// Mock data
const mockRidesData = {
  rides_offered: [
    {
      id: '1',
      pickup: { address: 'Start Point' },
      dropoff: { address: 'End Point' },
      date: '2025-04-21T10:00:00.000Z',
      seats: 3,
      price: 25,
      status: 'active'
    }
  ],
  rides_taken: [
    {
      id: '2',
      pickup: { address: 'Location A' },
      dropoff: { address: 'Location B' },
      date: '2025-04-22T10:00:00.000Z',
      driver_name: 'John Doe',
      price: 30,
      status: 'active'
    }
  ]
};

const mockUser = {
  token: 'mock-token'
};

describe('Rides Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders rides offered and taken sections', async () => {
    axios.post.mockResolvedValueOnce({ data: mockRidesData });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Rides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Rides Offered')).toBeInTheDocument();
      expect(screen.getByText('Rides Taken')).toBeInTheDocument();
    });
  });

  test('displays rides offered data correctly', async () => {
    axios.post.mockResolvedValueOnce({ data: mockRidesData });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Rides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Start Point')).toBeInTheDocument();
      expect(screen.getByText('End Point')).toBeInTheDocument();
      expect(screen.getByText('$25')).toBeInTheDocument();
    });
  });

  test('displays rides taken data correctly', async () => {
    axios.post.mockResolvedValueOnce({ data: mockRidesData });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Rides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Location A')).toBeInTheDocument();
      expect(screen.getByText('Location B')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('$30')).toBeInTheDocument();
    });
  });

  test('handles cancel booking', async () => {
    axios.post.mockImplementation((url) => {
      if (url.includes('cancel-booking')) {
        return Promise.resolve({ data: { message: 'Booking cancelled' } });
      }
      return Promise.resolve({ data: mockRidesData });
    });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Rides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Booking cancelled successfully!');
    });

    alertMock.mockRestore();
  });

  test('handles cancel ride as driver', async () => {
    axios.post.mockImplementation((url) => {
      if (url.includes('cancel-ride')) {
        return Promise.resolve({ data: { message: 'Ride cancelled' } });
      }
      return Promise.resolve({ data: mockRidesData });
    });

    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Rides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      const cancelRideButtons = screen.getAllByText('Cancel Ride');
      fireEvent.click(cancelRideButtons[0]);
    });

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith('Ride cancelled successfully!');
    });

    alertMock.mockRestore();
  });

  test('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch rides';
    axios.post.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Rides />
      </AuthContext.Provider>
    );

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});