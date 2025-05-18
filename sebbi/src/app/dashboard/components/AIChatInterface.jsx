"use client";

import { useState, useRef, useEffect } from "react";
import {
    ChevronsRight,
    Clock,
    Plus,
    Paperclip,
    AtSign,
    Send,
    ArrowDown,
    FileText as FileTextIcon,
    Globe as GlobeIcon,
    BookOpen as BookOpenIcon,
    X as XIcon
} from "lucide-react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Asumimos que tu backend FastAPI corre en http://localhost:8000
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const initialMessages = [
    {
        id: "initial-ai-greeting",
        sender: "ai",
        text: "Hola, soy Sebbi. Pídemelo y te ayudaré a redactar, resumir o analizar tus documentos.\n\nPor ejemplo, puedes pedirme: *'Crea un abstract de 250 palabras sobre IA en educación'*.",
        timestamp: new Date(),
    }
];

export default function AIChatInterface() {
    const [messages, setMessages] = useState(initialMessages);
    const [inputValue, setInputValue] = useState("");
    const [showScrollDown, setShowScrollDown] = useState(false);
    const messagesContainerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Estado para los contextos activos (simulado)
    const [activeContexts, setActiveContexts] = useState([
        { id: 'doc1', label: 'Current document', icon: FileTextIcon },
        { id: 'web1', label: 'Web', icon: GlobeIcon },
        { id: 'lib1', label: 'Library', icon: BookOpenIcon },
    ]);

    const removeContext = (idToRemove) => {
        setActiveContexts(contexts => contexts.filter(ctx => ctx.id !== idToRemove));
    };

    const handleSendMessage = async () => {
        if (inputValue.trim() === "") return;

        const userMessageToDisplay = {
            id: Date.now(),
            sender: "user",
            text: inputValue,
            timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, userMessageToDisplay]);

        const currentInputForAPI = inputValue;
        setInputValue("");
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API_URL}/ask`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: currentInputForAPI }),
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

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            setShowScrollDown(scrollHeight - scrollTop - clientHeight > 50);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-white border-l border-neutral-200 w-[360px] sm:w-[400px] md:w-[480px] lg:w-[520px] overflow-hidden">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200/80">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                        <ChevronsRight size={18} />
                    </Button>
                    <h2 className="text-sm font-semibold text-neutral-700">AI Chat</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                        <Clock size={18} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500">
                        <Plus size={20} />
                    </Button>
                </div>
            </div>

            {/* Área de Mensajes */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-grow relative overflow-y-auto"
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
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ node, ...props }) => <h2 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            );
                        }
                        return null;
                    })}
                    {loading && (
                        <div className="flex gap-3 items-center mt-4">
                            <Avatar className="h-7 w-7">
                                <AvatarFallback className="bg-indigo-500 text-white text-xs">AI</AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2 text-neutral-600 text-sm animate-pulse">
                                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-bounce mr-1"></span>
                                Sebbi está pensando...
                            </div>
                        </div>
                    )}
                </div>
                {showScrollDown && (
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute bottom-4 right-4 h-9 w-9 rounded-full bg-white shadow-md border-neutral-300/70 z-10"
                        onClick={() => scrollToBottom()}
                    >
                        <ArrowDown size={18} className="text-neutral-600" />
                    </Button>
                )}
            </div>

            {/* Área de Input */}
            <div className="border-t border-neutral-200/80 bg-white">
                <div className="px-3 pt-2 pb-1 flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-600 gap-1.5 px-1 h-7">
                        <Plus size={15} />
                    </Button>
                    {activeContexts.map(ctx => (
                        <Button
                            key={ctx.id}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7 gap-1.5 pr-1 pl-2 border-neutral-300/80 text-neutral-600 bg-neutral-100/80 hover:bg-neutral-200/70 shadow-xs flex items-center"
                        >
                            <ctx.icon size={13} className="text-neutral-500 mr-1" />
                            <span>{ctx.label}</span>
                            <span
                                role="button"
                                tabIndex={0}
                                aria-label={`Remove ${ctx.label} context`}
                                className="ml-1.5 p-0.5 rounded-full hover:bg-neutral-300/70 cursor-pointer flex items-center justify-center"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeContext(ctx.id);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.stopPropagation();
                                        removeContext(ctx.id);
                                    }
                                }}
                            >
                                <XIcon size={11} strokeWidth={3} className="text-neutral-400 hover:text-neutral-600" />
                            </span>
                        </Button>
                    ))}
                </div>

                <div className="p-3 pt-1">
                    <div className="relative flex items-center">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none z-10">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:bg-neutral-100 pointer-events-auto">
                                <AtSign size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-neutral-500 hover:bg-neutral-100 pointer-events-auto">
                                <Paperclip size={16} />
                            </Button>
                        </div>
                        <Textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Ask assistant, use @ to mention specific PDFs..."
                            className="pl-[4.5rem] pr-[5.5rem] min-h-[50px] max-h-[150px] text-sm rounded-md border-neutral-300/90 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 resize-none w-full"
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-8 bg-indigo-500 hover:bg-indigo-600"
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || loading}
                        >
                            {loading ? (
                                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                                <> Send <Send size={14} className="ml-1.5" /> </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
