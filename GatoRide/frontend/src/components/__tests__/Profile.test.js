import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Profile from '../Profile';
import AuthContext from '../../context/AuthContext';

// Mock axios
jest.mock('axios');

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Profile Component', () => {
  const mockUser = {
    token: 'fake-token',
    name: 'Test User'
  };

  const mockProfile = {
    name: 'Test User',
    username: 'testuser',
    email: 'test@example.com',
    is_verified: true,
    location: {
      address: '123 Test St'
    }
  };

  const mockAuthContext = {
    user: mockUser,
    handleLogout: jest.fn()
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    axios.post.mockResolvedValue({ data: { user: mockProfile } });
  });

  const renderProfile = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={mockAuthContext}>
          <Profile />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  test('renders profile information correctly', async () => {
    renderProfile();
    
    await waitFor(() => {
      expect(screen.getByText(`Welcome, ${mockProfile.name}!`)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.username)).toBeInTheDocument();
      expect(screen.getByText(mockProfile.email)).toBeInTheDocument();
      expect(screen.getByText('Yes')).toBeInTheDocument(); // is_verified
    });
  });

  test('handles update profile button click', async () => {
    renderProfile();
    
    await waitFor(() => {
      const updateButton = screen.getByText('Update Profile');
      fireEvent.click(updateButton);
    });

    // Get inputs by both label text and ID to ensure robustness
    const nameInput = screen.getByLabelText('Name:');
    const usernameInput = screen.getByLabelText('Username:');
    const addressInput = screen.getByLabelText('Address:');

    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('id', 'name');
    expect(usernameInput).toBeInTheDocument();
    expect(usernameInput).toHaveAttribute('id', 'username');
    expect(addressInput).toBeInTheDocument();
    expect(addressInput).toHaveAttribute('id', 'address');
  });

  test('handles address suggestions', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          features: [{
            properties: {
              name: 'Test Location',
              street: 'Test Street',
              city: 'Test City'
            },
            geometry: {
              coordinates: [10, 20]
            }
          }]
        })
      })
    );

    renderProfile();

    await waitFor(() => {
      const updateButton = screen.getByText('Update Profile');
      fireEvent.click(updateButton);
    });

    const addressInput = screen.getByLabelText('Address:');
    fireEvent.change(addressInput, { target: { value: 'Test' } });

    await waitFor(() => {
      expect(screen.getByText('Test Location, Test Street, Test City')).toBeInTheDocument();
    });
  });

  test('handles profile update submission', async () => {
    const successMessage = 'Profile updated successfully!';
    const updatedProfile = {
      ...mockProfile,
      name: 'Updated Name'
    };

    // Mock the coordinate fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({
          features: [{
            geometry: {
              coordinates: [10, 20]
            }
          }]
        })
      })
    );
    
    // Mock the successful API response
    axios.post.mockImplementation((url) => {
      if (url === 'http://localhost:5001/user/update-profile') {
        return Promise.resolve({
          data: { 
            user: updatedProfile,
            message: successMessage 
          }
        });
      }
      return Promise.resolve({ data: { user: mockProfile } });
    });

    renderProfile();

    // Wait for initial render and click update button
    const updateButton = await screen.findByText('Update Profile');
    fireEvent.click(updateButton);

    // Find and update the name input
    const nameInput = await screen.findByLabelText('Name:');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });

    // Submit the form
    const submitButton = screen.getByText('Save Changes');
    fireEvent.submit(submitButton.closest('form'));

    // Wait for success message using a more flexible approach
    await waitFor(() => {
      const successElement = screen.getByText((content, element) => {
        return element.tagName.toLowerCase() === 'p' && 
               element.className === 'success' && 
               content.includes(successMessage);
      });
      expect(successElement).toBeInTheDocument();
    });

    // Verify API call
    expect(axios.post).toHaveBeenCalledWith(
      'http://localhost:5001/user/update-profile',
      expect.objectContaining({
        name: 'Updated Name',
        username: mockProfile.username,
        location: expect.any(Object)
      }),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${mockUser.token}`
        })
      })
    );
  });

  test('handles logout', async () => {
    renderProfile();

    await waitFor(() => {
      const logoutButton = screen.getByText('Logout');
      fireEvent.click(logoutButton);
    });

    expect(mockAuthContext.handleLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles error states', async () => {
    const errorMessage = 'Failed to fetch profile';
    axios.post.mockRejectedValueOnce({ response: { data: { message: errorMessage } } });

    renderProfile();

    await waitFor(() => {
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });
  });
});