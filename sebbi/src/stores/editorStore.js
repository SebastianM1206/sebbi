import { create } from 'zustand';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const useEditorStore = create((set, get) => ({
    editor: null,
    currentDocument: null,
    isLoading: false,
    isSaving: false,
    isUpdatingTitle: false,
    lastSavedAt: null,
    hasUnsavedChanges: false,

    setEditor: (editor) => set({ editor }),

    setCurrentDocument: (document) => set({
        currentDocument: document,
        hasUnsavedChanges: false,
        lastSavedAt: document?.updated_at ? new Date(document.updated_at) : new Date()
    }),

    setHasUnsavedChanges: (value) => set({ hasUnsavedChanges: value }),

    updateDocumentTitle: async (newTitle) => {
        const { currentDocument, editor: editorFromStore, saveDocumentContent } = get();

        if (!currentDocument) {
            console.warn("updateDocumentTitle llamado sin currentDocument");
            return;
        }

        let originalContentParsed;
        try {
            originalContentParsed = JSON.parse(currentDocument.content);
        } catch (e) {
            console.error("Error al parsear currentDocument.content en updateDocumentTitle:", e);
            set({ isUpdatingTitle: false });
            return;
        }

        set({ isUpdatingTitle: true });

        try {
            const oldTitle = originalContentParsed.title || "";
            const processedNewTitle = newTitle.trim();

            if (processedNewTitle === oldTitle) {
                set({ isUpdatingTitle: false });
                return;
            }

            // Obtener el contenido HTML actual del editor
            const currentHTML = editorFromStore ? editorFromStore.getHTML() : originalContentParsed.blocks;

            const updatedContentStructure = {
                ...originalContentParsed,
                title: processedNewTitle,
                blocks: currentHTML
            };

            // Guardar inmediatamente en la API
            await saveDocumentContent({
                title: processedNewTitle,
                blocks: currentHTML
            });

            // Actualizar la versión local después de guardar exitosamente
            const updatedDocumentLocal = {
                ...currentDocument,
                content: JSON.stringify(updatedContentStructure),
                updated_at: new Date().toISOString()
            };

            set({
                currentDocument: updatedDocumentLocal,
                hasUnsavedChanges: false,  // Ya se guardó
                lastSavedAt: new Date()
            });

            // Actualizar el título en el editor si es necesario
            if (editorFromStore) {
                try {
                    const wasEditable = editorFromStore.isEditable;
                    if (wasEditable) editorFromStore.setEditable(false);

                    const firstNode = editorFromStore.state.doc.firstChild;
                    if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
                        if (firstNode.textContent.trim() !== processedNewTitle) {
                            const transaction = editorFromStore.state.tr.delete(0, firstNode.nodeSize);
                            const newHeading = editorFromStore.schema.nodes.heading.create(
                                { level: 1 },
                                processedNewTitle ? editorFromStore.schema.text(processedNewTitle) : null
                            );
                            transaction.insert(0, newHeading);
                            editorFromStore.view.dispatch(transaction);
                        }
                    } else {
                        const transaction = editorFromStore.state.tr;
                        const newHeading = editorFromStore.schema.nodes.heading.create(
                            { level: 1 },
                            processedNewTitle ? editorFromStore.schema.text(processedNewTitle) : null
                        );
                        transaction.insert(0, newHeading);
                        editorFromStore.view.dispatch(transaction);
                    }

                    if (wasEditable) editorFromStore.setEditable(true);
                } catch (editorError) {
                    console.error("Error al actualizar el título en el editor:", editorError);
                }
            }

        } catch (error) {
            console.error("Error en updateDocumentTitle:", error);
            // Restaurar el contenido original en caso de error
            if (currentDocument && originalContentParsed) {
                set({
                    currentDocument: {
                        ...currentDocument,
                        content: JSON.stringify(originalContentParsed)
                    },
                    hasUnsavedChanges: true
                });
            }
            throw error; // Relanzar el error para manejarlo en el componente
        } finally {
            set({ isUpdatingTitle: false });
        }
    },

    loadDocument: async (documentId) => {
        const { editor: editorFromStore } = get();

        if (!editorFromStore) {
            console.warn("loadDocument: Editor no disponible");
            return;
        }

        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail || !documentId) {
            console.warn("loadDocument: userEmail o documentId faltante.");
            return;
        }

        set({ isLoading: true });
        try {
            const response = await fetch(`${API_URL}/api/v1/documents/${documentId}?email=${encodeURIComponent(userEmail)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Error al cargar el documento desde el servidor." }));
                throw new Error(errorData.detail || "Error al cargar el documento");
            }

            const docFromAPI = await response.json();
            let contentObj;

            try {
                contentObj = JSON.parse(docFromAPI.content);
            } catch (parseError) {
                console.error("Error al parsear contenido del documento cargado:", parseError);
                contentObj = { title: "Sin título", blocks: "<p></p>" }; // Fallback
            }

            const title = contentObj.title || "Sin título";
            let contentHTML = contentObj.blocks || `<h1>${title}</h1><p></p>`;

            // Asegurar que el contenido tenga un H1 con el título correcto
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHTML;
            let h1 = tempDiv.querySelector('h1');

            if (!h1) {
                // Si no hay H1, crear uno con el título
                contentHTML = `<h1>${title}</h1>${contentHTML}`;
            } else if (h1.textContent.trim() !== title) {
                // Si el H1 existe pero tiene un título diferente, actualizarlo
                h1.textContent = title;
                contentHTML = tempDiv.innerHTML;
            }

            // Actualizar el documento en el store
            set({
                currentDocument: {
                    ...docFromAPI,
                    content: JSON.stringify({
                        ...contentObj,
                        title,
                        blocks: contentHTML
                    })
                },
                hasUnsavedChanges: false,
                lastSavedAt: new Date(docFromAPI.updated_at),
            });

            // Actualizar el editor
            if (editorFromStore.isEditable) {
                editorFromStore.commands.setContent(contentHTML);
            }

            return docFromAPI;
        } catch (error) {
            console.error("Error en loadDocument:", error);
            set({ isLoading: false });
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    saveDocumentContent: async (dataToSave) => {
        const { currentDocument } = get();
        if (!currentDocument) {
            console.warn("saveDocumentContent llamado sin currentDocument");
            return; // No se puede guardar sin un documento actual
        }

        let currentContentParsed;
        try {
            currentContentParsed = JSON.parse(currentDocument.content);
        } catch (e) {
            console.error("Error al parsear currentDocument.content en saveDocumentContent:", e);
            set({ isSaving: false, hasUnsavedChanges: true });
            // Considerar notificar al usuario que el contenido local está corrupto
            return; // No intentar guardar si el contenido local está mal
        }

        let newContentForAPI = { ...currentContentParsed };
        let sendUpdateToAPI = false;

        if (dataToSave.title !== undefined) {
            const newTitleTrimmed = dataToSave.title.trim();
            if (newTitleTrimmed !== (newContentForAPI.title || "")) {
                newContentForAPI.title = newTitleTrimmed;
                sendUpdateToAPI = true;
            }
        }

        if (dataToSave.blocks !== undefined && dataToSave.blocks !== newContentForAPI.blocks) {
            newContentForAPI.blocks = dataToSave.blocks;
            sendUpdateToAPI = true;
        }

        if (!sendUpdateToAPI) {
            set({
                hasUnsavedChanges: false,
                lastSavedAt: currentDocument.updated_at ? new Date(currentDocument.updated_at) : new Date(),
                isSaving: false
            });
            return; // No hay nada que guardar
        }

        // Solo poner isSaving en true si no lo está ya (evita múltiples llamadas visuales)
        if (!get().isSaving) set({ isSaving: true });

        try {
            const userEmail = localStorage.getItem("userEmail");
            if (!userEmail) throw new Error("Email de usuario no encontrado para guardar.");

            const response = await fetch(`${API_URL}/api/v1/documents/${currentDocument.id}?email=${encodeURIComponent(userEmail)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: JSON.stringify(newContentForAPI) }), // Enviar el nuevo contenido
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Error desconocido al guardar" }));
                throw new Error(errorData.detail || "Error al guardar en el servidor");
            }

            const updatedDocumentFromAPI = await response.json();

            set({ // No usar state => ({...state.currentDocument}) para evitar sobreescribir el currentDocument que podría haber cambiado
                currentDocument: updatedDocumentFromAPI, // Reemplazar con la respuesta completa de la API
                isSaving: false,
                lastSavedAt: new Date(updatedDocumentFromAPI.updated_at),
                hasUnsavedChanges: false,
            });

        } catch (error) {
            console.error("Error en saveDocumentContent:", error);
            // Dejar que el componente que llama maneje el toast
            set({
                isSaving: false,
                hasUnsavedChanges: true,
            });
            throw error; // Relanzar para que saveDocument pueda capturarlo si es necesario
        }
    },

    saveDocument: async (dataToSave = {}) => {
        const { currentDocument, saveDocumentContent, editor: editorFromStore } = get();
        if (!currentDocument) {
            console.warn("saveDocument llamado sin currentDocument");
            return;
        }

        let contentFromStore;
        try {
            contentFromStore = JSON.parse(currentDocument.content);
        } catch (e) {
            console.error("Error al parsear currentDocument.content en saveDocument:", e);
            contentFromStore = { title: "", blocks: "" };
            if (editorFromStore && editorFromStore.isEditable) {
                try {
                    contentFromStore.blocks = editorFromStore.getHTML();
                    const firstNode = editorFromStore.state.doc.firstChild;
                    if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
                        contentFromStore.title = firstNode.textContent.trim();
                    }
                } catch (editorError) {
                    console.error("Error al obtener contenido del editor como fallback:", editorError);
                }
            }
            // Notificar al usuario desde el componente es mejor
        }

        const titleToSave = dataToSave.title !== undefined ? dataToSave.title.trim() : contentFromStore.title;
        const blocksToSave = dataToSave.blocks !== undefined ? dataToSave.blocks : contentFromStore.blocks;

        set({ isSaving: true });
        try {
            await saveDocumentContent({ title: titleToSave, blocks: blocksToSave });
        } catch (error) {
            // saveDocumentContent ya debería haber puesto isSaving en false si falló
            // y haber manejado hasUnsavedChanges.
            // Si saveDocumentContent relanza el error, se captura aquí.
            // El componente que llama a saveDocument puede manejar el toast.
            if (get().isSaving) { // Solo si saveDocumentContent no lo puso en false (ej. por error antes de la llamada)
                set({ isSaving: false });
            }
        }
    }
}));

export default useEditorStore;