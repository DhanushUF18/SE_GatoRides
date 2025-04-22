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
            address: 'Tampa, United States'
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
            address: 'Tampa, United States'
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
    cy.contains('Location: Tampa, United States');
  });

  it('allows updating profile information', () => {
    cy.wait('@getProfile');
    
    // Click update profile button
    cy.contains('Update Profile').click();

    // Fill in new information
    cy.get('input[name="name"]').clear().type('Updated User');
    cy.get('input[name="username"]').clear().type('updateduser');

    // Handle location update with dropdown
    // cy.get('input[name="address"]').type('New York, United States');
    // cy.wait(1000); // Wait for API response
    // cy.get('.dropdown-menu').should('be.visible');

    // Mock address suggestions API
    // cy.intercept('GET', 'https://photon.komoot.io/api/*', {
    //   statusCode: 200,
    //   body: {
    //     features: [{
    //       geometry: {
    //         coordinates: [10.0, 20.0]
    //       },
    //       properties: {
    //         name: 'Tampa',
    //         //country: 'United States'
    //       }
    //     }]
    //   }
    // }).as('getAddressSuggestions');

    // // Wait for suggestions and select one
    // cy.wait('@getAddressSuggestions');
    cy.get('input[name="address"]').clear().type('Orlando International Airport');
      cy.wait(15000);
      cy.get('.dropdown-menu').should('be.visible');
      cy.get('.dropdown-item').first().click();
      cy.get('input[name="address"]').should('not.have.value', '');
    // Click the first suggestion and wait for input to be updated
    // cy.get('.dropdown-item')
    //   .first()
    //   .click();
    //   cy.wait(10000);
    // // Wait for the input to be updated with the selected value
    // cy.get('input[name="address"]')
    //   .should('not.have.value')
    //   // Add a blur event to close the dropdown
    //   // .blur();
      
    // Submit form after ensuring dropdown is handled
    cy.get('button[type="submit"]')
      // .should('be.visible')
      .click({ timeout: 10000 });

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

  it('automatically selects first address suggestion from dropdown', () => {
    cy.wait('@getProfile');
    
    // Click update profile button
    cy.contains('Update Profile').click();

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
            country: 'United States'
          }
        }]
      }
    }).as('getAddressSuggestions');

    // Type location and trigger suggestions
    cy.get('input[name="address"]')
      .clear()
      .type('Tampa')
      .should('have.value', 'Tampa');

    // Wait for suggestions to load
    cy.wait('@getAddressSuggestions');

    // Auto-select first suggestion
    cy.get('.dropdown-item')
      .first()
      .should('be.visible')
      .click();

    // Verify selected address
    cy.get('input[name="address"]')
      .should('have.value', 'Tampa, United States');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Wait for update and verify
    cy.wait('@updateProfile');
    cy.contains('Profile updated successfully!');
  });
});