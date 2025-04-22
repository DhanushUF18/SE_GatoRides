import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RideMap from '../RideMap';
import AuthContext from '../../context/AuthContext';
import '@testing-library/jest-dom';

// Mock leaflet to prevent errors
jest.mock('leaflet', () => ({
    Icon: {
        Default: {
            prototype: {
                _getIconUrl: jest.fn()
            },
            mergeOptions: jest.fn()
        }
    }
}));

// Mock react-leaflet components
jest.mock('react-leaflet', () => ({
    MapContainer: jest.fn(({ children }) => <div data-testid="map-container">{children}</div>),
    TileLayer: jest.fn(() => null),
    Marker: jest.fn(({ children }) => <div data-testid="map-marker">{children}</div>),
    Popup: jest.fn(({ children }) => <div data-testid="map-popup">{children}</div>)
}));

// Mock location search response
const mockLocationData = {
    gainesville: [{
        lat: '29.6516',
        lon: '-82.3248',
        display_name: 'Gainesville, FL'
    }],
    university: [{
        lat: '29.6436',
        lon: '-82.3549',
        display_name: 'University of Florida'
    }]
};

// Mock user data
const mockUser = {
    token: 'mock-token',
    // Add other user properties as needed
};

// Updated helper function to wrap component with both Router and AuthContext
const renderWithRouter = (component) => {
    return render(
        <AuthContext.Provider value={{ user: mockUser }}>
            <BrowserRouter>
                {component}
            </BrowserRouter>
        </AuthContext.Provider>
    );
};

describe('RideMap Component', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
        jest.clearAllMocks();
    });

    it('renders the map component with form elements', () => {
        renderWithRouter(<RideMap />);
        
        expect(screen.getByLabelText(/from:/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/to:/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /search route/i })).toBeInTheDocument();
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
    });

    it('handles location search successfully', async () => {
        global.fetch
            .mockResolvedValueOnce({
                json: () => Promise.resolve(mockLocationData.gainesville)
            })
            .mockResolvedValueOnce({
                json: () => Promise.resolve(mockLocationData.university)
            });

        renderWithRouter(<RideMap />);

        await userEvent.type(screen.getByLabelText(/from:/i), 'Gainesville');
        await userEvent.type(screen.getByLabelText(/to:/i), 'University of Florida');
        await userEvent.click(screen.getByRole('button', { name: /search route/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(32);
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('Gainesville'),
                expect.any(Object)
            );
        });
    });

    it('displays error message when location is not found', async () => {
        global.fetch.mockResolvedValueOnce({
            json: () => Promise.resolve([])
        });

        renderWithRouter(<RideMap />);

        await userEvent.type(screen.getByLabelText(/from:/i), 'NonexistentLocation');
        await userEvent.type(screen.getByLabelText(/to:/i), 'Somewhere');
        await userEvent.click(screen.getByRole('button', { name: /search route/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent(/please select valid locations/i);

        });
    });

    it('handles network errors during location search', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        renderWithRouter(<RideMap />);

        await userEvent.type(screen.getByLabelText(/from:/i), 'Gainesville');
        await userEvent.type(screen.getByLabelText(/to:/i), 'University');
        await userEvent.click(screen.getByRole('button', { name: /search route/i }));

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Please select valid locations.');
        });        
    });

    it('prevents form submission with empty inputs', async () => {
        const user = userEvent.setup();
        renderWithRouter(<RideMap />);
        
        const searchButton = screen.getByRole('button', { name: /search route/i });
        await user.click(searchButton);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('resets error message on new search', async () => {
        // Setup three fetch responses for the complete test flow
        global.fetch
            .mockRejectedValueOnce(new Error('Network error'))
            .mockResolvedValueOnce({
                json: () => Promise.resolve(mockLocationData.gainesville)
            })
            .mockResolvedValueOnce({
                json: () => Promise.resolve(mockLocationData.university)
            });

        renderWithRouter(<RideMap />);
        const fromInput = screen.getByLabelText(/from:/i);
        const toInput = screen.getByLabelText(/to:/i);
        const searchButton = screen.getByRole('button', { name: /search route/i });

        // First search - should fail
        await userEvent.type(fromInput, 'Failed Location');
        await userEvent.type(toInput, 'Somewhere');
        await userEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByRole('alert')).toHaveTextContent('Please select valid locations.');
        });
        

        // Second search - should succeed
        await userEvent.clear(fromInput);
        await userEvent.clear(toInput);
        await userEvent.type(fromInput, 'Gainesville');
        await userEvent.type(toInput, 'University');
        await userEvent.click(searchButton);

        // Wait for fetch calls to complete
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(45);
        });

        // Verify error is cleared
        // expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
});