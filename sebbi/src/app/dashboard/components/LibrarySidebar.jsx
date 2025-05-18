"use client";

import { X, Upload, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/uiStore";

export default function LibrarySidebar() {
    const closeLibrarySidebar = useUIStore((state) => state.closeLibrarySidebar);

    return (
        <div className="h-screen w-[320px] bg-white border-r border-neutral-200 shadow-sm flex flex-col">
            {/* Header con padding reducido */}
            <div className="flex items-center justify-between px-2 py-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-base text-neutral-800">Library</span>
                </div>
                <Button variant="ghost" size="icon" onClick={closeLibrarySidebar} className="h-8 w-8">
                    <X size={18} />
                </Button>
            </div>
            {/* Search con padding reducido */}
            <div className="p-2 border-b border-neutral-100">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        placeholder="Search..." // Texto más corto
                        className="flex-1 px-2 py-1.5 border border-neutral-200 rounded-md text-xs focus:outline-none" // Padding y texto reducidos
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Upload size={18} className="text-indigo-600" />
                    </Button>
                </div>
                <div className="flex gap-1 mt-2"> {/* Gap reducido */}
                    <Button variant="outline" size="xs" className="text-xs px-2 py-0.5">Sources</Button> {/* Padding y tamaño ajustados */}
                    <Button variant="ghost" size="xs" className="text-xs px-2 py-0.5 text-neutral-500">Collections</Button>
                    <Button variant="outline" size="xs" className="ml-auto flex gap-1 items-center px-2 py-0.5">
                        <Filter size={12} /> Filter
                    </Button>
                </div>
            </div>
            {/* Document List con padding reducido */}
            <div className="p-2 flex-1 overflow-y-auto">
                <div className="flex items-start gap-2">
                    <input type="checkbox" className="mt-1" />
                    <div>
                        <div className="text-xs text-neutral-500 mb-0.5">Document</div>
                        <div className="font-medium text-sm leading-tight"> {/* Tamaño y leading ajustados */}
                            Usos problemáticos de Internet y depresión en ado... {/* Texto truncado o más corto */}
                        </div>
                        <div className="text-xs text-neutral-500">
                            Lozano-Blasco, Cortés-Pascual<br />2020
                        </div>
                        <div className="flex gap-1 mt-1.5 items-center"> {/* Gap y margin reducidos */}
                            <Button variant="link" size="xs" className="text-xs px-0 h-auto py-0">+ Cite</Button>
                            <Button variant="link" size="xs" className="text-xs px-0 h-auto py-0">Details</Button>
                            <Button variant="link" size="xs" className="text-xs px-0 h-auto py-0">Open</Button>
                            <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-500">PDF</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
