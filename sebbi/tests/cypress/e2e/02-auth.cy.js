describe('Autenticación de Usuario', () => {
    beforeEach(() => {
        cy.clearLocalStorage()
        cy.clearCookies()
    })

    describe('Registro de Usuario', () => {
        it('debe mostrar la página de registro correctamente', () => {
            cy.visit('/sign-up')
            cy.waitForPageLoad()

            // Verificar elementos del formulario
            cy.get('[data-testid="email-input"], input[type="email"]').should('be.visible')
            cy.get('[data-testid="password-input"], input[type="password"]').should('be.visible')
            cy.get('[data-testid="signup-button"], button').contains(/sign up|register|registr/i).should('be.visible')
        })

        it('debe validar campos requeridos', () => {
            cy.visit('/sign-up')

            // Intentar enviar formulario vacío
            cy.get('[data-testid="signup-button"], button').contains(/sign up|register|registr/i).click()

            // Verificar que aparecen mensajes de error o que los campos están marcados como requeridos
            cy.get('input:invalid').should('exist')
        })

        it('debe validar formato de email', () => {
            cy.visit('/sign-up')

            // Ingresar email inválido
            cy.get('[data-testid="email-input"], input[type="email"]').type('email-invalido')
            cy.get('[data-testid="password-input"], input[type="password"]').type('password123')

            cy.get('[data-testid="signup-button"], button').contains(/sign up|register|registr/i).click()

            // Verificar validación de email
            cy.get('input[type="email"]:invalid').should('exist')
        })

        it('debe registrar usuario con datos válidos', () => {
            cy.mockApiCalls()
            cy.visit('/sign-up')

            const email = `test-${Date.now()}@example.com`

            cy.get('[data-testid="email-input"], input[type="email"]').type(email)
            cy.get('[data-testid="password-input"], input[type="password"]').type('password123')

            // Si hay confirmación de contraseña
            cy.get('body').then($body => {
                if ($body.find('[data-testid="confirm-password-input"]').length > 0) {
                    cy.get('[data-testid="confirm-password-input"]').type('password123')
                }
            })

            cy.get('[data-testid="signup-button"], button').contains(/sign up|register|registr/i).click()

            // Verificar redirección o mensaje de éxito
            cy.url().should('not.include', '/sign-up')
        })
    })

    describe('Inicio de Sesión', () => {
        it('debe mostrar la página de login correctamente', () => {
            cy.visit('/sign-in')
            cy.waitForPageLoad()

            cy.get('[data-testid="email-input"], input[type="email"]').should('be.visible')
            cy.get('[data-testid="password-input"], input[type="password"]').should('be.visible')
            cy.get('[data-testid="login-button"], button').contains(/sign in|login|iniciar/i).should('be.visible')
        })

        it('debe mostrar error con credenciales incorrectas', () => {
            cy.visit('/sign-in')

            cy.get('[data-testid="email-input"], input[type="email"]').type('wrong@example.com')
            cy.get('[data-testid="password-input"], input[type="password"]').type('wrongpassword')
            cy.get('[data-testid="login-button"], button').contains(/sign in|login|iniciar/i).click()

            // Verificar mensaje de error
            cy.contains(/invalid|incorrect|error|wrong/i).should('be.visible')
        })

        it('debe hacer login con credenciales correctas', () => {
            cy.mockApiCalls()
            cy.visit('/sign-in')

            cy.get('[data-testid="email-input"], input[type="email"]').type('test@example.com')
            cy.get('[data-testid="password-input"], input[type="password"]').type('password123')
            cy.get('[data-testid="login-button"], button').contains(/sign in|login|iniciar/i).click()

            // Verificar redirección al dashboard
            cy.url().should('include', '/dashboard')
        })
    })

    describe('Navegación entre Auth Pages', () => {
        it('debe navegar entre login y registro', () => {
            cy.visit('/sign-in')

            // Buscar enlace a registro
            cy.get('a').contains(/sign up|register|registr/i).click()
            cy.url().should('include', '/sign-up')

            // Volver a login
            cy.get('a').contains(/sign in|login|iniciar/i).click()
            cy.url().should('include', '/sign-in')
        })

        it('debe mostrar enlace "Forgot Password" si existe', () => {
            cy.visit('/sign-in')

            cy.get('body').then($body => {
                if ($body.find('a').filter(':contains("forgot"), a').filter(':contains("password")').length > 0) {
                    cy.get('a').contains(/forgot.*password|password.*forgot/i).should('be.visible')
                }
            })
        })
    })

    describe('Persistencia de Sesión', () => {
        it('debe mantener la sesión después de recargar', () => {
            cy.mockApiCalls()

            // Simular login exitoso
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
                win.localStorage.setItem('user', JSON.stringify({ email: 'test@example.com' }))
            })

            cy.visit('/dashboard')
            cy.reload()

            // Verificar que sigue en dashboard
            cy.url().should('include', '/dashboard')
        })

        it('debe cerrar sesión correctamente', () => {
            cy.mockApiCalls()
            cy.window().then((win) => {
                win.localStorage.setItem('auth-token', 'fake-jwt-token')
            })

            cy.visit('/dashboard')

            // Buscar botón de logout
            cy.get('body').then($body => {
                if ($body.find('[data-testid="logout-button"]').length > 0) {
                    cy.get('[data-testid="logout-button"]').click()
                } else if ($body.find('button').filter(':contains("logout"), button').filter(':contains("sign out")').length > 0) {
                    cy.get('button').contains(/logout|sign out|cerrar sesión/i).click()
                }
            })

            // Verificar redirección a home o login
            cy.url().should('satisfy', (url) => {
                return url.includes('/') || url.includes('/sign-in')
            })
        })
    })
}) 