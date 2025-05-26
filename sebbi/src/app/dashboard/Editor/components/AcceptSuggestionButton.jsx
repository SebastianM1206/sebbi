import React from 'react';
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function AcceptSuggestionButton({ onAccept, visible }) {
    if (!visible) return null;

    return (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
            <Button
                onClick={onAccept}
                size="sm"
                variant="ghost"
                className="bg-white hover:bg-gray-100 text-gray-700 border shadow-sm flex items-center gap-2 px-3 py-1.5 text-sm rounded-md"
            >
                <span className="font-normal">Tab</span>
                <Check size={14} className="text-gray-500" />
            </Button>
        </div>
    );
} 