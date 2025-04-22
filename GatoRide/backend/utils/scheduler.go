package utils

import (
	"backend/config"
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

func CleanupOldRides() {
	collection := config.GetCollection("rides")
	now := time.Now()

	filter := bson.M{
		"status": "open",
		"date": bson.M{
			"$lt": now,
		},
	}

	update := bson.M{
		"$set": bson.M{
			"status": "cancelled", // or use a constant like StatusCancelled if you import models
		},
	}

	result, err := collection.UpdateMany(context.TODO(), filter, update)
	if err != nil {
		log.Printf("❌ Failed to cleanup old rides: %v\n", err)
	} else {
		log.Printf("✅ Cleaned up %d expired rides\n", result.ModifiedCount)
	}
}

func StartCleanupScheduler() {
	ticker := time.NewTicker(10 * time.Second)
	go func() {
		for range ticker.C {
			log.Println("🕐 Running scheduled cleanup for expired rides...")
			CleanupOldRides()
		}
	}()
}
