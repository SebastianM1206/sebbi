"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Search, Filter as FilterIcon, Trash2, FileText, AlertCircle, Loader2, ExternalLink, BookOpen, ChevronDown, ChevronsRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE = `${API_URL}/api/v1/pdf`;

function sanitizeFileName(filename) {
    // Quita acentos, ñ, etc. y reemplaza espacios y comas por guion bajo
    return filename
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
        .replace(/[^a-zA-Z0-9._-]/g, '_'); // solo letras, números, punto, guion y guion bajo
}

export default function LibrarySidebar() {
    const closeLibrarySidebar = useUIStore((state) => state.closeLibrarySidebar);
    const [pdfs, setPdfs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const fileInputRef = useRef(null);
    const [refresh, setRefresh] = useState(0);

    // Obtener email de localStorage
    const userEmail = typeof window !== "undefined" ? encodeURIComponent(localStorage.getItem('userEmail') || "") : null;

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
            const sanitizedFile = new File([file], sanitizeFileName(file.name), { type: file.type });
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

    return (
        <div className="h-screen w-[320px] bg-white border-r border-neutral-200 shadow-sm flex flex-col">
            <Toaster richColors />
            <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-200">
                <span className="font-semibold text-lg text-neutral-800">Library</span>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={handleFileTrigger} className="h-8 w-8 border-indigo-600 text-indigo-600 hover:bg-indigo-50" title="Subir PDF">
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
                        placeholder="Search library..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-2 py-1.5 text-sm h-9"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="text-xs px-3 py-1 h-auto">Sources</Button>
                    <Button variant="ghost" size="sm" className="text-xs px-3 py-1 h-auto text-neutral-600">Collections</Button>
                    <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1 text-xs px-3 py-1 h-auto">
                        <FilterIcon size={12} /> Filter
                    </Button>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3">
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
                    {!isLoading && userEmail && filteredPdfs.length === 0 && !error && (
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
                </div>
            </ScrollArea>
        </div>
    );
}
