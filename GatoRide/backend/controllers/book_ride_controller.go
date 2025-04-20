// book_ride_controller.go

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

// BookRide - Request a ride directly without requiring driver confirmation
func BookRide(c *gin.Context) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	rideID := c.Query("ride_id")
	if rideID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing ride ID"})
		return
	}

	rideObjectID, err := primitive.ObjectIDFromHex(rideID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride ID"})
		return
	}

	rideCollection := config.GetCollection("rides")
	var ride models.Ride
	err = rideCollection.FindOne(context.TODO(), bson.M{"_id": rideObjectID}).Decode(&ride)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ride not found"})
		return
	}

	// Check if ride status is open
	if ride.Status != models.StatusOpen {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf("Cannot book a ride with status '%s'. Only 'open' rides can be booked", ride.Status),
		})
		return
	}

	// Check if there are enough seats available
	if ride.Seats <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No seats available"})
		return
	}

	// Convert user ID to ObjectID
	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	// Check if user is already a passenger on this ride
	for _, passengerID := range ride.PassengerIDs {
		if passengerID == userID {
			c.JSON(http.StatusConflict, gin.H{"error": "You have already booked this ride"})
			return
		}
	}

	// Update ride: decrease available seats and add passenger
	update := bson.M{
		"$inc":  bson.M{"seats": -1},
		"$push": bson.M{"passenger_ids": userID},
	}

	// If no seats remain after booking, update status to "booked"
	if ride.Seats == 1 {
		update["$set"] = bson.M{"status": models.StatusBooked}
	}

	_, err = rideCollection.UpdateOne(context.TODO(), bson.M{"_id": rideObjectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book ride"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ride booked successfully"})
}
