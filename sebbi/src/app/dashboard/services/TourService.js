import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useUIStore } from "@/stores/uiStore";

class TourService {
    constructor() {
        if (TourService.instance) {
            return TourService.instance;
        }
        TourService.instance = this;

        this.driverObj = driver({
            animate: true,
            showProgress: true,
            showButtons: ['next', 'previous', 'close'],
            steps: [],
            onReset: () => {
                console.log('Tour terminado o reseteado');
                // Restaurar estado original de los sidebars
                const uiStore = useUIStore.getState();
                uiStore.closeLibrarySidebar();
                uiStore.closeDocumentsSidebar();
                uiStore.setChatSidebarOpen(false);
            }
        });
    }

    setDashboardSteps() {
        const uiStore = useUIStore.getState();

        this.driverObj.setSteps([
            {
                element: '.sidebar-menu',
                popover: {
                    title: 'Menú Principal',
                    description: 'Aquí encontrarás todas las funciones principales de la aplicación.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '[data-tour="documents-button"]',
                popover: {
                    title: 'Documentos',
                    description: 'Accede a todos tus documentos guardados.',
                    side: "right",
                    align: 'start'
                },
                onHighlightStarted: () => {
                    uiStore.openDocumentsSidebar();
                }
            },
            {
                element: '[data-tour="documents-content"]',
                popover: {
                    title: 'Lista de Documentos',
                    description: 'Aquí puedes ver y gestionar todos tus documentos.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '[data-tour="library-button"]',
                popover: {
                    title: 'Biblioteca',
                    description: 'Gestiona tus documentos PDF y referencias.',
                    side: "right",
                    align: 'start'
                },
                onHighlightStarted: () => {
                    uiStore.openLibrarySidebar();
                }
            },
            {
                element: '[data-tour="sources"]',
                popover: {
                    title: 'Fuentes',
                    description: 'Visualiza y gestiona todos tus PDFs subidos.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '[data-tour="collections"]',
                popover: {
                    title: 'Colecciones',
                    description: 'Organiza tus PDFs en carpetas para una mejor gestión.',
                    side: "right",
                    align: 'start'
                }
            },
            {
                element: '[data-tour="upload"]',
                popover: {
                    title: 'Subir PDF',
                    description: 'Añade nuevos documentos PDF a tu biblioteca.',
                    side: "bottom",
                    align: 'start'
                }
            },
            {
                element: '[data-tour="chat-button"]',
                popover: {
                    title: 'Chat IA',
                    description: 'Interactúa con la IA para obtener ayuda con tus documentos.',
                    side: "right",
                    align: 'start'
                },
                onHighlightStarted: () => {
                    uiStore.setChatSidebarOpen(true);
                }
            },
            {
                element: '[data-tour="chat-content"]',
                popover: {
                    title: 'Asistente IA',
                    description: 'Haz preguntas y obtén ayuda inteligente para tus documentos.',
                    side: "left",
                    align: 'start'
                }
            },
            {
                element: '[data-tour="editor"]',
                popover: {
                    title: 'Editor Principal',
                    description: 'Este es tu espacio de trabajo principal donde puedes escribir y editar tu documento.',
                    side: "bottom",
                    align: 'start'
                }
            }
        ]);
    }

    startTour() {
        this.driverObj.drive();
    }

    destroy() {
        this.driverObj.destroy();
    }
}

export const tourService = new TourService(); 