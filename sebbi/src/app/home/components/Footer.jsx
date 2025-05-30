import React from "react";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-black">Sebbi AI</span>
          </div>

          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-black transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Términos de Servicio
            </a>
            <a href="#" className="hover:text-black transition-colors">
              Contacto
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500">
          <p>&copy; 2025 Sebbi AI. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
