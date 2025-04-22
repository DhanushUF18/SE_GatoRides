# GatoRides - Ride Sharing Platform

GatoRides is a car ride-sharing platform that enables users to find and provide rides in cities. Users can act as both riders and drivers, making the service flexible and cooperative.

## Features

- User authentication (signup, login, email verification)
- Interactive ride map with location search
- Provide ride functionality 
- Search available rides
- Profile management
- Route visualization
- Console Logs
- scheduler for ride status updation based on given date and time of the ride
## Prerequisites

- Node.js v16+ 
- Go v1.19+
- MongoDB 
- Git

## Installation

1. Clone the repository:
```sh
git clone https://github.com/DhanushUF18/SE_GatoRides.git
cd SE_GatoRides
```

2. Install Frontend Dependencies:
```sh
cd GatoRide/frontend
npm install
```

3. Install Backend Dependencies:
```sh
cd ../backend
go mod download
```

4. Configure Environment Variables:

Frontend (.env):
```
REACT_APP_API_BASE_URL=http://localhost:5001
```

## Running the Application

1. Start Backend Server:
```sh
cd GatoRide/backend
go run server.go
```

2. Start Frontend Development Server:
```sh
cd GatoRide/frontend
npm start
```


## Testing

Run Frontend Tests:
```sh
cd GatoRide/frontend
npm test
```

Run E2E Tests:
```sh
npm run cypress:open
```

Run Backend Tests:
```sh
cd GatoRide/backend
go test ./tests/controllers -v
```

## Project Structure

```
SE_GatoRides/
├── GatoRide/
│   ├── frontend/      # React frontend application
│   └── backend/       # Go backend API
├── cypress/           # E2E tests
└── docs/             # Documentation and sprint reports
```

## Documentation

- [Sprint 1 Report](sprint1.md) - Authentication Implementation
- [Sprint 2 Report](sprint2.md) - Dashboard & Ride Management 
- [Sprint 3 Report](sprint3.md) - Profile Management & Maps Integration

## Team

Frontend:
- Dhanush Kumar Reddy Gujjula
- Venkata Sandeep Macha

Backend:
- Shahid Shareef Mohammad
- Hareendra Sri Nag Nerusu