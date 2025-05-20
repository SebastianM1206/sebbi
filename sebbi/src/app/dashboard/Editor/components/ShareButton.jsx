"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Share2, Check } from "lucide-react";
import { toast } from "sonner";
import useEditorStore from '@/stores/editorStore';

export default function ShareButton() {
    const [copied, setCopied] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const { currentDocument } = useEditorStore();

    useEffect(() => {
        if (typeof window !== 'undefined' && currentDocument && currentDocument.id) {
            // Asumimos que la URL del editor es algo como /dashboard/Editor/[documentId]
            // O que tienes una forma de construir la URL para compartir.
            // Por ahora, usaremos la URL actual y le añadiremos un parámetro si no lo tiene.
            let baseUrl = window.location.origin + window.location.pathname;
            if (currentDocument.id) {
                // Si tu ruta ya incluye el ID del documento, puedes usarla directamente
                // Por ejemplo, si tu ruta es /dashboard/editor/[documentId]
                // podrías construirla como:
                // baseUrl = `${window.location.origin}/dashboard/Editor/${currentDocument.id}`;

                // Para este ejemplo, si la URL actual no termina con el ID del documento,
                // se lo añadimos como un parámetro de búsqueda para simplificar.
                // Idealmente, tu estructura de rutas ya manejaría esto.
                if (!baseUrl.endsWith(currentDocument.id)) {
                    baseUrl = `${window.location.origin}/dashboard/Editor/${currentDocument.id}`;
                }
            }
            setShareUrl(baseUrl);
        }
    }, [currentDocument]);

    const handleShare = () => {
        if (!shareUrl) {
            toast.error("No se pudo generar el enlace para compartir.");
            return;
        }
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            toast.success("Enlace copiado al portapapeles!");
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error("Error al copiar enlace: ", err);
            toast.error("Error al copiar el enlace.");
        });
    };

    if (!currentDocument || !currentDocument.id) {
        return null; // No mostrar el botón si no hay documento actual o ID
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleShare}
                    className="text-neutral-500 hover:text-neutral-800 h-8 w-8"
                    title="Compartir documento"
                >
                    {copied ? <Check size={18} className="text-green-500" /> : <Share2 size={18} />}
                </Button>
            </TooltipTrigger>
            <TooltipContent>
                {copied ? "Enlace copiado" : "Compartir documento"}
            </TooltipContent>
        </Tooltip>
    );
} 