import { create } from 'zustand';

export const useUIStore = create((set) => ({
    // Estado para el sidebar principal (izquierdo)
    isMainSidebarOpen: true, // O false si quieres que inicie cerrado
    toggleMainSidebar: () => set((state) => ({ isMainSidebarOpen: !state.isMainSidebarOpen })),
    setMainSidebarOpen: (isOpen) => set({ isMainSidebarOpen: isOpen }),

    // Estado para el sidebar de chat (derecho)
    isChatSidebarOpen: false,
    toggleChatSidebar: () => set((state) => ({ isChatSidebarOpen: !state.isChatSidebarOpen })),
    setChatSidebarOpen: (isOpen) => set({ isChatSidebarOpen: isOpen }),

    isLibrarySidebarOpen: false,
    openLibrarySidebar: () => set({ isLibrarySidebarOpen: true, isDocumentsSidebarOpen: false }),
    closeLibrarySidebar: () => set({ isLibrarySidebarOpen: false }),

    isDocumentsSidebarOpen: false,
    openDocumentsSidebar: () => {
        console.log("Abriendo Documents Sidebar...");
        set({ isDocumentsSidebarOpen: true, isLibrarySidebarOpen: false });
    },
    closeDocumentsSidebar: () => set({ isDocumentsSidebarOpen: false }),
}));
