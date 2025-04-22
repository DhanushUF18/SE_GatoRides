describe('Login and HomeRides Component', () => {
  beforeEach(() => {
    // Clear local storage before each test
    cy.clearLocalStorage();
  });

  describe('Login Tests', () => {
    it('should allow a user to log in', () => {
      cy.visit('http://localhost:3000/login'); // Visit the login page
      cy.get('input[name="email"]').type('r60y739794@tidissajiiu.com'); // Type email
      cy.get('input[name="password"]').type('asdf'); // Type password
      cy.get('button[type="submit"]').click(); // Click login button
    });
  });

  describe('HomeRides Component', () => {
    beforeEach(() => {
      // Mock the JWT token
      // const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMTIzNCJ9.some_signature';
      // localStorage.setItem('authTokens', JSON.stringify({ token: fakeToken }));
      cy.visit('http://localhost:3000/login'); // Visit the login page
      cy.get('input[name="email"]').type('r60y739794@tidissajiiu.com'); // Type email
      cy.get('input[name="password"]').type('asdf'); // Type password
      cy.get('button[type="submit"]').click(); // Click login button
      cy.url().should('include', '/');
      cy.wait(2000);  // Wait for a couple of seconds after login
      // Intercept the API calls
      cy.intercept('GET', 'http://localhost:5001/home', {
        statusCode: 200,
        body: {
          rides: [
            {
              id: '1',
              pickup: { address: 'SFSU' },
              dropoff: { address: 'Downtown SF' },
              price: 25,
              seats: 3,
              date: '2025-04-20',
              status: 'Available',
              driver_id: '5678',
            },
          ],
        },
      }).as('getRides');

      cy.intercept('POST', 'http://localhost:5001/user/book-ride*', {
        statusCode: 200,
        body: { message: 'Ride booked successfully' },
      }).as('bookRide');

      // Visit the home page
      cy.visit('http://localhost:3000/');
    });

    it('displays available rides', () => {
      cy.wait('@getRides');
      cy.get('.rides-table').should('exist');
      cy.get('tbody tr').should('have.length.at.least', 1);
      cy.contains('SFSU').should('be.visible');
      cy.contains('Downtown SF').should('be.visible');
      cy.contains('$25').should('be.visible');
    });

    it('shows booking option when ride is clicked', () => {
      cy.wait('@getRides');
      cy.get('tbody tr').first().click();
      cy.contains('Book This Ride').should('be.visible');
    });

    it('can book a ride successfully', () => {
      cy.wait('@getRides');
      cy.get('tbody tr').first().click();
      cy.contains('Book This Ride').click();
      cy.wait('@bookRide');
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Ride booked successfully!');
      });
    });

    it('handles no available rides', () => {
      cy.intercept('GET', 'http://localhost:5001/home', {
        statusCode: 200,
        body: { rides: [] },
      }).as('getEmptyRides');

      cy.visit('http://localhost:3000/');
      cy.wait('@getEmptyRides');
      cy.contains('No rides available.').should('be.visible');
    });

    // it('handles unauthorized access', () => {
    //   localStorage.removeItem('authTokens');
    //   cy.visit('http://localhost:3000/');
    //   cy.contains('Authorization token is missing.').should('be.visible');
    // });
  });
});