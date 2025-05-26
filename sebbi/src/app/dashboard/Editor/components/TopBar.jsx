"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowLeft,
    Loader2,
    Download,
    FileText,
    FileCode,
    FileType2,
    FileDown,
} from "lucide-react";
import useEditorStore from '@/stores/editorStore';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import ShareButton from './ShareButton';

import { saveAs } from "file-saver";
import { Document, Packer, Paragraph, TextRun } from "docx";

export default function TopBar({ documentTitle, setDocumentTitle }) {
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [titleValue, setTitleValue] = useState(documentTitle || "");
    const [isCommittingTitleChange, setIsCommittingTitleChange] = useState(false);
    const inputRef = useRef(null);
    const {
        editor: editorInstance,
        hasUnsavedChanges,
        isSaving,
        isUpdatingTitle,
        currentDocument
    } = useEditorStore();
    const router = useRouter();

    useEffect(() => {
        if (!isEditingTitle && !isCommittingTitleChange) {
            setTitleValue(documentTitle || "");
        }
    }, [documentTitle, isEditingTitle, isCommittingTitleChange]);

    useEffect(() => {
        if (currentDocument && !isEditingTitle && !isCommittingTitleChange) {
            try {
                const content = JSON.parse(currentDocument.content);
                const storeTitle = content.title || "";

                // Actualizar siempre el título desde el store para asegurar sincronización
                setTitleValue(storeTitle);
                setDocumentTitle(storeTitle); // Asegurar que el título del documento también se actualice
            } catch (error) {
                console.error("Error al sincronizar título en TopBar:", error);
            }
        }
    }, [currentDocument, isEditingTitle, isCommittingTitleChange, setDocumentTitle]);

    useEffect(() => {
        if (documentTitle !== titleValue && !isEditingTitle && !isCommittingTitleChange) {
            setTitleValue(documentTitle || "");
        }
    }, [documentTitle, titleValue, isEditingTitle, isCommittingTitleChange]);

    const handleStartEditing = () => {
        if (isUpdatingTitle || isCommittingTitleChange) return;
        setTitleValue(documentTitle || "");
        setIsEditingTitle(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        }, 0);
    };

    const handleTitleAction = async () => {
        const newTitleToSave = titleValue.trim() || "";
        if (newTitleToSave === (documentTitle || "").trim() || isUpdatingTitle || isCommittingTitleChange) {
            setIsEditingTitle(false);
            setTitleValue(documentTitle || "");
            return;
        }
        setIsCommittingTitleChange(true);
        try {
            await setDocumentTitle(newTitleToSave);

            // Actualizar el H1 en el editor si existe
            if (editorInstance) {
                const firstNode = editorInstance.state.doc.firstChild;
                if (firstNode && firstNode.type.name === 'heading' && firstNode.attrs.level === 1) {
                    editorInstance.chain()
                        .focus()
                        .command(({ tr }) => {
                            const start = 0;
                            const end = firstNode.nodeSize;
                            tr.replaceWith(
                                start,
                                end,
                                editorInstance.schema.nodes.heading.create(
                                    { level: 1 },
                                    editorInstance.schema.text(newTitleToSave)
                                )
                            );
                            return true;
                        })
                        .run();
                }
            }
        } catch (error) {
            console.error("Error al actualizar título desde TopBar:", error);
            setTitleValue(documentTitle || "");
            toast.error("Error al guardar el título");
        } finally {
            setIsCommittingTitleChange(false);
            setIsEditingTitle(false);
        }
    };

    const handleTitleBlur = () => {
        if (isEditingTitle) {
            handleTitleAction();
        }
    };

    const handleTitleKeyDown = (e) => {
        if (isUpdatingTitle || isCommittingTitleChange) return;
        if (e.key === 'Enter') {
            e.preventDefault();
            handleTitleAction();
        } else if (e.key === 'Escape') {
            setIsEditingTitle(false);
            setTitleValue(documentTitle || "");
        }
    };

    const handleBackToDashboard = () => {
        if (isUpdatingTitle || isCommittingTitleChange) return;
        router.push('/dashboard');
    };

    const handleExport = async (type) => {
        if (!editorInstance) {
            toast.error("El editor no está disponible para exportar.");
            return;
        }

        const htmlContent = editorInstance.getHTML();
        const textContent = editorInstance.getText();
        const finalDocumentTitle = (documentTitle || "documento").replace(/[^a-z0-9]/gi, '_').toLowerCase();

        try {
            if (type === "txt") {
                const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
                saveAs(blob, `${finalDocumentTitle}.txt`);
                toast.success("Exportado a TXT con éxito!");
            } else if (type === "html") {
                const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
                saveAs(blob, `${finalDocumentTitle}.html`);
                toast.success("Exportado a HTML con éxito!");
            } else if (type === "docx") {
                toast.info("Generando DOCX...", { duration: 2000 });
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: textContent.split('\n').map(line => new Paragraph({
                            children: [new TextRun(line)]
                        })),
                    }],
                });
                const blob = await Packer.toBlob(doc);
                saveAs(blob, `${finalDocumentTitle}.docx`);
                toast.success("Exportado a DOCX con éxito!");
            } else if (type === "pdf") {
                toast.info("Generando PDF...", { duration: 3000 });
                const html2canvas = (await import("html2canvas-pro")).default;
                const { jsPDF } = await import("jspdf");

                // Selecciona el nodo del editor (ajusta el selector si usas otro wrapper)
                const editorNode = document.querySelector('.ProseMirror') || editorInstance.view.dom;

                // Márgenes en puntos (1cm = 28.35pt, 2cm ≈ 56.7pt)
                const marginLeft = 56.7;
                const marginTop = 56.7;
                const marginRight = 56.7;
                const marginBottom = 56.7;

                // Tamaño de página A4 en puntos
                const pageWidth = 595.28;  // 21cm
                const pageHeight = 841.89; // 29.7cm

                // Renderiza el editor a imagen de alta calidad
                const canvas = await html2canvas(editorNode, {
                    useCORS: true,
                    backgroundColor: "#fff",
                    scale: 3, // Alta resolución
                    scrollY: -window.scrollY, // Corrige si hay scroll
                });

                // Calcula el tamaño de la imagen dentro de los márgenes
                const imgWidth = pageWidth - marginLeft - marginRight;
                const imgHeight = canvas.height * (imgWidth / canvas.width);

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF({
                    orientation: "portrait",
                    unit: "pt",
                    format: "a4"
                });

                // Si la imagen cabe en una página
                if (imgHeight <= (pageHeight - marginTop - marginBottom)) {
                    pdf.addImage(
                        imgData,
                        'PNG',
                        marginLeft,
                        marginTop,
                        imgWidth,
                        imgHeight,
                        undefined,
                        'FAST'
                    );
                } else {
                    // Si la imagen es más alta que una página, la divide en varias páginas
                    let y = marginTop;
                    let remainingHeight = imgHeight;
                    while (remainingHeight > 0) {
                        pdf.addImage(
                            imgData,
                            'PNG',
                            marginLeft,
                            y,
                            imgWidth,
                            imgHeight,
                            undefined,
                            'FAST'
                        );
                        remainingHeight -= (pageHeight - marginTop - marginBottom);
                        if (remainingHeight > 0) {
                            pdf.addPage();
                            y = marginTop - (imgHeight - remainingHeight);
                        }
                    }
                }

                pdf.save(`${finalDocumentTitle}.pdf`);
                toast.success("Exportado a PDF con éxito!");
            }
        } catch (error) {
            console.error(`Error al exportar a ${type.toUpperCase()}:`, error);
            toast.error(`Error al exportar a ${type.toUpperCase()}.`);
        }
    };

    const showLoadingState = isUpdatingTitle || isCommittingTitleChange;

    return (
        <div className="border-b border-neutral-200 px-4 py-2 flex items-center justify-between sticky top-0 bg-white z-20">
            <div className="flex items-center space-x-2 flex-1">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleBackToDashboard}
                            className="text-neutral-500 hover:text-neutral-800 h-8 w-8"
                            disabled={showLoadingState}
                        >
                            <ArrowLeft size={18} />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Volver al dashboard</TooltipContent>
                </Tooltip>

                <div className="flex-1 min-w-0">
                    {isEditingTitle && !showLoadingState ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={titleValue}
                            onChange={(e) => setTitleValue(e.target.value)}
                            onBlur={handleTitleBlur}
                            onKeyDown={handleTitleKeyDown}
                            className="w-full border-0 bg-transparent text-lg font-medium focus:outline-none focus:ring-0 text-neutral-800 px-2 py-1 -ml-2"
                            placeholder="Título"
                            disabled={showLoadingState}
                        />
                    ) : (
                        <div className="flex items-center">
                            <button
                                onClick={handleStartEditing}
                                className={`text-lg font-medium text-neutral-800 hover:bg-neutral-100 rounded px-2 py-1 -ml-2 truncate ${showLoadingState ? 'cursor-not-allowed' : ''}`}
                                disabled={showLoadingState}
                                title={documentTitle || "Título"}
                            >
                                {showLoadingState
                                    ? <span className="text-neutral-400 flex items-center"><Loader2 size={18} className="animate-spin mr-2" /> Guardando...</span>
                                    : <span className="truncate max-w-xs md:max-w-md lg:max-w-lg">{documentTitle || <span className="text-neutral-400">Título</span>}</span>
                                }
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center space-x-1">
                <div className="px-2 text-xs text-neutral-500 min-w-[100px] text-right whitespace-nowrap">
                    {showLoadingState ? 'Actualizando...' : isSaving ? 'Guardando...' : hasUnsavedChanges ? 'Sin guardar' : 'Guardado'}
                </div>

                <ShareButton />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-neutral-500 hover:text-neutral-800 h-8 w-8" title="Exportar documento">
                            <Download size={18} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport("docx")}>
                            <FileType2 size={16} className="mr-2 text-blue-600" /> Exportar a DOCX
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("pdf")}>
                            <FileDown size={16} className="mr-2 text-red-600" /> Exportar a PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("txt")}>
                            <FileText size={16} className="mr-2 text-gray-600" /> Exportar a TXT
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport("html")}>
                            <FileCode size={16} className="mr-2 text-green-600" /> Exportar a HTML
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
} 