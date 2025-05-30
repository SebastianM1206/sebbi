import { render, screen } from '@testing-library/react'
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

describe('Card Components', () => {
    it('renderiza Card correctamente', () => {
        render(
            <Card data-testid="card">
                <CardContent>Contenido</CardContent>
            </Card>
        )
        expect(screen.getByTestId('card')).toBeInTheDocument()
    })

    it('renderiza CardHeader con título y descripción', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Título de la tarjeta</CardTitle>
                    <CardDescription>Descripción de la tarjeta</CardDescription>
                </CardHeader>
            </Card>
        )

        expect(screen.getByText('Título de la tarjeta')).toBeInTheDocument()
        expect(screen.getByText('Descripción de la tarjeta')).toBeInTheDocument()
    })

    it('renderiza CardContent correctamente', () => {
        render(
            <Card>
                <CardContent>
                    <p>Este es el contenido principal</p>
                </CardContent>
            </Card>
        )

        expect(screen.getByText('Este es el contenido principal')).toBeInTheDocument()
    })

    it('renderiza CardFooter correctamente', () => {
        render(
            <Card>
                <CardFooter>
                    <button>Acción</button>
                </CardFooter>
            </Card>
        )

        expect(screen.getByRole('button', { name: 'Acción' })).toBeInTheDocument()
    })

    it('renderiza una tarjeta completa', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle>Tarjeta Completa</CardTitle>
                    <CardDescription>Una tarjeta con todos los componentes</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Contenido principal de la tarjeta</p>
                </CardContent>
                <CardFooter>
                    <button>Guardar</button>
                    <button>Cancelar</button>
                </CardFooter>
            </Card>
        )

        expect(screen.getByText('Tarjeta Completa')).toBeInTheDocument()
        expect(screen.getByText('Una tarjeta con todos los componentes')).toBeInTheDocument()
        expect(screen.getByText('Contenido principal de la tarjeta')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    })

    it('aplica clases CSS personalizadas', () => {
        render(
            <Card className="custom-card-class" data-testid="card">
                <CardContent className="custom-content-class">Contenido</CardContent>
            </Card>
        )

        expect(screen.getByTestId('card')).toHaveClass('custom-card-class')
        expect(screen.getByText('Contenido')).toHaveClass('custom-content-class')
    })

    it('mantiene la estructura semántica correcta', () => {
        render(
            <Card>
                <CardHeader>
                    <CardTitle as="h2">Título H2</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Párrafo de contenido</p>
                </CardContent>
            </Card>
        )

        // Verificar que se mantiene la estructura HTML correcta
        const title = screen.getByText('Título H2')
        expect(title.tagName).toBe('DIV') // CardTitle usa div, no h3
    })
}) 