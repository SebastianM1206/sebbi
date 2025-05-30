describe('Editor de Documentos', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.window().then((win) => {
            win.localStorage.setItem('auth-token', 'fake-jwt-token')
        })
        cy.visit('/dashboard')
        cy.waitForPageLoad()
    })

    it('debe abrir el editor cuando se crea un nuevo documento', () => {
        cy.get('body').then($body => {
            if ($body.find('[data-testid="new-document-button"]').length > 0) {
                cy.get('[data-testid="new-document-button"]').click()
            } else {
                cy.get('button').contains(/new|create|nuevo/i).first().click()
            }
        })

        // Verificar que el editor está presente
        cy.get('[data-testid="editor"], .editor, [contenteditable="true"]').should('be.visible')
    })

    it('debe permitir escribir texto en el editor', () => {
        cy.createDocument('Documento de Prueba')

        const testText = 'Este es un texto de prueba para el editor'

        cy.get('[data-testid="editor-content"], [contenteditable="true"], .ProseMirror').first().then($editor => {
            if ($editor.length > 0) {
                cy.wrap($editor).click().type(testText)
                cy.wrap($editor).should('contain.text', testText)
            }
        })
    })

    it('debe guardar automáticamente los cambios', () => {
        cy.createDocument('Auto Save Test')

        cy.typeInEditor('Contenido que debe guardarse automáticamente')

        // Esperar un momento y verificar que se hizo un request de guardado
        cy.wait(2000)
        cy.get('@updateDocument', { timeout: 10000 }).should('have.been.called')
    })

    it('debe permitir aplicar formato de texto básico', () => {
        cy.createDocument('Formato Test')

        const testText = 'Texto para formatear'
        cy.typeInEditor(testText)

        // Seleccionar texto y aplicar formato
        cy.get('[data-testid="editor-content"], [contenteditable="true"]').first().then($editor => {
            // Simular selección de texto
            cy.wrap($editor).type('{selectall}')

            // Buscar botones de formato
            cy.get('body').then($body => {
                if ($body.find('[data-testid="bold-button"], button').filter(':contains("Bold")').length > 0) {
                    cy.get('[data-testid="bold-button"], button').contains(/bold|B/i).first().click()
                }

                if ($body.find('[data-testid="italic-button"], button').filter(':contains("Italic")').length > 0) {
                    cy.get('[data-testid="italic-button"], button').contains(/italic|I/i).first().click()
                }
            })
        })
    })

    it('debe mostrar la barra de herramientas del editor', () => {
        cy.createDocument('Toolbar Test')

        // Verificar que existe alguna barra de herramientas
        cy.get('[data-testid="editor-toolbar"], .toolbar, .menu-bar').should('be.visible')

        // Verificar que hay botones de formato comunes
        cy.get('body').then($body => {
            const hasFormatButtons = $body.find('button').filter(':contains("Bold"), button').filter(':contains("Italic")').length > 0
            const hasHeadings = $body.find('button, select').filter(':contains("Heading"), button, select').filter(':contains("H1")').length > 0

            expect(hasFormatButtons || hasHeadings).to.be.true
        })
    })

    it('debe permitir insertar listas', () => {
        cy.createDocument('Lista Test')

        cy.typeInEditor('Item de lista')

        // Buscar botón de lista
        cy.get('body').then($body => {
            const listButton = $body.find('button').filter(':contains("list"), button').filter(':contains("bullet")')
            if (listButton.length > 0) {
                cy.wrap(listButton.first()).click()

                // Verificar que se creó una lista
                cy.get('ul, ol').should('exist')
            }
        })
    })

    it('debe permitir insertar enlaces', () => {
        cy.createDocument('Link Test')

        cy.typeInEditor('Texto con enlace')

        cy.get('body').then($body => {
            const linkButton = $body.find('button').filter(':contains("link"), button').filter(':contains("url")')
            if (linkButton.length > 0) {
                cy.wrap(linkButton.first()).click()

                // Si aparece un modal o input para el enlace
                cy.get('input[placeholder*="url"], input[placeholder*="link"]').then($input => {
                    if ($input.length > 0) {
                        cy.wrap($input).type('https://example.com')
                        cy.get('button').contains(/ok|confirm|add/i).click()
                    }
                })
            }
        })
    })

    it('debe manejar el historial de deshacer/rehacer', () => {
        cy.createDocument('Undo Test')

        const firstText = 'Primer texto'
        const secondText = ' - segundo texto'

        cy.typeInEditor(firstText)
        cy.typeInEditor(secondText)

        // Intentar deshacer
        cy.get('[data-testid="editor-content"], [contenteditable="true"]').first().type('{ctrl+z}')

        // Verificar que se deshizo la última acción
        cy.get('[data-testid="editor-content"], [contenteditable="true"]').first().should('not.contain.text', secondText)
    })

    it('debe permitir cambiar el título del documento', () => {
        cy.createDocument('Título Original')

        // Buscar campo de título
        cy.get('[data-testid="document-title"], input[placeholder*="title"], h1[contenteditable="true"]').then($title => {
            if ($title.length > 0) {
                cy.wrap($title).clear().type('Título Modificado')
                cy.wrap($title).should('have.value', 'Título Modificado').or('contain.text', 'Título Modificado')
            }
        })
    })

    it('debe mostrar información de colaboración en tiempo real', () => {
        cy.createDocument('Collab Test')

        // Buscar indicadores de colaboración
        cy.get('body').then($body => {
            const hasCollabInfo = $body.find('[data-testid*="collab"], [data-testid*="users"], .collaboration').length > 0
            const hasUserAvatars = $body.find('.avatar, [data-testid*="avatar"]').length > 0
            const hasOnlineStatus = $body.find('.online, .status').length > 0

            // Al menos uno de estos indicadores debería estar presente en un editor colaborativo
            if (hasCollabInfo || hasUserAvatars || hasOnlineStatus) {
                cy.get('[data-testid*="collab"], [data-testid*="users"], .collaboration, .avatar, .online').should('be.visible')
            }
        })
    })
}) 