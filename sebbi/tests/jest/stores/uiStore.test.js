import { act, renderHook } from '@testing-library/react'
import { useUIStore } from '@/stores/uiStore'

describe('UIStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useUIStore.setState({
            isMainSidebarOpen: true,
            isChatSidebarOpen: false,
            isLibrarySidebarOpen: false,
            isDocumentsSidebarOpen: false,
        })
    })

    describe('Main Sidebar', () => {
        it('tiene el estado inicial correcto para el sidebar principal', () => {
            const { result } = renderHook(() => useUIStore())

            expect(result.current.isMainSidebarOpen).toBe(true)
        })

        it('alterna el estado del sidebar principal', () => {
            const { result } = renderHook(() => useUIStore())

            act(() => {
                result.current.toggleMainSidebar()
            })

            expect(result.current.isMainSidebarOpen).toBe(false)

            act(() => {
                result.current.toggleMainSidebar()
            })

            expect(result.current.isMainSidebarOpen).toBe(true)
        })

        it('establece el estado del sidebar principal directamente', () => {
            const { result } = renderHook(() => useUIStore())

            act(() => {
                result.current.setMainSidebarOpen(false)
            })

            expect(result.current.isMainSidebarOpen).toBe(false)

            act(() => {
                result.current.setMainSidebarOpen(true)
            })

            expect(result.current.isMainSidebarOpen).toBe(true)
        })
    })

    describe('Chat Sidebar', () => {
        it('tiene el estado inicial correcto para el sidebar de chat', () => {
            const { result } = renderHook(() => useUIStore())

            expect(result.current.isChatSidebarOpen).toBe(false)
        })

        it('alterna el estado del sidebar de chat', () => {
            const { result } = renderHook(() => useUIStore())

            act(() => {
                result.current.toggleChatSidebar()
            })

            expect(result.current.isChatSidebarOpen).toBe(true)

            act(() => {
                result.current.toggleChatSidebar()
            })

            expect(result.current.isChatSidebarOpen).toBe(false)
        })

        it('establece el estado del sidebar de chat directamente', () => {
            const { result } = renderHook(() => useUIStore())

            act(() => {
                result.current.setChatSidebarOpen(true)
            })

            expect(result.current.isChatSidebarOpen).toBe(true)

            act(() => {
                result.current.setChatSidebarOpen(false)
            })

            expect(result.current.isChatSidebarOpen).toBe(false)
        })
    })

    describe('Library Sidebar', () => {
        it('tiene el estado inicial correcto para el sidebar de librería', () => {
            const { result } = renderHook(() => useUIStore())

            expect(result.current.isLibrarySidebarOpen).toBe(false)
        })

        it('abre el sidebar de librería y cierra el de documentos', () => {
            const { result } = renderHook(() => useUIStore())

            // Primero abrimos documentos
            act(() => {
                result.current.openDocumentsSidebar()
            })

            expect(result.current.isDocumentsSidebarOpen).toBe(true)

            // Luego abrimos librería (debe cerrar documentos)
            act(() => {
                result.current.openLibrarySidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(true)
            expect(result.current.isDocumentsSidebarOpen).toBe(false)
        })

        it('cierra el sidebar de librería', () => {
            const { result } = renderHook(() => useUIStore())

            act(() => {
                result.current.openLibrarySidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(true)

            act(() => {
                result.current.closeLibrarySidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(false)
        })
    })

    describe('Documents Sidebar', () => {
        it('tiene el estado inicial correcto para el sidebar de documentos', () => {
            const { result } = renderHook(() => useUIStore())

            expect(result.current.isDocumentsSidebarOpen).toBe(false)
        })

        it('abre el sidebar de documentos y cierra el de librería', () => {
            const { result } = renderHook(() => useUIStore())

            // Primero abrimos librería
            act(() => {
                result.current.openLibrarySidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(true)

            // Mock console.log para capturar el mensaje
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

            // Luego abrimos documentos (debe cerrar librería)
            act(() => {
                result.current.openDocumentsSidebar()
            })

            expect(result.current.isDocumentsSidebarOpen).toBe(true)
            expect(result.current.isLibrarySidebarOpen).toBe(false)
            expect(consoleSpy).toHaveBeenCalledWith("Abriendo Documents Sidebar...")

            consoleSpy.mockRestore()
        })

        it('cierra el sidebar de documentos', () => {
            const { result } = renderHook(() => useUIStore())

            act(() => {
                result.current.openDocumentsSidebar()
            })

            expect(result.current.isDocumentsSidebarOpen).toBe(true)

            act(() => {
                result.current.closeDocumentsSidebar()
            })

            expect(result.current.isDocumentsSidebarOpen).toBe(false)
        })
    })

    describe('Exclusividad entre Library y Documents', () => {
        it('solo permite un sidebar secundario abierto a la vez', () => {
            const { result } = renderHook(() => useUIStore())

            // Inicialmente ambos cerrados
            expect(result.current.isLibrarySidebarOpen).toBe(false)
            expect(result.current.isDocumentsSidebarOpen).toBe(false)

            // Abrir librería
            act(() => {
                result.current.openLibrarySidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(true)
            expect(result.current.isDocumentsSidebarOpen).toBe(false)

            // Abrir documentos (debe cerrar librería)
            act(() => {
                result.current.openDocumentsSidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(false)
            expect(result.current.isDocumentsSidebarOpen).toBe(true)

            // Abrir librería nuevamente (debe cerrar documentos)
            act(() => {
                result.current.openLibrarySidebar()
            })

            expect(result.current.isLibrarySidebarOpen).toBe(true)
            expect(result.current.isDocumentsSidebarOpen).toBe(false)
        })
    })
}) 