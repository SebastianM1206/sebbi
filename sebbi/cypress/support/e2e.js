// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Configure Cypress
Cypress.on('uncaught:exception', (err, runnable) => {
    // Returning false here prevents Cypress from failing the test on uncaught exceptions
    if (err.message.includes('ResizeObserver loop limit exceeded')) {
        return false
    }
    return true
})

// Configuración global para pruebas
beforeEach(() => {
    // Configurar viewport por defecto
    cy.viewport(1280, 720)

    // Interceptar requests comunes que podrían fallar en testing
    cy.intercept('GET', '**/api/**', { fixture: 'api-response.json' }).as('apiCall')
})

// Custom assertions
chai.use((chai, utils) => {
    chai.Assertion.addMethod('beVisible', function () {
        const obj = this._obj

        new chai.Assertion(obj).to.be.visible
        new chai.Assertion(obj).to.not.be.hidden
    })
}) 