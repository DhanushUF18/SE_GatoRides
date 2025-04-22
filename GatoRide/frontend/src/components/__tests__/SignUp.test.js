import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import SignupForm from '../SignUp';
import AuthContext from '../../context/AuthContext';
import '@testing-library/jest-dom';

const mockHandleSignup = jest.fn();
const mockContextValue = {
  handleSignup: mockHandleSignup,
  user: null
};

const renderWithContext = (component) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockContextValue}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('SignupForm Component', () => {
  beforeEach(() => {
    mockHandleSignup.mockClear();
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    window.alert.mockRestore();
  });

  it('renders signup form with all elements', () => {
    renderWithContext(<SignupForm />);
    
    expect(screen.getByText('Join GatoRides')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('updates form data when user types', async () => {
    renderWithContext(<SignupForm />);
    
    const nameInput = screen.getByPlaceholderText('Name');
    const emailInput = screen.getByPlaceholderText('Email');
    const usernameInput = screen.getByPlaceholderText('Username');
    const passwordInput = screen.getByPlaceholderText('Password');

    await userEvent.type(nameInput, 'John Doe');
    await userEvent.type(emailInput, 'john@example.com');
    await userEvent.type(usernameInput, 'johndoe');
    await userEvent.type(passwordInput, 'password123');

    expect(nameInput).toHaveValue('John Doe');
    expect(emailInput).toHaveValue('john@example.com');
    expect(usernameInput).toHaveValue('johndoe');
    expect(passwordInput).toHaveValue('password123');
  });

  // it('calls handleSignup with correct data on form submission', async () => {
  //   renderWithContext(<SignupForm />);
    
  //   const nameInput = screen.getByPlaceholderText('Name');
  //   const emailInput = screen.getByPlaceholderText('Email');
  //   const usernameInput = screen.getByPlaceholderText('Username');
  //   const passwordInput = screen.getByPlaceholderText('Password');
  //   const locationInput = screen.getByPlaceholderText('Enter your location');
  //   const submitButton = screen.getByRole('button', { name: /sign up/i });

  //   await userEvent.type(nameInput, 'John Doe');
  //   await userEvent.type(emailInput, 'john@example.com');
  //   await userEvent.type(usernameInput, 'johndoe');
  //   await userEvent.type(passwordInput, 'password123');
  //   await userEvent.type(locationInput, 'New York, United States');

  //   const form = screen.getByRole('form');
  //   await userEvent.click(submitButton);

  //   await waitFor(() => {
  //     expect(mockHandleSignup).toHaveBeenCalledWith({
  //       name: 'John Doe',
  //       email: 'john@example.com',
  //       username: 'johndoe',
  //       password: 'password123',
  //       location: 'New York, United States'
  //     });
  //   });
  // });

  it('shows success alert on successful signup', async () => {
    mockHandleSignup.mockResolvedValueOnce();
    renderWithContext(<SignupForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });

  });

  it('shows error alert on signup failure', async () => {
    mockHandleSignup.mockRejectedValueOnce(new Error('Error during signup: Unknown error'));
    renderWithContext(<SignupForm />);
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Error during signup: Unknown error');
    });
  });
});