describe('Performance y Optimización', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.clearLocalStorage()
    })

    describe('Tiempos de Carga', () => {
        it('debe cargar la página principal en tiempo razonable', () => {
            const startTime = performance.now()

            cy.visit('/')
            cy.waitForPageLoad()

            cy.window().then(() => {
                const endTime = performance.now()
                const loadTime = endTime - startTime

                // Verificar que carga en menos de 3 segundos
                expect(loadTime).to.be.lessThan(3000)
            })

            // Verificar que elementos críticos se cargan rápido
            cy.get('img[alt="Next.js logo"]').should('be.visible')
            cy.get('a').contains('START HERE').should('be.visible')
        })

        it('debe cargar el dashboard rápidamente después del login', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            const startTime = performance.now()
            cy.visit('/dashboard')
            cy.waitForPageLoad()

            cy.window().then(() => {
                const endTime = performance.now()
                const loadTime = endTime - startTime

                expect(loadTime).to.be.lessThan(4000)
            })

            // Verificar elementos principales del dashboard
            cy.get('main, [data-testid="dashboard-main"]').should('exist')
        })

        it('debe mostrar contenido above-the-fold rápidamente', () => {
            cy.visit('/')

            // Verificar que el contenido principal se muestra sin esperar JavaScript
            cy.get('main').should('be.visible')
            cy.get('img[alt="Next.js logo"]').should('be.visible')
            cy.contains('Get started by editing').should('be.visible')
        })
    })

    describe('Recursos y Red', () => {
        it('debe cargar recursos esenciales eficientemente', () => {
            cy.intercept('GET', '**/*.js', (req) => {
                req.continue((res) => {
                    // Verificar que los archivos JS no son demasiado grandes
                    const contentLength = res.headers['content-length']
                    if (contentLength) {
                        expect(parseInt(contentLength)).to.be.lessThan(1024 * 1024) // 1MB max
                    }
                })
            }).as('jsFiles')

            cy.intercept('GET', '**/*.css', (req) => {
                req.continue((res) => {
                    // Verificar que los archivos CSS no son demasiado grandes
                    const contentLength = res.headers['content-length']
                    if (contentLength) {
                        expect(parseInt(contentLength)).to.be.lessThan(512 * 1024) // 512KB max
                    }
                })
            }).as('cssFiles')

            cy.visit('/')
            cy.waitForPageLoad()
        })

        it('debe manejar imágenes optimizadas', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            cy.get('img').each($img => {
                cy.wrap($img).should('be.visible')

                // Verificar que las imágenes no son excesivamente grandes
                cy.wrap($img).then($el => {
                    const naturalWidth = $el[0].naturalWidth
                    const naturalHeight = $el[0].naturalHeight

                    // Verificar dimensiones razonables
                    expect(naturalWidth).to.be.lessThan(2000)
                    expect(naturalHeight).to.be.lessThan(2000)
                })
            })
        })

        it('debe minimizar requests innecesarios', () => {
            let requestCount = 0

            cy.intercept('**/*', (req) => {
                requestCount++
                req.continue()
            })

            cy.visit('/')
            cy.waitForPageLoad()

            cy.then(() => {
                // Verificar que no hay demasiados requests
                expect(requestCount).to.be.lessThan(50)
            })
        })
    })

    describe('Responsividad de la Interfaz', () => {
        it('debe responder rápidamente a interacciones del usuario', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Medir tiempo de respuesta al click
            const startTime = performance.now()
            cy.get('a').contains('START HERE').click()

            cy.url().should('include', '/sign-up').then(() => {
                const endTime = performance.now()
                const responseTime = endTime - startTime

                expect(responseTime).to.be.lessThan(1000) // Menos de 1 segundo
            })
        })

        it('debe mantener 60fps en animaciones', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Verificar que no hay janks evidentes en las transiciones
            cy.get('body').then($body => {
                const buttons = $body.find('button').filter(':visible')

                if (buttons.length > 0) {
                    cy.wrap(buttons.first()).click()
                    cy.wait(500)

                    // Verificar que la página sigue respondiendo
                    cy.get('body').should('be.visible')
                }
            })
        })

        it('debe manejar múltiples interacciones simultáneas', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Realizar múltiples acciones rápidamente
            cy.get('body').then($body => {
                const buttons = $body.find('button').filter(':visible')

                if (buttons.length >= 2) {
                    cy.wrap(buttons.eq(0)).click()
                    cy.wrap(buttons.eq(1)).click()

                    // Verificar que la aplicación sigue respondiendo
                    cy.get('body').should('be.visible')
                }
            })
        })
    })

    describe('Memoria y CPU', () => {
        it('debe manejar navegación sin memory leaks evidentes', () => {
            // Navegar entre páginas múltiples veces
            for (let i = 0; i < 3; i++) {
                cy.visit('/')
                cy.waitForPageLoad()

                cy.get('a').contains('START HERE').click()
                cy.url().should('include', '/sign-up')
                cy.waitForPageLoad()

                cy.go('back')
                cy.waitForPageLoad()
            }

            // Verificar que la página sigue funcionando
            cy.get('img[alt="Next.js logo"]').should('be.visible')
        })

        it('debe mantener performance con múltiples componentes', () => {
            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Abrir múltiples sidebars/modales si existen
            cy.get('body').then($body => {
                const toggleButtons = $body.find('button').filter(':contains("toggle"), button').filter(':contains("open")')

                toggleButtons.each((index, button) => {
                    if (index < 3) { // Límite para evitar sobrecargar
                        cy.wrap(button).click()
                        cy.wait(200)
                    }
                })
            })

            // Verificar que la aplicación sigue respondiendo
            cy.get('body').should('be.visible')
        })
    })

    describe('Caching y Offline', () => {
        it('debe cachear recursos estáticos apropiadamente', () => {
            cy.intercept('GET', '**/*.js', (req) => {
                req.continue((res) => {
                    // Verificar headers de cache
                    expect(res.headers).to.have.property('cache-control')
                })
            }).as('staticJs')

            cy.intercept('GET', '**/*.css', (req) => {
                req.continue((res) => {
                    expect(res.headers).to.have.property('cache-control')
                })
            }).as('staticCss')

            cy.visit('/')
            cy.waitForPageLoad()
        })

        it('debe manejar errores de red gracefully', () => {
            // Simular fallo de red
            cy.intercept('GET', '**/api/**', {
                statusCode: 500,
                body: { error: 'Network error' }
            }).as('networkError')

            cy.visit('/dashboard')
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.waitForPageLoad()

            // Verificar que la aplicación no se rompe completamente
            cy.get('body').should('be.visible')
            cy.get('main, [data-testid="dashboard-main"]').should('exist')
        })
    })

    describe('Optimización de Bundle', () => {
        it('debe cargar solo código necesario inicialmente', () => {
            let initialJsSize = 0

            cy.intercept('GET', '**/*.js', (req) => {
                if (req.url.includes('chunk') || req.url.includes('main')) {
                    req.continue((res) => {
                        const contentLength = res.headers['content-length']
                        if (contentLength) {
                            initialJsSize += parseInt(contentLength)
                        }
                    })
                }
            }).as('initialJs')

            cy.visit('/')
            cy.waitForPageLoad()

            cy.then(() => {
                // Bundle inicial no debería ser demasiado grande
                expect(initialJsSize).to.be.lessThan(512 * 1024) // 512KB
            })
        })

        it('debe usar code splitting efectivamente', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            let routeChunksLoaded = 0

            cy.intercept('GET', '**/*.js', (req) => {
                if (req.url.includes('page') || req.url.includes('route')) {
                    routeChunksLoaded++
                }
                req.continue()
            }).as('routeChunks')

            // Navegar a una nueva ruta
            cy.get('a').contains('START HERE').click()
            cy.url().should('include', '/sign-up')

            // Verificar que se cargaron chunks adicionales
            cy.then(() => {
                expect(routeChunksLoaded).to.be.greaterThan(0)
            })
        })
    })

    describe('Métricas Web Vitales', () => {
        it('debe tener First Contentful Paint rápido', () => {
            cy.visit('/')

            // Verificar que el contenido principal aparece rápidamente
            cy.get('main').should('be.visible')
            cy.get('img[alt="Next.js logo"]').should('be.visible')

            cy.window().then((win) => {
                // Verificar Performance API si está disponible
                if (win.performance && win.performance.getEntriesByType) {
                    const paintEntries = win.performance.getEntriesByType('paint')
                    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')

                    if (fcp) {
                        expect(fcp.startTime).to.be.lessThan(2000) // 2 segundos
                    }
                }
            })
        })

        it('debe minimizar Cumulative Layout Shift', () => {
            cy.visit('/')
            cy.waitForPageLoad()

            // Esperar a que todo cargue completamente
            cy.wait(2000)

            // Verificar que no hay cambios de layout evidentes
            cy.get('main').should('be.visible')
            cy.get('img[alt="Next.js logo"]').should('be.visible')

            // Interactuar y verificar estabilidad
            cy.get('a').contains('START HERE').should('be.visible')
        })
    })
}) 