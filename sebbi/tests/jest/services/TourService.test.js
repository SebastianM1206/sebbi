// Mock dependencies
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
}));

jest.mock('@/stores/uiStore', () => ({
    useUIStore: {
        getState: jest.fn(() => ({
            openDocumentsSidebar: jest.fn(),
            closeDocumentsSidebar: jest.fn(),
            openLibrarySidebar: jest.fn(),
            closeLibrarySidebar: jest.fn(),
            setChatSidebarOpen: jest.fn(),
        }))
    }
}));

import { driver } from 'driver.js';
import { useUIStore } from '@/stores/uiStore';

describe('TourService', () => {
    let mockDriver;
    let mockUiStore;

    beforeEach(() => {
        jest.clearAllMocks();

        mockDriver = {
            setSteps: jest.fn(),
            drive: jest.fn(),
            reset: jest.fn(),
            destroy: jest.fn(),
            refresh: jest.fn(),
            moveNext: jest.fn(),
            movePrevious: jest.fn(),
            hasNextStep: jest.fn().mockReturnValue(true),
            hasPreviousStep: jest.fn().mockReturnValue(false),
        };

        mockUiStore = {
            openDocumentsSidebar: jest.fn(),
            closeDocumentsSidebar: jest.fn(),
            openLibrarySidebar: jest.fn(),
            closeLibrarySidebar: jest.fn(),
            setChatSidebarOpen: jest.fn(),
        };

        driver.mockReturnValue(mockDriver);
        useUIStore.getState.mockReturnValue(mockUiStore);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Driver.js Integration', () => {
        it('debe poder inicializar driver.js con configuración', () => {
            const config = {
                animate: true,
                showProgress: true,
                showButtons: ['next', 'previous', 'close'],
                steps: [],
                onReset: jest.fn()
            };

            const driverInstance = driver(config);

            expect(driver).toHaveBeenCalledWith(config);
            expect(driverInstance).toBe(mockDriver);
        });

        it('debe tener todos los métodos necesarios del driver', () => {
            const driverInstance = driver({});

            expect(driverInstance.setSteps).toBeDefined();
            expect(driverInstance.drive).toBeDefined();
            expect(driverInstance.reset).toBeDefined();
            expect(driverInstance.destroy).toBeDefined();
        });
    });

    describe('UI Store Integration', () => {
        it('debe poder acceder al estado del UI store', () => {
            const state = useUIStore.getState();

            expect(useUIStore.getState).toHaveBeenCalled();
            expect(state).toBe(mockUiStore);
            expect(state.openDocumentsSidebar).toBeDefined();
            expect(state.closeDocumentsSidebar).toBeDefined();
        });

        it('debe poder llamar a las funciones del UI store', () => {
            const state = useUIStore.getState();

            state.openDocumentsSidebar();
            state.closeLibrarySidebar();
            state.setChatSidebarOpen(false);

            expect(mockUiStore.openDocumentsSidebar).toHaveBeenCalled();
            expect(mockUiStore.closeLibrarySidebar).toHaveBeenCalled();
            expect(mockUiStore.setChatSidebarOpen).toHaveBeenCalledWith(false);
        });
    });

    describe('Tour Steps Configuration', () => {
        it('debe poder configurar pasos del tour', () => {
            const driverInstance = driver({});
            const steps = [
                {
                    element: '.sidebar-menu',
                    popover: {
                        title: 'Menú Principal',
                        description: 'Aquí encontrarás todas las funciones principales.',
                        side: 'right',
                        align: 'start'
                    }
                },
                {
                    element: '[data-tour="documents-button"]',
                    popover: {
                        title: 'Documentos',
                        description: 'Accede a todos tus documentos.',
                        side: 'right',
                        align: 'start'
                    },
                    onHighlightStarted: () => {
                        const uiStore = useUIStore.getState();
                        uiStore.openDocumentsSidebar();
                    }
                }
            ];

            driverInstance.setSteps(steps);

            expect(mockDriver.setSteps).toHaveBeenCalledWith(steps);
        });

        it('debe ejecutar callbacks de pasos correctamente', () => {
            const uiStore = useUIStore.getState();
            const callback = () => {
                uiStore.openDocumentsSidebar();
            };

            callback();

            expect(mockUiStore.openDocumentsSidebar).toHaveBeenCalled();
        });
    });

    describe('Tour Lifecycle', () => {
        it('debe poder iniciar el tour', () => {
            const driverInstance = driver({});

            driverInstance.drive();

            expect(mockDriver.drive).toHaveBeenCalled();
        });

        it('debe poder resetear el tour', () => {
            const driverInstance = driver({});

            driverInstance.reset();

            expect(mockDriver.reset).toHaveBeenCalled();
        });

        it('debe manejar el callback onReset', () => {
            const onResetCallback = jest.fn(() => {
                const uiStore = useUIStore.getState();
                uiStore.closeLibrarySidebar();
                uiStore.closeDocumentsSidebar();
                uiStore.setChatSidebarOpen(false);
            });

            driver({ onReset: onResetCallback });

            onResetCallback();

            expect(onResetCallback).toHaveBeenCalled();
            expect(mockUiStore.closeLibrarySidebar).toHaveBeenCalled();
            expect(mockUiStore.closeDocumentsSidebar).toHaveBeenCalled();
            expect(mockUiStore.setChatSidebarOpen).toHaveBeenCalledWith(false);
        });
    });

    describe('Driver Configuration', () => {
        it('debe configurar animaciones', () => {
            const config = { animate: true };
            driver(config);

            expect(driver).toHaveBeenCalledWith(expect.objectContaining({ animate: true }));
        });

        it('debe configurar progreso', () => {
            const config = { showProgress: true };
            driver(config);

            expect(driver).toHaveBeenCalledWith(expect.objectContaining({ showProgress: true }));
        });

        it('debe configurar botones', () => {
            const config = { showButtons: ['next', 'previous', 'close'] };
            driver(config);

            expect(driver).toHaveBeenCalledWith(expect.objectContaining({
                showButtons: ['next', 'previous', 'close']
            }));
        });
    });

    describe('Navigation Methods', () => {
        it('debe poder navegar al siguiente paso', () => {
            const driverInstance = driver({});

            driverInstance.moveNext();

            expect(mockDriver.moveNext).toHaveBeenCalled();
        });

        it('debe poder navegar al paso anterior', () => {
            const driverInstance = driver({});

            driverInstance.movePrevious();

            expect(mockDriver.movePrevious).toHaveBeenCalled();
        });

        it('debe verificar si hay siguiente paso', () => {
            const driverInstance = driver({});

            const hasNext = driverInstance.hasNextStep();

            expect(mockDriver.hasNextStep).toHaveBeenCalled();
            expect(hasNext).toBe(true);
        });

        it('debe verificar si hay paso anterior', () => {
            const driverInstance = driver({});

            const hasPrevious = driverInstance.hasPreviousStep();

            expect(mockDriver.hasPreviousStep).toHaveBeenCalled();
            expect(hasPrevious).toBe(false);
        });
    });
}); 