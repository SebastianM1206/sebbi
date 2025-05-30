"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/sign-in");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">Sebbi AI</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Precios
            </a>
            <a
              href="#about"
              className="text-gray-600 hover:text-black transition-colors"
            >
              Acerca de
            </a>
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              onClick={handleSignIn}
            >
              Iniciar Sesión
            </Button>
          </div>

          <button
            className="md:hidden text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <a
              href="#features"
              className="block py-2 text-gray-600 hover:text-black"
            >
              Características
            </a>
            <a
              href="#pricing"
              className="block py-2 text-gray-600 hover:text-black"
            >
              Precios
            </a>
            <a
              href="#about"
              className="block py-2 text-gray-600 hover:text-black"
            >
              Acerca de
            </a>
            <Button
              variant="outline"
              className="w-full mt-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              onClick={handleSignIn}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
