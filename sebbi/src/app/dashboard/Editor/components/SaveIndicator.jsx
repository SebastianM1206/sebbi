"use client";
import { useEffect, useState } from 'react';
import { Check, Clock, Cloud, Loader2 } from 'lucide-react';
import useEditorStore from '@/stores/editorStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale'; // Para formato en español

export default function SaveIndicator() {
    const { isSaving, hasUnsavedChanges, lastSavedAt, isUpdatingTitle } = useEditorStore();
    const [statusText, setStatusText] = useState("Guardado");

    useEffect(() => {
        if (isUpdatingTitle) { // Prioridad si el título se está actualizando
            setStatusText("Actualizando título...");
        } else if (isSaving) {
            setStatusText("Guardando...");
        } else if (hasUnsavedChanges) {
            setStatusText("No guardado");
        } else if (lastSavedAt) {
            const timeAgo = formatDistanceToNow(new Date(lastSavedAt), { addSuffix: true, locale: es });
            setStatusText(`Guardado ${timeAgo}`);
        } else {
            // Estado inicial antes del primer guardado o si no hay lastSavedAt
            setStatusText("Guardado");
        }
    }, [isSaving, hasUnsavedChanges, lastSavedAt, isUpdatingTitle]);

    // No ocultar el indicador si hay una acción pendiente o un estado que mostrar.
    // if (!isUpdatingTitle && !isSaving && !hasUnsavedChanges && !lastSavedAt) {
    //     return null; 
    // }

    return (
        <div className="fixed bottom-14 right-4 z-10">
            <div className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 border text-xs shadow-sm backdrop-blur-sm transition-all",
                isSaving ? "border-neutral-300" :
                    hasUnsavedChanges ? "border-yellow-400" : "border-green-500",
                statusText === 'No guardado' ? "text-yellow-600" : "text-neutral-600"
            )}>
                {isSaving ? (
                    <Loader2 size={14} className="animate-spin text-neutral-500" />
                ) : hasUnsavedChanges ? (
                    <Clock size={14} className="text-yellow-500" />
                ) : (
                    <Check size={14} className="text-green-500" />
                )}
                <span>{statusText}</span>
            </div>
        </div>
    );
} 