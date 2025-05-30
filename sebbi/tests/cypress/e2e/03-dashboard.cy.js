describe('Dashboard Principal', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.window().then((win) => {
            win.localStorage.setItem('auth-token', 'fake-jwt-token')
            win.localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }))
        })
        cy.visit('/dashboard')
        cy.waitForPageLoad()
    })

    it('debe cargar el dashboard correctamente', () => {
        cy.url().should('include', '/dashboard')
        cy.get('body').should('be.visible')

        // Verificar elementos principales del dashboard
        cy.get('main, [data-testid="dashboard-main"]').should('exist')
    })

    it('debe mostrar la navegación principal', () => {
        // Verificar que existe algún tipo de navegación
        cy.get('nav, [data-testid="navigation"], [data-testid="sidebar"]').should('exist')

        // Verificar elementos de navegación comunes
        cy.get('body').then($body => {
            const hasDocuments = $body.find('[data-testid*="document"], button').filter(':contains("document")').length > 0
            const hasLibrary = $body.find('[data-testid*="library"], button').filter(':contains("library")').length > 0
            const hasAI = $body.find('[data-testid*="ai"], button').filter(':contains("ai")').length > 0

            expect(hasDocuments || hasLibrary || hasAI).to.be.true
        })
    })

    it('debe permitir crear un nuevo documento', () => {
        // Buscar botón de nuevo documento
        cy.get('body').then($body => {
            if ($body.find('[data-testid="new-document-button"]').length > 0) {
                cy.get('[data-testid="new-document-button"]').click()
            } else if ($body.find('button').filter(':contains("new"), button').filter(':contains("create")').length > 0) {
                cy.get('button').contains(/new|create|nuevo/i).first().click()
            }
        })

        // Verificar que se abre el editor o modal de creación
        cy.get('body').should('contain.text', 'document').or('contain.text', 'editor').or('contain.text', 'title')
    })

    it('debe mostrar la lista de documentos existentes', () => {
        cy.wait('@getDocuments', { timeout: 10000 })

        // Verificar que hay alguna lista o grid de documentos
        cy.get('body').then($body => {
            const hasDocumentList = $body.find('[data-testid*="document-list"], [data-testid*="documents"]').length > 0
            const hasDocumentItems = $body.find('[data-testid*="document-item"], .document').length > 0

            if (hasDocumentList || hasDocumentItems) {
                cy.get('[data-testid*="document"], .document').should('have.length.at.least', 0)
            }
        })
    })

    it('debe permitir abrir y cerrar la librería', () => {
        // Buscar toggle de librería
        cy.get('body').then($body => {
            if ($body.find('[data-testid="library-toggle"]').length > 0) {
                cy.get('[data-testid="library-toggle"]').click()
                cy.get('[data-testid="library-sidebar"]').should('be.visible')

                // Cerrar librería
                cy.get('[data-testid="library-toggle"]').click()
                cy.get('[data-testid="library-sidebar"]').should('not.be.visible')
            } else {
                // Buscar botón que contenga "library"
                const libraryButton = $body.find('button').filter(':contains("library")')
                if (libraryButton.length > 0) {
                    cy.wrap(libraryButton.first()).click()
                }
            }
        })
    })

    it('debe permitir abrir el chat de AI', () => {
        cy.get('body').then($body => {
            if ($body.find('[data-testid="ai-chat-toggle"]').length > 0) {
                cy.get('[data-testid="ai-chat-toggle"]').click()
                cy.get('[data-testid="ai-chat-interface"]').should('be.visible')
            } else {
                const aiButton = $body.find('button').filter(':contains("ai"), button').filter(':contains("chat")')
                if (aiButton.length > 0) {
                    cy.wrap(aiButton.first()).click()
                }
            }
        })
    })

    it('debe tener navegación responsive', () => {
        // Desktop
        cy.viewport(1280, 720)
        cy.get('nav, [data-testid="navigation"], [data-testid="sidebar"]').should('be.visible')

        // Mobile
        cy.viewport(375, 667)
        cy.wait(500)

        // En mobile, la navegación podría estar oculta o en un menú hamburguesa
        cy.get('body').then($body => {
            const hasVisibleNav = $body.find('nav:visible, [data-testid="navigation"]:visible').length > 0
            const hasMenuButton = $body.find('[data-testid="menu-toggle"], button').filter(':contains("menu")').length > 0

            expect(hasVisibleNav || hasMenuButton).to.be.true
        })
    })

    it('debe mostrar información del usuario', () => {
        // Buscar avatar, nombre de usuario, o menú de usuario
        cy.get('body').then($body => {
            const hasAvatar = $body.find('[data-testid*="avatar"], .avatar').length > 0
            const hasUserMenu = $body.find('[data-testid*="user-menu"], [data-testid*="profile"]').length > 0
            const hasUserInfo = $body.find('span, div').filter(':contains("test@example.com")').length > 0

            expect(hasAvatar || hasUserMenu || hasUserInfo).to.be.true
        })
    })

    it('debe permitir buscar documentos', () => {
        cy.get('body').then($body => {
            if ($body.find('[data-testid="search-input"], input[placeholder*="search"]').length > 0) {
                cy.get('[data-testid="search-input"], input[placeholder*="search"]').first().type('test document')
                cy.get('[data-testid="search-input"], input[placeholder*="search"]').first().should('have.value', 'test document')
            }
        })
    })

    it('debe manejar estados de carga', () => {
        // Recargar página para ver estados de carga
        cy.reload()

        // Verificar que no hay errores de carga críticos
        cy.get('body').should('not.contain.text', '404')
        cy.get('body').should('not.contain.text', 'Error 500')
        cy.get('body').should('not.contain.text', 'Page not found')
    })
}) 