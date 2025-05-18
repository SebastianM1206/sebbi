"use client";

import { Plus, ChevronsLeft, Search, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/stores/uiStore";
import { cn } from "@/lib/utils";
import React from "react";

// Datos simulados para los documentos
const documentsData = [
    { id: 1, title: "Untitled", time: "27 minutes ago" },
    { id: 2, title: "Mi proyecto de investigación sobre IA", time: "27 minutes ago", hasOptions: true },
    { id: 3, title: "Otro documento sin título", time: "27 minutes ago" },
    { id: 4, title: "Depresión en programadores: Un análisis exhaustivo", time: "19 hours ago" },
    { id: 5, title: "Notas de la reunión", time: "2 days ago", hasOptions: true },
    { id: 6, title: "Borrador del artículo", time: "3 days ago" },
];

export default function DocumentsSidebar() {
    const closeDocumentsSidebar = useUIStore((state) => state.closeDocumentsSidebar);
    const [selectedDocumentId, setSelectedDocumentId] = React.useState(null);

    const handleDocumentClick = (docId) => {
        setSelectedDocumentId(docId);
        // Aquí podrías añadir lógica para cargar el documento seleccionado, etc.
        console.log("Documento seleccionado:", docId);
    };

    return (
        <div className="h-screen w-[300px] bg-white border-r border-neutral-200 shadow-sm flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-neutral-200">
                <span className="font-semibold text-lg text-neutral-800">Documents</span>
                <div className="flex items-center gap-1">
                    <Button variant="primary" size="icon" className="h-8 w-8 bg-indigo-600 hover:bg-indigo-700">
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
                        type="search"
                        placeholder="Search docs..."
                        className="pl-8 pr-2 py-2 text-sm w-full rounded-md border-neutral-300 focus-visible:ring-1 focus-visible:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Document List */}
            <ScrollArea className="flex-1">
                <ul className="py-1 px-1">
                    {documentsData.map((doc) => (
                        <li key={doc.id} className="mb-0.5">
                            <div
                                role="button"
                                tabIndex={0}
                                className={cn(
                                    "w-full text-left px-2 py-2 rounded-md hover:bg-neutral-100 focus:bg-neutral-100 outline-none group",
                                    selectedDocumentId === doc.id && "bg-neutral-100"
                                )}
                                onClick={() => handleDocumentClick(doc.id)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleDocumentClick(doc.id); }}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-neutral-800 truncate group-hover:text-neutral-900">
                                        {doc.title}
                                    </span>
                                    {doc.hasOptions && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 text-neutral-400 hover:text-neutral-700 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("Opciones para:", doc.title);
                                            }}
                                        >
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-500 mt-0.5 group-hover:text-neutral-600">
                                    {doc.time}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </ScrollArea>
        </div>
    );
} 