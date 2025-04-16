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
