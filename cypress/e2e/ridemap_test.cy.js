describe('RideMap Component', () => {
  beforeEach(() => {
    cy.viewport(2160, 1400); // Set the viewport size for consistent testing
    // Visit the login page
    cy.visit('http://localhost:3000/login');

    // Perform login
    cy.get('input[name="email"]').type('r60y739794@tidissajiiu.com'); // Type email
    cy.get('input[name="password"]').type('asdf'); // Type password
    cy.get('button[type="submit"]').click(); // Click login button

    // Wait for the login to complete and navigate to the home page
    cy.url().should('include', '/'); // Ensure the user is redirected to the home page
  });

  it('should display suggestions when typing in the "From" input', () => {
    // Type into the "From" input
    cy.get('#from').type('New York');

    // Mock the API response for location suggestions
    cy.intercept('GET', '**/search?format=json&q=New%20York', {
      statusCode: 200,
      body: [
        {
          lat: '40.712776',
          lon: '-74.005974',
          display_name: 'New York',
        },
        {
          lat: '40.73061',
          lon: '-73.935242',
          display_name: 'Brooklyn',
        },
      ],
    }).as('getFromSuggestions');

    // Wait for the API response and dropdown to appear
    cy.wait(10000);
    cy.get('.dropdown-menu').should('be.visible');
    cy.get('.dropdown-item').should('have.length', 15);

    // Verify the suggestions
    cy.get('.dropdown-item').first().should('contain.text', 'New York, United States');
    //cy.get('.dropdown-item').last().should('contain.text', 'WFAN-FM (New York), West 33rd Street, 10001, New York, United States');
  });

  it('should allow selecting a suggestion for "From" location', () => {
    // Type into the "From" input
    cy.get('#from').type('New York');

    // Mock the API response for location suggestions
    cy.intercept('GET', '**/search?format=json&q=New%20York', {
      statusCode: 200,
      body: [
        {
          lat: '40.712776',
          lon: '-74.005974',
          display_name: 'New York, United States',
        },
      ],
    }).as('getToSuggestions');

    // Wait for the API response and dropdown to appear
    cy.wait(10000);
    cy.get('.dropdown-item').first().click();

    // Verify the input value is updated
    cy.get('#from').should('have.value', 'New York, United States');
  });

  it('should display suggestions when typing in the "To" input', () => {
    // Type into the "To" input
    cy.get('#to').type('Los Angeles');

    // Mock the API response for location suggestions
    cy.intercept('GET', '**/search?format=json&q=Los%20Angeles', {
      statusCode: 200,
      body: [
        {
          lat: '34.052235',
          lon: '-118.243683',
          display_name: 'Los Angeles, United States',
        },
      ],
    }).as('getToSuggestions');

    // Wait for the API response and dropdown to appear
    cy.wait(10000);
    cy.get('.dropdown-menu').should('be.visible');
    cy.get('.dropdown-item').should('have.length', 15);

    // Verify the suggestion
    cy.get('.dropdown-item').first().should('contain.text', 'Los Angeles, United States');
  });

  it('should allow selecting a suggestion for "To" location', () => {
    // Type into the "To" input
    cy.get('#to').type('Los Angeles');

    // Mock the API response for location suggestions
    cy.intercept('GET', '**/search?format=json&q=Los%20Angeles', {
      statusCode: 200,
      body: [
        {
          lat: '34.052235',
          lon: '-118.243683',
          display_name: 'Los Angeles, United States',
        },
      ],
    }).as('getToSuggestions');

    // Wait for the API response and dropdown to appear
    cy.wait(10000);
    cy.get('.dropdown-item').first().click();

    // Verify the input value is updated
    cy.get('#to').should('have.value', 'Los Angeles, United States');
  });

  
  
});