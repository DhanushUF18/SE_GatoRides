describe('Profile Page', () => {
  beforeEach(() => {
    // Mock user authentication
    cy.viewport(2160, 1400);
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        token: 'fake-token',
        user: {
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          is_verified: true,
          location: {
            address: '123 Test St, Test City'
          }
        }
      }));
    });

    // Mock API responses
    cy.intercept('POST', 'http://localhost:5001/user/profile', {
      statusCode: 200,
      body: {
        user: {
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          is_verified: true,
          location: {
            address: '123 Test St, Test City'
          }
        }
      }
    }).as('getProfile');

    cy.intercept('POST', 'http://localhost:5001/user/update-profile', {
      statusCode: 200,
      body: {
        user: {
          name: 'Updated User',
          username: 'updateduser',
          email: 'test@example.com',
          is_verified: true,
          location: {
            address: 'Tampa, United States'
          }
        }
      }
    }).as('updateProfile');

    // Visit the profile page
    cy.visit('http://localhost:3000/profile');
  });

  it('displays user profile information', () => {
    cy.wait('@getProfile');
    cy.contains('Welcome, Test User!');
    cy.contains('Username: testuser');
    cy.contains('Email: test@example.com');
    cy.contains('Verified: Yes');
    cy.contains('Location: 123 Test St, Test City');
  });

  it('allows updating profile information', () => {
    cy.wait('@getProfile');
    
    // Click update profile button
    cy.contains('Update Profile').click();

    // Fill in new information
    cy.get('input[name="name"]').clear().type('Updated User');
    cy.get('input[name="username"]').clear().type('updateduser');
    cy.get('input[name="address"]').clear().type('Tampa, United States');

    // Mock address suggestions API
    cy.intercept('GET', 'https://photon.komoot.io/api/*', {
      statusCode: 200,
      body: {
        features: [{
          geometry: {
            coordinates: [10.0, 20.0]
          },
          properties: {
            name: 'Tampa',
            // city: 'New City',
            country: 'United States'
          }
        }]
      }
    }).as('getAddressSuggestions');

    // Wait for suggestions and select one
    cy.wait('@getAddressSuggestions');
    cy.get('.dropdown-item').first().click();

    // Submit form
    cy.get('button[type="submit"]').click();

    // Wait for update request
    cy.wait('@updateProfile');

    // Verify success message
    cy.contains('Profile updated successfully!');

    // Verify updated information is displayed
    cy.contains('Welcome, Updated User!');
    cy.contains('Username: updateduser');
  });

  it('handles navigation to rides page', () => {
    cy.wait('@getProfile');
    cy.contains('View Rides').click();
    cy.url().should('include', '/rides');
  });

  // it('handles logout', () => {
  //   cy.wait('@getProfile');
  //   cy.contains('Logout').click();
  //   cy.url().should('eq', Cypress.config().baseUrl + '/');
  // });

  it('handles API errors gracefully', () => {
    // Mock API error
    cy.intercept('POST', 'http://localhost:5001/user/update-profile', {
      statusCode: 400,
      body: {
        message: 'Failed to update profile'
      }
    }).as('updateProfileError');

    cy.wait('@getProfile');
    cy.contains('Update Profile').click();

    // Fill in new information
    cy.get('input[name="name"]').clear().type('Updated User');
    cy.get('button[type="submit"]').click();

    // Verify error message
    cy.contains('Error: Failed to update profile');
  });
});