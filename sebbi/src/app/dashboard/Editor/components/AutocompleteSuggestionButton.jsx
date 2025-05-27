import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export default function AutocompleteSuggestionButton({
    visible,
    onAccept,
    suggestion = "",
    className = ""
}) {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsAnimating(true);
            const timer = setTimeout(() => setIsAnimating(false), 200);
            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const truncatedSuggestion = suggestion.length > 40
        ? `${suggestion.substring(0, 40)}...`
        : suggestion;

    return (
        <div className={`
            fixed top-4 right-4 z-50 
            transition-all duration-200 ease-in-out
            ${isAnimating ? 'animate-pulse' : ''}
            ${className}
        `}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-sm">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-blue-500" />
                    <span className="text-xs font-medium text-gray-600">
                        Sugerencia con IA
                    </span>
                    <div className="ml-auto">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            AI
                        </span>
                    </div>
                </div>

                {/* Preview del texto sugerido */}
                <div className="mb-3">
                    <p className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded border-l-2 border-blue-400">
                        {truncatedSuggestion}
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                            Tab
                        </kbd>
                        <span className="text-xs text-gray-500">para aceptar</span>
                    </div>


                </div>

                {/* Indicador de tecla Escape */}
                <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                            Esc
                        </kbd>
                        <span className="text-xs text-gray-400">para rechazar</span>
                    </div>
                </div>
            </div>
        </div>
    );
} 