package controllers_test

import (
	"backend/config"
	"backend/models"
	"backend/utils"
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestCleanupOldRides(t *testing.T) {
	collection := config.GetCollection("rides")

	// Insert a test ride scheduled 48 hours in the past
	pastRide := models.Ride{
		ID:        primitive.NewObjectID(),
		DriverID:  primitive.NewObjectID(),
		Pickup:    models.Location{Latitude: 10.0, Longitude: 10.0, Address: "Test From"},
		Dropoff:   models.Location{Latitude: 20.0, Longitude: 20.0, Address: "Test To"},
		Status:    models.StatusOpen,
		Price:     10.0,
		Seats:     2,
		Date:      time.Now().Add(-48 * time.Hour),
		CreatedAt: time.Now().Add(-72 * time.Hour),
	}

	_, err := collection.InsertOne(context.TODO(), pastRide)
	assert.NoError(t, err)

	// Run cleanup
	utils.CleanupOldRides()

	// Fetch the ride again and verify status is now "cancelled"
	var updatedRide models.Ride
	err = collection.FindOne(context.TODO(), bson.M{"_id": pastRide.ID}).Decode(&updatedRide)
	assert.NoError(t, err)
	assert.Equal(t, models.StatusCancelled, updatedRide.Status)

	// Clean up: delete the test ride
	_, _ = collection.DeleteOne(context.TODO(), bson.M{"_id": pastRide.ID})
}
