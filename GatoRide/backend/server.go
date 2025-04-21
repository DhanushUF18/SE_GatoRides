package main

import (
	"backend/config"
	"backend/routes"
	"backend/utils"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/handlers"
)

func main() {
	config.ConnectDB()
	router := routes.SetupRoutes()
	utils.StartCleanupScheduler()

	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"http://localhost:3000"}),                   // Allow frontend
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}), // Allow methods
		handlers.AllowedHeaders([]string{"Content-Type", "Authorization"}),           // Allow headers
	)
	fmt.Println("Server running on port", port)
	fmt.Println("http://localhost:5001")
	log.Fatal(http.ListenAndServe(":"+port, corsHandler(router)))

}
