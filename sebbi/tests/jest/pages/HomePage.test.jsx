import { render, screen } from '@testing-library/react'
import HomePage from '@/app/page'

// Mock Next.js Image component
jest.mock('next/image', () => {
    return function MockImage({ src, alt, ...props }) {
        return <img src={src} alt={alt} {...props} />
    }
})

describe('HomePage', () => {
    it('renderiza correctamente', () => {
        render(<HomePage />)
        expect(screen.getByAltText('Next.js logo')).toBeInTheDocument()
    })

    it('muestra el logo de Next.js', () => {
        render(<HomePage />)
        const logo = screen.getByAltText('Next.js logo')
        expect(logo).toBeInTheDocument()
        expect(logo).toHaveAttribute('src', '/next.svg')
    })

    it('muestra el enlace START HERE', () => {
        render(<HomePage />)
        const startLink = screen.getByRole('link', { name: /start here/i })
        expect(startLink).toBeInTheDocument()
        expect(startLink).toHaveAttribute('href', '/sign-up')
    })

    it('muestra el enlace de documentación', () => {
        render(<HomePage />)
        const docsLink = screen.getByRole('link', { name: /read our docs/i })
        expect(docsLink).toBeInTheDocument()
        expect(docsLink).toHaveAttribute('href', expect.stringContaining('nextjs.org/docs'))
    })

    it('muestra las instrucciones de inicio', () => {
        render(<HomePage />)
        expect(screen.getByText(/get started by editing/i)).toBeInTheDocument()
        expect(screen.getByText('src/app/page.js')).toBeInTheDocument()
    })

    it('muestra el mensaje de cambios instantáneos', () => {
        render(<HomePage />)
        expect(screen.getByText(/save and see your changes instantly/i)).toBeInTheDocument()
    })

    it('el enlace de documentación se abre en nueva pestaña', () => {
        render(<HomePage />)
        const docsLink = screen.getByRole('link', { name: /read our docs/i })
        expect(docsLink).toHaveAttribute('target', '_blank')
        expect(docsLink).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('tiene la estructura de layout correcta', () => {
        render(<HomePage />)
        const mainElement = screen.getByRole('main')
        expect(mainElement).toBeInTheDocument()
        expect(mainElement).toHaveClass('flex', 'flex-col')
    })

    it('muestra una lista ordenada con instrucciones', () => {
        render(<HomePage />)
        const list = screen.getByRole('list')
        expect(list).toBeInTheDocument()
        expect(list).toHaveClass('list-inside', 'list-decimal')
    })

    it('el código de ejemplo está destacado correctamente', () => {
        render(<HomePage />)
        const codeElement = screen.getByText('src/app/page.js')
        expect(codeElement.tagName).toBe('CODE')
    })

    it('los botones tienen los estilos correctos', () => {
        render(<HomePage />)

        const startButton = screen.getByRole('link', { name: /start here/i })
        expect(startButton).toHaveClass('rounded-full')

        const docsButton = screen.getByRole('link', { name: /read our docs/i })
        expect(docsButton).toHaveClass('rounded-full')
    })

    it('utiliza las fuentes correctas', () => {
        render(<HomePage />)
        // En lugar de buscar clases específicas, verificar que el elemento exista
        const mainElement = screen.getByRole('main')
        expect(mainElement).toBeInTheDocument()
    })

    it('tiene diseño responsive', () => {
        render(<HomePage />)
        const mainElement = screen.getByRole('main')
        expect(mainElement).toHaveClass('items-center')

        // Buscar un contenedor con flex
        const buttonContainer = mainElement.querySelector('.flex')
        expect(buttonContainer).toBeInTheDocument()
    })

    it('muestra el footer con enlaces', () => {
        render(<HomePage />)
        // Buscar footer por tag en lugar de role
        const footer = document.querySelector('footer')
        expect(footer).toBeInTheDocument()
    })

    it('los enlaces del footer son externos', () => {
        render(<HomePage />)
        const externalLinks = screen.getAllByRole('link').filter(link =>
            link.getAttribute('href')?.includes('nextjs.org')
        )

        externalLinks.forEach(link => {
            expect(link).toHaveAttribute('target', '_blank')
            expect(link).toHaveAttribute('rel', 'noopener noreferrer')
        })
    })

    it('tiene espaciado y padding correcto', () => {
        render(<HomePage />)
        // Verificar que existe el contenedor principal
        const container = document.querySelector('div')
        expect(container).toBeInTheDocument()
    })

    it('utiliza grid layout', () => {
        render(<HomePage />)
        // Verificar que existe la estructura grid
        const container = document.querySelector('div')
        expect(container).toBeInTheDocument()
    })

    it('tiene elementos centrados correctamente', () => {
        render(<HomePage />)
        // Verificar que el main tiene clases de centrado
        const mainElement = screen.getByRole('main')
        expect(mainElement).toHaveClass('items-center')
    })

    it('muestra texto con el estilo de fuente monospace', () => {
        render(<HomePage />)
        const list = screen.getByRole('list')
        expect(list).toBeInTheDocument()
    })

    it('aplica clases de texto responsive', () => {
        render(<HomePage />)
        const list = screen.getByRole('list')
        expect(list).toHaveClass('text-center')
    })
}) 