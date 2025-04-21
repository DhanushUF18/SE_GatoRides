describe('ProvideRide Component', () => {
    beforeEach(() => {
      cy.viewport(2160, 1400);
      cy.visit('http://localhost:3000/login');
    // Perform login
      cy.get('input[name="email"]').type('r60y739794@tidissajiiu.com'); // Type email
      cy.get('input[name="password"]').type('asdf'); // Type password
      cy.get('button[type="submit"]').click(); // Click login button
      cy.url().should('include', '/');
      cy.wait(2000);  // Wait for a couple of seconds after login

      cy.visit('http://localhost:3000/ride-request'); // Update with the correct route
      cy.intercept('GET', 'https://nominatim.openstreetmap.org/search**', { fixture: 'locationSuggestions.json' }).as('getLocationSuggestions');
      cy.intercept('POST', 'http://localhost:5001/user/ride-request', { statusCode: 200, body: { message: 'Ride provided successfully!' } }).as('provideRide');
    });
  
    it('should display the form elements correctly', () => {
      cy.get('h2').should('contain', 'Request a Ride');
      cy.get('input[name="pickup"]').should('exist');
      cy.get('input[name="dropoff"]').should('exist');
      cy.get('input[name="price"]').should('exist');
      cy.get('input[name="date"]').should('exist');
      cy.get('button[type="submit"]').should('contain', 'Provide Ride');
    });
  
    it('should allow users to enter pickup and dropoff locations and fetch suggestions', () => {
      cy.get('input[name="pickup"]').type('Gainesville');
      cy.wait(10000);
      cy.get('.dropdown-menu').should('be.visible');
      cy.get('.dropdown-item').first().click();
      cy.get('input[name="pickup"]').should('not.have.value', '');
  
      cy.get('input[name="dropoff"]').type('Orlando International Airport');
      cy.wait(10000);
      cy.get('.dropdown-menu').should('be.visible');
      cy.get('.dropdown-item').first().click();
      cy.get('input[name="dropoff"]').should('not.have.value', '');
    });
  
    it('should allow users to enter price and date', () => {
      cy.get('input[name="price"]').type('20');
      cy.get('input[name="price"]').should('have.value', '20');
  
      const today = new Date().toISOString().split('T')[0];
      cy.get('input[name="date"]').type(today);
      cy.get('input[name="date"]').should('have.value', today);
    });
  
    it('should submit the ride request successfully', () => {
      cy.get('input[name="pickup"]').type('Gainesville');
      cy.wait(10000);
      cy.get('.dropdown-item').first().click();
  
      cy.get('input[name="dropoff"]').type('Orlando International Airport');
      cy.wait(14000);
      cy.get('.dropdown-item').first().click();
  
      cy.get('input[name="price"]').type('20');
      const today = new Date().toISOString().split('T')[0];
      cy.get('input[name="date"]').type(today);
  
      cy.get('button[type="submit"]').click();
    });
  });
  