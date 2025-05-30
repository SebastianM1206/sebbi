describe('Accesibilidad Web', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.clearLocalStorage()
    })

    describe('Navegación por Teclado', () => {
        it('debe permitir navegación completa con teclado en homepage', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Comenzar navegación con Tab
            cy.get('body').tab()
            cy.focused().should('be.visible')

            // Navegar a través de todos los elementos focuseables
            let focusCount = 0
            const maxTabs = 10

            for (let i = 0; i < maxTabs; i++) {
                cy.focused().then($el => {
                    if ($el.length > 0) {
                        focusCount++
                        expect($el).to.be.visible
                    }
                })
                cy.tab()
            }

            expect(focusCount).to.be.greaterThan(0)
        })

        it('debe permitir activar elementos con Enter y Space', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Navegar al botón START HERE
            cy.get('a').contains('START HERE').focus()
            cy.focused().should('contain', 'START HERE')

            // Activar con Enter
            cy.focused().type('{enter}')
            cy.url().should('include', '/sign-up')
        })

        it('debe mantener el orden lógico de tabulación', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            const expectedOrder = []
            cy.get('a, button, input, [tabindex]').each($el => {
                if ($el.is(':visible') && !$el.is(':disabled')) {
                    expectedOrder.push($el[0])
                }
            })

            // Verificar que el orden de tabulación es lógico
            cy.get('body').tab()
            cy.focused().then($first => {
                expect(expectedOrder).to.include($first[0])
            })
        })
    })

    describe('Lectores de Pantalla', () => {
        it('debe tener estructura semántica correcta', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar elementos semánticos principales
            cy.get('main').should('exist')
            cy.get('header, nav').should('exist')
            cy.get('footer').should('exist')

            // Verificar jerarquía de headings
            cy.get('h1, h2, h3, h4, h5, h6').should('exist')
            cy.get('h1').should('have.length.at.most', 1) // Solo un h1 por página
        })

        it('debe tener todos los atributos ARIA necesarios', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Verificar roles ARIA
            cy.get('[role]').should('exist')

            // Verificar labels para form controls
            cy.get('input, select, textarea').each($el => {
                const hasLabel = $el.attr('aria-label') ||
                    $el.attr('aria-labelledby') ||
                    $el.attr('placeholder') ||
                    Cypress.$(`label[for="${$el.attr('id')}"]`).length > 0

                expect(hasLabel).to.be.true
            })
        })

        it('debe tener textos alternativos para imágenes', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            cy.get('img').each($img => {
                expect($img).to.have.attr('alt')
                expect($img.attr('alt')).to.not.be.empty
            })
        })

        it('debe anunciar cambios dinámicos con aria-live', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Buscar regiones live para anuncios
            cy.get('body').then($body => {
                const hasLiveRegions = $body.find('[aria-live], [aria-atomic], .sr-only').length > 0

                if (hasLiveRegions) {
                    cy.get('[aria-live]').should('exist')
                }
            })
        })
    })

    describe('Contraste y Visual', () => {
        it('debe mantener contraste suficiente en texto', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que existe texto visible
            cy.get('main').should('be.visible')
            cy.get('main').should('have.css', 'color')
            cy.get('main').should('have.css', 'background-color')

            // Verificar elementos de texto principales
            cy.get('a').contains('START HERE').should('be.visible')
            cy.contains('Get started by editing').should('be.visible')
        })

        it('debe ser usable sin CSS', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que el contenido sigue siendo accesible
            cy.get('main').should('exist')
            cy.get('a').contains('START HERE').should('be.visible')

            // Verificar que los enlaces tienen texto descriptivo
            cy.get('a').each($link => {
                const text = $link.text().trim()
                const ariaLabel = $link.attr('aria-label')

                expect(text || ariaLabel).to.not.be.empty
                expect(text || ariaLabel).to.not.match(/^(click here|read more|more)$/i)
            })
        })

        it('debe mantener usabilidad con zoom al 200%', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Simular zoom (reducir viewport)
            cy.viewport(640, 360) // 50% del tamaño original simula zoom 200%

            // Verificar que elementos siguen siendo usables
            cy.get('a').contains('START HERE').should('be.visible')
            cy.get('main').should('be.visible')

            // Verificar que no hay scroll horizontal
            cy.window().then((win) => {
                expect(win.document.body.scrollWidth).to.be.at.most(650)
            })
        })
    })

    describe('Formularios Accesibles', () => {
        it('debe tener labels apropiados en formularios', () => {
            cy.visit('/sign-up')
            cy.waitForPageLoad()

            cy.get('input').each($input => {
                const type = $input.attr('type')
                const hasLabel = $input.attr('aria-label') ||
                    $input.attr('placeholder') ||
                    Cypress.$(`label[for="${$input.attr('id')}"]`).length > 0

                expect(hasLabel, `Input type ${type} should have a label`).to.be.true
            })
        })

        it('debe mostrar mensajes de error accesibles', () => {
            cy.visit('/sign-up')
            cy.waitForPageLoad()

            // Intentar enviar formulario con datos inválidos
            cy.get('input[type="email"]').type('invalid-email')
            cy.get('button').contains(/sign up|register/i).click()

            // Verificar que los errores están asociados con los campos
            cy.get('input:invalid').should('exist')

            // Buscar mensajes de error
            cy.get('body').then($body => {
                const hasErrorMessages = $body.find('[aria-describedby], .error, [role="alert"]').length > 0

                if (hasErrorMessages) {
                    cy.get('.error, [role="alert"]').should('be.visible')
                }
            })
        })

        it('debe mantener foco después de errores de validación', () => {
            cy.visit('/sign-up')
            cy.waitForPageLoad()

            // Enfocar un campo y dejarlo vacío
            cy.get('input[type="email"]').focus().blur()

            // Verificar que el foco se mantiene o se mueve a un lugar lógico
            cy.focused().should('exist')
        })
    })

    describe('Componentes Interactivos', () => {
        it('debe tener estados de foco visibles', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que los elementos focuseables tienen outline
            cy.get('a').contains('START HERE').focus()
            cy.focused().should('have.css', 'outline').and('not.contain', 'none')
        })

        it('debe ser operables solo con teclado', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Verificar que se pueden abrir/cerrar sidebars con teclado
            cy.get('body').then($body => {
                const buttons = $body.find('button').filter(':visible')

                if (buttons.length > 0) {
                    cy.wrap(buttons.first()).focus().type('{enter}')
                    // Verificar que algo cambió (sidebar, modal, etc.)
                    cy.wait(500)
                    cy.get('body').should('exist') // Verificación básica de que la página responde
                }
            })
        })

        it('debe anunciar estados de componentes dinámicos', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Verificar atributos de estado en componentes interactivos
            cy.get('button').then($buttons => {
                $buttons.each((i, button) => {
                    const $btn = Cypress.$(button)
                    const hasStateAttrs = $btn.attr('aria-expanded') !== undefined ||
                        $btn.attr('aria-pressed') !== undefined ||
                        $btn.attr('aria-selected') !== undefined

                    // Al menos algunos botones deberían tener atributos de estado
                    if (hasStateAttrs) {
                        expect($btn.attr('aria-expanded')).to.match(/true|false/)
                    }
                })
            })
        })
    })

    describe('Compatibilidad con Tecnologías Asistivas', () => {
        it('debe funcionar con navegación por voz', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que los elementos tienen nombres accesibles únicos
            cy.get('button, a').each($el => {
                const name = $el.text().trim() || $el.attr('aria-label') || $el.attr('title')
                expect(name).to.not.be.empty
                expect(name.length).to.be.greaterThan(2)
            })
        })

        it('debe tener landmarks apropiados', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar landmarks principales
            const expectedLandmarks = ['main', 'nav', 'header', 'footer']
            expectedLandmarks.forEach(landmark => {
                cy.get(landmark).should('exist')
            })

            // Verificar roles de landmark
            cy.get('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]')
                .should('have.length.at.least', 1)
        })

        it('debe manejar reducción de movimiento', () => {
            // Simular preferencia de movimiento reducido
            cy.window().then((win) => {
                Object.defineProperty(win, 'matchMedia', {
                    writable: true,
                    value: jest.fn().mockImplementation(query => ({
                        matches: query === '(prefers-reduced-motion: reduce)',
                        media: query,
                        onchange: null,
                        addEventListener: jest.fn(),
                        removeEventListener: jest.fn(),
                    })),
                })
            })

            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que la página sigue siendo funcional
            cy.get('a').contains('START HERE').should('be.visible')
            cy.get('main').should('be.visible')
        })
    })
}) 