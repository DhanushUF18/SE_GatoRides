package models

import (
	"time"

	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID                primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name              string             `bson:"name" json:"name"`
	Email             string             `bson:"email" json:"email"`
	Username          string             `bson:"username" json:"username"`
	Password          string             `bson:"password" json:"password"`
	IsVerified        bool               `bson:"is_verified" json:"is_verified"`
	VerificationToken string             `bson:"verification_token" json:"-"`
	Location          Location           `bson:"location" json:"location"`
}

type RideStatus string

const (
	StatusOpen      RideStatus = "open"      // Ride is available for booking
	StatusBooked    RideStatus = "booked"    // Ride is reserved by a passenger
	StatusOngoing   RideStatus = "ongoing"   // Ride is in progress
	StatusCompleted RideStatus = "completed" // Ride has been completed
	StatusCancelled RideStatus = "cancelled" // Ride was cancelled
)

// Location represents a geographical point
type Location struct {
	Latitude  float64 `bson:"latitude" json:"latitude"`
	Longitude float64 `bson:"longitude" json:"longitude"`
	Address   string  `bson:"address" json:"address"`
}

// Ride represents a ride request
type Ride struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	DriverID     primitive.ObjectID   `bson:"driver_id" json:"driver_id"`
	Pickup       Location             `bson:"pickup" json:"pickup"`
	Dropoff      Location             `bson:"dropoff" json:"dropoff"`
	Status       RideStatus           `bson:"status" json:"status"`
	Price        float64              `bson:"price" json:"price"`
	Seats        int                  `bson:"seats" json:"seats"`
	Date         time.Time            `bson:"date" json:"date"`
	CreatedAt    time.Time            `bson:"created_at" json:"created_at"`
	PassengerIDs []primitive.ObjectID `bson:"passenger_ids,omitempty" json:"passenger_ids,omitempty"`
}

type Session struct {
	UserID    string `json:"user_id"`
	Token     string `json:"token"`
	ExpiresAt int64  `json:"expires_at"`
}

type Claims struct {
	UserID string `json:"user_id"`
	jwt.StandardClaims
}
