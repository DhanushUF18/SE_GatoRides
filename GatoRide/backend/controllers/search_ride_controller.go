package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"math"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

const maxDistance = 0.05 // roughly ~5km range for latitude/longitude

type SearchRideRequest struct {
	From  models.Location `json:"from" binding:"required"`
	To    models.Location `json:"to" binding:"required"`
	Date  string          `json:"date" binding:"required"`  // "YYYY-MM-DD"
	Seats int             `json:"seats" binding:"required"` // required number of seats
}

func isNearby(loc1, loc2 models.Location) bool {
	return math.Abs(loc1.Latitude-loc2.Latitude) <= maxDistance &&
		math.Abs(loc1.Longitude-loc2.Longitude) <= maxDistance
}

func SearchRides(c *gin.Context) {
	var req SearchRideRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	// Parse date and get start and end of that day
	date, err := time.Parse("2006-01-02", req.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format. Use YYYY-MM-DD"})
		return
	}
	startOfDay := date
	endOfDay := date.Add(24 * time.Hour)

	collection := config.GetCollection("rides")

	// Fetch all open rides within that day
	filter := bson.M{
		"status": "open",
		"date": bson.M{
			"$gte": startOfDay,
			"$lt":  endOfDay,
		},
		"seats": bson.M{"$gte": req.Seats}, // Only consider rides with enough available seats
	}

	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database query failed"})
		return
	}
	defer cursor.Close(context.TODO())

	var matchingRides []models.Ride
	for cursor.Next(context.TODO()) {
		var ride models.Ride
		if err := cursor.Decode(&ride); err == nil {
			if isNearby(ride.Pickup, req.From) && isNearby(ride.Dropoff, req.To) {
				matchingRides = append(matchingRides, ride)
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"rides": matchingRides})
}
