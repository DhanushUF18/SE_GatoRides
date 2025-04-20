// cancel_ride_controller.go

package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// CancelRide - Allows a driver to cancel a ride they've offered
func CancelRide(c *gin.Context) {
	// Extract userID from context (set by auth middleware)
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get ride ID from query parameter
	rideID := c.Query("ride_id")
	if rideID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing ride ID"})
		return
	}

	// Convert string IDs to ObjectIDs
	rideObjectID, err := primitive.ObjectIDFromHex(rideID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID format"})
		return
	}

	userObjectID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Get the rides collection
	rideCollection := config.GetCollection("rides")

	// Find the ride first to verify it exists and the user is the driver
	var ride models.Ride
	err = rideCollection.FindOne(context.TODO(), bson.M{
		"_id": rideObjectID,
	}).Decode(&ride)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Check if user is the driver of this ride
	if ride.DriverID != userObjectID {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not the driver of this ride"})
		return
	}

	// Update the ride status to cancelled
	updateResult, err := rideCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": rideObjectID},
		bson.M{"$set": bson.M{"status": models.StatusCancelled}},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel ride"})
		return
	}

	if updateResult.ModifiedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride status"})
		return
	}

	fmt.Println("Ride canceled successfully by driver:", userIDStr)
	c.JSON(http.StatusOK, gin.H{"message": "Your ride has been canceled successfully"})
}
