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

func TestCancelRide(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()

	// Add mock authentication middleware
	router.GET("/rides/cancel", func(c *gin.Context) {
		// Mock the auth middleware by setting userID
		c.Set("userID", mockUserID)
		controllers.CancelRide(c)
	})

	// Test case: successful ride cancellation
	t.Run("Successful ride cancellation", func(t *testing.T) {
		// Convert mockUserID to ObjectID
		userObjectID, err := primitive.ObjectIDFromHex(mockUserID)
		assert.NoError(t, err)

		// Create a test ride with the user as the driver
		rideID := primitive.NewObjectID()
		testRide := models.Ride{
			ID:        rideID,
			DriverID:  userObjectID, // User is the driver
			Status:    models.StatusOpen,
			Seats:     2,
			CreatedAt: time.Now(),
		}

		// Insert test ride
		collection := config.GetCollection("rides")
		_, err = collection.InsertOne(context.TODO(), testRide)
		assert.NoError(t, err)
		defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

		// Create request
		req, _ := http.NewRequest("GET", "/rides/cancel?ride_id="+rideID.Hex(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusOK, w.Code)

		// Verify ride status was updated in the database
		var updatedRide models.Ride
		err = collection.FindOne(context.TODO(), bson.M{"_id": rideID}).Decode(&updatedRide)
		assert.NoError(t, err)

		// Check that status is now cancelled
		assert.Equal(t, models.StatusCancelled, updatedRide.Status)
	})

	// Test case: user not the driver
	t.Run("User not the driver", func(t *testing.T) {
		// Create a test ride with a different driver
		rideID := primitive.NewObjectID()
		testRide := models.Ride{
			ID:        rideID,
			DriverID:  primitive.NewObjectID(), // Some other driver
			Status:    models.StatusOpen,
			Seats:     2,
			CreatedAt: time.Now(),
		}

		// Insert test ride
		collection := config.GetCollection("rides")
		_, err := collection.InsertOne(context.TODO(), testRide)
		assert.NoError(t, err)
		defer collection.DeleteOne(context.TODO(), bson.M{"_id": rideID})

		// Create request
		req, _ := http.NewRequest("GET", "/rides/cancel?ride_id="+rideID.Hex(), nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions - should get forbidden status
		assert.Equal(t, http.StatusForbidden, w.Code)
	})

	// Test case: ride not found
	t.Run("Ride not found", func(t *testing.T) {
		nonExistentRideID := primitive.NewObjectID().Hex()
		req, _ := http.NewRequest("GET", "/rides/cancel?ride_id="+nonExistentRideID, nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusNotFound, w.Code)
	})

	// Test case: invalid ride ID
	t.Run("Invalid ride ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/rides/cancel?ride_id=invalid-id", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

	// Test case: missing ride ID
	t.Run("Missing ride ID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/rides/cancel", nil)
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusBadRequest, w.Code)
	})

}
