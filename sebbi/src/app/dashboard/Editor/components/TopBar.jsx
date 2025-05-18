import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings, Clock, Zap } from "lucide-react";

export default function TopBar({ documentTitle, setDocumentTitle }) {
    const handleTitleChange = (e) => {
        const newTitle = e.target.value;
        // Si el título está vacío, establecer "Untitled"
        setDocumentTitle(newTitle || "Untitled");
    };

    return (
        <div className="flex justify-between items-center px-5 py-2.5 border-b border-neutral-200/70">
            <div>
                <Input
                    type="text"
                    value={documentTitle}
                    onChange={handleTitleChange}
                    placeholder="Untitled"
                    className="font-semibold text-sm text-neutral-700 border-none shadow-none h-8 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 w-[250px]"
                />
            </div>
            <div className="flex items-center gap-1.5">
                <Button size="sm" className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-xs h-8">
                    <Zap size={14} />
                    <span>See Pricing</span>
                </Button>
                <Button variant="ghost" size="sm" className="text-xs text-neutral-600 h-8">Export</Button>
                <Button variant="ghost" size="sm" className="text-xs text-neutral-600 h-8">Publish</Button>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:bg-neutral-100">
                            <Settings size={16} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Configuración</p></TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:bg-neutral-100">
                            <Clock size={16} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Historial</p></TooltipContent>
                </Tooltip>
            </div>
        </div>
    );
} 