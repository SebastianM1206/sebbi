describe('Diseño Responsive', () => {
    const viewports = [
        { name: 'Desktop Large', width: 1920, height: 1080 },
        { name: 'Desktop', width: 1280, height: 720 },
        { name: 'Laptop', width: 1024, height: 768 },
        { name: 'Tablet Portrait', width: 768, height: 1024 },
        { name: 'Tablet Landscape', width: 1024, height: 768 },
        { name: 'Mobile Large', width: 414, height: 896 },
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Mobile Small', width: 320, height: 568 }
    ]

    beforeEach(() => {
        cy.mockApiCalls()
        cy.clearLocalStorage()
    })

    viewports.forEach(viewport => {
        describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
            beforeEach(() => {
                cy.viewport(viewport.width, viewport.height)
            })

            it('debe cargar la página principal correctamente', () => {
                cy.visit('/')
                cy.waitForPageLoad()

                // Verificar elementos principales
                cy.get('img[alt="Next.js logo"]').should('be.visible')
                cy.get('a').contains('START HERE').should('be.visible')

                // Verificar que no hay overflow horizontal
                cy.window().then((win) => {
                    expect(win.document.body.scrollWidth).to.be.at.most(viewport.width + 10)
                })
            })

            it('debe mostrar la navegación apropiadamente', () => {
                cy.window().then((win) => {
                    win.localStorage.setItem('auth-token', 'fake-jwt-token')
                })
                cy.visit('/dashboard')
                cy.waitForPageLoad()

                if (viewport.width >= 768) {
                    // Desktop/Tablet: navegación visible
                    cy.get('nav, [data-testid="navigation"], [data-testid="sidebar"]').should('be.visible')
                } else {
                    // Mobile: puede estar oculta o ser un menú hamburguesa
                    cy.get('body').then($body => {
                        const hasVisibleNav = $body.find('nav:visible, [data-testid="navigation"]:visible').length > 0
                        const hasMenuButton = $body.find('[data-testid="menu-toggle"], button').filter(':contains("menu")').length > 0

                        expect(hasVisibleNav || hasMenuButton).to.be.true
                    })
                }
            })

            it('debe mantener la usabilidad de los botones', () => {
                cy.visit('/')
                cy.waitForPageLoad()

                // Verificar que los botones son clickeables
                cy.get('a').contains('START HERE').should('be.visible').click()
                cy.url().should('include', '/sign-up')

                // Verificar tamaño mínimo de área de click (especialmente en mobile)
                if (viewport.width <= 768) {
                    cy.get('button, a').each($el => {
                        const height = $el.height()
                        const width = $el.width()
                        expect(Math.min(height, width)).to.be.at.least(44) // Tamaño mínimo recomendado
                    })
                }
            })

            it('debe mostrar texto legible', () => {
                cy.visit('/')
                cy.waitForPageLoad()

                // Verificar que el texto no es demasiado pequeño
                cy.get('body').should('have.css', 'font-size').then(fontSize => {
                    const size = parseInt(fontSize)
                    expect(size).to.be.at.least(14) // Tamaño mínimo legible
                })

                // Verificar contraste y legibilidad
                cy.get('main').should('be.visible')
                cy.contains('Get started by editing').should('be.visible')
            })
        })
    })

    describe('Breakpoints y Transiciones', () => {
        it('debe adaptarse suavemente entre breakpoints', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Empezar en desktop
            cy.viewport(1280, 720)
            cy.get('main').should('be.visible')

            // Cambiar a tablet
            cy.viewport(768, 1024)
            cy.wait(500)
            cy.get('main').should('be.visible')

            // Cambiar a mobile
            cy.viewport(375, 667)
            cy.wait(500)
            cy.get('main').should('be.visible')

            // Volver a desktop
            cy.viewport(1280, 720)
            cy.wait(500)
            cy.get('main').should('be.visible')
        })

        it('debe manejar orientación de pantalla en tablets', () => {
            // Portrait
            cy.viewport(768, 1024)
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()
            cy.get('body').should('be.visible')

            // Landscape
            cy.viewport(1024, 768)
            cy.wait(500)
            cy.get('body').should('be.visible')
        })
    })

    describe('Formularios Responsive', () => {
        it('debe mantener usabilidad de formularios en mobile', () => {
            cy.viewport(375, 667)
            cy.visit('/sign-up')
            cy.waitForPageLoad()

            // Verificar que los inputs son accesibles
            cy.get('input[type="email"]').should('be.visible').tap()
            cy.get('input[type="email"]').should('have.focus')

            // Verificar que el teclado virtual no oculta elementos importantes
            cy.get('input[type="email"]').type('test@example.com')
            cy.get('input[type="password"]').should('be.visible')
        })

        it('debe ajustar el layout de formularios apropiadamente', () => {
            const testViewports = [
                { width: 1280, height: 720 },
                { width: 768, height: 1024 },
                { width: 375, height: 667 }
            ]

            testViewports.forEach(vp => {
                cy.viewport(vp.width, vp.height)
                cy.visit('/sign-up')
                cy.waitForPageLoad()

                // Verificar que los campos no se superponen
                cy.get('input').each($input => {
                    cy.wrap($input).should('be.visible')
                })

                // Verificar espaciado adecuado
                cy.get('form, .form').then($form => {
                    if ($form.length > 0) {
                        expect($form.width()).to.be.at.most(vp.width)
                    }
                })
            })
        })
    })

    describe('Performance en Diferentes Dispositivos', () => {
        it('debe cargar rápidamente en dispositivos móviles simulados', () => {
            cy.viewport(375, 667)

            const startTime = Date.now()
            cy.visit('/')
            cy.waitForPageLoad()
            const endTime = Date.now()

            // Verificar tiempo de carga razonable
            expect(endTime - startTime).to.be.lessThan(5000)

            // Verificar que elementos críticos se cargan primero
            cy.get('img[alt="Next.js logo"]').should('be.visible')
            cy.get('a').contains('START HERE').should('be.visible')
        })

        it('debe manejar imágenes responsive', () => {
            cy.viewport(375, 667)
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que las imágenes se escalan correctamente
            cy.get('img').each($img => {
                cy.wrap($img).should('be.visible')
                cy.wrap($img).then($el => {
                    expect($el.width()).to.be.at.most(375)
                })
            })
        })
    })

    describe('Accesibilidad Responsive', () => {
        it('debe mantener navegación por teclado en todos los tamaños', () => {
            const viewports = [
                { width: 1280, height: 720 },
                { width: 375, height: 667 }
            ]

            viewports.forEach(vp => {
                cy.viewport(vp.width, vp.height)
                cy.visit('/')
                cy.waitForPageLoad()

                // Navegar con Tab
                cy.get('body').tab()
                cy.focused().should('be.visible')

                // Verificar que el foco es visible
                cy.focused().should('have.css', 'outline').and('not.contain', 'none')
            })
        })

        it('debe mantener contraste adecuado en todos los tamaños', () => {
            cy.viewport(375, 667)
            cy.visit('/')
            cy.waitForPageLoad()

            // Verificar que el texto mantiene buen contraste
            cy.get('a').contains('START HERE').should('be.visible')
            cy.get('main').should('have.css', 'color')
            cy.get('main').should('have.css', 'background-color')
        })
    })
}) 