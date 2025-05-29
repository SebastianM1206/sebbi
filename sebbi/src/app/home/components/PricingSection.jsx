"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, CheckCircle, Check } from "lucide-react";
import { DiscountContext } from "../model/DiscountContext";
import PercentageDiscountStrategy from "../model/PercentageDiscount";
import { StudentDiscountStrategy } from "../model/StudentDiscount";
import { FixedAmountDiscountStrategy } from "../model/FixedAmount";
import { useRouter } from "next/navigation";

const PricingSection = () => {
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState("");

  const discountContext = new DiscountContext();

  const plans = [
    {
      name: "Gratis",
      price: 0,
      description: "Perfecto para comenzar",
      features: [
        "100 tokens de prueba",
        "Asistencia básica de escritura con IA",
        "Plantillas estándar",
        "Soporte por email",
      ],
    },
    {
      name: "Pro",
      price: 29,
      description: "Popular entre estudiantes",
      features: [
        "Palabras ilimitadas",
        "Escritura avanzada con IA",
        "Generador de citas",
        "Plantillas personalizables",
        "Soporte prioritario",
        "Trabajo en parejas",
      ],
      popular: true,
    },
    {
      name: "Equipo",
      price: 99,
      description: "Para equipos de investigación",
      features: [
        "Todo el plan Pro",
        "Colaboración en equipo",
        "Panel de administración",
        "Integraciones personalizadas",
        "Soporte dedicado",
        "Análisis avanzado",
      ],
    },
  ];

  const discountCodes = {
    YOUTUBER20: new PercentageDiscountStrategy(20),
    STUDENT: new StudentDiscountStrategy(),
    WELCOME10: new FixedAmountDiscountStrategy(10),
    RESEARCH25: new PercentageDiscountStrategy(25),
  };

  const handleStartFree = () => {
    router.push("/sign-up");
  };

  const applyDiscount = () => {
    const code = discountCode.toUpperCase();
    if (discountCodes[code]) {
      discountContext.setStrategy(discountCodes[code]);
      setAppliedDiscount(discountCodes[code]);
      setDiscountError("");
    } else {
      setDiscountError("Código de descuento inválido");
      setAppliedDiscount(null);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountError("");
  };

  const calculateDiscountedPrice = (originalPrice) => {
    if (appliedDiscount && originalPrice > 0) {
      discountContext.setStrategy(appliedDiscount);
      return discountContext.calculatePrice(originalPrice);
    }
    return originalPrice;
  };

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            Elige Tu
            <span className="block text-blue-600">Plan Perfecto</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Comienza gratis y actualiza a medida que creces. Todos los planes
            incluyen nuestras funciones principales de escritura con IA.
          </p>

          <div className="max-w-md mx-auto mb-12">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Tag className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-semibold text-gray-900">
                  ¿Tienes un código de descuento?
                </span>
              </div>

              {appliedDiscount ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">
                      ¡{appliedDiscount.getDescription()} aplicado!
                    </span>
                  </div>
                  <button
                    onClick={removeDiscount}
                    className="text-green-600 hover:text-green-800 text-sm underline"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ingresa el código de descuento"
                      value={discountCode}
                      onChange={(e) => {
                        setDiscountCode(e.target.value);
                        setDiscountError("");
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <Button
                      onClick={applyDiscount}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                      disabled={!discountCode.trim()}
                    >
                      Aplicar
                    </Button>
                  </div>
                  {discountError && (
                    <p className="text-red-500 text-sm">
                      Código de descuento inválido
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    Prueba: STUDENT, YOUTUBER20, WELCOME10, RESEARCH25
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => {
            const originalPrice = plan.price;
            const discountedPrice = calculateDiscountedPrice(originalPrice);
            const hasDiscount =
              appliedDiscount &&
              originalPrice > 0 &&
              discountedPrice < originalPrice;

            return (
              <Card
                key={index}
                className={`relative bg-white border-2 transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "border-blue-600 shadow-lg transform scale-105"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-black mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>

                    <div className="mb-6">
                      {hasDiscount ? (
                        <div>
                          <div className="text-gray-400 line-through text-2xl">
                            ${originalPrice}
                          </div>
                          <div className="text-4xl font-bold text-blue-600">
                            ${Math.round(discountedPrice)}
                            <span className="text-lg text-gray-600">
                              /month
                            </span>
                          </div>
                          <div className="text-sm text-green-600 font-medium mt-1">
                            Save ${Math.round(originalPrice - discountedPrice)}
                            /month
                          </div>
                        </div>
                      ) : (
                        <div className="text-4xl font-bold text-black">
                          ${originalPrice}
                          {originalPrice > 0 && (
                            <span className="text-lg text-gray-600">
                              /month
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full py-3 text-lg rounded-xl transition-all duration-200 ${
                        plan.popular
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300"
                      }`}
                      onClick={handleStartFree}
                    >
                      {plan.price === 0 ? "Comenzar Gratis" : "Prueba Gratuita"}
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm mb-4">
            Todos los planes incluyen una prueba gratuita de 7 días. No se
            requiere tarjeta de crédito.
          </p>
          <p className="text-gray-500 text-sm">
            ¿Necesitas un plan personalizado?{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Contacta a nuestro equipo de ventas
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
