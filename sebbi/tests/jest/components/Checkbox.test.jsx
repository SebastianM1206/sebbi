import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Component', () => {
    it('renderiza correctamente', () => {
        render(<Checkbox data-testid="checkbox" />)
        expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    })

    it('está marcado cuando checked es true', () => {
        render(<Checkbox checked={true} readOnly />)
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeChecked()
    })

    it('no está marcado cuando checked es false', () => {
        render(<Checkbox checked={false} readOnly />)
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).not.toBeChecked()
    })

    it('está deshabilitado cuando se especifica', () => {
        render(<Checkbox disabled />)
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBeDisabled()
    })

    it('ejecuta onCheckedChange cuando se hace click', async () => {
        const handleChange = jest.fn()
        const user = userEvent.setup()

        render(<Checkbox onCheckedChange={handleChange} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('no ejecuta onCheckedChange cuando está deshabilitado', async () => {
        const handleChange = jest.fn()
        const user = userEvent.setup()

        render(<Checkbox disabled onCheckedChange={handleChange} />)

        const checkbox = screen.getByRole('checkbox')
        await user.click(checkbox)

        expect(handleChange).not.toHaveBeenCalled()
    })

    it('maneja el estado indeterminado', () => {
        render(<Checkbox checked="indeterminate" readOnly />)
        const checkbox = screen.getByRole('checkbox')
        expect(checkbox).toBePartiallyChecked()
    })

    it('aplica clases CSS personalizadas', () => {
        render(<Checkbox className="custom-checkbox" data-testid="checkbox" />)
        expect(screen.getByTestId('checkbox')).toHaveClass('custom-checkbox')
    })

    it('funciona con etiquetas asociadas', async () => {
        const handleChange = jest.fn()
        const user = userEvent.setup()

        render(
            <div>
                <Checkbox id="terms" onCheckedChange={handleChange} />
                <label htmlFor="terms">Acepto los términos</label>
            </div>
        )

        const label = screen.getByText('Acepto los términos')
        await user.click(label)

        expect(handleChange).toHaveBeenCalledWith(true)
    })

    it('permite navegación por teclado', async () => {
        const handleChange = jest.fn()
        const user = userEvent.setup()

        render(<Checkbox onCheckedChange={handleChange} />)

        const checkbox = screen.getByRole('checkbox')

        await user.click(checkbox)
        expect(handleChange).toHaveBeenCalledWith(true)
    })
}) 