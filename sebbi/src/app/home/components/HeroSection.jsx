"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Play } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();

  const handleDemoClick = () => {
    window.open(
      "https://www.youtube.com/watch?v=xvFZjo5PgG0&ab_channel=Duran",
      "_blank"
    ); //TODO: change to the actual video (or a better one)
  };

  const handleStartWriting = () => {
    router.push("/sign-up");
  };

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto text-center">
        <Badge className="mb-6 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
          <Sparkles className="w-3 h-3 mr-1" />
          Impulsado por IA Avanzada
        </Badge>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-black mb-6 leading-tight">
          Escribe Mejores Trabajos
          <span className="block text-blue-600">10 Veces Más Rápido</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          El asistente de escritura con IA que ayuda a estudiantes e
          investigadores a escribir trabajos académicos de alta calidad con
          citas apropiadas, en la mitad del tiempo.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={handleStartWriting}
          >
            Comenzar a Escribir
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg rounded-xl cursor-pointer hover:scale-105 transition-all duration-200 "
            onClick={handleDemoClick}
          >
            <Play className="mr-2 h-5 w-5" />
            Ver Demo
          </Button>
        </div>

        <div className="text-sm text-gray-500 mb-8">
          Confiado por más de 500,000 estudiantes y profesores en todo el mundo
        </div>

        {/* Demo Video Placeholder */}
        <div className="relative max-w-4xl mx-auto">
          <div className="aspect-video bg-gray-100 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <Play className="h-8 w-8 text-blue-600 ml-1" />
                </div>
                <p className="text-gray-500">Video de uso muy pronto</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-3xl -z-10 transform scale-110"></div>
        </div>
      </div>
    </section>
  );
}
