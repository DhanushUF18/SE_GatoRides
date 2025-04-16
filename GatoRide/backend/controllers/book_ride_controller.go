package controllers

import (
	"backend/config"
	"backend/models"
	"context"
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

	// Update ride: decrease available seats and add passenger
	update := bson.M{
		"$inc":  bson.M{"seats": -1},
		"$push": bson.M{"passenger_ids": userID},
	}

	_, err = rideCollection.UpdateOne(context.TODO(), bson.M{"_id": rideObjectID}, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book ride"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Ride booked successfully."})
}
