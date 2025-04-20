# Sprint 3 Documentation - 

## Backend [Video](https://drive.google.com/drive/folders/14aGit5GFDWazu_BC7HtRsW8BOncJuM-U?usp=sharing)

## Overview
This document outlines the functionalities implemented during Sprint 3 of the GatoRide application backend and Frontend.

## New Features

### 1. User Profile Management

#### 1.1 Update Profile Functionality
- **Endpoint**: `POST /user/update-profile`
- **Description**: Implemented a comprehensive profile update system that allows users to modify their personal information
- **Features**:
  - Update user's name
  - Update username (with validation to prevent duplicates)
  - Update location information (latitude, longitude, address)
- **Implementation**: Created in `controllers/update_profile_controller.go`
- **Testing**: Comprehensive tests in `tests/controllers/update_profile_test.go`
  - Tests for successful updates of various fields
  - Tests for duplicate username validation
  - Tests for empty update validation
  - Tests for invalid data format handling

#### 1.2 Profile Controller
- **Endpoints**: 
  - `GET /user/profile` - Retrieve user profile information
  - `GET /user/rides` - Retrieve user's ride history
- **Description**: Allows users to view their profile information and ride history
- **Features**:
  - Get user profile details with sensitive data (password, verification tokens) removed
  - Get list of rides offered as a driver
  - Get list of rides taken as a passenger
- **Implementation**: Created in `controllers/profile_controller.go` 
- **Testing**: Implemented in profile controller tests

### 2. Authentication Improvements

#### 2.1 Logout Functionality
- **Endpoint**: `POST /user/logout`
- **Description**: Securely invalidates user sessions
- **Features**:
  - Extracts JWT token from authorization header
  - Removes the session from database
  - Prevents token reuse after logout
- **Implementation**: Created in `controllers/logout_controller.go`
- **Testing**: Implemented tests that verify:
  - Successful logout operations
  - Handling of invalid tokens
  - Handling of missing tokens

### 3. Ride Management

#### 3.1 Search Ride Functionality
- **Endpoint**: `POST /rides/search-ride`
- **Description**: Allows users to search for available rides based on location, destination, date, and seats required
- **Features**:
  - Search by geographical proximity (origin and destination)
  - Filter by date of travel
  - Filter by minimum available seats
  - Returns only "open" (available) rides
- **Implementation**: Created in `controllers/search_ride_controller.go`
- **Testing**: Comprehensive tests verifying:
  - Successful searches with multiple criteria
  - Empty result handling
  - Invalid input handling

#### 3.2 Book Ride Functionality (Partial Implementation)
- **Endpoint**: `POST /rides/book-ride_id`
- **Description**: Allows users to request to book a ride
- **Features**:
  - Creates a booking alert for the ride driver
  - Validates seat availability
  - Status tracking (pending, confirmed)
- **Implementation**: Created in `controllers/book_ride_controller.go`
- **Note**: This feature is partially implemented and does not have test coverage yet

## Testing

All new functionality (except the partially implemented Book Ride feature) is covered by unit tests. Tests verify:

- Successful operations with valid data
- Validation of input data
- Error handling for edge cases
- Database state verification after operations
- Authentication and authorization checks

## API Documentation - [Link](https://drive.google.com/drive/folders/14aGit5GFDWazu_BC7HtRsW8BOncJuM-U?usp=sharing)

## Technical Improvements
- Enhanced error handling across all endpoints
- Improved validation for all user inputs
- Optimized database queries for better performance
- Consistent response format across all endpoints
- Added detailed documentation for all new functionality

## Future Enhancements
- Complete the Book Ride functionality with tests
- Add ride cancellation functionality
- Implement ride ratings and reviews
- Develop notification system for ride updates

## Frontend Changes
## Frontend [Video](https://drive.google.com/file/d/1rx7QIyYn_kviXtniAia0gln6X6o9ALG-/view?usp=sharing)
### 1. Ride Map Integration
- **Description**: Integrated a dynamic ride map to display ride routes and locations.
- **Features**:
  - Displays the route between the origin and destination using a polyline.
  - Highlights pickup and drop-off points with custom markers.
  - Interactive map with zoom, pan, and reset functionality.
- **Implementation**: Added in `frontend/components/RideMap.js`.
- **Testing**:
  - Verified map rendering with various route scenarios.
  - Tested marker placement accuracy for pickup and drop-off points.
  - Ensured smooth interaction with zoom and pan features.

### 2. Provide Ride Functionality
- **Description**: Added a frontend interface for users to provide rides.
- **Features**:
  - Form to input ride details, including:
    - Origin and destination (with autocomplete suggestions).
    - Date and time of the ride.
  - Integration with backend API to save ride details securely.
  - Validation for:
    - Required fields (e.g., origin, destination, date, time).
    - Input formats (e.g., valid date and time, positive seat count).
  - Success and error notifications for ride creation.
- **Implementation**: Added in `frontend/pages/ProvideRide.js`.
- **Testing**:
  - Verified form validation for all fields.
  - Tested successful ride creation with valid inputs.
  - Ensured proper error handling for invalid or missing inputs.
  - Simulated API failures to test error notifications.

### 3. Change in Maps API
- **Description**: Updated the Maps API integration to use a new provider for better performance and additional features.
- **Features**:
  - Improved geocoding accuracy for converting addresses to coordinates.
  - Faster route calculations with optimized algorithms.
  - Reduced API latency for a smoother user experience.
- **Implementation**: Updated API calls in `frontend/utils/maps.js`.
- **Testing**:
  - Verified geocoding accuracy with various address formats.
  - Measured API response times to confirm performance improvements.

## Issues and Solutions

### 1. Issue: Inconsistent Geocoding Results
- **Description**: Users reported inaccurate geocoding results when entering certain addresses, leading to incorrect route calculations.
- **Solution**: Switched to a new Maps API provider with improved geocoding accuracy. Verified the results with various address formats during testing.

### 2. Issue: Slow Route Calculations
- **Description**: Route calculations were taking longer than expected, causing delays in displaying the map.
- **Solution**: Optimized the API calls by using batch processing for geocoding and route calculations. Updated the frontend to handle asynchronous map rendering for a smoother user experience.

### 3. Issue: Validation Errors in Provide Ride Form
- **Description**: Users encountered validation errors when entering incomplete or incorrectly formatted ride details.
- **Solution**: Enhanced form validation logic to provide clear error messages for missing or invalid inputs. Added a confirmation modal to allow users to review their details before submission.

### 4. Issue: Missing Test Coverage for Book Ride Feature
- **Description**: The partially implemented Book Ride functionality lacked unit tests, increasing the risk of undetected bugs.
- **Solution**: Added test cases to cover edge cases, input validation, and database state verification. Ensured comprehensive test coverage before completing the feature.

### 5. Issue: High API Latency
- **Description**: Users experienced delays in map rendering due to high latency in API responses.
- **Solution**: Migrated to a high-performance Maps API provider with reduced latency. Measured and confirmed improved response times during testing.

### 6. Issue: Lack of Ride Ratings and Reviews
- **Description**: Users were unable to provide feedback on their ride experiences, limiting opportunities for service improvement.
- **Solution**: Planned the implementation of a ride ratings and reviews system to allow passengers to rate and review their rides and drivers to view feedback.

### 7. Issue: No Route Highlighting
- **Description**: The map did not visually highlight the route between the origin and destination, making it harder for users to follow the path.
- **Solution**: Planned to add route highlighting functionality using polylines to clearly display the path between the origin and destination on the map.

## Future Enhancements
- Route highlighting between the from location pin to To location pin
- book ride implementation
- Implement ride ratings and reviews
- Develop notification system for ride updates
