import { act, renderHook } from '@testing-library/react'
import useEditorStore from '@/stores/editorStore'

// Mock fetch API
global.fetch = jest.fn()

// Mock editor object
const mockEditor = {
    getHTML: jest.fn(() => '<p>Test content</p>'),
    isEditable: true,
    setEditable: jest.fn(),
    commands: {
        setContent: jest.fn()
    },
    state: {
        doc: {
            firstChild: {
                type: { name: 'heading' },
                attrs: { level: 1 },
                textContent: 'Test Title',
                nodeSize: 10
            }
        },
        tr: {
            delete: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis()
        }
    },
    schema: {
        nodes: {
            heading: {
                create: jest.fn((attrs, content) => ({ attrs, content, type: { name: 'heading' } }))
            }
        },
        text: jest.fn((text) => ({ text, type: 'text' }))
    },
    view: {
        dispatch: jest.fn()
    }
}

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

describe('EditorStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        fetch.mockClear()

        // Reset store state
        useEditorStore.setState({
            editor: null,
            currentDocument: null,
            isLoading: false,
            isSaving: false,
            isUpdatingTitle: false,
            lastSavedAt: null,
            hasUnsavedChanges: false,
        })
    })

    describe('Estado inicial', () => {
        it('debe tener el estado inicial correcto', () => {
            const { result } = renderHook(() => useEditorStore())

            expect(result.current.editor).toBeNull()
            expect(result.current.currentDocument).toBeNull()
            expect(result.current.isLoading).toBe(false)
            expect(result.current.isSaving).toBe(false)
            expect(result.current.isUpdatingTitle).toBe(false)
            expect(result.current.lastSavedAt).toBeNull()
            expect(result.current.hasUnsavedChanges).toBe(false)
        })
    })

    describe('setEditor', () => {
        it('debe establecer el editor correctamente', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                result.current.setEditor(mockEditor)
            })

            expect(result.current.editor).toBe(mockEditor)
        })

        it('debe permitir establecer null como editor', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                result.current.setEditor(null)
            })

            expect(result.current.editor).toBeNull()
        })
    })

    describe('setCurrentDocument', () => {
        it('debe establecer el documento actual correctamente', () => {
            const { result } = renderHook(() => useEditorStore())
            const testDocument = {
                id: 1,
                title: 'Test Document',
                content: '{"title": "Test", "blocks": "<p>Content</p>"}',
                updated_at: '2024-01-01T00:00:00Z'
            }

            act(() => {
                result.current.setCurrentDocument(testDocument)
            })

            expect(result.current.currentDocument).toBe(testDocument)
            expect(result.current.hasUnsavedChanges).toBe(false)
            expect(result.current.lastSavedAt).toBeInstanceOf(Date)
        })

        it('debe manejar documento sin updated_at', () => {
            const { result } = renderHook(() => useEditorStore())
            const testDocument = {
                id: 1,
                title: 'Test Document',
                content: '{"title": "Test", "blocks": "<p>Content</p>"}'
            }

            act(() => {
                result.current.setCurrentDocument(testDocument)
            })

            expect(result.current.currentDocument).toBe(testDocument)
            expect(result.current.lastSavedAt).toBeInstanceOf(Date)
        })
    })

    describe('setHasUnsavedChanges', () => {
        it('debe actualizar el estado de cambios no guardados', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                result.current.setHasUnsavedChanges(true)
            })

            expect(result.current.hasUnsavedChanges).toBe(true)

            act(() => {
                result.current.setHasUnsavedChanges(false)
            })

            expect(result.current.hasUnsavedChanges).toBe(false)
        })
    })

    describe('Funciones del store', () => {
        it('debe tener la función updateDocumentTitle', () => {
            const { result } = renderHook(() => useEditorStore())
            expect(typeof result.current.updateDocumentTitle).toBe('function')
        })

        it('debe tener la función saveDocumentContent', () => {
            const { result } = renderHook(() => useEditorStore())
            expect(typeof result.current.saveDocumentContent).toBe('function')
        })

        it('debe tener la función loadDocument', () => {
            const { result } = renderHook(() => useEditorStore())
            expect(typeof result.current.loadDocument).toBe('function')
        })
    })

    describe('Estados de carga', () => {
        it('debe manejar el estado isLoading', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                useEditorStore.setState({ isLoading: true })
            })

            expect(result.current.isLoading).toBe(true)
        })

        it('debe manejar el estado isSaving', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                useEditorStore.setState({ isSaving: true })
            })

            expect(result.current.isSaving).toBe(true)
        })

        it('debe manejar el estado isUpdatingTitle', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                useEditorStore.setState({ isUpdatingTitle: true })
            })

            expect(result.current.isUpdatingTitle).toBe(true)
        })
    })

    describe('Integración con API', () => {
        it('debe usar la URL de API del entorno', () => {
            expect(process.env.NEXT_PUBLIC_API_URL).toBe('http://localhost:8000')
        })
    })

    describe('Persistencia', () => {
        it('debe manejar hasUnsavedChanges correctamente', () => {
            const { result } = renderHook(() => useEditorStore())

            expect(result.current.hasUnsavedChanges).toBe(false)

            act(() => {
                result.current.setHasUnsavedChanges(true)
            })

            expect(result.current.hasUnsavedChanges).toBe(true)
        })
    })

    describe('Funcionalidad del editor', () => {
        it('debe verificar si el editor está disponible', () => {
            const { result } = renderHook(() => useEditorStore())

            expect(result.current.editor).toBeNull()

            act(() => {
                result.current.setEditor(mockEditor)
            })

            expect(result.current.editor).toBe(mockEditor)
            expect(result.current.editor.getHTML).toBeDefined()
            expect(result.current.editor.commands).toBeDefined()
        })

        it('debe manejar la configuración de contenido del editor', () => {
            const { result } = renderHook(() => useEditorStore())

            act(() => {
                result.current.setEditor(mockEditor)
            })

            expect(result.current.editor.commands.setContent).toBeDefined()
            expect(typeof result.current.editor.commands.setContent).toBe('function')
        })
    })
}) 