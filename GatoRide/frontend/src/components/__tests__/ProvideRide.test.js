import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProvideRide from '../ProvideRide';
import AuthContext from '../../context/AuthContext';
import RideContext from '../../context/RideContext';
import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios'); // Mock axios

describe('ProvideRide Component', () => {
  const mockUser = {
    token: 'test-token',
    location: { address: '123 Main St', latitude: '40.7128', longitude: '-74.0060' },
  };
  const mockSetRidePayload = jest.fn();

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: mockUser }}>
          <RideContext.Provider value={{ setRidePayload: mockSetRidePayload }}>
            <ProvideRide />
          </RideContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders form elements correctly', () => {
    renderComponent();
    expect(screen.getByPlaceholderText('Enter pickup location')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter dropoff address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter price')).toBeInTheDocument();
    expect(screen.getByText('Provide Ride')).toBeInTheDocument(); // Updated button text
  });

  test('allows input changes', () => {
    renderComponent();

    const pickupInput = screen.getByPlaceholderText('Enter pickup location');
    fireEvent.change(pickupInput, { target: { value: 'New Pickup Location' } });
    expect(pickupInput.value).toBe('New Pickup Location');

    const dropoffInput = screen.getByPlaceholderText('Enter dropoff address');
    fireEvent.change(dropoffInput, { target: { value: 'New Dropoff Location' } });
    expect(dropoffInput.value).toBe('New Dropoff Location');

    const seatsInput = screen.getByPlaceholderText('Enter number of available seats');
    fireEvent.change(seatsInput, { target: { value: '4' } });
    expect(seatsInput.value).toBe('4');
  });

  test('submits ride request successfully', async () => {
    render(
      <BrowserRouter>
        <AuthContext.Provider value={{ user: { token: 'test-token', location: { address: '123 Test St' } } }}>
          <RideContext.Provider value={{ setRidePayload: jest.fn() }}>
            <ProvideRide />
          </RideContext.Provider>
        </AuthContext.Provider>
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Enter pickup location'), {
      target: { value: 'New Pickup' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter dropoff address'), {
      target: { value: 'New Dropoff' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter price'), {
      target: { value: '20' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter number of available seats'), {
      target: { value: '4' }
    });
    const dateInput = screen.getByPlaceholderText('Enter date');
    fireEvent.change(dateInput, { target: { value: '2025-04-01' } });

    fireEvent.click(screen.getByText('Provide Ride')); // Updated button text

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  });

  test('handles API error on submit', async () => {
    axios.post.mockRejectedValue({ response: { data: { message: 'Error occurred' } } });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText('Enter pickup location'), { target: { value: 'New Pickup' } });
    fireEvent.change(screen.getByPlaceholderText('Enter dropoff address'), { target: { value: 'New Dropoff' } });
    fireEvent.change(screen.getByPlaceholderText('Enter price'), { target: { value: '20' } });
    fireEvent.change(screen.getByPlaceholderText('Enter number of available seats'), {
      target: { value: '4' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter date'), { 
      target: { value: '2025-04-01' } 
    });

    fireEvent.click(screen.getByText('Provide Ride')); // Updated button text

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(mockSetRidePayload).not.toHaveBeenCalled();
  });
});