"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Upload, Search, Filter as FilterIcon, Trash2, FileText, AlertCircle, Loader2, ExternalLink, BookOpen, ChevronDown, ChevronsRightLeft, FolderPlus, Folder, File as FileIcon, MoreVertical, Edit2, FolderMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/uiStore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, Toaster } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = `${API_URL}/api/v1/pdf`;
const LOCAL_STORAGE_FOLDERS_KEY = 'libraryFolderStructure';

// Constantes para DnD
const ItemTypes = {
    PDF: 'pdf',
    FOLDER: 'folder'
};

// Estructura de datos de árbol para carpetas
class FolderNode {
    constructor(id, name, parentId = null) {
        this.id = id;
        this.name = name;
        this.parentId = parentId;
        this.children = []; // Subcarpetas
        this.pdfIds = []; // PDFs en esta carpeta
    }
}

class FolderTree {
    constructor() {
        this.folders = new Map(); // Map de id -> FolderNode
    }

    addFolder(id, name, parentId = null) {
        const newFolder = new FolderNode(id, name, parentId);
        this.folders.set(id, newFolder);
        if (parentId && this.folders.has(parentId)) {
            this.folders.get(parentId).children.push(id);
        }
        return newFolder;
    }

    removeFolder(id) {
        const folder = this.folders.get(id);
        if (!folder) return;

        // Eliminar de la carpeta padre
        if (folder.parentId) {
            const parent = this.folders.get(folder.parentId);
            if (parent) {
                parent.children = parent.children.filter(childId => childId !== id);
            }
        }

        // Eliminar recursivamente todas las subcarpetas
        const removeFolderRecursive = (folderId) => {
            const currentFolder = this.folders.get(folderId);
            if (!currentFolder) return;

            // Eliminar subcarpetas
            [...currentFolder.children].forEach(childId => {
                removeFolderRecursive(childId);
            });

            // Eliminar la carpeta actual
            this.folders.delete(folderId);
        };

        removeFolderRecursive(id);
    }

    moveFolder(folderId, newParentId) {
        const folder = this.folders.get(folderId);
        if (!folder) return false;

        // Verificar que no estemos moviendo a un descendiente
        let current = newParentId;
        while (current) {
            if (current === folderId) return false; // Evitar ciclos
            current = this.folders.get(current)?.parentId;
        }

        // Remover de la carpeta padre actual
        if (folder.parentId) {
            const oldParent = this.folders.get(folder.parentId);
            if (oldParent) {
                oldParent.children = oldParent.children.filter(id => id !== folderId);
            }
        }

        // Añadir a la nueva carpeta padre
        folder.parentId = newParentId;
        if (newParentId) {
            const newParent = this.folders.get(newParentId);
            if (newParent) {
                newParent.children.push(folderId);
            }
        }

        return true;
    }

    movePdf(pdfId, fromFolderId, toFolderId) {
        // Remover de la carpeta origen
        if (fromFolderId) {
            const fromFolder = this.folders.get(fromFolderId);
            if (fromFolder) {
                fromFolder.pdfIds = fromFolder.pdfIds.filter(id => id !== pdfId);
            }
        }

        // Añadir a la carpeta destino
        if (toFolderId) {
            const toFolder = this.folders.get(toFolderId);
            if (toFolder) {
                toFolder.pdfIds.push(pdfId);
            }
        }
    }

    getRootFolders() {
        return Array.from(this.folders.values())
            .filter(folder => !folder.parentId);
    }

    serialize() {
        // Convertir el Map a un objeto plano para JSON
        const foldersObject = {};
        for (const [id, folder] of this.folders) {
            foldersObject[id] = {
                name: folder.name,
                parentId: folder.parentId,
                children: folder.children,
                pdfIds: folder.pdfIds
            };
        }
        return foldersObject;
    }

    static deserialize(data) {
        const tree = new FolderTree();
        // Primero crear todos los nodos
        Object.entries(data).forEach(([id, folderData]) => {
            const node = new FolderNode(id, folderData.name, folderData.parentId);
            node.children = folderData.children || [];
            node.pdfIds = folderData.pdfIds || [];
            tree.folders.set(id, node);
        });
        return tree;
    }
}

// Componente para una carpeta individual
const FolderItem = ({ folder, level = 0, onDrop, onRename, onDelete, onCreateSubfolder, folderTree, getFilenameFromUrl, pdfs }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [{ isOver }, drop] = useDrop({
        accept: [ItemTypes.PDF, ItemTypes.FOLDER],
        drop: (item, monitor) => {
            if (!monitor.didDrop()) {
                onDrop(item.id, item.type, folder.id);
            }
        },
        collect: monitor => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    });

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.FOLDER,
        item: { id: folder.id, type: ItemTypes.FOLDER },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div ref={drop} style={{ opacity: isDragging ? 0.5 : 1 }}>
            <div
                ref={drag}
                className={`flex items-center p-2 rounded-md hover:bg-neutral-100 transition-colors ${isOver ? 'bg-neutral-100' : ''}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
            >
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown
                        size={16}
                        className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                </Button>
                <Folder size={18} className="mr-2 text-indigo-600" />
                <span className="font-medium text-sm text-neutral-700 flex-grow">
                    {folder.name}
                </span>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1 h-auto">
                            <MoreVertical size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRename(folder.id)}>
                            <Edit2 size={14} className="mr-2" />
                            Renombrar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onCreateSubfolder(folder.id)}>
                            <FolderPlus size={14} className="mr-2" />
                            Nueva subcarpeta
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => onDelete(folder.id)}
                        >
                            <FolderMinus size={14} className="mr-2" />
                            Eliminar
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            {isOpen && (
                <div className="ml-4">
                    {/* Mostrar PDFs de la carpeta */}
                    {folder.pdfIds.map(pdfId => {
                        const pdf = pdfs.find(p => p.pdf_id === pdfId);
                        if (!pdf) return null;
                        return (
                            <DraggablePdf
                                key={pdfId}
                                pdf={pdf}
                                inFolder={true}
                                getFilenameFromUrl={getFilenameFromUrl}
                            />
                        );
                    })}
                    {/* Mostrar subcarpetas */}
                    {folder.children && folder.children.length > 0 && folder.children.map(childId => {
                        const childFolder = folderTree.folders.get(childId);
                        if (!childFolder) return null;
                        return (
                            <FolderItem
                                key={childId}
                                folder={childFolder}
                                level={level + 1}
                                onDrop={onDrop}
                                onRename={onRename}
                                onDelete={onDelete}
                                onCreateSubfolder={onCreateSubfolder}
                                folderTree={folderTree}
                                getFilenameFromUrl={getFilenameFromUrl}
                                pdfs={pdfs}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

// Componente para un PDF draggable
const DraggablePdf = ({ pdf, inFolder, getFilenameFromUrl }) => {
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.PDF,
        item: { id: pdf.pdf_id, type: ItemTypes.PDF },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
            className={`flex items-center mb-1 p-2 rounded-md hover:bg-neutral-50 transition-colors ${isDragging ? 'opacity-50' : ''
                }`}
            style={{ marginLeft: inFolder ? '16px' : '0' }}
        >
            <FileText size={16} className="mr-2 text-neutral-500 flex-shrink-0" />
            <span
                className="text-sm text-neutral-700 truncate cursor-pointer hover:text-indigo-600"
                onClick={() => window.open(pdf.link, '_blank')}
            >
                {getFilenameFromUrl(pdf.link)}
            </span>
        </div>
    );
};

function sanitizeFileName(filename) {
    // Quitar la extensión temporalmente
    const nameWithoutExt = filename.replace(/\.pdf$/i, '');

    // Sanitizar el nombre: quitar acentos, espacios, caracteres especiales
    const sanitized = nameWithoutExt
        .normalize('NFD')                           // Descomponer caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '')           // Quitar marcas de acentos
        .replace(/[^a-zA-Z0-9._-]/g, '_')          // Reemplazar caracteres inválidos con guion bajo
        .replace(/_{2,}/g, '_')                    // Reemplazar múltiples guiones bajos con uno solo
        .replace(/^_+|_+$/g, '')                   // Quitar guiones bajos al inicio y final
        .toLowerCase();                            // Convertir a minúsculas

    // Asegurar que el nombre no esté vacío
    const finalName = sanitized || 'documento';

    // Devolver con la extensión .pdf
    return finalName + '.pdf';
}

export default function LibrarySidebar() {
    const closeLibrarySidebar = useUIStore((state) => state.closeLibrarySidebar);
    const [pdfs, setPdfs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef(null);
    const [refresh, setRefresh] = useState(0);

    const [viewMode, setViewMode] = useState('sources'); // 'sources' o 'collections'
    const [folders, setFolders] = useState([]);

    const userEmail = typeof window !== "undefined" ? encodeURIComponent(localStorage.getItem('userEmail') || "") : null;

    const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [movePdfId, setMovePdfId] = useState(null); // Para saber qué PDF se está moviendo

    // Estado para el árbol de carpetas
    const [folderTree, setFolderTree] = useState(() => {
        if (typeof window === 'undefined') return new FolderTree();

        try {
            const storedFolders = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);
            if (storedFolders) {
                const parsedData = JSON.parse(storedFolders);
                if (parsedData && typeof parsedData === 'object') {
                    return FolderTree.deserialize(parsedData);
                }
            }
        } catch (e) {
            console.error("Error al cargar carpetas desde localStorage:", e);
        }
        return new FolderTree();
    });
    const [renamingFolderId, setRenamingFolderId] = useState(null);
    const [newFolderParentId, setNewFolderParentId] = useState(null);

    // PDFs sin asignar a ninguna carpeta (para la vista 'collections')
    const getUnassignedPdfs = useCallback(() => {
        if (!pdfs.length) return [];
        // Obtener todos los PDFs asignados de todas las carpetas
        const assignedPdfIds = new Set();
        for (const folder of folderTree.folders.values()) {
            folder.pdfIds.forEach(id => assignedPdfIds.add(id));
        }
        return pdfs.filter(pdf => !assignedPdfIds.has(pdf.pdf_id));
    }, [pdfs, folderTree]);

    // Guardar carpetas en localStorage cuando cambien
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const serializedData = folderTree.serialize();
            const currentData = localStorage.getItem(LOCAL_STORAGE_FOLDERS_KEY);

            // Solo guardar si hay cambios reales
            if (JSON.stringify(serializedData) !== currentData) {
                localStorage.setItem(LOCAL_STORAGE_FOLDERS_KEY, JSON.stringify(serializedData));
            }
        } catch (e) {
            console.error("Error al guardar carpetas en localStorage:", e);
            toast.error("No se pudieron guardar los cambios en las carpetas.");
        }
    }, [folderTree]);

    // Listar PDFs
    useEffect(() => {
        if (!userEmail) return;
        setIsLoading(true);
        setError(null);
        fetch(`${API_BASE}/user?email=${userEmail}`)
            .then(async res => {
                if (!res.ok) throw new Error((await res.json()).detail || 'Error al obtener PDFs');
                return res.json();
            })
            .then(data => setPdfs(data || []))
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [userEmail, refresh]);

    // Subir PDF
    const handleFileTrigger = () => {
        if (!userEmail) {
            toast.error("Debes estar logueado (email configurado) para subir archivos.");
            return;
        }
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            if (!userEmail) {
                toast.error("No hay un email de usuario configurado para la subida.");
                event.target.value = null;
                return;
            }
            const uploadToastId = toast.loading(`Subiendo "${file.name}"...`);
            const formData = new FormData();

            // Crear un nuevo archivo con nombre sanitizado
            const sanitizedFileName = sanitizeFileName(file.name);
            const sanitizedFile = new File([file], sanitizedFileName, { type: file.type });

            console.log('📁 Archivo original:', file.name);
            console.log('🧹 Archivo sanitizado:', sanitizedFileName);

            formData.append("file", sanitizedFile);
            formData.append("email", decodeURIComponent(userEmail));
            try {
                const res = await fetch(`${API_BASE}/upload`, {
                    method: "POST",
                    body: formData,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.detail || err.message || "Error al subir el PDF.");
                }
                toast.success(`PDF "${file.name}" subido correctamente.`, { id: uploadToastId });
                setRefresh(r => r + 1);
            } catch (err) {
                toast.error(err.message || `Error al subir "${file.name}".`, { id: uploadToastId });
            }
            event.target.value = null;
        }
    };

    // Eliminar PDF
    const handleDelete = async (pdf) => {
        if (!userEmail) return;
        const pdfName = getFilenameFromUrl(pdf.link);
        const deleteToastId = toast.loading(`Eliminando "${pdfName}"...`);
        try {
            const res = await fetch(`${API_BASE}/${pdf.pdf_id}?email=${userEmail}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || err.message || "Error al eliminar el PDF.");
            }
            toast.success(`"${pdfName}" eliminado correctamente.`, { id: deleteToastId });
            setRefresh(r => r + 1);
        } catch (err) {
            toast.error(err.message || "Error al eliminar.", { id: deleteToastId });
        }
    };

    // Citar APA
    const handleCiteAPA = async (pdf) => {
        const citeToastId = toast.loading("Generando cita APA...");
        try {
            const res = await fetch(`${API_BASE}/cite-apa`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pdf_url: pdf.link }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.detail || err.message || "Error al generar la cita APA.");
            }
            const data = await res.json();
            const cita = data.apa_citation || "Cita generada";
            toast.success("Cita APA generada e insertada en el editor", { id: citeToastId });
            window.dispatchEvent(new CustomEvent('insert-apa-citation', { detail: cita }));
        } catch (err) {
            toast.error(err.message || "Error al generar la cita APA.", { id: citeToastId });
        }
    };

    const getFilenameFromUrl = (url) => {
        try {
            const path = new URL(url).pathname;
            const filename = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
            return filename.toLowerCase().endsWith('.pdf') ? filename.slice(0, -4) : filename;
        } catch (e) {
            return "Nombre de archivo no disponible";
        }
    };

    const filteredPdfs = pdfs.filter(pdf =>
        getFilenameFromUrl(pdf.link).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Manejadores para las acciones de carpetas
    const handleCreateFolder = (parentId = null) => {
        setNewFolderParentId(parentId);
        setShowCreateFolderModal(true);
    };

    const handleCreateFolderConfirm = () => {
        const folderName = newFolderName.trim();
        if (!folderName) {
            toast.error("El nombre de la carpeta no puede estar vacío.");
            return;
        }

        const newTree = new FolderTree();
        Object.assign(newTree, folderTree);
        newTree.addFolder(uuidv4(), folderName, newFolderParentId);
        setFolderTree(newTree);

        setShowCreateFolderModal(false);
        setNewFolderName("");
        setNewFolderParentId(null);
        toast.success(`Carpeta "${folderName}" creada.`);
    };

    const handleRenameFolder = (folderId) => {
        setRenamingFolderId(folderId);
        const folder = folderTree.folders.get(folderId);
        if (folder) {
            setNewFolderName(folder.name);
            setShowCreateFolderModal(true);
        }
    };

    const handleRenameFolderConfirm = () => {
        const folderName = newFolderName.trim();
        if (!folderName) {
            toast.error("El nombre de la carpeta no puede estar vacío.");
            return;
        }

        const newTree = new FolderTree();
        Object.assign(newTree, folderTree);
        const folder = newTree.folders.get(renamingFolderId);
        if (folder) {
            folder.name = folderName;
            setFolderTree(newTree);
            toast.success(`Carpeta renombrada a "${folderName}".`);
        }

        setShowCreateFolderModal(false);
        setNewFolderName("");
        setRenamingFolderId(null);
    };

    const handleDeleteFolder = (folderId) => {
        const newTree = new FolderTree();
        Object.assign(newTree, folderTree);
        newTree.removeFolder(folderId);
        setFolderTree(newTree);
        toast.success("Carpeta eliminada.");
    };

    const handleDrop = (itemId, itemType, targetFolderId) => {
        const newTree = new FolderTree();
        Object.assign(newTree, folderTree);

        if (itemType === ItemTypes.PDF) {
            // Encontrar la carpeta actual del PDF
            let currentFolderId = null;
            for (const [folderId, folder] of newTree.folders.entries()) {
                if (folder.pdfIds.includes(itemId)) {
                    currentFolderId = folderId;
                    break;
                }
            }

            newTree.movePdf(itemId, currentFolderId, targetFolderId);
            setFolderTree(newTree);
            toast.success("PDF movido correctamente.");
        } else if (itemType === ItemTypes.FOLDER) {
            if (newTree.moveFolder(itemId, targetFolderId)) {
                setFolderTree(newTree);
                toast.success("Carpeta movida correctamente.");
            } else {
                toast.error("No se puede mover la carpeta a esa ubicación.");
            }
        }
    };

    const renderSourcesView = () => (
        <>
            {userEmail && filteredPdfs.map((pdf) => (
                <div key={pdf.pdf_id} className="mb-2 p-2 rounded-md hover:bg-neutral-50 transition-colors">
                    <div className="flex flex-col min-w-0">
                        <label htmlFor={`pdf-${pdf.pdf_id}`} className="text-xs text-neutral-500 mb-0.5 block cursor-pointer">Document</label>
                        <p
                            className="font-medium text-sm leading-tight text-neutral-800 hover:text-indigo-600 cursor-pointer truncate max-w-56"
                            title={getFilenameFromUrl(pdf.link)}
                            onClick={() => window.open(pdf.link, '_blank')}
                        >
                            {getFilenameFromUrl(pdf.link)}
                        </p>
                        <div className="flex gap-2 items-center mt-1.5">
                            <Button variant="link" size="xs" className="text-xs px-0 h-auto py-0 text-indigo-600 hover:text-indigo-700" onClick={() => handleCiteAPA(pdf)}>
                                <BookOpen size={12} className="mr-0.5" /> Citar APA
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="link" size="xs" className="text-xs px-0 h-auto py-0 text-indigo-600 hover:text-indigo-700">
                                        <ExternalLink size={12} className="mr-0.5" /> Open <ChevronDown size={10} className="ml-0.5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="text-xs">
                                    <DropdownMenuItem onClick={() => window.open(pdf.link, '_blank')}>
                                        Abrir en nueva pestaña
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="link" size="xs" className="text-xs px-0 h-auto py-0 text-red-500 hover:text-red-600" title="Eliminar PDF">
                                        <Trash2 size={12} className="mr-0.5" /> Eliminar
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Eliminarás permanentemente el PDF: <span className='font-semibold'>{getFilenameFromUrl(pdf.link)}</span>.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async () => handleDelete(pdf)}
                                            className="bg-red-600 hover:bg-red-700"
                                        >
                                            Eliminar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && userEmail && (
                <div className="flex flex-col items-center justify-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
                    <p className="text-sm text-neutral-500">Cargando documentos...</p>
                </div>
            )}
            {!isLoading && !userEmail && (
                <div className="text-center py-10 px-4">
                    <FileText size={40} className="mx-auto text-neutral-400 mb-3" />
                    <p className="text-sm text-neutral-600 font-medium">Accede a tu librería</p>
                    <p className="text-xs text-neutral-500 mt-1 mb-3">
                        El email no está configurado. Por favor, asegúrate de que tu email esté guardado en localStorage (clave: 'userEmail') para ver tus documentos.
                    </p>
                </div>
            )}
            {error && userEmail && !(!isLoading && filteredPdfs.length === 0) && (
                <div className="m-2 p-4 rounded-md text-red-700 bg-red-100 border border-red-300 text-center">
                    <AlertCircle size={32} className="mx-auto text-red-500 mb-2" />
                    <p className="text-sm font-semibold mb-1">Error al cargar documentos</p>
                    <p className="text-xs mb-3">{error}</p>
                    <Button onClick={() => setRefresh(r => r + 1)} variant="outline" size="sm" className="text-red-700 border-red-300 hover:bg-red-200">
                        <Loader2 size={14} className={`mr-1.5 ${!isLoading ? 'hidden' : 'animate-spin'}`} />
                        Reintentar carga
                    </Button>
                    <p className="text-xs text-neutral-500 mt-3">O intenta <button onClick={handleFileTrigger} className="text-indigo-600 hover:underline">subir un nuevo PDF</button>.</p>
                </div>
            )}
            {!isLoading && userEmail && filteredPdfs.length === 0 && !error && viewMode === 'sources' && (
                <div className="text-center py-10 px-4">
                    <FileText size={40} className="mx-auto text-neutral-400 mb-3" />
                    <p className="text-sm text-neutral-600 font-medium">
                        Sube tu primer PDF para empezar
                    </p>
                    <Button onClick={handleFileTrigger} variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 mt-4">
                        <Upload size={14} className="mr-1.5" />
                        Subir PDF
                    </Button>
                </div>
            )}
        </>
    );

    const renderCollectionsView = () => {
        const rootFolders = folderTree.getRootFolders();
        const unassignedPdfs = getUnassignedPdfs();

        return (
            <DndProvider backend={HTML5Backend}>
                <div className="space-y-2">
                    {/* Modal para crear/renombrar carpeta */}
                    <AlertDialog open={showCreateFolderModal} onOpenChange={setShowCreateFolderModal}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {renamingFolderId ? "Renombrar carpeta" : "Crear nueva carpeta"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {renamingFolderId
                                        ? "Escribe el nuevo nombre para la carpeta."
                                        : "Escribe el nombre de la carpeta que deseas crear."}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <input
                                autoFocus
                                className="w-full border rounded px-2 py-1 mt-2"
                                placeholder="Nombre de la carpeta"
                                value={newFolderName}
                                onChange={e => setNewFolderName(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        renamingFolderId
                                            ? handleRenameFolderConfirm()
                                            : handleCreateFolderConfirm();
                                    }
                                }}
                            />
                            <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => {
                                    setShowCreateFolderModal(false);
                                    setNewFolderName("");
                                    setRenamingFolderId(null);
                                }}>
                                    Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={renamingFolderId ? handleRenameFolderConfirm : handleCreateFolderConfirm}
                                >
                                    {renamingFolderId ? "Renombrar" : "Crear"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Carpetas */}
                    {rootFolders.map(folder => (
                        <FolderItem
                            key={folder.id}
                            folder={folder}
                            onDrop={handleDrop}
                            onRename={handleRenameFolder}
                            onDelete={handleDeleteFolder}
                            onCreateSubfolder={handleCreateFolder}
                            folderTree={folderTree}
                            getFilenameFromUrl={getFilenameFromUrl}
                            pdfs={pdfs}
                        />
                    ))}

                    {/* PDFs sin archivar */}
                    {unassignedPdfs.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-neutral-200">
                            <h3 className="text-xs text-neutral-500 mb-2 px-2 font-semibold">
                                Sin Archivar
                            </h3>
                            {unassignedPdfs.map(pdf => (
                                <DraggablePdf
                                    key={pdf.pdf_id}
                                    pdf={pdf}
                                    getFilenameFromUrl={getFilenameFromUrl}
                                />
                            ))}
                        </div>
                    )}

                    {/* Estado vacío */}
                    {!isLoading && userEmail && rootFolders.length === 0 && unassignedPdfs.length === 0 && (
                        <div className="text-center py-10 px-4">
                            <Folder size={40} className="mx-auto text-neutral-400 mb-3" />
                            <p className="text-sm text-neutral-600 font-medium">
                                Organiza tus documentos creando carpetas
                            </p>
                            <Button
                                onClick={() => handleCreateFolder()}
                                variant="default"
                                size="sm"
                                className="bg-indigo-600 hover:bg-indigo-700 mt-4"
                            >
                                <FolderPlus size={14} className="mr-1.5" />
                                Crear Carpeta
                            </Button>
                        </div>
                    )}
                </div>
            </DndProvider>
        );
    };

    return (
        <div className="h-screen w-[320px] bg-white border-r border-neutral-200 shadow-sm flex flex-col" data-tour="library-content">
            <Toaster richColors />
            <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-200">
                <span className="font-semibold text-lg text-neutral-800">Library</span>
                <div className="flex items-center gap-1">
                    {viewMode === 'collections' && (
                        <Button variant="outline" size="icon" onClick={() => setShowCreateFolderModal(true)} className="h-8 w-8 border-indigo-600 text-indigo-600 hover:bg-indigo-50" title="Crear nueva carpeta">
                            <FolderPlus size={16} />
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleFileTrigger}
                        className="h-8 w-8 border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                        title="Subir PDF"
                        data-tour="upload"
                    >
                        <Upload size={16} />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf"
                        style={{ display: 'none' }}
                    />
                    <Button variant="ghost" size="icon" onClick={closeLibrarySidebar} className="h-8 w-8" title="Cerrar librería">
                        <ChevronsRightLeft size={18} />
                    </Button>
                </div>
            </div>

            <div className="p-3 border-b border-neutral-100 space-y-3">
                <div className="relative">
                    <Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <Input
                        type="text"
                        placeholder={viewMode === 'sources' ? "Search library..." : "Search collections..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1.5 text-sm h-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={viewMode === 'sources' ? "secondary" : "ghost"}
                        size="sm"
                        className="text-xs px-3 py-1 h-auto"
                        onClick={() => setViewMode('sources')}
                        data-tour="sources"
                    >
                        Sources
                    </Button>
                    <Button
                        variant={viewMode === 'collections' ? "secondary" : "ghost"}
                        size="sm"
                        className={`text-xs px-3 py-1 h-auto ${viewMode === 'collections' ? '' : 'text-neutral-600'}`}
                        onClick={() => setViewMode('collections')}
                        data-tour="collections"
                    >
                        Collections
                    </Button>
                    <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1 text-xs px-3 py-1 h-auto">
                        <FilterIcon size={12} /> Filter
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3">
                    {viewMode === 'sources' ? renderSourcesView() : renderCollectionsView()}
                </div>
            </ScrollArea>
        </div>
    );
}
