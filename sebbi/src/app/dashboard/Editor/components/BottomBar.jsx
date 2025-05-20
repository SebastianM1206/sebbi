import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { Quote, TextIcon, ImageIcon, TableIcon, FileCode, Braces, Undo, Redo, ChevronDown } from "lucide-react";

export default function BottomBar({ editor, wordCount }) {
    if (!editor) {
        return (
            <div className="border-t border-neutral-200/70 py-1.5 px-4 flex justify-center items-center bg-white shadow-sm">
                <div className="max-w-[800px] w-full flex justify-center items-center">
                    <div className="text-neutral-500 text-xs">Editor no disponible</div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-t border-neutral-200/70 py-1.5 px-4 flex justify-center items-center bg-white shadow-sm">
            <div className="max-w-[800px] w-full flex justify-center items-center">
                <div className="flex items-center justify-center gap-2">

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium flex items-center text-neutral-700 hover:bg-neutral-100">
                            <TextIcon size={14} />
                            <span className="ml-1">Text</span>
                            <ChevronDown size={12} className="ml-0.5 text-neutral-400" />
                        </Button>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    <div className="flex items-center gap-0.5">
                        {[
                            { icon: ImageIcon, label: "Imagen" },
                            { icon: TableIcon, label: "Tabla" },
                            { icon: FileCode, label: "Bloque de Código" },
                            { icon: Braces, label: "Fórmula (Math)" },
                        ].map(item => (
                            <Tooltip key={item.label}>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:bg-neutral-100">
                                        <item.icon size={14} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>{item.label}</p></TooltipContent>
                            </Tooltip>
                        ))}
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    <div className="flex items-center gap-0.5">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-500 hover:bg-neutral-100"
                                    onClick={() => editor.chain().focus().undo().run()}
                                    disabled={!editor.can().undo()}
                                >
                                    <Undo size={15} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Deshacer</p></TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-neutral-500 hover:bg-neutral-100"
                                    onClick={() => editor.chain().focus().redo().run()}
                                    disabled={!editor.can().redo()}
                                >
                                    <Redo size={15} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Rehacer</p></TooltipContent>
                        </Tooltip>
                    </div>

                    <Separator orientation="vertical" className="h-5 bg-neutral-200/70" />

                    <div className="text-neutral-500 text-xs">
                        {wordCount} palabras
                    </div>
                </div>
            </div>
        </div>
    );
} 