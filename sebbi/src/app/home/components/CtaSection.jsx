"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CtaSection() {
  const router = useRouter();

  const handleStartFree = () => {
    router.push("/sign-up");
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
          ¿Listo para Transformar tu
          <span className="block text-blue-600">Escritura Académica?</span>
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Únete a miles de estudiantes e investigadores que ya están escribiendo
          mejores trabajos, más rápido.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 cursor-pointer"
            onClick={handleStartFree}
          >
            Comenzar Gratis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Sin tarjeta de crédito
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            100 tokens gratis
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Cancelar en cualquier momento
          </div>
        </div>
      </div>
    </section>
  );
}
