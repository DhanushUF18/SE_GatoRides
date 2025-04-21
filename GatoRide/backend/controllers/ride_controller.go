package controllers

import (
	"backend/config"
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// UpdateUserLocation updates the last known location of a user
func UpdateUserLocation(c *gin.Context) {
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Convert userID from string to ObjectID
	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID format"})
		return
	}

	var location models.Location
	if err := c.ShouldBindJSON(&location); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid location data"})
		return
	}

	collection := config.GetCollection("users")
	filter := bson.M{"_id": userID}
	update := bson.M{"$set": bson.M{"location": location}}

	result, err := collection.UpdateOne(context.TODO(), filter, update)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update location"})
		return
	}

	// Debugging: Check if the update was acknowledged
	if result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Location updated successfully"})
}

func ProvideRide(c *gin.Context) {
	// Extract userID from context
	userIDStr, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Convert userID to ObjectID
	userID, err := primitive.ObjectIDFromHex(userIDStr.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	// Define a struct to decode only the fields we expect
	type RideRequest struct {
		Pickup  models.Location `json:"pickup"`
		Dropoff models.Location `json:"dropoff"`
		Price   float64         `json:"price"`
		Seats   int             `json:"seats"`
		Date    time.Time       `json:"date"`
	}

	var rideReq RideRequest
	if err := c.ShouldBindJSON(&rideReq); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ride data", "details": err.Error()})
		return
	}

	// Validate required fields
	if rideReq.Pickup.Latitude == 0 || rideReq.Pickup.Longitude == 0 || rideReq.Dropoff.Latitude == 0 || rideReq.Dropoff.Longitude == 0 || rideReq.Price <= 0 || rideReq.Seats <= 0 || rideReq.Date.IsZero() {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pickup/dropoff location, price, seats, or date"})
		return
	}

	// Create ride object
	ride := models.Ride{
		ID:           primitive.NewObjectID(),
		DriverID:     userID,
		Pickup:       rideReq.Pickup,
		Dropoff:      rideReq.Dropoff,
		Status:       models.StatusOpen,
		Price:        rideReq.Price,
		Seats:        rideReq.Seats,
		Date:         rideReq.Date,
		CreatedAt:    time.Now(),
		PassengerIDs: []primitive.ObjectID{},
	}

	// Get MongoDB collection
	collection := config.GetCollection("rides")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// **🔹 Check for existing ride**
	filter := bson.M{
		"driver_id":         userID,
		"pickup.latitude":   ride.Pickup.Latitude,
		"pickup.longitude":  ride.Pickup.Longitude,
		"dropoff.latitude":  ride.Dropoff.Latitude,
		"dropoff.longitude": ride.Dropoff.Longitude,
		"status":            "open", // Only prevent duplicate if ride is still open
		"date": bson.M{
			"$eq": ride.Date,
		},
	}
	existingRide := models.Ride{}
	err = collection.FindOne(ctx, filter).Decode(&existingRide)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "A similar ride already exists"})
		return
	}

	// Insert ride into database
	_, err = collection.InsertOne(ctx, ride)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to provide ride", "details": err.Error()})
		return
	}

	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message": "Ride provided successfully",
		"ride_id": ride.ID.Hex(),
	})
}
