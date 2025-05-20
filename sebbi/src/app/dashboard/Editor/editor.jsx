"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import OrderedList from '@tiptap/extension-ordered-list'
import Link from '@tiptap/extension-link';
import { TooltipProvider } from "@/components/ui/tooltip";
import useEditorStore from '@/stores/editorStore';
import { toast } from "sonner";
import ListItem from '@tiptap/extension-list-item'
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import EditorContentWrapper from './components/EditorContent';
import SaveIndicator from './components/SaveIndicator';
import BulletList from '@tiptap/extension-bullet-list';


// Tiempo entre cada guardado automático (3 segundos)
const AUTO_SAVE_INTERVAL = 3000;

export default function NotionStyleEditor() {
    const [documentTitle, setDocumentTitle] = useState("");
    const [wordCount, setWordCount] = useState(0);
    const [menuState, setMenuState] = useState({
        isOpen: false,
        position: null,
        query: '',
        range: null,
        selectedIndex: 0,
        filteredItems: [],
    });
    const [isLoadingEditor, setIsLoadingEditor] = useState(true);

    const {
        editor: editorInstanceFromStore,
        setEditor,
        saveDocument,
        currentDocument,
        setHasUnsavedChanges,
        updateDocumentTitle,
        hasUnsavedChanges: storeHasUnsavedChanges,
        isUpdatingTitle
    } = useEditorStore();
    const commandMenuRef = useRef(null);
    const autoSaveTimerRef = useRef(null);
    const hasContentChangedRef = useRef(false);
    const debounceTimeoutRef = useRef(null);

    // Configuración de guardado automático
    const scheduleAutoSave = useCallback(() => {
        clearTimeout(autoSaveTimerRef.current);

        if (hasContentChangedRef.current) {
            autoSaveTimerRef.current = setTimeout(() => {
                saveCurrentContent();
            }, AUTO_SAVE_INTERVAL);
        }
    }, []);

    // Función para guardar el contenido actual
    const saveCurrentContent = useCallback(async () => {
        const { editor: currentEditorInstance } = useEditorStore.getState();
        if (!currentEditorInstance || !currentEditorInstance.isEditable) return;

        const contentHTML = currentEditorInstance.getHTML();

        try {
            await saveDocument({ blocks: contentHTML });
        } catch (error) {
            console.error("Error al guardar contenido:", error);
            toast.error("Error al guardar cambios de contenido");
        }
    }, [saveDocument]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                    HTMLAttributes: {
                        class: 'first-heading',
                    },
                },
            }),
            Placeholder.configure({
                placeholder: ({ node }) => {
                    if (node.type.name === 'heading' && node.attrs.level === 1 && node.content.size === 0) {
                        return isUpdatingTitle ? 'Actualizando título...' : 'Sin título';
                    }
                    return 'Escribe algo...';
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full',
                },
            }),
            TableRow,
            TableHeader,
            TableCell,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 hover:text-blue-600 underline',
                },
            }),
            OrderedList,
            BulletList,
            ListItem
        ],
        content: '',
        editable: true,
        onBeforeCreate({ editor }) {
            setEditor(editor);
        },
        onCreate({ editor }) {
            setEditor(editor);
        },
        onDestroy() {
            setEditor(null);
        },
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-full prose prose-sm max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-2 prose-pre:bg-neutral-100 prose-pre:p-2 prose-pre:rounded",
            },
        },
    });

    // Efecto para controlar la editabilidad del editor Tiptap
    useEffect(() => {
        if (editor) {
            editor.setEditable(!isLoadingEditor && !isUpdatingTitle);
        }
    }, [editor, isLoadingEditor, isUpdatingTitle]);

    // Sincronizar título desde currentDocument
    useEffect(() => {
        if (currentDocument) {
            try {
                const contentObj = JSON.parse(currentDocument.content);
                const titleFromStore = contentObj.title || "";

                // Actualizar siempre el estado local del título cuando cambia el documento
                setDocumentTitle(titleFromStore);

                // Solo actualizar el editor si está listo y es editable
                if (editor && editor.isEditable && !isUpdatingTitle) {
                    // Obtener el primer nodo
                    const firstNode = editor.state.doc.firstChild;

                    // Verificar si el primer nodo es un H1 y su contenido coincide con el título
                    if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
                        if (firstNode.textContent.trim() !== titleFromStore) {
                            try {
                                // Enfoque más seguro: reemplazar todo el nodo H1
                                const transaction = editor.state.tr.delete(0, firstNode.nodeSize);

                                // Crear nuevo nodo H1 con el nuevo título
                                const newHeading = editor.schema.nodes.heading.create(
                                    { level: 1 },
                                    titleFromStore ? editor.schema.text(titleFromStore) : null
                                );

                                // Insertar el nuevo H1 al principio
                                transaction.insert(0, newHeading);

                                // Aplicar la transacción
                                editor.view.dispatch(transaction);
                            } catch (editorError) {
                                console.error("Error al actualizar el H1 en editor.jsx:", editorError);
                            }
                        }
                    } else {
                        // Si no hay H1 al principio, insertar uno de forma segura
                        editor.chain()
                            .focus()
                            .command(({ tr }) => {
                                // Si hay contenido, crear espacio para el H1
                                if (firstNode) {
                                    tr.insert(0, editor.schema.nodes.heading.create(
                                        { level: 1 },
                                        titleFromStore ? editor.schema.text(titleFromStore) : null
                                    ));
                                    return true;
                                }
                                return false;
                            })
                            .run();
                    }
                }
            } catch (error) {
                console.error("Error en useEffect[currentDocument]:", error);
            }
        }
    }, [currentDocument, editor, isUpdatingTitle, setDocumentTitle]);

    // Guardar cambios al salir de la página
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasContentChangedRef.current && editor && editor.isEditable) {
                saveCurrentContent();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [saveCurrentContent, editor]);

    const closeMenuHandler = () => {
        setMenuState({
            isOpen: false,
            position: null,
            query: '',
            range: null,
            selectedIndex: 0,
            filteredItems: [],
        });
    };

    const handleCommandExecution = (item) => {
        if (!editor || !menuState.range) return;

        editor.chain()
            .focus()
            .deleteRange(menuState.range)
            .run();

        item.action({ editor });
        closeMenuHandler();
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!menuState.isOpen || !editor) return;

            if (event.key === 'Escape') {
                event.preventDefault();
                closeMenuHandler();
                return;
            }

            if (['ArrowUp', 'ArrowDown', 'Enter'].includes(event.key)) {
                event.preventDefault();
                commandMenuRef.current?.onKeyDown(event);
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);
        return () => document.removeEventListener('keydown', handleKeyDown, true);
    }, [menuState.isOpen, editor]);

    // Guardar con Ctrl+S / Cmd+S
    useEffect(() => {
        const handleSaveShortcut = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (editor && editor.isEditable) saveCurrentContent();
                else if (isUpdatingTitle) toast.info("Guardado de título en progreso...");
                else toast.info("El editor no está editable para guardar.");
            }
        };

        document.addEventListener('keydown', handleSaveShortcut);
        return () => document.removeEventListener('keydown', handleSaveShortcut);
    }, [saveCurrentContent, editor, isUpdatingTitle]);

    const handleTitleChange = useCallback(async (newTitleFromTopBar) => {
        if (isUpdatingTitle) {
            toast.info("Actualización de título en curso...");
            return;
        }

        const trimmedTitle = newTitleFromTopBar.trim();

        // Verificar si realmente hay un cambio
        const storeCurrentDoc = useEditorStore.getState().currentDocument;
        const storeTitle = storeCurrentDoc ?
            (JSON.parse(storeCurrentDoc.content).title || "") : "";

        if (trimmedTitle === storeTitle) {
            // No hay cambio real, solo actualizar el estado local
            setDocumentTitle(trimmedTitle);
            return;
        }

        // Hay un cambio, actualizamos todo
        try {
            // Actualizar el estado local inmediatamente para UI responsiva
            setDocumentTitle(trimmedTitle);
            setHasUnsavedChanges(true);
            hasContentChangedRef.current = true;

            // Llamar a la función centralizada para actualizar el store, DB y editor
            await updateDocumentTitle(trimmedTitle);
        } catch (error) {
            console.error("Error en handleTitleChange:", error);
            toast.error("Error al actualizar el título");

            // Restaurar título anterior en caso de error
            if (storeCurrentDoc) {
                try {
                    const content = JSON.parse(storeCurrentDoc.content);
                    setDocumentTitle(content.title || "");
                } catch (e) { }
            }
        }
    }, [updateDocumentTitle, isUpdatingTitle, setHasUnsavedChanges]);

    useEffect(() => {
        if (!storeHasUnsavedChanges) {
            hasContentChangedRef.current = false;
        }
    }, [storeHasUnsavedChanges]);

    useEffect(() => {
        function handleInsertCitation(e) {
            if (editor && e.detail) {
                editor.chain().focus().insertContent(e.detail + "\n").run();

            }
        }
        window.addEventListener('insert-apa-citation', handleInsertCitation);
        return () => window.removeEventListener('insert-apa-citation', handleInsertCitation);
    }, [editor]);

    // Cuando termines de cargar el documento:
    useEffect(() => {
        if (currentDocument) {
            setIsLoadingEditor(false);
        }
    }, [currentDocument]);

    // Detectar cambios en el H1 (título) al editar directamente en el editor
    useEffect(() => {
        if (!editor) return;

        // Función que actualiza el título cuando se modifica el H1 directamente en el editor
        const handleDocumentUpdate = () => {
            if (isUpdatingTitle) return; // Evitar bucles

            try {
                // Verificar si el primer nodo es un H1
                const firstNode = editor.state.doc.firstChild;
                if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
                    const newTitle = firstNode.textContent.trim();

                    // Si el título cambió y no coincide con el documentTitle actual
                    if (newTitle !== documentTitle) {
                        // Actualizar el estado local
                        setDocumentTitle(newTitle);

                        // Si hay cambios significativos, actualizar en el store para todos los componentes
                        if (currentDocument) {
                            const currentTitle = JSON.parse(currentDocument.content).title || "";
                            if (newTitle !== currentTitle) {
                                // Actualizar referencias locales
                                setHasUnsavedChanges(true);
                                hasContentChangedRef.current = true;

                                // Actualizar el título en el store - crucial para notificar a DocumentsSidebar
                                clearTimeout(debounceTimeoutRef.current);
                                debounceTimeoutRef.current = setTimeout(() => {
                                    updateDocumentTitle(newTitle);
                                }, 300);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error("Error al sincronizar H1 con el título:", error);
            }
        };

        // Suscripción adecuada a los cambios
        const unsubscribe = editor.on('update', handleDocumentUpdate);

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            } else {
                editor.off('update', handleDocumentUpdate);
            }
            clearTimeout(debounceTimeoutRef.current);
        };
    }, [editor, documentTitle, currentDocument, setHasUnsavedChanges, updateDocumentTitle, isUpdatingTitle]);

    if (isLoadingEditor || !editorInstanceFromStore) {
        return (
            <div className="flex justify-center items-center h-screen text-lg text-neutral-500">
                Cargando editor...
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex flex-col h-screen bg-white text-neutral-800">
                <TopBar
                    documentTitle={documentTitle}
                    setDocumentTitle={handleTitleChange}
                />

                <div className="flex-grow overflow-y-auto relative">
                    <EditorContentWrapper
                        editor={editor}
                        menuState={menuState}
                        commandMenuRef={commandMenuRef}
                        handleCommandExecution={handleCommandExecution}
                        setMenuState={setMenuState}
                    />

                </div>

                <BottomBar
                    editor={editor}
                    wordCount={wordCount}
                />
            </div>
        </TooltipProvider>
    );
}

