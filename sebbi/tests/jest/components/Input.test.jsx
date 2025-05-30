import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from '@/components/ui/input'

describe('Input Component', () => {
    it('renderiza correctamente', () => {
        render(<Input />)
        expect(screen.getByRole('textbox')).toBeInTheDocument()
    })

    it('muestra el placeholder correctamente', () => {
        render(<Input placeholder="Escribe aquí..." />)
        expect(screen.getByPlaceholderText('Escribe aquí...')).toBeInTheDocument()
    })

    it('aplica el valor inicial', () => {
        render(<Input value="Valor inicial" readOnly />)
        expect(screen.getByDisplayValue('Valor inicial')).toBeInTheDocument()
    })

    it('está deshabilitado cuando se especifica', () => {
        render(<Input disabled />)
        expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('maneja cambios de texto correctamente', async () => {
        const handleChange = jest.fn()
        const user = userEvent.setup()

        render(<Input onChange={handleChange} />)

        const input = screen.getByRole('textbox')
        await user.type(input, 'Nuevo texto')

        expect(handleChange).toHaveBeenCalled()
        expect(input).toHaveValue('Nuevo texto')
    })

    it('aplica diferentes tipos de input', () => {
        render(<Input type="password" />)
        const input = document.querySelector('input[type="password"]')
        expect(input).toBeInTheDocument()
        expect(input).toHaveAttribute('type', 'password')
    })

    it('mantiene el foco correctamente', async () => {
        const user = userEvent.setup()
        render(<Input />)

        const input = screen.getByRole('textbox')
        await user.click(input)

        expect(input).toHaveFocus()
    })

    it('aplica clases CSS personalizadas', () => {
        render(<Input className="custom-class" />)
        const input = screen.getByRole('textbox')
        expect(input).toHaveClass('custom-class')
    })

    it('maneja eventos de teclado', async () => {
        const handleKeyDown = jest.fn()
        const user = userEvent.setup()

        render(<Input onKeyDown={handleKeyDown} />)

        const input = screen.getByRole('textbox')
        await user.type(input, '{enter}')

        expect(handleKeyDown).toHaveBeenCalled()
    })
}) 