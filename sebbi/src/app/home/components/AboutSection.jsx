import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, Users, Sparkles, BookOpen } from "lucide-react";
import { CheckCircle } from "lucide-react";

// Componente Sección Acerca de
const AboutSection = () => {
  const stats = [
    {
      number: "500K+",
      label: "Usuarios Activos",
      description: "Estudiantes e investigadores en todo el mundo",
    },
    {
      number: "10M+",
      label: "Artículos Escritos",
      description: "Artículos académicos completados exitosamente",
    },
    {
      number: "95%",
      label: "Tasa de Éxito",
      description: "Satisfacción y tasa de finalización de usuarios",
    },
    {
      number: "24/7",
      label: "Asistente IA",
      description: "Siempre disponible para ayudarte a escribir",
    },
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">
            Acerca de
            <span className="text-blue-600"> Jenni AI</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nuestra misión es democratizar la escritura académica y empoderar a
            todas las personas para que comuniquen sus ideas con claridad y
            confianza.
          </p>
        </div>

        <div className="mb-20">
          <Card className="bg-gray-50 border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="max-w-4xl mx-auto text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-black mb-6">
                  Nuestra Misión
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-8">
                  La escritura académica no debería ser una barrera para
                  compartir investigaciones e ideas innovadoras. Creemos que con
                  las herramientas adecuadas, cada mente brillante puede
                  concentrarse en lo más importante: sus descubrimientos, ideas
                  y contribuciones al conocimiento humano.
                </p>
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-black mb-2">
                      Inconformidad
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Desafiando lo establecido y dandole la bienvenida a nuevas
                      ideas y perspectivas
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-black mb-2">
                      Innovación
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Aprovechando la IA de vanguardia para transformar el
                      futuro
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-black mb-2">
                      Excelencia
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Manteniendo los más altos estándares en integridad
                      académica
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
