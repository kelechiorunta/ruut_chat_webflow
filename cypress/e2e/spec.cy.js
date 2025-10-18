import { WebflowClient } from 'webflow-api';

describe('Ruut Webflow OAuth Test', () => {
  // it('visits the Ruut Login Page', () => {
  //   cy.login('kelechiorunta1@gmail.com', 'Keleman4xst@kus');
  // });

  it('Ruut login test', () => {
    // // Webflow login page
    cy.visit('https://ruut-webflow-oauth.vercel.app');

    cy.url().should('includes', '/login');

    cy.get('input[name=email]').type(Cypress.env('WEBFLOW_TEST_EMAIL'));
    cy.get('input[name=password]').type(Cypress.env('WEBFLOW_TEST_PASSWORD'));
    cy.contains('Login to account').click();
    // cy.getCookie('auth_session').should('exist');

    const authorizeUrl = WebflowClient.authorizeURL({
      clientId: Cypress.env('WEBFLOW_CLIENT_ID'),
      redirectUri: 'https://ruut-webflow-oauth.vercel.app/webflow/oauth/callback',
      scope: 'cms:read cms:write users:read'
    });

    // spy on the Webflow oauth request that passes the scopes, response_type, redirect_uri, scopes, workspaces and client ids as query parameters
    cy.intercept('GET', 'https://webflow.com/oauth/authorize*', {
      statusCode: 302,
      query: {
        response_type: 'code',
        client_id: '9089fdfe104ec151afa65f041e4d52712fbf568bf1fb6d55f2e9ef1e939381c7',
        redirect_uri: 'https://ruut-webflow-oauth.vercel.app/webflow/oauth/callback',
        scope:
          'cms:read cms:write users:read pages:read authorized_user:read workspace:read workspace:write sites:read sites:write custom_code:read site_config:read',
        workspace: 'ruuts-workspace-3b8166'
      },
      headers: {
        'content-type': 'text/html'
      }
    }).as('oauthAuthorize');

    // Trigger the network call (the intercept will catch it)
    cy.visit(authorizeUrl);

    // Wait for Cypress to catch that intercepted request
    cy.wait('@oauthAuthorize').its('response.statusCode').should('eq', 302);

    // Assert that your app handled the redirect properly
    cy.url().should(
      'include',
      '/oauth/authorize?response_type=code&client_id=9089fdfe104ec151afa65f041e4d52712fbf568bf1fb6d55f2e9ef1e939381c7'
    );
  });

  it('exchange code for access token', async () => {
    // Mock the token exchange as well with a mock/fake authorization code(fake-auth-code) for a fake access token as part of the reply/response
    cy.intercept('POST', 'https://webflow.com/webflow/oauth/token', (req) => {
      expect(req.body).to.include(`code=${'fake-auth-code'}`);
      req.reply({
        statusCode: 200,
        body: {
          access_token: 'fake-access-token',
          token_type: 'bearer',
          scope: 'cms:read cms:write users:read'
        }
      });
    }).as('oauthToken');

    // Simulate your frontend making the POST request to exchange the code
    cy.request('POST', 'https://webflow.com/oauth/token', {
      client_id: Cypress.env('WEBFLOW_CLIENT_ID'),
      client_secret: Cypress.env('WEBFLOW_CLIENT_SECRET'),
      redirect_uri: 'https://ruut-webflow-oauth.vercel.app/webflow/oauth/callback',
      code: 'fake-auth-code',
      grant_type: 'authorization_code'
    });

    // Wait for and assert the mocked token response
    cy.wait('@oauthToken').its('response.statusCode').should('eq', 200);

    cy.wait('@oauthToken').its('response.body.access_token').should('eq', 'fake-access-token');
    cy.wait('@oauthToken').its('response.body.token_ype').should('eq', 'bearer');

    cy.getCookie('auth_session').should('exist');
  });
});
