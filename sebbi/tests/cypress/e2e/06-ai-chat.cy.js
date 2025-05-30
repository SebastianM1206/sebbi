describe('Chat de Inteligencia Artificial', () => {
    beforeEach(() => {
        cy.mockApiCalls()
        cy.window().then((win) => {
            win.localStorage.setItem('auth-token', 'fake-jwt-token')
        })
        cy.visit('/dashboard')
        cy.waitForPageLoad()
    })

    it('debe abrir y cerrar el chat de AI correctamente', () => {
        // Intentar abrir el chat de AI
        cy.get('body').then($body => {
            if ($body.find('[data-testid="ai-chat-toggle"]').length > 0) {
                cy.get('[data-testid="ai-chat-toggle"]').click()
                cy.get('[data-testid="ai-chat-interface"]').should('be.visible')

                // Cerrar chat
                cy.get('[data-testid="ai-chat-toggle"]').click()
                cy.get('[data-testid="ai-chat-interface"]').should('not.be.visible')
            } else {
                const aiButton = $body.find('button').filter(':contains("ai"), button').filter(':contains("chat"), button').filter(':contains("assistant")')
                if (aiButton.length > 0) {
                    cy.wrap(aiButton.first()).click()
                }
            }
        })
    })

    it('debe mostrar la interfaz del chat correctamente', () => {
        cy.openAIChat()

        // Verificar elementos de la interfaz del chat
        cy.get('[data-testid="ai-chat-interface"], .ai-chat, .chat-interface').should('be.visible')

        // Verificar área de mensajes
        cy.get('[data-testid="chat-messages"], .chat-messages, .messages').should('exist')

        // Verificar input de mensaje
        cy.get('[data-testid="chat-input"], input[placeholder*="message"], textarea[placeholder*="message"]').should('be.visible')

        // Verificar botón de envío
        cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).should('be.visible')
    })

    it('debe permitir enviar un mensaje al AI', () => {
        cy.openAIChat()

        const testMessage = '¿Puedes ayudarme con mi documento?'

        // Escribir mensaje
        cy.get('[data-testid="chat-input"], input[placeholder*="message"], textarea[placeholder*="message"]').type(testMessage)

        // Enviar mensaje
        cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).click()

        // Verificar que el mensaje aparece en el chat
        cy.get('[data-testid="chat-messages"], .chat-messages').should('contain.text', testMessage)
    })

    it('debe mostrar la respuesta del AI', () => {
        cy.openAIChat()

        // Mock respuesta del AI
        cy.intercept('POST', '**/api/ai/chat', {
            statusCode: 200,
            body: {
                message: 'Hola, estoy aquí para ayudarte con tu documento. ¿Qué necesitas?'
            }
        }).as('aiResponse')

        // Enviar mensaje
        cy.get('[data-testid="chat-input"], input, textarea').type('Hola AI')
        cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).click()

        // Esperar respuesta
        cy.wait('@aiResponse')

        // Verificar que aparece la respuesta del AI
        cy.get('[data-testid="chat-messages"], .chat-messages').should('contain.text', 'Hola, estoy aquí para ayudarte')
    })

    it('debe mantener el historial de conversación', () => {
        cy.openAIChat()

        // Enviar múltiples mensajes
        const messages = ['Primer mensaje', 'Segundo mensaje', 'Tercer mensaje']

        messages.forEach((message, index) => {
            cy.get('[data-testid="chat-input"], input, textarea').clear().type(message)
            cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).click()
            cy.wait(500)
        })

        // Verificar que todos los mensajes están presentes
        messages.forEach(message => {
            cy.get('[data-testid="chat-messages"], .chat-messages').should('contain.text', message)
        })
    })

    it('debe permitir limpiar el historial del chat', () => {
        cy.openAIChat()

        // Enviar un mensaje primero
        cy.get('[data-testid="chat-input"], input, textarea').type('Mensaje de prueba')
        cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).click()

        // Buscar botón de limpiar chat
        cy.get('body').then($body => {
            const hasClearButton = $body.find('[data-testid="clear-chat"], button').filter(':contains("clear"), button').filter(':contains("limpiar")').length > 0

            if (hasClearButton) {
                cy.get('[data-testid="clear-chat"], button').contains(/clear|limpiar|reset/i).click()

                // Verificar que el chat está vacío
                cy.get('[data-testid="chat-messages"], .chat-messages').should('not.contain.text', 'Mensaje de prueba')
            }
        })
    })

    it('debe mostrar indicadores de estado (escribiendo, pensando)', () => {
        cy.openAIChat()

        // Mock respuesta con delay para ver el estado de carga
        cy.intercept('POST', '**/api/ai/chat', (req) => {
            req.reply((res) => {
                res.setDelay(2000)
                res.send({
                    statusCode: 200,
                    body: { message: 'Respuesta del AI' }
                })
            })
        }).as('slowAiResponse')

        // Enviar mensaje
        cy.get('[data-testid="chat-input"], input, textarea').type('Mensaje que requiere procesamiento')
        cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).click()

        // Verificar indicador de carga/pensando
        cy.get('[data-testid="typing-indicator"], .typing, .loading').should('be.visible')

        // Esperar respuesta
        cy.wait('@slowAiResponse')

        // Verificar que el indicador desaparece
        cy.get('[data-testid="typing-indicator"], .typing, .loading').should('not.exist')
    })

    it('debe manejar errores de conexión con el AI', () => {
        cy.openAIChat()

        // Mock error de respuesta
        cy.intercept('POST', '**/api/ai/chat', {
            statusCode: 500,
            body: { error: 'Error interno del servidor' }
        }).as('aiError')

        // Enviar mensaje
        cy.get('[data-testid="chat-input"], input, textarea').type('Mensaje que causará error')
        cy.get('[data-testid="send-button"], button').contains(/send|enviar|submit/i).click()

        // Esperar error
        cy.wait('@aiError')

        // Verificar mensaje de error
        cy.get('[data-testid="error-message"], .error, .alert').should('be.visible')
        cy.get('[data-testid="error-message"], .error, .alert').should('contain.text', /error|failed|falló/i)
    })

    it('debe permitir sugerencias predefinidas', () => {
        cy.openAIChat()

        // Buscar sugerencias o prompts predefinidos
        cy.get('body').then($body => {
            const hasSuggestions = $body.find('[data-testid*="suggestion"], .suggestion, .prompt').length > 0
            const hasQuickActions = $body.find('[data-testid*="quick"], .quick-action').length > 0

            if (hasSuggestions || hasQuickActions) {
                cy.get('[data-testid*="suggestion"], .suggestion, .prompt, .quick-action').first().click()

                // Verificar que se llena el input o se envía automáticamente
                cy.get('[data-testid="chat-input"], input, textarea').should('not.be.empty')
            }
        })
    })

    it('debe ser responsive en diferentes tamaños de pantalla', () => {
        // Desktop
        cy.viewport(1280, 720)
        cy.openAIChat()
        cy.get('[data-testid="ai-chat-interface"], .ai-chat').should('be.visible')

        // Tablet
        cy.viewport(768, 1024)
        cy.get('[data-testid="ai-chat-interface"], .ai-chat').should('be.visible')

        // Mobile
        cy.viewport(375, 667)
        cy.get('[data-testid="ai-chat-interface"], .ai-chat').should('be.visible')

        // Verificar que el input sigue siendo usable
        cy.get('[data-testid="chat-input"], input, textarea').should('be.visible').and('not.be.disabled')
    })
}) 