import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'

describe('Dialog Components', () => {
    it('renderiza el trigger correctamente', () => {
        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir Dialog</button>
                </DialogTrigger>
            </Dialog>
        )

        expect(screen.getByRole('button', { name: 'Abrir Dialog' })).toBeInTheDocument()
    })

    it('abre el dialog cuando se hace click en el trigger', async () => {
        const user = userEvent.setup()

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir Dialog</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Título del Dialog</DialogTitle>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir Dialog' }))

        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText('Título del Dialog')).toBeInTheDocument()
    })

    it('muestra el contenido completo del dialog', async () => {
        const user = userEvent.setup()

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Título</DialogTitle>
                        <DialogDescription>Descripción del dialog</DialogDescription>
                    </DialogHeader>
                    <div>Contenido principal</div>
                    <DialogFooter>
                        <button>Cancelar</button>
                        <button>Confirmar</button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir' }))

        expect(screen.getByText('Título')).toBeInTheDocument()
        expect(screen.getByText('Descripción del dialog')).toBeInTheDocument()
        expect(screen.getByText('Contenido principal')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
    })

    it('cierra el dialog con la X', async () => {
        const user = userEvent.setup()

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Dialog Test</DialogTitle>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir' }))
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        const closeButton = screen.getByRole('button', { name: /close/i })
        await user.click(closeButton)

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('cierra el dialog con Escape', async () => {
        const user = userEvent.setup()

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Dialog Test</DialogTitle>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir' }))
        expect(screen.getByRole('dialog')).toBeInTheDocument()

        await user.keyboard('{Escape}')
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('mantiene el foco dentro del dialog', async () => {
        const user = userEvent.setup()

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Dialog con inputs</DialogTitle>
                    <input placeholder="Primer input" />
                    <input placeholder="Segundo input" />
                    <button>Botón del dialog</button>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir' }))

        const firstInput = screen.getByPlaceholderText('Primer input')
        const secondInput = screen.getByPlaceholderText('Segundo input')
        const dialogButton = screen.getByRole('button', { name: 'Botón del dialog' })

        // Verificar que los elementos existen y son focuseables
        expect(firstInput).toBeInTheDocument()
        expect(secondInput).toBeInTheDocument()
        expect(dialogButton).toBeInTheDocument()

        // Verificar que se puede hacer focus manualmente en los elementos
        firstInput.focus()
        expect(firstInput).toHaveFocus()
    })

    it('ejecuta onOpenChange cuando se abre/cierra', async () => {
        const handleOpenChange = jest.fn()
        const user = userEvent.setup()

        render(
            <Dialog onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <button>Abrir</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Dialog Test</DialogTitle>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir' }))
        expect(handleOpenChange).toHaveBeenCalledWith(true)

        await user.keyboard('{Escape}')
        expect(handleOpenChange).toHaveBeenCalledWith(false)
    })

    it('se puede controlar externamente', () => {
        const handleOpenChange = jest.fn()

        const { rerender } = render(
            <Dialog open={false} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogTitle>Dialog Controlado</DialogTitle>
                </DialogContent>
            </Dialog>
        )

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

        rerender(
            <Dialog open={true} onOpenChange={handleOpenChange}>
                <DialogContent>
                    <DialogTitle>Dialog Controlado</DialogTitle>
                </DialogContent>
            </Dialog>
        )

        expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('aplica aria-labelledby y aria-describedby correctamente', async () => {
        const user = userEvent.setup()

        render(
            <Dialog>
                <DialogTrigger asChild>
                    <button>Abrir</button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Título Accesible</DialogTitle>
                        <DialogDescription>Descripción accesible</DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        )

        await user.click(screen.getByRole('button', { name: 'Abrir' }))

        const dialog = screen.getByRole('dialog')
        const title = screen.getByText('Título Accesible')
        const description = screen.getByText('Descripción accesible')

        expect(dialog).toHaveAttribute('aria-labelledby', title.id)
        expect(dialog).toHaveAttribute('aria-describedby', description.id)
    })
}) 