"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { tourService } from "../services/TourService";

export default function TourButton() {
    useEffect(() => {
        // Configurar los pasos del tour
        tourService.setDashboardSteps();

        // Limpiar al desmontar
        return () => {
            tourService.destroy();
        };
    }, []);

    const startTour = () => {
        tourService.startTour();
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-4 right-4 z-50 bg-white shadow-md hover:bg-gray-100"
            onClick={startTour}
            title="Iniciar tour guiado"
        >
            <HelpCircle className="h-5 w-5 text-indigo-600" />
        </Button>
    );
} 