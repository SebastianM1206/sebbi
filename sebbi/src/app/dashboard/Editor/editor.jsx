"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Heading from "@tiptap/extension-heading";
import {
    Zap,
    Settings,
    Clock,
    Quote,
    TextIcon,
    Image as ImageIcon,
    Table,
    FileCode,
    Braces,
    Undo,
    Redo,
    CheckCircle,
    ChevronDown,
    PlusCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function NotionStyleEditor() {
    const [documentTitle, setDocumentTitle] = useState("");
    const [wordCount, setWordCount] = useState(0);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Heading.configure({ levels: [1, 2, 3] }),
            Placeholder.configure({
                placeholder: ({ node, editor: currentEditor }) => {
                    if (node.type.name === 'heading' && node.attrs.level === 1 && node.content.size === 0 && currentEditor.state.doc.firstChild === node) {
                        return 'Sin título';
                    }
                    if (node.type.name === 'paragraph' && node.content.size === 0) {
                        return 'Pulsa Intro o escribe / para comandos...';
                    }
                    return null;
                },
                emptyEditorClass: 'is-editor-empty',
                emptyNodeClass: 'is-node-empty',
            }),
        ],
        content: '<h1> </h1><p> </p>',
        onUpdate: ({ editor: currentEditor }) => {
            const text = currentEditor.getText();
            const words = text.split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);

            const firstNode = currentEditor.state.doc.firstChild;
            if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
                const h1Text = firstNode.textContent.trim();
                if (h1Text && h1Text !== "Sin título") {
                }
            }
        },
        editorProps: {
            attributes: {
                class: "focus:outline-none min-h-full",
            },
        },
    });

    useEffect(() => {
        if (editor) {
            const text = editor.getText();
            const words = text.split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length === 1 && words[0] === '' ? 0 : words.length);
        }
    }, [editor]);

    if (!editor) return null;

    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex flex-col h-screen bg-white text-neutral-800">
                {/* Barra superior */}
                <div className="flex justify-between items-center px-5 py-2.5 border-b border-neutral-200/70">
                    <div>
                        <Input
                            type="text"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            placeholder="Sin título"
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

                {/* Área principal del editor */}
                <div className="flex-grow overflow-y-auto relative">
                    <div className="max-w-[800px] mx-auto px-4 sm:px-8 py-12">
                        <EditorContent editor={editor} />
                    </div>
                    <div className="absolute right-6 top-6">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" className="bg-blue-500 hover:bg-blue-600 text-white rounded-full h-7 w-7 p-0">
                                    <CheckCircle size={14} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left"><p>Guardado</p></TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                {/* Barra inferior */}
                <div className="border-t border-neutral-200/70 py-1.5 px-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs font-normal text-neutral-600 hover:bg-neutral-100">
                                    <Quote size={14} className="opacity-70" />
                                    <span>Cite</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Citar fuentes</p></TooltipContent>
                        </Tooltip>

                        <Separator orientation="vertical" className="mx-3 h-5 bg-neutral-200/70" />

                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-medium flex items-center text-neutral-700 hover:bg-neutral-100">
                                <TextIcon size={14} />
                                <span className="ml-1">Text</span>
                                <ChevronDown size={12} className="ml-0.5 text-neutral-400" />
                            </Button>
                        </div>

                        <Separator orientation="vertical" className="mx-3 h-5 bg-neutral-200/70" />

                        <div className="flex items-center gap-0.5">
                            {[
                                { icon: ImageIcon, label: "Imagen" },
                                { icon: Table, label: "Tabla" },
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

                        <Separator orientation="vertical" className="mx-3 h-5 bg-neutral-200/70" />

                        <div className="flex items-center gap-0.5">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:bg-neutral-100">
                                        <Undo size={15} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Deshacer</p></TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:bg-neutral-100">
                                        <Redo size={15} />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Rehacer</p></TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    <div className="text-neutral-500 text-xs">
                        {wordCount} palabras
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
