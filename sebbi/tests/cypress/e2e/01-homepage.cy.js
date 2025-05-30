describe('Página Principal', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.waitForPageLoad()
    })

    it('debe cargar correctamente y mostrar elementos principales', () => {
        // Verificar que la página carga
        cy.get('body').should('be.visible')

        // Verificar logo de Next.js
        cy.get('img[alt="Next.js logo"]').should('be.visible')

        // Verificar botón START HERE
        cy.get('a').contains('START HERE').should('be.visible')
        cy.get('a').contains('START HERE').should('have.attr', 'href', '/sign-up')

        // Verificar enlace de documentación
        cy.get('a').contains('Read our docs').should('be.visible')
        cy.get('a').contains('Read our docs').should('have.attr', 'target', '_blank')
    })

    it('debe navegarse al registro cuando se hace click en START HERE', () => {
        cy.get('a').contains('START HERE').click()
        cy.url().should('include', '/sign-up')
    })

    it('debe abrir la documentación en nueva pestaña', () => {
        cy.get('a').contains('Read our docs')
            .should('have.attr', 'href')
            .and('include', 'nextjs.org')
            .and('include', 'docs')
    })

    it('debe mostrar las instrucciones de inicio', () => {
        cy.contains('Get started by editing').should('be.visible')
        cy.contains('src/app/page.js').should('be.visible')
        cy.contains('Save and see your changes instantly').should('be.visible')
    })

    it('debe tener un diseño responsive', () => {
        cy.checkResponsive()

        // Verificar que los elementos principales siguen siendo visibles
        cy.get('img[alt="Next.js logo"]').should('be.visible')
        cy.get('a').contains('START HERE').should('be.visible')
    })

    it('debe tener la estructura semántica correcta', () => {
        cy.get('main').should('exist')
        cy.get('footer').should('exist')

        // Verificar que hay una lista ordenada
        cy.get('ol').should('exist')
        cy.get('ol li').should('have.length.at.least', 2)
    })

    it('debe cargar sin errores de consola críticos', () => {
        cy.window().then((win) => {
            cy.stub(win.console, 'error').as('consoleError')
        })

        cy.reload()
        cy.get('@consoleError').should('not.have.been.called')
    })

    it('debe mostrar el footer con enlaces', () => {
        cy.get('footer').should('be.visible')
        cy.get('footer a').should('have.length.at.least', 1)

        // Verificar enlace Learn
        cy.get('footer a').contains(/learn/i).should('be.visible')
    })

    it('debe mantener el foco accesible', () => {
        // Navegar con Tab
        cy.get('body').tab()
        cy.focused().should('be.visible')

        // Verificar que se puede navegar a los enlaces principales
        cy.get('a').contains('START HERE').focus()
        cy.focused().should('contain', 'START HERE')
    })

    it('debe tomar screenshot para comparación visual', () => {
        cy.takeScreenshot('homepage-full')

        // Screenshot en mobile
        cy.viewport(375, 667)
        cy.takeScreenshot('homepage-mobile')
    })
})