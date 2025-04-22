# Sprint 4 Documentation

## Backend - [Video](https://drive.google.com/drive/folders/1S9oR-HDTs1S1axb-hkbNk7i6dp3oF7mh?usp=drive_link)

## Overview
This document outlines the functionalities implemented during Sprint 4 of the GatoRide application backend.

## New Features

### 1. Book Ride Functionality
- **Endpoint**: `POST /rides/book-ride`
- **Description**: Allows users to book available rides
- **Features**:
  - Books a ride for the authenticated user
  - Verifies ride exists and has available seats
  - Updates ride status to "booked" when all seats are taken
  - Prevents duplicate bookings by the same user
  - Validates ride is in "open" status before booking
- **Implementation**: Created in `controllers/book_ride_controller.go`
- **Testing**: Comprehensive tests in `tests/controllers/book_ride_test.go`
  - Tests for successful booking
  - Tests for booking the last available seat
  - Tests for various error conditions (already booked, no seats, wrong status)

### 2. Cancel Booking Functionality
- **Endpoint**: `POST /rides/cancel-booking?ride_id=RIDE_ID`
- **Description**: Allows passengers to cancel their bookings
- **Features**:
  - Verifies user is a passenger on the ride
  - Increases available seats when booking is canceled
  - Removes passenger from the ride's passenger list
  - Only allows cancellation for rides in "open" or "booked" status
- **Implementation**: Created in `controllers/cancel_booking_controller.go`
- **Testing**: Implemented tests that verify:
  - Successful booking cancellations
  - Status validation (cannot cancel ongoing or completed rides)
  - Authorization checks (must be a passenger)
  - Error handling for various edge cases

### 3. Cancel Ride Functionality
- **Endpoint**: `POST /rides/cancel-ride?ride_id=RIDE_ID`
- **Description**: Allows drivers to cancel rides they've offered
- **Features**:
  - Verifies user is the driver of the ride
  - Updates ride status to "cancelled"
  - Maintains ride record for history purposes
- **Implementation**: Created in `controllers/cancel_ride_controller.go`
- **Testing**: Comprehensive tests verifying:
  - Successful ride cancellations by drivers
  - Authorization checks (only driver can cancel)
  - Error handling for various scenarios


## Scheduled Ride Cleanup

### 4. Automatic Status Update for Expired Rides
- **Description**: Periodically checks and cancels rides that are no longer valid.
- **Features**:
  - Runs a scheduled job every 6 hours
  - Cancels rides in the past with "open" status by marking them as "cancelled"
  - Helps maintain a clean and accurate ride feed
- **Implementation**: Implemented in `utils/scheduler.go`
- **Notes**: Triggered via a goroutine at backend startup in `main.go`

## Request/Response Logging

### 5. Middleware Logging for All API Calls
- **Description**: Logs all HTTP requests and responses to a file.
- **Features**:
  - Captures HTTP method, path, headers, request body, status code, response body, and latency
  - Outputs logs to `logs/server.log` file
  - Ensures visibility into backend activity for debugging and auditing
- **Implementation**: Middleware implemented in `middlewares/logger.go` and registered in `main.go`


## Testing

All new functionality is covered by unit tests. Tests verify:

- Successful operations with valid data
- Validation of input data
- Error handling for edge cases
- Database state verification after operations
- Authentication and authorization checks

## API Documentation - [Link](https://drive.google.com/drive/folders/1S9oR-HDTs1S1axb-hkbNk7i6dp3oF7mh?usp=drive_link)

## Technical Improvements
- Enhanced error handling across all endpoints
- Improved validation for all user inputs
- Optimized database queries for better performance
- Consistent response format across all endpoints
- Added detailed documentation for all new functionality


## Frontend- [Video](https://drive.google.com/file/d/1EYxOFblu4KKjdRCwQzjZUdbrB1SaXs3R/view?usp=drive_link)

## Overview
This document outlines the functionalities implemented during Sprint 4 of the GatoRide application backend.

### 1. Booking Rides
- **Description**: Allows users to book available rides from the home page.
- **Features**:
  - Displays a list of available rides with details like pickup, dropoff, price, and seats available.
  - Users can select a ride and book it directly.
  - Prevents users from booking their own rides.
- **Implementation**: Implemented in `HomeRides.js`.

### 2. Search Rides
- **Description**: Enables users to search for rides based on specific criteria.
- **Features**:
  - Filters rides based on user input.
  - Displays search results dynamically.
- **Implementation**: Integrated into `HomeRides.js`.

### 3. Profile and Update Profile
- **Description**: Allows users to view and update their profile information.
- **Features**:
  - Displays user details such as name, username, email, and location.
  - Users can update their name, username, and address.
  - Provides address suggestions and fetches coordinates for the updated address.
- **Implementation**: Implemented in `Profile.js`.

### 4. User Rides and Cancelling
- **Description**: Displays rides offered and taken by the user, with options to cancel.
- **Features**:
  - Lists rides offered by the user with details like pickup, dropoff, date, and status.
  - Lists rides taken by the user with details like driver, price, and status.
  - Allows users to cancel their bookings or rides they have offered.
- **Implementation**: Implemented in `Rides.js`.

## Issues and Solutions

### 1. Issue: Address Suggestions Not Accurate
- **Description**: Users reported that the address suggestions in the profile update form were not always accurate or relevant.
- **Solution**: Improved the address suggestion logic by refining the query parameters sent to the Photon API. Added better error handling to ensure fallback suggestions when the API response is incomplete.

### 2. Issue: Booking Own Rides
- **Description**: Users were able to book rides they had created, leading to inconsistencies in the system.
- **Solution**: Added a validation check in both the backend and frontend to prevent users from booking their own rides. Updated the UI to disable the "Book This Ride" button for rides created by the logged-in user.

### 3. Issue: Ride Cancellation Not Updating in Real-Time
- **Description**: When a user canceled a ride or booking, the changes were not reflected immediately in the UI.
- **Solution**: Implemented state updates in the frontend to refresh the ride lists after a cancellation. Added success notifications to confirm the action to the user.

### 4. Issue: Slow Profile Update with Address Coordinates
- **Description**: Fetching coordinates for updated addresses caused delays in saving profile updates.
- **Solution**: Optimized the coordinate-fetching process by caching results for frequently used addresses. Added a loading indicator to inform users of the ongoing process.

### 5. Issue: No Feedback on Ride Booking Errors
- **Description**: Users did not receive clear feedback when a ride booking failed due to issues like no available seats or invalid ride status.
- **Solution**: Enhanced error messages in the frontend to display specific reasons for booking failures. Updated the backend to provide more descriptive error responses.

### 6. Issue: Address Suggestions Dropdown Overlapping UI
- **Description**: The address suggestions dropdown in the profile update form overlapped with other UI elements, making it difficult to select an address.
- **Solution**: Adjusted the CSS styling of the dropdown to ensure it appears above other elements. Added a scrollable container for better usability.

### 7. Issue: No Confirmation for Ride Cancellation
- **Description**: Users could accidentally cancel rides or bookings without any confirmation.
- **Solution**: Added a confirmation modal before canceling a ride or booking. This ensures users can review their action before proceeding.

### 8. Issue: Lack of Feedback for Profile Updates
- **Description**: Users were unsure if their profile updates were successful due to the lack of feedback.
- **Solution**: Added success and error messages to the profile update form. Displayed a success message upon successful updates and detailed error messages for failures.

## Testing

### Frontend Testing

#### Unit Testing
- **Components Tested**:
  - `HomeRides.js`:
    - Verified the correct display of available rides.
    - Tested the booking functionality, ensuring users cannot book their own rides.
    - Checked error handling for failed bookings.
  - `Profile.js`:
    - Tested profile rendering with user details.
    - Verified the update functionality for name, username, and address.
    - Checked address suggestion dropdown behavior and coordinate fetching.
  - `Rides.js`:
    - Verified the display of rides offered and taken by the user.
    - Tested ride cancellation functionality for both drivers and passengers.
    - Ensured real-time updates to the UI after cancellations.

#### Cypress End-to-End Testing
- **Test Scenarios**:
  - **Booking Rides**:
    - Verified that users can view and book available rides.
    - Ensured users cannot book their own rides.
    - Tested error handling for booking failures (e.g., no available seats).
  - **Profile Updates**:
    - Tested updating user profiles with valid and invalid data.
    - Verified address suggestions and coordinate fetching functionality.
  - **Ride Cancellation**:
    - Tested ride cancellation by drivers and passengers.
    - Verified that canceled rides are updated in real-time in the UI.
  - **Search Rides**:
    - Verified that search results are displayed dynamically.

