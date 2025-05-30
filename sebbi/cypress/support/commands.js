// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom commands para la aplicación Sebbi

// Comando para login de usuario
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
    cy.visit('/sign-in')
    cy.get('[data-testid="email-input"]', { timeout: 10000 }).type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="login-button"]').click()
    cy.url().should('include', '/dashboard')
})

// Comando para registro de usuario
Cypress.Commands.add('signup', (email = 'newuser@example.com', password = 'password123') => {
    cy.visit('/sign-up')
    cy.get('[data-testid="email-input"]').type(email)
    cy.get('[data-testid="password-input"]').type(password)
    cy.get('[data-testid="confirm-password-input"]').type(password)
    cy.get('[data-testid="signup-button"]').click()
})

// Comando para crear un nuevo documento
Cypress.Commands.add('createDocument', (title = 'Nuevo Documento') => {
    cy.get('[data-testid="new-document-button"]').click()
    cy.get('[data-testid="document-title-input"]').type(title)
    cy.get('[data-testid="create-document-confirm"]').click()
})

// Comando para abrir la librería
Cypress.Commands.add('openLibrary', () => {
    cy.get('[data-testid="library-toggle"]').click()
    cy.get('[data-testid="library-sidebar"]').should('be.visible')
})

// Comando para abrir el chat AI
Cypress.Commands.add('openAIChat', () => {
    cy.get('[data-testid="ai-chat-toggle"]').click()
    cy.get('[data-testid="ai-chat-interface"]').should('be.visible')
})

// Comando para escribir en el editor
Cypress.Commands.add('typeInEditor', (text) => {
    cy.get('[data-testid="editor-content"]').click()
    cy.get('[data-testid="editor-content"]').type(text)
})

// Comando para esperar que cargue la página completamente
Cypress.Commands.add('waitForPageLoad', () => {
    cy.get('body').should('be.visible')
    cy.window().its('document.readyState').should('equal', 'complete')
})

// Comando para tomar screenshot con nombre específico
Cypress.Commands.add('takeScreenshot', (name) => {
    cy.screenshot(name, { capture: 'fullPage' })
})

// Comando para verificar responsive design
Cypress.Commands.add('checkResponsive', () => {
    // Desktop
    cy.viewport(1280, 720)
    cy.wait(500)

    // Tablet
    cy.viewport(768, 1024)
    cy.wait(500)

    // Mobile
    cy.viewport(375, 667)
    cy.wait(500)

    // Volver a desktop
    cy.viewport(1280, 720)
})

// Comando para simular drag and drop
Cypress.Commands.add('dragAndDrop', (source, target) => {
    cy.get(source).trigger('mousedown', { button: 0 })
    cy.get(target).trigger('mousemove').trigger('mouseup')
})

// Comando para verificar accesibilidad básica
Cypress.Commands.add('checkA11y', () => {
    // Verificar que existan elementos de navegación principales
    cy.get('main').should('exist')
    cy.get('nav').should('exist')

    // Verificar que los botones tengan texto o aria-label
    cy.get('button').each(($btn) => {
        cy.wrap($btn).should('satisfy', ($el) => {
            return $el.text().trim() !== '' || $el.attr('aria-label') !== undefined
        })
    })
})

// Comando para limpiar localStorage
Cypress.Commands.add('clearLocalStorage', () => {
    cy.window().then((win) => {
        win.localStorage.clear()
    })
})

// Comando para intercept API calls con datos mock
Cypress.Commands.add('mockApiCalls', () => {
    cy.intercept('GET', '/api/documents', { fixture: 'documents.json' }).as('getDocuments')
    cy.intercept('POST', '/api/documents', { fixture: 'new-document.json' }).as('createDocument')
    cy.intercept('PUT', '/api/documents/*', { fixture: 'updated-document.json' }).as('updateDocument')
    cy.intercept('DELETE', '/api/documents/*', { statusCode: 204 }).as('deleteDocument')
})

// Sobrescribir comando visit para agregar configuración común
Cypress.Commands.overwrite('visit', (originalFn, url, options) => {
    const defaultOptions = {
        failOnStatusCode: false,
        timeout: 30000
    }

    return originalFn(url, { ...defaultOptions, ...options })
}) 