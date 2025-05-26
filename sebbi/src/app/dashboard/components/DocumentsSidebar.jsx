"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, ChevronsLeft, Search, Trash, Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import useEditorStore from '@/stores/editorStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DocumentsSidebar() {
    const closeDocumentsSidebar = useUIStore((state) => state.closeDocumentsSidebar);
    const {
        currentDocument: currentDocumentFromStore,
        loadDocument,
        updateDocumentTitle,
        setCurrentDocument,
        setDocumentTitle,
        setHasUnsavedChanges
    } = useEditorStore();
    const router = useRouter();
    const [documents, setDocuments] = useState([]);
    const [filteredDocuments, setFilteredDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDocumentId, setSelectedDocumentId] = useState(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newDocumentTitle, setNewDocumentTitle] = useState("");
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [documentToRename, setDocumentToRename] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState(null);
    const [creatingDocument, setCreatingDocument] = useState(false);
    const userEmail = typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
    const searchInputRef = useRef(null);
    const editorTitle = useEditorStore((state) => {
        if (!state.currentDocument) return "";
        try {
            return JSON.parse(state.currentDocument.content).title || "";
        } catch (e) {
            return "";
        }
    });
    const editor = useEditorStore((state) => state.editor);
    const isUpdatingTitle = typeof window !== "undefined" ? window.isUpdatingTitle : false;
    const hasContentChangedRef = useRef(false);
    const debounceTimeoutRef = useRef(null);

    // Obtener los documentos al cargar
    useEffect(() => {
        if (userEmail) {
            fetchDocuments();
        } else {
            setIsLoading(false);
        }
    }, [userEmail]);

    // Filtrar documentos cuando cambia la búsqueda
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredDocuments(documents);
        } else {
            const filtered = documents.filter(doc => {
                try {
                    const content = JSON.parse(doc.content);
                    const title = content.title || "";
                    return title.toLowerCase().includes(searchQuery.toLowerCase());
                } catch (error) {
                    console.error("Error al parsear contenido durante búsqueda:", error);
                    return false;
                }
            });
            setFilteredDocuments(filtered);
        }
    }, [searchQuery, documents]);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/api/v1/documents?email=${encodeURIComponent(userEmail)}`);

            if (!response.ok) {
                throw new Error("Error al obtener documentos");
            }

            const data = await response.json();

            // Si no hay documentos, crear uno por defecto
            if (data.length === 0) {
                const defaultTitle = "Mi primer documento";
                const defaultDoc = await createDefaultDocument(defaultTitle);
                if (defaultDoc) {
                    setDocuments([defaultDoc]);
                    setFilteredDocuments([defaultDoc]);
                    // Cargar el documento por defecto
                    await handleDocumentClick(defaultDoc);
                }
            } else {
                setDocuments(data);
                setFilteredDocuments(data);
            }
        } catch (error) {
            console.error("Error al cargar documentos:", error);
            toast.error("Error al cargar documentos");
        } finally {
            setIsLoading(false);
        }
    };

    // Función auxiliar para crear un documento por defecto
    const createDefaultDocument = async (title) => {
        try {
            const defaultContent = {
                title: title,
                blocks: `<h1>${title}</h1><p>¡Bienvenido a tu primer documento!</p>`
            };

            const response = await fetch(`${API_URL}/api/v1/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: JSON.stringify(defaultContent),
                    email: userEmail
                }),
            });

            if (!response.ok) {
                throw new Error("Error al crear documento por defecto");
            }

            const newDocument = await response.json();
            toast.success("Documento inicial creado");
            return newDocument;
        } catch (error) {
            console.error("Error al crear documento por defecto:", error);
            toast.error("Error al crear documento inicial");
            return null;
        }
    };

    const handleCreateDocument = async () => {
        if (!newDocumentTitle.trim()) {
            toast.error("Por favor ingrese un título para el documento");
            return;
        }

        try {
            setCreatingDocument(true);
            const documentContent = {
                title: newDocumentTitle,
                blocks: `<h1>${newDocumentTitle}</h1><p></p>`
            };

            const response = await fetch(`${API_URL}/api/v1/documents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    content: JSON.stringify(documentContent),
                    email: userEmail
                }),
            });

            if (!response.ok) {
                throw new Error("Error al crear documento");
            }

            const newDocument = await response.json();
            setDocuments(prev => [newDocument, ...prev]);
            setIsCreateDialogOpen(false);
            setNewDocumentTitle("");
            toast.success("Documento creado correctamente");

            // Cargar el nuevo documento inmediatamente
            await handleDocumentClick(newDocument);
        } catch (error) {
            console.error("Error al crear documento:", error);
            toast.error("Error al crear el documento");
        } finally {
            setCreatingDocument(false);
        }
    };

    const handleRenameDocument = async () => {
        if (!newTitle.trim()) {
            toast.error("Por favor ingrese un título para el documento");
            return;
        }

        try {
            // Primero actualizamos localmente
            const originalDocContent = JSON.parse(documentToRename.content);
            const newDocumentContent = { ...originalDocContent, title: newTitle };

            // Luego en la API
            const response = await fetch(`${API_URL}/api/v1/documents/${documentToRename.id}?email=${encodeURIComponent(userEmail)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: JSON.stringify(newDocumentContent) }),
            });

            if (!response.ok) {
                throw new Error("Error al renombrar documento");
            }

            const updatedDocumentFromAPI = await response.json();

            // Actualizar la lista local
            setDocuments(prev =>
                prev.map(doc => doc.id === updatedDocumentFromAPI.id ? updatedDocumentFromAPI : doc)
            );

            // Si es el documento actualmente abierto, actualizar en el editor y store
            if (currentDocumentFromStore && currentDocumentFromStore.id === updatedDocumentFromAPI.id) {
                console.log("Sidebar: Documento actual renombrado. Volviendo a cargar documento con nuevo título:", newTitle);

                // Importante: volver a cargar el documento completo
                // Esto asegura que todo se actualice correctamente
                await loadDocument(updatedDocumentFromAPI.id);
            }

            setIsRenameDialogOpen(false);
            setDocumentToRename(null);
            setNewTitle("");
            toast.success("Documento renombrado correctamente");
        } catch (error) {
            console.error("Error al renombrar documento:", error);
            toast.error("Error al renombrar el documento");
        }
    };

    const handleDeleteDocument = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/documents/${documentToDelete.id}?email=${encodeURIComponent(userEmail)}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Error al eliminar documento");
            }

            await response.json();

            setDocuments(prev =>
                prev.filter(doc => doc.id !== documentToDelete.id)
            );

            if (selectedDocumentId === documentToDelete.id) {
                setSelectedDocumentId(null);
                // Aquí podrías añadir lógica para cargar otro documento si es necesario
            }

            setIsDeleteDialogOpen(false);
            setDocumentToDelete(null);
            toast.success("Documento eliminado correctamente");
        } catch (error) {
            console.error("Error al eliminar documento:", error);
            toast.error("Error al eliminar el documento");
        }
    };

    const openRenameDialog = (doc) => {
        try {
            const content = JSON.parse(doc.content);
            setNewTitle(content.title || "");
            setDocumentToRename(doc);
            setIsRenameDialogOpen(true);
        } catch (error) {
            console.error("Error al parsear contenido del documento:", error);
            toast.error("Error al preparar documento para renombrar");
        }
    };

    const handleDocumentClick = async (doc) => {
        if (doc.id === selectedDocumentId) return; // No recargar si ya está seleccionado

        try {
            // Si hay cambios sin guardar en el documento actual, guardarlos primero
            if (editor && editor.isEditable && hasContentChangedRef.current) {
                await saveCurrentContent();
            }

            setSelectedDocumentId(doc.id);
            await loadDocument(doc.id);

            let title = "";
            try {
                const content = JSON.parse(doc.content);
                title = content.title || "";
            } catch (e) {
                console.error("Error al parsear contenido:", e);
            }

            toast.success(`Documento "${title}" cargado`);
        } catch (error) {
            console.error("Error al cargar documento:", error);
            toast.error("Error al cargar el documento");
            setSelectedDocumentId(null);
        }
    };

    const getTitleFromContent = (content) => {
        try {
            const parsed = JSON.parse(content);
            return parsed.title || "Sin título";
        } catch (error) {
            console.error("Error al parsear título en getTitleFromContent:", error);
            return "Sin título";
        }
    };

    const getFormattedDate = (timestamp) => {
        if (!timestamp) return "sin fecha";

        try {
            const date = new Date(timestamp);

            // Verificar si la fecha es válida
            if (isNaN(date.getTime())) {
                return "formato inválido";
            }

            // Formatear la fecha como DD/MM/YYYY HH:MM
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');

            return `${day}/${month}/${year} ${hours}:${minutes}`;
        } catch (error) {
            console.error("Error al formatear fecha:", error);
            return "error de formato";
        }
    };

    const handleKeyDown = (e) => {
        // Atajo Ctrl+K o Cmd+K para enfocar la búsqueda
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInputRef.current?.focus();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Establecer el documento seleccionado inicialmente
    useEffect(() => {
        if (currentDocumentFromStore) {
            setSelectedDocumentId(currentDocumentFromStore.id);
        }
    }, [currentDocumentFromStore]);

    // Actualizar documento en la lista cuando cambia en el store
    useEffect(() => {
        if (currentDocumentFromStore) {
            setDocuments(prevDocs => {
                const updatedDocs = prevDocs.map(doc => {
                    if (doc.id === currentDocumentFromStore.id) {
                        return { ...currentDocumentFromStore };
                    }
                    return doc;
                });

                // Actualizar también la lista filtrada si hay una búsqueda activa
                if (searchQuery.trim() !== "") {
                    setFilteredDocuments(updatedDocs.filter(doc => {
                        try {
                            const content = JSON.parse(doc.content);
                            const title = content.title || "";
                            return title.toLowerCase().includes(searchQuery.toLowerCase());
                        } catch (error) {
                            console.error("Error al filtrar documento:", error);
                            return false;
                        }
                    }));
                } else {
                    setFilteredDocuments(updatedDocs);
                }

                return updatedDocs;
            });
        }
    }, [currentDocumentFromStore, searchQuery]);

    return (
        <div className="h-screen w-[300px] bg-white border-r border-neutral-200 shadow-sm flex flex-col" data-tour="documents-content">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-200">
                <span className="font-semibold text-lg text-neutral-800">Documentos</span>
                <div className="flex items-center gap-1">
                    <Button
                        variant="primary"
                        size="icon"
                        className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => setIsCreateDialogOpen(true)}
                    >
                        <Plus size={18} className="text-white" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={closeDocumentsSidebar} className="h-8 w-8">
                        <ChevronsLeft size={20} />
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-neutral-100">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input
                        ref={searchInputRef}
                        type="search"
                        placeholder="Buscar documentos... ⌘K"
                        className="pl-8 pr-2 py-2 text-sm w-full rounded-md border-neutral-300 focus-visible:ring-1 focus-visible:ring-indigo-500"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Document List */}
            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-neutral-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <p className="text-neutral-500 mb-3">No se encontraron documentos</p>
                    {searchQuery ? (
                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                            Limpiar búsqueda
                        </Button>
                    ) : (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            Crear documento
                        </Button>
                    )}
                </div>
            ) : (
                <ScrollArea className="flex-1">
                    <ul className="py-1 px-1">
                        {filteredDocuments.map((doc) => (
                            <li key={doc.id} className="mb-0.5">
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className={cn(
                                        "w-full text-left px-2 py-2 rounded-md hover:bg-neutral-100 focus:bg-neutral-100 outline-none group",
                                        selectedDocumentId === doc.id && "bg-neutral-100"
                                    )}
                                    onClick={() => handleDocumentClick(doc)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDocumentClick(doc); }}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-neutral-800 truncate group-hover:text-neutral-900">
                                            {getTitleFromContent(doc.content)}
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                                                        <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                                    </svg>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-[160px]">
                                                <DropdownMenuItem onClick={() => openRenameDialog(doc)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Renombrar</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setDocumentToDelete(doc);
                                                        setIsDeleteDialogOpen(true);
                                                    }}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <Trash className="mr-2 h-4 w-4" />
                                                    <span>Eliminar</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-0.5 group-hover:text-neutral-600">
                                        {getFormattedDate(doc.updated_at)}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </ScrollArea>
            )}

            {/* Create Document Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Crear nuevo documento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="name"
                                placeholder="Mi nuevo documento"
                                className="col-span-3"
                                value={newDocumentTitle}
                                onChange={(e) => setNewDocumentTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleCreateDocument();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleCreateDocument}
                            disabled={creatingDocument || !newDocumentTitle.trim()}
                        >
                            {creatingDocument ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creando...
                                </>
                            ) : (
                                'Crear'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Document Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Renombrar documento</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-name" className="text-right">
                                Nuevo título
                            </Label>
                            <Input
                                id="new-name"
                                placeholder="Nuevo título del documento"
                                className="col-span-3"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleRenameDocument();
                                    }
                                }}
                                autoFocus
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRenameDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRenameDocument}
                            disabled={!newTitle.trim()}
                        >
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Document Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción no se puede deshacer. El documento será eliminado permanentemente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleDeleteDocument}
                        >
                            Eliminar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
} 