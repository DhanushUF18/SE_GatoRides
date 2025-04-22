package controllers_test

import (
	"backend/config"
	"backend/controllers"
	"backend/models"
	"backend/utils"
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestLogin(t *testing.T) {
	// Setup
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/login", controllers.Login)

	// Test case 1: Successful login
	t.Run("Successful login", func(t *testing.T) {
		// Create a test user
		testUser := models.User{
			Username:   "shahid_43",
			Email:      "shahidshareef4353@gmail.com",
			Password:   "Password",
			IsVerified: true,
		}

		// Clean up before and after test
		cleanupTestUser(t, testUser.Email, testUser.Username)
		defer cleanupTestUser(t, testUser.Email, testUser.Username)
		cleanupUserSessions(t, testUser.ID.Hex())

		// Insert test user into DB
		collection := config.GetCollection("users")
		hashedPassword, _ := utils.HashPassword(testUser.Password)
		testUser.Password = hashedPassword
		testUser.ID = primitive.NewObjectID()
		_, err := collection.InsertOne(context.TODO(), testUser)
		assert.NoError(t, err)

		// Create login request
		loginData := map[string]string{
			"email":    testUser.Email,
			"password": "Password",
		}

		jsonData, _ := json.Marshal(loginData)
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusOK, w.Code)

		var response map[string]interface{}
		err = json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)

		token, exists := response["token"]
		fmt.Println("Token:", token)
		assert.True(t, exists)

	})

	t.Run("Login with incorrect password", func(t *testing.T) {
		// Create a test user
		testUser := models.User{
			Username:   "shahid_wrongpass",
			Email:      "wrongpass@test.com",
			Password:   "CorrectPassword",
			IsVerified: true,
		}

		// Clean up before and after test
		cleanupTestUser(t, testUser.Email, testUser.Username)
		defer cleanupTestUser(t, testUser.Email, testUser.Username)
		cleanupUserSessions(t, testUser.ID.Hex())

		// Insert test user into DB
		collection := config.GetCollection("users")
		hashedPassword, _ := utils.HashPassword(testUser.Password)
		testUser.Password = hashedPassword
		testUser.ID = primitive.NewObjectID()
		_, err := collection.InsertOne(context.TODO(), testUser)
		assert.NoError(t, err)

		// Create login request with incorrect password
		loginData := map[string]string{
			"email":    testUser.Email,
			"password": "WrongPassword",
		}

		jsonData, _ := json.Marshal(loginData)
		req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(jsonData))
		req.Header.Set("Content-Type", "application/json")

		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// Assertions
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
