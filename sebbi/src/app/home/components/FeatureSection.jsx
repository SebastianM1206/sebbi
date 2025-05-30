"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, BookOpen, Lightbulb, Users } from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Escritura con IA",
      description:
        "Genera contenido de alta calidad con IA avanzada que entiende los estándares de escritura académica",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Integración de Pdf",
      description:
        "Integra fácilmente citas e investigaciones de distintas fuentes académicas",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Sugerencias Inteligentes",
      description:
        "Recibe recomendaciones inteligentes para mejorar la claridad, fluidez y rigor académico",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Herramientas de Colaboración",
      description:
        "Trabaja junto con asesores y compañeros con funciones de colaboración en tiempo real",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            Todo lo que Necesitas para
            <span className="block text-blue-600">Escribir con Confianza</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desde la lluvia de ideas hasta la entrega final, nuestra IA te
            asiste en cada paso de tu trayectoria académica.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 group hover:border-blue-200"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-700 group-hover:scale-110 transition-all duration-200">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
