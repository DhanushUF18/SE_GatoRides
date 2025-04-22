package middlewares

import (
	"bytes"
	"io"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func RequestResponseLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		reqBody, _ := io.ReadAll(c.Request.Body)
		c.Request.Body = io.NopCloser(bytes.NewBuffer(reqBody))

		respBody := &bytes.Buffer{}
		writer := &responseLogger{body: respBody, ResponseWriter: c.Writer}
		c.Writer = writer
		c.Next()
		log.Printf("➡️ %s %s\nHeaders: %v\nRequest: %s\n⬅️ Status: %d | Duration: %v\nResponse: %s\n",
			c.Request.Method,
			c.Request.URL.Path,
			c.Request.Header,
			string(reqBody),
			writer.status,
			time.Since(start),
			respBody.String(),
		)
	}
}

type responseLogger struct {
	gin.ResponseWriter
	body   *bytes.Buffer
	status int
}

func (r *responseLogger) Write(b []byte) (int, error) {
	r.body.Write(b)
	return r.ResponseWriter.Write(b)
}

func (r *responseLogger) WriteHeader(statusCode int) {
	r.status = statusCode
	r.ResponseWriter.WriteHeader(statusCode)
}
