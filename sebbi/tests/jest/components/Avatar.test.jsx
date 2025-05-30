import { render, screen } from '@testing-library/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

describe('Avatar Components', () => {
    it('renderiza el fallback cuando se proporciona', () => {
        render(
            <Avatar>
                <AvatarImage src="/test-avatar.jpg" alt="Test User" />
                <AvatarFallback>TU</AvatarFallback>
            </Avatar>
        )

        // El avatar muestra el fallback por defecto en el entorno de testing
        const fallback = screen.getByText('TU')
        expect(fallback).toBeInTheDocument()
    })

    it('muestra el fallback cuando no hay imagen', () => {
        render(
            <Avatar>
                <AvatarFallback>FB</AvatarFallback>
            </Avatar>
        )

        expect(screen.getByText('FB')).toBeInTheDocument()
    })

    it('aplica clases CSS correctas', () => {
        render(
            <Avatar>
                <AvatarFallback>CS</AvatarFallback>
            </Avatar>
        )

        const avatar = screen.getByText('CS').closest('[data-slot="avatar"]')
        expect(avatar).toHaveClass('relative', 'flex', 'shrink-0', 'overflow-hidden', 'rounded-full')
    })

    it('permite configurar el tamaño', () => {
        render(
            <Avatar className="size-16">
                <AvatarFallback>LG</AvatarFallback>
            </Avatar>
        )

        const avatar = screen.getByText('LG').closest('[data-slot="avatar"]')
        expect(avatar).toHaveClass('size-16')
    })

    it('mantiene la estructura semántica correcta', () => {
        render(
            <Avatar data-testid="avatar">
                <AvatarFallback>ST</AvatarFallback>
            </Avatar>
        )

        const avatar = screen.getByTestId('avatar')
        expect(avatar.tagName).toBe('SPAN')

        const fallback = screen.getByText('ST')
        expect(fallback.tagName).toBe('SPAN')
    })

    it('maneja contenido personalizado en fallback', () => {
        render(
            <Avatar>
                <AvatarFallback>
                    <span>Custom Content</span>
                </AvatarFallback>
            </Avatar>
        )

        expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('funciona con diferentes tipos de fallback', () => {
        render(
            <Avatar>
                <AvatarFallback>AB</AvatarFallback>
            </Avatar>
        )

        expect(screen.getByText('AB')).toBeInTheDocument()
    })

    it('mantiene las propiedades data-slot', () => {
        render(
            <Avatar>
                <AvatarFallback>DS</AvatarFallback>
            </Avatar>
        )

        const avatar = screen.getByText('DS').closest('[data-slot="avatar"]')
        const fallback = screen.getByText('DS').closest('[data-slot="avatar-fallback"]')

        expect(avatar).toBeInTheDocument()
        expect(fallback).toBeInTheDocument()
    })

    it('puede renderizar múltiples avatares', () => {
        render(
            <>
                <Avatar>
                    <AvatarFallback>A1</AvatarFallback>
                </Avatar>
                <Avatar>
                    <AvatarFallback>A2</AvatarFallback>
                </Avatar>
            </>
        )

        expect(screen.getByText('A1')).toBeInTheDocument()
        expect(screen.getByText('A2')).toBeInTheDocument()
    })

    it('aplica estilos de fondo correctos al fallback', () => {
        render(
            <Avatar>
                <AvatarFallback>BG</AvatarFallback>
            </Avatar>
        )

        const fallback = screen.getByText('BG')
        expect(fallback).toHaveClass('bg-muted', 'flex', 'items-center', 'justify-center')
    })
}) 