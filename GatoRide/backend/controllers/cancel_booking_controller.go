// cancel_booking_controller.go

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

// CancelBooking - Allows a passenger to cancel their booking on a ride
func CancelBooking(c *gin.Context) {
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

	// Find the ride first to verify it exists and the user is a passenger
	var ride models.Ride
	err = rideCollection.FindOne(context.TODO(), bson.M{
		"_id": rideObjectID,
	}).Decode(&ride)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Check if ride status allows cancellation (only open or booked)
	if ride.Status != models.StatusOpen && ride.Status != models.StatusBooked {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Cannot cancel booking for a ride with status '%s'. Only 'open' or 'booked' rides can be canceled", ride.Status),
		})
		return
	}

	// Check if user is a passenger on this ride
	isPassenger := false
	for _, passengerID := range ride.PassengerIDs {
		if passengerID == userObjectID {
			isPassenger = true
			break
		}
	}

	if !isPassenger {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not a passenger on this ride"})
		return
	}

	// Update the ride: remove passenger and increase available seats
	updateResult, err := rideCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": rideObjectID},
		bson.M{
			"$pull": bson.M{"passenger_ids": userObjectID},
			"$inc":  bson.M{"seats": 1},
		},
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to cancel booking"})
		return
	}

	if updateResult.ModifiedCount == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update ride"})
		return
	}

	fmt.Println("Booking canceled successfully for user:", userIDStr)
	c.JSON(http.StatusOK, gin.H{"message": "Your booking has been canceled successfully"})
}
