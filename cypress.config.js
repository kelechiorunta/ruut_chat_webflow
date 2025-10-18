import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    pageLoadTimeout: 9000,
    env: {
      WEBFLOW_TEST_EMAIL: 'kelechiorunta1@gmail.com',
      WEBFLOW_TEST_PASSWORD: 'Keleman4xst@kus',
      WEBFLOW_CLIENT_ID: '9089fdfe104ec151afa65f041e4d52712fbf568bf1fb6d55f2e9ef1e939381c7',
      WEBFLOW_CLIENT_SECRET: '91d45be937ca76f10107dc6bc995879822131dcb6faa3b3adc8e72cd6799134a'
    }
  }
});
