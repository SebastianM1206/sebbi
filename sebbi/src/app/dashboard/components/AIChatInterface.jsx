"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronsRight,
    Paperclip,
    Send,
    Copy,
    FileText,
    X,
    BookOpen,
    RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import useEditorStore from '@/stores/editorStore';
import { marked } from 'marked';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from '@/stores/uiStore';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Asumimos que tu backend FastAPI corre en http://localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const PDF_API_BASE = `${API_URL}/api/v1/pdf`;

const initialMessages = [
    {
        id: "initial-ai-greeting",
        sender: "ai",
        text: "Hola, soy Sebbi. Puedo ayudarte a redactar, resumir o analizar tus documentos.\n\nPor ejemplo, prueba pedirme: *'Escribe un resumen de la Segunda Guerra Mundial en 300 palabras'*.\n\nPuedes seleccionar PDFs como contexto para tus preguntas usando el botón de clip.",
        timestamp: new Date(),
    }
];

export default function AIChatInterface() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const messagesContainerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { editor } = useEditorStore();
    const [pdfs, setPdfs] = useState([]);
    const [loadingPdfs, setLoadingPdfs] = useState(false);
    const [selectedPdfs, setSelectedPdfs] = useState([]);
    const [showPdfSelector, setShowPdfSelector] = useState(false);

    const { isChatSidebarOpen, toggleChatSidebar } = useUIStore();

    // Función para obtener PDFs del usuario
    const fetchPdfs = async () => {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        setLoadingPdfs(true);
        try {
            const response = await fetch(`${PDF_API_BASE}/user?email=${encodeURIComponent(userEmail)}`);
            if (!response.ok) {
                throw new Error('Error al cargar PDFs');
            }
            const data = await response.json();
            setPdfs(data || []);
        } catch (error) {
            console.error("Error al cargar PDFs:", error);
        } finally {
            setLoadingPdfs(false);
        }
    };

    // Cargar PDFs al inicio
    useEffect(() => {
        fetchPdfs();
    }, []);

    // Actualizar PDFs cuando se abre el selector
    useEffect(() => {
        if (showPdfSelector) {
            fetchPdfs();
        }
    }, [showPdfSelector]);

    const handleSendMessage = async () => {
        if (inputValue.trim() === "") return;

        const userMessageToDisplay = {
            id: Date.now(),
            sender: "user",
            text: inputValue + (selectedPdfs.length > 0 ? `\n\n_[Usando ${selectedPdfs.length} PDF(s) como contexto]_` : ""),
            timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, userMessageToDisplay]);

        const currentInputForAPI = inputValue;
        setInputValue("");
        setLoading(true);
        setError(null);

        try {
            // Preparar el cuerpo de la petición incluyendo el contexto de PDFs si hay seleccionados
            const requestBody = {
                text: currentInputForAPI
            };

            if (selectedPdfs.length > 0) {
                requestBody.context = selectedPdfs.map(pdf => pdf.link);
            }

            const response = await fetch(`${API_URL}/api/v1/questions/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `Error: ${response.status}`);
            }

            const data = await response.json();

            const aiResponseBlock = {
                id: Date.now() + 1,
                sender: "ai",
                text: data.response,
                timestamp: new Date(),
            };
            setMessages(prevMessages => [...prevMessages, aiResponseBlock]);

        } catch (err) {
            console.error("Error al contactar la API de Gemini:", err);
            setError(err.message || "No se pudo obtener respuesta de Sebbi.");
            const errorMessage = {
                id: Date.now() + 1,
                sender: "ai",
                text: `**Error:** ${err.message || "No se pudo obtener respuesta de Sebbi."}`,
                timestamp: new Date(),
                isError: true,
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    const togglePdfSelection = (pdf) => {
        setSelectedPdfs(prev => {
            const isPdfSelected = prev.some(p => p.pdf_id === pdf.pdf_id);
            if (isPdfSelected) {
                return prev.filter(p => p.pdf_id !== pdf.pdf_id);
            } else {
                return [...prev, pdf];
            }
        });
    };

    const clearSelectedPdfs = () => {
        setSelectedPdfs([]);
        setShowPdfSelector(false);
    };

    const getFilenameFromUrl = (url) => {
        try {
            const path = new URL(url).pathname;
            const filename = decodeURIComponent(path.substring(path.lastIndexOf('/') + 1));
            return filename.toLowerCase().endsWith('.pdf') ? filename.slice(0, -4) : filename;
        } catch (e) {
            return "PDF";
        }
    };

    const scrollToBottom = (behavior = "smooth") => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: behavior,
            });
        }
    };

    useEffect(() => {
        if (messages.length > 0) scrollToBottom("auto");
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleCopyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const handleAddToDocument = (text) => {
        if (editor) {
            const htmlContent = marked(text);

            // Insertar después del título (h1)
            const firstNode = editor.state.doc.firstChild;
            const insertPosition = firstNode ? firstNode.nodeSize : 0;

            editor.chain()
                .focus()
                .insertContentAt(insertPosition, `<p>${htmlContent}</p>`)
                .run();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white border-l border-neutral-200 w-full overflow-hidden">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/80 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-neutral-500 hover:bg-neutral-100"
                        onClick={toggleChatSidebar}
                    >
                        <ChevronsRight size={18} />
                    </Button>
                    <h2 className="text-sm font-semibold text-neutral-700">Asistente IA</h2>
                </div>
                <div className="flex items-center gap-2">
                    {selectedPdfs.length > 0 && (
                        <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 border-indigo-200">
                            <BookOpen size={12} />
                            {selectedPdfs.length} PDF(s)
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0 ml-1 text-indigo-500 hover:text-indigo-700 hover:bg-transparent"
                                onClick={clearSelectedPdfs}
                            >
                                <X size={12} />
                            </Button>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Área de Mensajes */}
            <div
                ref={messagesContainerRef}
                className="flex-grow relative overflow-y-auto bg-neutral-50/50"
            >
                <div className="p-4 space-y-4 pb-24 prose prose-sm max-w-none">
                    {messages.map((msg) => {
                        if (msg.sender === "user") {
                            return (
                                <div key={msg.id} className="flex justify-end">
                                    <div className="max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-wrap bg-indigo-500 text-white rounded-br-none shadow-sm">
                                        {msg.text}
                                    </div>
                                </div>
                            );
                        }
                        if (msg.sender === "ai") {
                            return (
                                <div key={msg.id} className={`text-neutral-800 my-3 ${msg.isError ? "text-red-600" : ""}`}>
                                    <div className="flex items-start gap-2 mb-2">
                                        <Avatar className="h-7 w-7 mt-1">
                                            <AvatarFallback className="bg-indigo-500 text-white text-xs">IA</AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white p-3 rounded-lg shadow-sm border border-neutral-200 flex-1">
                                            <ReactMarkdown
                                                components={{
                                                    h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                                    p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                                                }}
                                            >
                                                {msg.text}
                                            </ReactMarkdown>
                                            {!msg.isError && msg.id !== "initial-ai-greeting" && (
                                                <div className="flex gap-2 mt-3 border-t pt-2 border-neutral-100">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs h-8 gap-1.5"
                                                                onClick={() => handleAddToDocument(msg.text)}
                                                            >
                                                                <FileText size={14} />
                                                                Agregar al documento
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Agregar respuesta al editor</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-xs h-8 gap-1.5"
                                                                onClick={() => handleCopyToClipboard(msg.text)}
                                                            >
                                                                <Copy size={14} />
                                                                Copiar
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Copiar al portapapeles</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {loading && (
                        <div className="flex gap-3 items-start mt-4">
                            <Avatar className="h-7 w-7 mt-1">
                                <AvatarFallback className="bg-indigo-500 text-white text-xs">IA</AvatarFallback>
                            </Avatar>
                            <div className="bg-white p-3 rounded-lg shadow-sm border border-neutral-200 flex-1">
                                <div className="flex items-center gap-2 text-neutral-600 text-sm animate-pulse">
                                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-bounce mr-1"></span>
                                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:150ms] mr-1"></span>
                                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-bounce [animation-delay:300ms] mr-1"></span>
                                    Sebbi está pensando...
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Área de Input */}
            <div className="border-t border-neutral-200 bg-white shadow-lg">
                <div className="p-4 pt-3">
                    <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
                            <Popover open={showPdfSelector} onOpenChange={setShowPdfSelector}>
                                <PopoverTrigger asChild>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 rounded-full pointer-events-auto ${selectedPdfs.length > 0 ? 'text-indigo-600 bg-indigo-50' : 'text-neutral-500 hover:bg-neutral-100'}`}
                                            >
                                                <Paperclip size={16} />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Seleccionar PDFs como contexto</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </PopoverTrigger>
                                <PopoverContent className="w-[280px] p-3" align="start" side="top">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="font-medium text-sm">Seleccionar PDFs como contexto</div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 text-neutral-500 hover:text-indigo-600 hover:bg-indigo-50"
                                                onClick={fetchPdfs}
                                                disabled={loadingPdfs}
                                            >
                                                <RefreshCw size={14} className={loadingPdfs ? "animate-spin" : ""} />
                                            </Button>
                                        </div>
                                        {loadingPdfs ? (
                                            <div className="flex justify-center py-6">
                                                <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                                            </div>
                                        ) : pdfs.length === 0 ? (
                                            <div className="text-center py-6 text-sm text-neutral-500 bg-neutral-50 rounded-md">
                                                No hay PDFs disponibles
                                            </div>
                                        ) : (
                                            <ScrollArea className="h-[200px] pr-3">
                                                <div className="space-y-1">
                                                    {pdfs.map(pdf => (
                                                        <div
                                                            key={pdf.pdf_id}
                                                            className={`flex items-start gap-2 p-2 hover:bg-neutral-50 rounded-md cursor-pointer ${selectedPdfs.some(p => p.pdf_id === pdf.pdf_id) ? 'bg-indigo-50' : ''
                                                                }`}
                                                            onClick={() => togglePdfSelection(pdf)}
                                                        >
                                                            <Checkbox
                                                                checked={selectedPdfs.some(p => p.pdf_id === pdf.pdf_id)}
                                                                onCheckedChange={() => togglePdfSelection(pdf)}
                                                                className="mt-1 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white"
                                                            />
                                                            <div className="text-sm truncate" title={getFilenameFromUrl(pdf.link)}>
                                                                {getFilenameFromUrl(pdf.link)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                        )}
                                        <div className="flex justify-between pt-2 border-t">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearSelectedPdfs}
                                                className="text-xs h-8"
                                            >
                                                Limpiar
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() => setShowPdfSelector(false)}
                                                className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Aceptar ({selectedPdfs.length})
                                            </Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Escribe tu pregunta aquí..."
                            className="pl-12 pr-[5.5rem] min-h-[56px] max-h-[150px] text-sm rounded-xl border-neutral-300/90 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 resize-none w-full shadow-sm"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey && !loading) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            rows={1}
                            disabled={loading}
                        />
                        <Button
                            size="sm"
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-9 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || loading}
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <> Enviar <Send size={14} className="ml-1.5" /> </>
                            )}
                        </Button>
                    </div>
                    <div className="text-xs text-neutral-400 mt-1.5 ml-12">
                        Presiona Enter para enviar, Shift + Enter para nueva línea
                    </div>
                </div>
            </div>
        </div>
    );
}
