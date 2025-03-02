package controllers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"backend/config"
	"backend/models"
	"backend/utils"

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
	err = collection.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existingUser)
	emailExists := err == nil // If no error, email already exists

	err = collection.FindOne(context.TODO(), bson.M{"username": user.Username}).Decode(&existingUser)
	usernameExists := err == nil // If no error, username already exists

	// Return precise error messages
	if emailExists && usernameExists {
		http.Error(w, "Email and Username already exist", http.StatusConflict)
		return
	} else if emailExists {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	} else if usernameExists {
		http.Error(w, "Username already exists", http.StatusConflict)
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
	log.Println("Received email verification request.")

	// Extract token from query params
	token := r.URL.Query().Get("token")
	if token == "" {
		log.Println("Error: Missing verification token in request.")
		http.Error(w, "Missing verification token", http.StatusBadRequest)
		return
	}
	log.Println("Verification token received:", token)

	// Verify token and extract email
	email, err := utils.VerifyToken(token)
	if err != nil {
		log.Println("Error verifying token:", err)
		http.Error(w, "Invalid or expired token", http.StatusBadRequest)
		return
	}
	log.Println("Token successfully verified. Email:", email)

	// Get the users collection
	collection := config.GetCollection("users")

	// Find user by email
	var user bson.M
	err = collection.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		log.Println("Error: No user found with the given email:", email, err)
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	log.Println("User found in database:", user)

	// Check if the user is already verified
	if user["is_verified"] == true {
		log.Println("User already verified:", email)
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Email already verified."})
		return
	}

	// Update user verification status
	updateResult, err := collection.UpdateOne(context.TODO(), bson.M{"email": email}, bson.M{"$set": bson.M{"is_verified": true}})
	if err != nil {
		log.Println("Error updating user verification status:", err)
		http.Error(w, "Error verifying email", http.StatusInternalServerError)
		return
	}

	// Log update result
	log.Println("Update Result:", updateResult)

	// Send successful response
	log.Println("Email successfully verified for:", email)
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
	json.NewEncoder(w).Encode(map[string]string{"token": token})
}
