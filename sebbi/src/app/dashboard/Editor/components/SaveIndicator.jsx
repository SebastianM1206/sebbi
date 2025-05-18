import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle } from "lucide-react";

export default function SaveIndicator() {
    return (
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
    );
} 