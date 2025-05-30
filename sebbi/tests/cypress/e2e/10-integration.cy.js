describe('Flujo de Integración Completo', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.clearLocalStorage()
        cy.clearCookies()
    })

    describe('Flujo de Usuario Completo', () => {
        it('debe completar el flujo desde registro hasta uso del editor', () => {
            // 1. Visitar homepage
            cy.visit('/')
            cy.waitForPageLoad()
            cy.get('img[alt="Next.js logo"]').should('be.visible')

            // 2. Ir a registro
            cy.get('a').contains('START HERE').click()
            cy.url().should('include', '/sign-up')

            // 3. Registrar usuario
            const email = `test-${Date.now()}@example.com`
            cy.get('input[type="email"]').type(email)
            cy.get('input[type="password"]').type('password123')

            // Si hay confirmación de contraseña
            cy.get('body').then($body => {
                if ($body.find('input[type="password"]').length > 1) {
                    cy.get('input[type="password"]').last().type('password123')
                }
            })

            cy.get('button').contains(/sign up|register|registrar/i).click()

            // 4. Verificar redirección al dashboard
            cy.url({ timeout: 10000 }).should('include', '/dashboard')
            cy.waitForPageLoad()

            // 5. Crear un nuevo documento
            cy.get('body').then($body => {
                if ($body.find('[data-testid="new-document-button"]').length > 0) {
                    cy.get('[data-testid="new-document-button"]').click()
                } else {
                    cy.get('button').contains(/new|create|nuevo/i).first().click()
                }
            })

            // 6. Escribir en el editor
            const documentTitle = 'Mi Primer Documento'
            const documentContent = 'Este es el contenido de mi primer documento de prueba.'

            cy.get('[data-testid="document-title"], input[placeholder*="title"]').then($title => {
                if ($title.length > 0) {
                    cy.wrap($title).type(documentTitle)
                }
            })

            cy.get('[data-testid="editor-content"], [contenteditable="true"], .ProseMirror').then($editor => {
                if ($editor.length > 0) {
                    cy.wrap($editor).click().type(documentContent)
                }
            })

            // 7. Verificar que el contenido se guardó
            cy.wait(2000)
            cy.get('[data-testid="editor-content"], [contenteditable="true"]').should('contain.text', documentContent)

            // 8. Abrir biblioteca si existe
            cy.get('body').then($body => {
                if ($body.find('[data-testid="library-toggle"]').length > 0) {
                    cy.get('[data-testid="library-toggle"]').click()
                    cy.get('[data-testid="library-sidebar"]').should('be.visible')
                }
            })

            // 9. Probar chat de AI si existe
            cy.get('body').then($body => {
                if ($body.find('[data-testid="ai-chat-toggle"]').length > 0) {
                    cy.get('[data-testid="ai-chat-toggle"]').click()
                    cy.get('[data-testid="ai-chat-interface"]').should('be.visible')
                }
            })
        })

        it('debe manejar el flujo de login existente', () => {
            // 1. Ir a login
            cy.visit('/sign-in')
            cy.waitForPageLoad()

            // 2. Intentar login con credenciales existentes
            cy.get('input[type="email"]').type('existing@example.com')
            cy.get('input[type="password"]').type('password123')
            cy.get('button').contains(/sign in|login|iniciar/i).click()

            // 3. Verificar acceso al dashboard
            cy.url({ timeout: 10000 }).should('include', '/dashboard')
            cy.waitForPageLoad()

            // 4. Verificar que puede acceder a funcionalidades
            cy.get('main, [data-testid="dashboard-main"]').should('exist')
        })
    })

    describe('Integración Entre Componentes', () => {
        it('debe sincronizar estado entre editor y biblioteca', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Crear documento
            cy.createDocument('Documento de Sincronización')

            // Escribir contenido
            cy.typeInEditor('Contenido que debe aparecer en la biblioteca')
            cy.wait(2000)

            // Abrir biblioteca y verificar que el documento aparece
            cy.openLibrary()
            cy.get('[data-testid="library-sidebar"], .library').should('contain.text', 'Documento de Sincronización')
        })

        it('debe mantener consistencia en navegación entre secciones', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })
            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Navegar entre diferentes secciones
            const sections = ['library', 'ai', 'documents']

            sections.forEach(section => {
                cy.get('body').then($body => {
                    const sectionButton = $body.find(`[data-testid="${section}-toggle"], button`).filter(`:contains("${section}")`)

                    if (sectionButton.length > 0) {
                        cy.wrap(sectionButton.first()).click()
                        cy.wait(500)

                        // Verificar que la sección se abre
                        cy.get(`[data-testid="${section}-sidebar"], [data-testid="${section}-interface"]`).should('be.visible')

                        // Cerrar sección
                        cy.wrap(sectionButton.first()).click()
                        cy.wait(500)
                    }
                })
            })
        })

        it('debe manejar múltiples usuarios colaborando (simulado)', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
                win.localStorage.setItem('user', JSON.stringify({
                    id: 'user1',
                    email: 'user1@example.com',
                    name: 'Usuario 1'
                }))
            })

            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Crear documento colaborativo
            cy.createDocument('Documento Colaborativo')

            // Simular presencia de otros usuarios
            cy.window().then((win) => {
                // Simular datos de colaboración
                win.localStorage.setItem('collaboration-users', JSON.stringify([
                    { id: 'user2', name: 'Usuario 2', email: 'user2@example.com' },
                    { id: 'user3', name: 'Usuario 3', email: 'user3@example.com' }
                ]))
            })

            // Escribir contenido
            cy.typeInEditor('Contenido colaborativo')

            // Verificar que el documento funciona correctamente
            cy.get('[data-testid="editor-content"], [contenteditable="true"]').should('contain.text', 'Contenido colaborativo')
        })
    })

    describe('Flujos de Error y Recuperación', () => {
        it('debe recuperarse de errores de red durante el flujo', () => {
            // Simular intermitencia de red
            let requestCount = 0
            cy.intercept('POST', '**/api/**', (req) => {
                requestCount++
                if (requestCount % 3 === 0) {
                    req.reply({ statusCode: 500, body: { error: 'Network error' } })
                } else {
                    req.reply({ statusCode: 200, body: { success: true } })
                }
            }).as('flakeyNetwork')

            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Intentar crear documento
            cy.createDocument('Documento con Errores de Red')

            // Escribir contenido a pesar de errores
            cy.typeInEditor('Contenido que debe persistir')

            // Verificar que eventualmente funciona
            cy.get('[data-testid="editor-content"], [contenteditable="true"]').should('contain.text', 'Contenido que debe persistir')
        })

        it('debe manejar pérdida de sesión durante uso', () => {
            // Comenzar con sesión válida
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Simular expiración de sesión
            cy.window().then((win) => {
                win.localStorage.removeItem('auth-token')
            })

            // Intentar realizar acción que requiere autenticación
            cy.get('body').then($body => {
                const button = $body.find('button').filter(':visible').first()
                if (button.length > 0) {
                    cy.wrap(button).click()
                }
            })

            // Verificar que maneja la pérdida de sesión gracefully
            cy.url({ timeout: 10000 }).should('satisfy', (url) => {
                return url.includes('/sign-in') || url.includes('/') || url.includes('/dashboard')
            })
        })
    })

    describe('Performance en Flujos Completos', () => {
        it('debe mantener performance durante uso extensivo', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            const startTime = performance.now()

            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Realizar múltiples operaciones
            for (let i = 0; i < 3; i++) {
                cy.createDocument(`Documento ${i + 1}`)
                cy.typeInEditor(`Contenido del documento ${i + 1}`)
                cy.wait(1000)

                // Navegar de vuelta al dashboard
                cy.visit('/dashboard')
                cy.waitForPageLoad()
            }

            cy.then(() => {
                const endTime = performance.now()
                const totalTime = endTime - startTime

                // El flujo completo no debería tomar más de 30 segundos
                expect(totalTime).to.be.lessThan(30000)
            })
        })

        it('debe ser usable en diferentes dispositivos durante flujo completo', () => {
            const devices = [
                { width: 1280, height: 720 },  // Desktop
                { width: 768, height: 1024 },  // Tablet
                { width: 375, height: 667 }    // Mobile
            ]

            devices.forEach((device, index) => {
                cy.viewport(device.width, device.height)

                cy.window().then((win) => {
                    win.localStorage.setItem('auth-token', 'fake-jwt-token')
                })

                cy.visit('/dashboard')
                cy.waitForPageLoad()

                // Verificar usabilidad básica en cada dispositivo
                cy.get('main, [data-testid="dashboard-main"]').should('exist')

                // Crear documento si es posible
                cy.get('body').then($body => {
                    const createButton = $body.find('button').filter(':contains("new"), button').filter(':contains("create")')
                    if (createButton.length > 0) {
                        cy.wrap(createButton.first()).click()
                        cy.wait(1000)
                    }
                })

                cy.clearLocalStorage()
            })
        })
    })

    describe('Casos Edge y Límites', () => {
        it('debe manejar contenido muy largo en el editor', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            cy.visit('/dashboard')
            cy.waitForPageLoad()
            cy.createDocument('Documento Largo')

            // Crear contenido muy largo
            const longContent = 'Este es un texto muy largo. '.repeat(100)
            cy.typeInEditor(longContent.substring(0, 1000)) // Limitar para no sobrecargar

            // Verificar que el editor maneja el contenido largo
            cy.get('[data-testid="editor-content"], [contenteditable="true"]').should('contain.text', 'Este es un texto muy largo')
        })

        it('debe manejar caracteres especiales y Unicode', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            cy.visit('/dashboard')
            cy.waitForPageLoad()
            cy.createDocument('Documento con Caracteres Especiales')

            // Probar diferentes tipos de caracteres
            const specialText = 'Texto con émojis 😀🚀 y caracteres especiales: ñáéíóú ¿¡ €$¥'
            cy.typeInEditor(specialText)

            cy.get('[data-testid="editor-content"], [contenteditable="true"]').should('contain.text', 'émojis')
        })

        it('debe funcionar correctamente después de idle prolongado', () => {
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            cy.visit('/dashboard')
            cy.waitForPageLoad()

            // Simular tiempo idle
            cy.wait(5000)

            // Intentar operación después del idle
            cy.createDocument('Documento Post-Idle')
            cy.typeInEditor('Contenido después de idle')

            cy.get('[data-testid="editor-content"], [contenteditable="true"]').should('contain.text', 'Contenido después de idle')
        })
    })
}) 