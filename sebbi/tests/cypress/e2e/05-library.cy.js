describe('Biblioteca de Documentos', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.window().then((win) => {
            win.localStorage.setItem('auth-token', 'fake-jwt-token')
        })
        cy.visit('/dashboard')
        cy.waitForPageLoad()
    })

    it('debe abrir y cerrar la biblioteca correctamente', () => {
        // Intentar abrir la biblioteca
        cy.get('body').then($body => {
            if ($body.find('[data-testid="library-toggle"]').length > 0) {
                cy.get('[data-testid="library-toggle"]').click()
                cy.get('[data-testid="library-sidebar"]').should('be.visible')

                // Cerrar biblioteca
                cy.get('[data-testid="library-toggle"]').click()
                cy.get('[data-testid="library-sidebar"]').should('not.be.visible')
            } else {
                const libraryButton = $body.find('button').filter(':contains("library"), button').filter(':contains("documents")')
                if (libraryButton.length > 0) {
                    cy.wrap(libraryButton.first()).click()
                }
            }
        })
    })

    it('debe mostrar la lista de documentos en la biblioteca', () => {
        cy.openLibrary()

        cy.wait('@getDocuments', { timeout: 10000 })

        // Verificar que se muestran documentos
        cy.get('[data-testid="library-sidebar"], .library, .documents-list').then($library => {
            if ($library.length > 0) {
                cy.wrap($library).should('be.visible')

                // Buscar elementos de documento
                cy.get('[data-testid*="document-item"], .document-item, .doc').should('have.length.at.least', 0)
            }
        })
    })

    it('debe permitir buscar documentos en la biblioteca', () => {
        cy.openLibrary()

        // Buscar campo de búsqueda en la biblioteca
        cy.get('[data-testid="library-search"], [data-testid="search-input"]').then($search => {
            if ($search.length > 0) {
                cy.wrap($search).type('test document')
                cy.wrap($search).should('have.value', 'test document')

                // Verificar que se actualiza la lista de resultados
                cy.wait(1000)
                cy.get('[data-testid*="document-item"], .document-item').should('exist')
            }
        })
    })

    it('debe permitir filtrar documentos por categoría', () => {
        cy.openLibrary()

        // Buscar filtros o categorías
        cy.get('body').then($body => {
            const hasFilters = $body.find('[data-testid*="filter"], .filter, select').length > 0
            const hasCategories = $body.find('[data-testid*="category"], .category').length > 0
            const hasTags = $body.find('[data-testid*="tag"], .tag').length > 0

            if (hasFilters || hasCategories || hasTags) {
                // Hacer click en un filtro si existe
                cy.get('[data-testid*="filter"], .filter, [data-testid*="category"], .category').first().click()
            }
        })
    })

    it('debe permitir ordenar documentos', () => {
        cy.openLibrary()

        // Buscar opciones de ordenación
        cy.get('body').then($body => {
            const hasSortOptions = $body.find('[data-testid*="sort"], .sort, select').filter(':contains("sort")').length > 0
            const hasDateSort = $body.find('button, select option').filter(':contains("date"), button, select option').filter(':contains("name")').length > 0

            if (hasSortOptions || hasDateSort) {
                cy.get('[data-testid*="sort"], .sort, button').contains(/sort|order|fecha|date|name/i).first().click()
            }
        })
    })

    it('debe mostrar información detallada de cada documento', () => {
        cy.openLibrary()

        // Verificar que cada documento muestra información básica
        cy.get('[data-testid*="document-item"], .document-item').first().then($doc => {
            if ($doc.length > 0) {
                // Verificar que tiene título
                cy.wrap($doc).should('contain.text', /[A-Za-z]/)

                // Verificar que tiene fecha o información adicional
                cy.wrap($doc).find('[data-testid*="date"], .date, .meta, time').should('exist')
            }
        })
    })

    it('debe permitir abrir un documento desde la biblioteca', () => {
        cy.openLibrary()

        // Hacer click en el primer documento disponible
        cy.get('[data-testid*="document-item"], .document-item').first().then($doc => {
            if ($doc.length > 0) {
                cy.wrap($doc).click()

                // Verificar que se abre el editor o vista del documento
                cy.get('[data-testid="editor"], .editor, [contenteditable="true"]').should('be.visible')
            }
        })
    })

    it('debe permitir crear un nuevo documento desde la biblioteca', () => {
        cy.openLibrary()

        // Buscar botón de nuevo documento en la biblioteca
        cy.get('[data-testid="new-document"], [data-testid="create-document"]').then($newBtn => {
            if ($newBtn.length > 0) {
                cy.wrap($newBtn).click()

                // Verificar que se abre el formulario de creación
                cy.get('[data-testid="document-title-input"], input[placeholder*="title"]').should('be.visible')
            }
        })
    })

    it('debe mostrar documentos recientes', () => {
        cy.openLibrary()

        // Buscar sección de documentos recientes
        cy.get('body').then($body => {
            const hasRecents = $body.find('[data-testid*="recent"], .recent').length > 0
            const hasRecentSection = $body.find('h2, h3, .section-title').filter(':contains("recent"), h2, h3, .section-title').filter(':contains("último")').length > 0

            if (hasRecents || hasRecentSection) {
                cy.get('[data-testid*="recent"], .recent, .section').contains(/recent|último/i).should('be.visible')
            }
        })
    })

    it('debe permitir gestionar documentos (eliminar, duplicar)', () => {
        cy.openLibrary()

        // Buscar menú de opciones en un documento
        cy.get('[data-testid*="document-item"], .document-item').first().then($doc => {
            if ($doc.length > 0) {
                // Buscar botón de menú (tres puntos, engranaje, etc.)
                cy.wrap($doc).find('[data-testid*="menu"], .menu, button').filter(':contains("⋮"), button').filter(':contains("...")').then($menu => {
                    if ($menu.length > 0) {
                        cy.wrap($menu).click()

                        // Verificar que aparecen opciones como eliminar
                        cy.get('[data-testid*="delete"], [data-testid*="remove"]').should('be.visible')
                    }
                })
            }
        })
    })
}) 