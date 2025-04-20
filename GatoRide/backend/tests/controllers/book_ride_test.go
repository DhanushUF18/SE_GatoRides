package controllers_test

import (
	"backend/config"
	"backend/controllers"
	"backend/models"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestBookRide(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()

	// Add mock authentication middleware
	router.GET("/rides/book", func(c *gin.Context) {
		// Mock the auth middleware by setting userID
		c.Set("userID", mockUserID)
		controllers.BookRide(c)
	})

	// Test case: successful booking
	t.Run("Successful ride booking", func(t *testing.T) {
		// Create a test ride
		rideID := primitive.NewObjectID()
		testRide := models.Ride{
			ID:       rideID,
			DriverID: primitive.NewObjectID(),
			Pickup: models.Location{
				Latitude:  40.7128,
				Longitude: -74.0060,
				Address:   "New York, NY",
			},
			Dropoff: models.Location{
				Latitude:  40.7306,
				Longitude: -73.9352,
				Address:   "Brooklyn, NY",
			},
			Status:    models.StatusOpen,
			Price:     25.99,
			Seats:     2,
			CreatedAt: time.Now(),
		}

		// Insert test ride
		collection := config.GetCollection("rides")
		_, err := collection.InsertOne(context.TODO(), testRide)
		assert.NoError(t, err)
		defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

		// Create request
		req, _ := http.NewRequest("GET", "/rides/book?ride_id="+rideID.Hex(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusOK, w.Code)

		// Verify ride was updated in the database
		var updatedRide models.Ride
		err = collection.FindOne(context.TODO(), bson.M{"_id": rideID}).Decode(&updatedRide)
		assert.NoError(t, err)

		// Check that seats were decreased
		assert.Equal(t, 1, updatedRide.Seats)

		// Check that passenger was added
		userObjectID, _ := primitive.ObjectIDFromHex(mockUserID)
		passengerFound := false
		for _, passengerID := range updatedRide.PassengerIDs {
			if passengerID == userObjectID {
				passengerFound = true
				break
			}
		}
		assert.True(t, passengerFound, "Passenger ID not found in the ride's passenger list")

		// Status should still be open since there are seats left
		assert.Equal(t, models.StatusOpen, updatedRide.Status)
	})

	// Test case: booking the last seat changes status to booked
	t.Run("Booking last seat changes status to booked", func(t *testing.T) {
		// Create a test ride with only 1 seat
		rideID := primitive.NewObjectID()
		testRide := models.Ride{
			ID:        rideID,
			DriverID:  primitive.NewObjectID(),
			Status:    models.StatusOpen,
			Seats:     1, // Only one seat available
			CreatedAt: time.Now(),
		}

		// Insert test ride
		collection := config.GetCollection("rides")
		_, err := collection.InsertOne(context.TODO(), testRide)
		assert.NoError(t, err)
		defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

		// Create request
		req, _ := http.NewRequest("GET", "/rides/book?ride_id="+rideID.Hex(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusOK, w.Code)

		// Verify ride status was updated to booked
		var updatedRide models.Ride
		err = collection.FindOne(context.TODO(), bson.M{"_id": rideID}).Decode(&updatedRide)
		assert.NoError(t, err)

		// Status should be changed to booked
		assert.Equal(t, models.StatusBooked, updatedRide.Status)

		// Seats should be zero
		assert.Equal(t, 0, updatedRide.Seats)
	})

	// Test case: booking a ride that's not open
	t.Run("Cannot book non-open ride", func(t *testing.T) {
		// Try with various non-open statuses
		statuses := []models.RideStatus{
			models.StatusBooked,
			models.StatusOngoing,
			models.StatusCompleted,
			models.StatusCancelled,
		}

		for _, status := range statuses {
			// Create a test ride with non-open status
			rideID := primitive.NewObjectID()
			testRide := models.Ride{
				ID:        rideID,
				DriverID:  primitive.NewObjectID(),
				Status:    status,
				Seats:     2,
				CreatedAt: time.Now(),
			}

			// Insert test ride
			collection := config.GetCollection("rides")
			_, err := collection.InsertOne(context.TODO(), testRide)
			assert.NoError(t, err)
			defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

			// Create request
			req, _ := http.NewRequest("GET", "/rides/book?ride_id="+rideID.Hex(), nil)
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// Assertions - should get bad request due to ride status
			assert.Equal(t, http.StatusBadRequest, w.Code, "Should not allow booking ride with status "+string(status))

			// Verify ride was not changed in the database
			var unchangedRide models.Ride
			err = collection.FindOne(context.TODO(), bson.M{"_id": rideID}).Decode(&unchangedRide)
			assert.NoError(t, err)

			// Status and seats should remain unchanged
			assert.Equal(t, status, unchangedRide.Status)
			assert.Equal(t, 2, unchangedRide.Seats)

			// Passenger list should be empty
			assert.Empty(t, unchangedRide.PassengerIDs)
		}
	})

	// Test case: no seats available
	t.Run("No seats available", func(t *testing.T) {
		// Create a test ride with 0 seats
		rideID := primitive.NewObjectID()
		testRide := models.Ride{
			ID:        rideID,
			DriverID:  primitive.NewObjectID(),
			Status:    models.StatusOpen,
			Seats:     0,
			CreatedAt: time.Now(),
		}

		// Insert test ride
		collection := config.GetCollection("rides")
		_, err := collection.InsertOne(context.TODO(), testRide)
		assert.NoError(t, err)
		defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

		// Create request
		req, _ := http.NewRequest("GET", "/rides/book?ride_id="+rideID.Hex(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions - should get bad request due to no seats
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test case: already a passenger
	t.Run("Already a passenger", func(t *testing.T) {
		// Convert mockUserID to ObjectID
		userObjectID, err := primitive.ObjectIDFromHex(mockUserID)
		assert.NoError(t, err)

		// Create a test ride where user is already a passenger
		rideID := primitive.NewObjectID()
		testRide := models.Ride{
			ID:           rideID,
			DriverID:     primitive.NewObjectID(),
			Status:       models.StatusOpen,
			Seats:        2,
			PassengerIDs: []primitive.ObjectID{userObjectID}, // User already a passenger
			CreatedAt:    time.Now(),
		}

		// Insert test ride
		collection := config.GetCollection("rides")
		_, err = collection.InsertOne(context.TODO(), testRide)
		assert.NoError(t, err)
		defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

		// Create request
		req, _ := http.NewRequest("GET", "/rides/book?ride_id="+rideID.Hex(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions - should get conflict status
		assert.Equal(t, http.StatusConflict, w.Code)
	})

	// Test case: invalid ride ID
	t.Run("Invalid ride ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/rides/book?ride_id=invalid-id", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test case: missing ride ID
	t.Run("Missing ride ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/rides/book", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test case: ride not found
	t.Run("Ride not found", func(t *testing.T) {
		nonExistentRideID := primitive.NewObjectID().Hex()
		req, _ := http.NewRequest("GET", "/rides/book?ride_id="+nonExistentRideID, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusNotFound, w.Code)
	})
}
