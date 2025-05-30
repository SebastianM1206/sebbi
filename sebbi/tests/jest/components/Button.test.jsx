import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
    it('renderiza correctamente con texto', () => {
        render(<Button>Click me</Button>)
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
    })

    it('aplica la variante correcta', () => {
        render(<Button variant="destructive">Delete</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('bg-destructive')
    })

    it('aplica el tamaño correcto', () => {
        render(<Button size="lg">Large Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toHaveClass('h-10')
    })

    it('está deshabilitado cuando se especifica', () => {
        render(<Button disabled>Disabled</Button>)
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
    })

    it('ejecuta onClick cuando se hace click', async () => {
        const handleClick = jest.fn()
        const user = userEvent.setup()

        render(<Button onClick={handleClick}>Click me</Button>)

        await user.click(screen.getByRole('button'))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('no ejecuta onClick cuando está deshabilitado', async () => {
        const handleClick = jest.fn()
        const user = userEvent.setup()

        render(<Button disabled onClick={handleClick}>Disabled</Button>)

        await user.click(screen.getByRole('button'))
        expect(handleClick).not.toHaveBeenCalled()
    })

    it('renderiza como un enlace cuando asChild está presente', () => {
        render(
            <Button asChild>
                <a href="/test">Link Button</a>
            </Button>
        )

        const link = screen.getByRole('link')
        expect(link).toBeInTheDocument()
        expect(link).toHaveAttribute('href', '/test')
    })
}) 