# **Backend Authentication System - User Stories**


## **User Story 1: User Registration**
**Summary:** Implement user signup with email and password.  
**Acceptance Criteria:**  
- User should be able to send a `POST /signup` request with name, email, username, and password.
- Email and username should be unique.
- Password should be **hashed** before storing.
- User should receive an email verification token after successful registration.

### **Tasks:**
- [x] Create `User` model with `name`, `email`, `username`, `password`, `is_verified`, `verification_token`.
- [x] Implement `POST /signup` endpoint in `auth_controller.go`.
- [x] Hash password using `bcrypt` before storing in the database.
- [x] Ensure unique constraints on `email` and `username`.
- [x] Send verification email with JWT token.

---

## **User Story 2: Email Verification**
**Summary:** Users must verify their email before logging in.  
**Acceptance Criteria:**  
- User receives an email containing a verification link with a JWT token.
- Clicking the link should validate the token and mark the user as verified in the database.
- If the token is expired or invalid, return an appropriate error.

### **Tasks:**
- [x] Generate JWT token for email verification (`GenerateVerificationToken`).
- [x] Implement `GET /verify-email?token=<JWT_TOKEN>` endpoint.
- [x] Update `is_verified` flag to `true` in the database.
- [x] Handle token expiration and invalid cases.
- [x] Log errors for debugging.

---

## **User Story 3: Secure User Login**
**Summary:** Implement user login with JWT authentication.  
**Acceptance Criteria:**  
- User should be able to send a `POST /login` request with email and password.
- System should validate the credentials and return a JWT token.
- If the user is not verified, they should not be allowed to log in.

### **Tasks:**
- [x] Implement `POST /login` endpoint.
- [x] Verify the hashed password using `bcrypt.CompareHashAndPassword`.
- [x] Ensure only verified users can log in (`is_verified: true`).
- [x] Generate a JWT token for authenticated users (`GenerateJWT`).
- [x] Return appropriate error messages if credentials are incorrect or the user is not verified.

---
## **User Story 4: Middleware for Protected Routes**

**Summary**
Users should only access protected routes if they provide a valid JWT token.

**Acceptance Criteria**
- Any protected API should require a valid JWT token in the `Authorization` header.
- If the token is missing or invalid, the request should be denied.

### **Tasks**
- [x] Implement `AuthMiddleware` to validate JWT tokens.
- [x] Parse JWT and extract the user's identity.
- [x] Apply middleware to protected routes like `/profile`, `/rides`, etc.
---

### **Backend Demo Video - [video](https://drive.google.com/drive/folders/1bG-C_ymVRk1-Vz3KoHQRccUUy9I7lS0Z?usp=share_link)**

## **Sprint Goal: successfully implemented**
**successfully implemented the stories 1-3 mentioned above (signup, email verification, login, and JWT-based authentication)**.

## **planned but not implemented**
**user story 4 was not implemented as we later decided that it will be better to implement after the frontend and backend integration**

# **Frontend Authentication Implementation System - User Stories**

## **User Story 1: User Interface Layout**
**Summary:** Implement responsive page layout with navigation and background themes.  
**Acceptance Criteria:**  
- Application should have a consistent navigation bar across all pages
- Each route should have a unique background theme
- Navigation should reflect user authentication state

### **Tasks:**
- [x] Create NavBar component with responsive design
- [x] Implement route-specific background themes
- [x] Set up protected routes for authenticated users
- [x] Add responsive CSS breakpoints
- [x] Implement authentication state context

---

## **User Story 2: Authentication Forms**
**Summary:** Create user-friendly authentication forms with validation.  
**Acceptance Criteria:**  
- User should see clear signup and login forms
- Forms should validate input before submission
- Users should receive feedback on submission status

### **Tasks:**
- [x] Create SignUp component with validation
- [x] Create Login component with validation
- [x] Implement form error handling and display
- [x] Connect forms to backend API endpoints

---

## **User Story 3: User Dashboard**
**Summary:** Implement personalized dashboard for authenticated users.  
**Acceptance Criteria:**  
- User should see their profile information
- Dashboard should display active rides and history
- User should be able to edit their profile
- Dashboard should have quick actions for common tasks

### **Tasks:**
- [x] Create Dashboard component with profile section
- [x] Implement ride history display
- [x] Add profile editing functionality
- [x] Create quick action buttons
- [x] Connect dashboard to backend API endpoints

---

### **Frontend Demo Video - [video](https://drive.google.com/file/d/1MXSEfQ2GfEedOzZUHVvQT9oqCgA0qyr_/view?usp=drive_link)**

## **Sprint Goal:**
**successfully implemented the intuitive, responsive user interface* for GatoRides with *seamless authentication flow, and consistent theme system**

## **Planned but not implemented**
**User story 3 was not completely implemented as the dashboard component was partially written and we plan to display the user information on the dashboard after successful verification in the future sprints**.

## **Issues**

**Issue**: The Routes component requires a BrowserRouter (or HashRouter) to work properly.  
**Solution**: Wrapped the Routes component inside a BrowserRouter in App.js

**Issue**: ReactDOM.render is deprecated in React 18+  
**Solution**: Replaced ReactDOM.render with createRoot from react-dom/client

**Issue**: handleVerifyEmail modifies user, but user might be null initially.  
**Solution**: Ensured user is properly defined before updating.

**Issue**: The service relies entirely on environment variables without fallback values. If .env is misconfigured, requests might fail.  
**Solution**: Added default values.

**Issue**: The verifyEmail function sends the token in a URL query, which could be exposed in logs.  
**Solution**: Used a POST request with the token in the body.

**Issue**: The login function does not store or use authentication tokens for subsequent requests.  
**Solution**: Stored the token in localStorage or a state management system.