package routes

import (
	"backend/controllers"
	"backend/middlewares"

	"github.com/gin-gonic/gin"
)

func SetupRoutes() *gin.Engine {
	r := gin.Default()

	r.POST("/signup", controllers.Signup)
	r.POST("/login", controllers.Login)
	r.GET("/verify-email", controllers.VerifyEmail)

	protected := r.Group("/")
	protected.Use(middlewares.AuthMiddleware())
	{
		protected.POST("/user/provide-ride", controllers.ProvideRide)
		protected.POST("/user/location", controllers.UpdateUserLocation)
		protected.POST("/user/logout", controllers.LogOut)
		protected.POST("/user/search-ride", controllers.SearchRides)
		protected.POST("/user/book-ride", controllers.BookRide)
		protected.POST("/user/cancel-ride", controllers.CancelBooking)
		protected.POST("/user/cancel-ride", controllers.CancelRide)
		protected.POST("/user/profile", controllers.GetUserProfile)
		protected.POST("/user/update-profile", controllers.UpdateUserProfile)
		protected.POST("/user/rides", controllers.GetUserRides)
		protected.GET("/home", controllers.HomeHandler)

		// protected.GET("/rides/feed", controllers.FetchRideFeed)

	}

	return r
}
