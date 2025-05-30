// Helper functions for testing
export const formatDate = (date) => {
    if (!date) return ''
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC'
    }).format(new Date(date))
}

export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

export const generateId = (prefix = 'id') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export const debounce = (func, delay) => {
    let timeoutId
    return (...args) => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
}

describe('Helper Functions', () => {
    describe('formatDate', () => {
        it('formatea correctamente una fecha válida', () => {
            const date = new Date('2024-01-15T00:00:00.000Z')
            const formatted = formatDate(date)
            expect(formatted).toBe('15 de enero de 2024')
        })

        it('retorna string vacío para fecha nula', () => {
            expect(formatDate(null)).toBe('')
            expect(formatDate(undefined)).toBe('')
        })

        it('maneja strings de fecha', () => {
            const formatted = formatDate('2024-12-25T00:00:00.000Z')
            expect(formatted).toBe('25 de diciembre de 2024')
        })
    })

    describe('truncateText', () => {
        it('trunca texto largo correctamente', () => {
            const longText = 'Este es un texto muy largo que necesita ser truncado porque excede el límite de caracteres permitidos'
            const truncated = truncateText(longText, 50)
            expect(truncated).toBe('Este es un texto muy largo que necesita ser trunca...')
            expect(truncated.length).toBe(53) // 50 + '...'
        })

        it('retorna texto corto sin modificar', () => {
            const shortText = 'Texto corto'
            expect(truncateText(shortText, 50)).toBe(shortText)
        })

        it('maneja texto vacío o nulo', () => {
            expect(truncateText('')).toBe('')
            expect(truncateText(null)).toBe(null)
            expect(truncateText(undefined)).toBe(undefined)
        })

        it('usa longitud por defecto', () => {
            const text = 'a'.repeat(150)
            const truncated = truncateText(text)
            expect(truncated.length).toBe(103) // 100 + '...'
        })
    })

    describe('validateEmail', () => {
        it('valida emails correctos', () => {
            expect(validateEmail('test@example.com')).toBe(true)
            expect(validateEmail('user.name@domain.co.uk')).toBe(true)
            expect(validateEmail('user+tag@example.org')).toBe(true)
        })

        it('rechaza emails incorrectos', () => {
            expect(validateEmail('invalid-email')).toBe(false)
            expect(validateEmail('test@')).toBe(false)
            expect(validateEmail('@example.com')).toBe(false)
            expect(validateEmail('test.example.com')).toBe(false)
            expect(validateEmail('')).toBe(false)
        })
    })

    describe('generateId', () => {
        it('genera IDs únicos', () => {
            const id1 = generateId()
            const id2 = generateId()
            expect(id1).not.toBe(id2)
        })

        it('usa prefijo personalizado', () => {
            const id = generateId('user')
            expect(id).toMatch(/^user-\d+-[a-z0-9]+$/)
        })

        it('usa prefijo por defecto', () => {
            const id = generateId()
            expect(id).toMatch(/^id-\d+-[a-z0-9]+$/)
        })
    })

    describe('debounce', () => {
        it('debounce ejecuta función después del delay', (done) => {
            const mockFn = jest.fn()
            const debouncedFn = debounce(mockFn, 100)

            debouncedFn()
            expect(mockFn).not.toHaveBeenCalled()

            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledTimes(1)
                done()
            }, 150)
        })

        it('cancela ejecuciones previas', (done) => {
            const mockFn = jest.fn()
            const debouncedFn = debounce(mockFn, 100)

            debouncedFn()
            debouncedFn()
            debouncedFn()

            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledTimes(1)
                done()
            }, 150)
        })

        it('pasa argumentos correctamente', (done) => {
            const mockFn = jest.fn()
            const debouncedFn = debounce(mockFn, 50)

            debouncedFn('arg1', 'arg2')

            setTimeout(() => {
                expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2')
                done()
            }, 100)
        })
    })
}) 