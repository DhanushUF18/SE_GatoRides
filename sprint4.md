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
- **Endpoint**: `POST /rides/cancel-booking`
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
- **Endpoint**: `POST /rides/cancel-ride`
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
