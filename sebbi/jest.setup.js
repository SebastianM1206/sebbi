import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
    constructor() { }

    observe() {
        return null
    }

    disconnect() {
        return null
    }

    unobserve() {
        return null
    }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
    constructor() { }

    observe() {
        return null
    }

    disconnect() {
        return null
    }

    unobserve() {
        return null
    }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock fetch API
global.fetch = jest.fn()

// Mock console methods to avoid noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
}))

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, ...props }) {
        return <img src={src} alt={alt} {...props} />
    }
})

// Mock driver.js for tour functionality
jest.mock('driver.js', () => ({
    driver: jest.fn(() => ({
        setSteps: jest.fn(),
        drive: jest.fn(),
        reset: jest.fn(),
        destroy: jest.fn(),
        refresh: jest.fn(),
        moveNext: jest.fn(),
        movePrevious: jest.fn(),
        hasNextStep: jest.fn().mockReturnValue(true),
        hasPreviousStep: jest.fn().mockReturnValue(false),
    }))
}))

// Mock Liveblocks
jest.mock('@liveblocks/react', () => ({
    useRoom: () => ({
        id: 'test-room',
        getPresence: jest.fn(),
        updatePresence: jest.fn(),
        subscribe: jest.fn(),
    }),
    useMyPresence: () => [{ cursor: null }, jest.fn()],
    useOthers: () => [],
    useMutation: () => jest.fn(),
    useStorage: () => null,
}))

// Mock TipTap editor
jest.mock('@tiptap/react', () => ({
    useEditor: () => ({
        getHTML: jest.fn(() => '<p>Test content</p>'),
        commands: {
            setContent: jest.fn(),
            focus: jest.fn(),
        },
        isEditable: true,
        setEditable: jest.fn(),
        state: {
            doc: {
                firstChild: {
                    type: { name: 'heading' },
                    attrs: { level: 1 },
                    textContent: 'Test Title',
                    nodeSize: 10
                }
            }
        }
    }),
    EditorContent: ({ editor }) => <div data-testid="editor-content" />,
}))

// Setup cleanup after each test
afterEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
    sessionStorageMock.clear()
}) 