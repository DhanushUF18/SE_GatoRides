package controllers

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/go-auth/config"
	"github.com/go-auth/models"
	"github.com/go-auth/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Signup with Email Verification
func Signup(w http.ResponseWriter, r *http.Request) {
	var user models.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	collection := config.GetCollection("users")

	// Check if email or username already exists
	var existingUser models.User
	err = collection.FindOne(context.TODO(), bson.M{"$or": []bson.M{{"email": user.Email}, {"username": user.Username}}}).Decode(&existingUser)
	if err == nil {
		http.Error(w, "Email or Username already exists", http.StatusConflict)
		return
	}

	// Hash password
	hashedPassword, _ := utils.HashPassword(user.Password)
	user.Password = hashedPassword
	user.ID = primitive.NewObjectID()
	user.IsVerified = false

	// Generate verification token
	verificationToken, _ := utils.GenerateVerificationToken(user.Email)
	user.VerificationToken = verificationToken

	// Insert user into DB
	_, err = collection.InsertOne(context.TODO(), user)
	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	// Send verification email
	err = utils.SendVerificationEmail(user.Email, verificationToken)
	if err != nil {
		http.Error(w, "Failed to send verification email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "User created. Verify your email."})
}

// Verify Email
func VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")

	email, err := utils.VerifyToken(token)
	if err != nil {
		http.Error(w, "Invalid or expired token", http.StatusBadRequest)
		return
	}

	collection := config.GetCollection("users")

	_, err = collection.UpdateOne(context.TODO(), bson.M{"email": email}, bson.M{"$set": bson.M{"is_verified": true}})
	if err != nil {
		http.Error(w, "Error verifying email", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Email verified successfully."})
}

// Login User
func Login(w http.ResponseWriter, r *http.Request) {
	var creds models.User
	err := json.NewDecoder(r.Body).Decode(&creds)
	if err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	collection := config.GetCollection("users")
	var user models.User

	// Check if user exists
	err = collection.FindOne(context.TODO(), bson.M{"email": creds.Email}).Decode(&user)
	if err != nil {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Check password
	if !utils.CheckPasswordHash(creds.Password, user.Password) {
		http.Error(w, "Invalid email or password", http.StatusUnauthorized)
		return
	}

	// Check if user is verified
	if !user.IsVerified {
		http.Error(w, "Please verify your email before logging in.", http.StatusUnauthorized)
		return
	}

	// Generate JWT token for authentication
	token, _ := utils.GenerateJWT(user.Username)

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}