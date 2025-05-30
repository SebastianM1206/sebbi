import { renderHook, act } from '@testing-library/react'
import * as React from 'react'
import { useIsMobile } from '@/hooks/use-mobile'

// Mock window.matchMedia
const mockMatchMedia = (matches) => {
    return jest.fn().mockImplementation(query => ({
        matches,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    }));
};

// Mock window.innerWidth
Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
});

describe('useIsMobile', () => {
    let matchMediaMock;
    let addEventListenerSpy;
    let removeEventListenerSpy;

    beforeEach(() => {
        matchMediaMock = mockMatchMedia(false);
        window.matchMedia = matchMediaMock;
        addEventListenerSpy = jest.fn();
        removeEventListenerSpy = jest.fn();

        matchMediaMock.mockReturnValue({
            matches: false,
            media: '',
            onchange: null,
            addListener: jest.fn(),
            removeListener: jest.fn(),
            addEventListener: addEventListenerSpy,
            removeEventListener: removeEventListenerSpy,
            dispatchEvent: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('debe retornar false en dispositivos desktop (>= 768px)', () => {
        window.innerWidth = 1024;

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('debe retornar true en dispositivos móviles (< 768px)', () => {
        window.innerWidth = 500;

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('debe retornar false cuando el ancho es exactamente 768px', () => {
        window.innerWidth = 768;

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it('debe retornar true cuando el ancho es 767px', () => {
        window.innerWidth = 767;

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it('debe configurar un media query listener con el breakpoint correcto', () => {
        renderHook(() => useIsMobile());

        expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });

    it('debe agregar un event listener para cambios de media query', () => {
        renderHook(() => useIsMobile());

        expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('debe remover el event listener en cleanup', () => {
        const { unmount } = renderHook(() => useIsMobile());

        unmount();

        expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('debe manejar el estado inicial correctamente', () => {
        // El hook inicializa con undefined pero luego se actualiza basado en window.innerWidth
        window.innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());

        // El hook debería retornar false para desktop
        expect(result.current).toBe(false);
    });

    it('debe usar el MOBILE_BREAKPOINT constante (768)', () => {
        window.innerWidth = 769;
        renderHook(() => useIsMobile());

        // Verifica que se use 767px como max-width (768 - 1)
        expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 767px)');
    });

    it('debe retornar un booleano en todos los casos', () => {
        // Caso desktop
        window.innerWidth = 1200;
        const { result: result1 } = renderHook(() => useIsMobile());
        expect(typeof result1.current).toBe('boolean');

        // Caso móvil
        window.innerWidth = 320;
        const { result: result2 } = renderHook(() => useIsMobile());
        expect(typeof result2.current).toBe('boolean');

        // Caso límite
        window.innerWidth = 768;
        const { result: result3 } = renderHook(() => useIsMobile());
        expect(typeof result3.current).toBe('boolean');
    });

    it('debe responder a cambios de media query', () => {
        window.innerWidth = 1024;
        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        // Simular cambio en el media query
        act(() => {
            // Cambiar el valor de matches en el mock
            matchMediaMock.mockReturnValue({
                matches: true,
                media: '',
                onchange: null,
                addListener: jest.fn(),
                removeListener: jest.fn(),
                addEventListener: addEventListenerSpy,
                removeEventListener: removeEventListenerSpy,
                dispatchEvent: jest.fn(),
            });

            // Simular el evento de cambio
            const changeHandler = addEventListenerSpy.mock.calls[0][1];
            if (changeHandler) {
                window.innerWidth = 500;
                changeHandler();
            }
        });

        // Después del cambio, debería reflejar el nuevo estado
        expect(result.current).toBe(true);
    });

    it('debe manejar múltiples renderizados correctamente', () => {
        window.innerWidth = 800;

        const { result: result1 } = renderHook(() => useIsMobile());
        const { result: result2 } = renderHook(() => useIsMobile());

        expect(result1.current).toBe(result2.current);
        expect(result1.current).toBe(false);
    });

    it('debe manejar valores extremos de ancho de ventana', () => {
        // Muy pequeño
        window.innerWidth = 1;
        const { result: result1 } = renderHook(() => useIsMobile());
        expect(result1.current).toBe(true);

        // Muy grande
        window.innerWidth = 99999;
        const { result: result2 } = renderHook(() => useIsMobile());
        expect(result2.current).toBe(false);
    });
}); 