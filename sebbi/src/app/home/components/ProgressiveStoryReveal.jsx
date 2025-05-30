"use client";

import { useState, useEffect, useRef } from "react";
import { StoryPublisher } from "../model/StoryPublisher";
import { StoryAnimationSubscriber } from "../model/StoryAnimationSubscriber";
import { ProgressIndicatorSubscriber } from "../model/ProgressIndicatorSubscriber";
import { ScrollProgressSubscriber } from "../model/ScrollProgressSubscriber";

const ProgressiveStoryReveal = () => {
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sectionsRef = useRef([]);
  const publisherRef = useRef(null);
  const subscribersRef = useRef([]);

  const storyChapters = [
    {
      id: "beginning",
      title: "El Comienzo",
      year: "2018",
      content:
        'Todo comenzó con un simple "Hola Mundo" y una insaciable curiosidad sobre cómo cobran vida los sitios web. Lo que comenzó como sesiones de programación los fines de semana rápidamente se convirtió en un apasionante viaje al mundo del desarrollo web.',
      icon: "🌱",
      color: "from-cyan-400 to-blue-500",
    },
    {
      id: "learning",
      title: "La Fase de Aprendizaje",
      year: "2019-2020",
      content:
        "Sin conocernos aún, profundizamos en JavaScript, React y tecnologías web modernas. Cada proyecto enseñó algo nuevo, las noches tardías se convirtieron en madrugadas mientras se construían nuestras primeras aplicaciones reales.",
      icon: "📚",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "breakthrough",
      title: "El Avance",
      year: "2021",
      content:
        "Alfonse obtuvó su primer proyecto importante, fue un gran salto, implementar características complejas y ver usuarios reales interactuando con su código. Este fue el momento en que supo que había encontrado su vocación.",
      icon: "🚀",
      color: "from-indigo-500 to-purple-600",
    },
    {
      id: "growth",
      title: "Crecimiento Rápido",
      year: "2022-2023",
      content:
        "Nos conocimos en la universidad, donde se expandió el conocimiento de ambos. Cada nueva tecnología abrió puertas a desafíos más complejos y emocionantes, sabiamos que podiamos hacer cosas grandes juntos.",
      icon: "📈",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "present",
      title: "Hoy y Más Allá",
      year: "2024+",
      content:
        "Ahora cremos como equipo experiencias digitales que no solo se ven increibles sino que resuelven problemas reales. Cada proyecto es una oportunidad para superar límites y crear algo significativo. Sebbi fue el primer gran exito pero, El viaje continúa...",
      icon: "✨",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const handleConnect = () => {
    window.open(
      "https://www.linkedin.com/in/sebastián-medina-578a9b254",
      "_blank"
    );
  };

  useEffect(() => {
    // Initialize Publisher (Subject in observer pattern )
    publisherRef.current = new StoryPublisher();

    // Create and subscribe concrete subscribers
    const animationSubscriber = new StoryAnimationSubscriber(
      setVisibleSections
    );
    const progressSubscriber = new ProgressIndicatorSubscriber(
      setActiveSection
    );
    const scrollSubscriber = new ScrollProgressSubscriber(setScrollProgress);

    subscribersRef.current = [
      animationSubscriber,
      progressSubscriber,
      scrollSubscriber,
    ];

    subscribersRef.current.forEach((subscriber) => {
      publisherRef.current.subscribe(subscriber);
    });

    // Intersection Observer (Client)
    const observer = new IntersectionObserver(
      (entries) => {
        const currentVisible = new Set(
          publisherRef.current.state.visibleSections
        );
        let maxVisibleIndex = publisherRef.current.state.activeSection;

        entries.forEach((entry) => {
          const sectionId = entry.target.getAttribute("data-section");
          const sectionIndex = parseInt(
            entry.target.getAttribute("data-index")
          );

          if (entry.isIntersecting) {
            currentVisible.add(sectionId);
            maxVisibleIndex = Math.max(maxVisibleIndex, sectionIndex);
          } else {
            currentVisible.delete(sectionId);
          }
        });

        // Calculate scroll progress
        const progress = Math.min(
          (maxVisibleIndex / (storyChapters.length - 1)) * 100,
          100
        );

        // Notify all subscribers through publisher
        publisherRef.current.updateState({
          visibleSections: currentVisible,
          activeSection: maxVisibleIndex,
          scrollProgress: progress,
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-10% 0px -10% 0px",
      }
    );

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => {
      observer.disconnect();

      if (publisherRef.current) {
        subscribersRef.current.forEach((subscriber) => {
          publisherRef.current.unsubscribe(subscriber);
        });
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r bg-clip-text">
            Nuestro
            <span className=" text-blue-600"> Viaje</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cada gran historia tiene capítulos. Aquí está la nuestra, un relato
            de curiosidad, crecimiento y posibilidades infinitas.
          </p>
        </div>

        <div className="space-y-32">
          {storyChapters.map((chapter, index) => (
            <div
              key={chapter.id}
              ref={(el) => (sectionsRef.current[index] = el)}
              data-section={chapter.id}
              data-index={index}
              className={`transform transition-all duration-1000 ease-out ${
                visibleSections.has(chapter.id)
                  ? "translate-y-0 opacity-100"
                  : "translate-y-20 opacity-0"
              }`}
            >
              <div
                className={`relative ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } flex flex-col lg:flex items-center gap-12`}
              >
                <div
                  className={`relative flex-shrink-0 ${
                    visibleSections.has(chapter.id) ? "animate-pulse" : ""
                  }`}
                >
                  <div
                    className={`w-24 h-24 rounded-full bg-gradient-to-r ${
                      chapter.color
                    } flex items-center justify-center text-4xl shadow-2xl transform transition-transform duration-500 ${
                      visibleSections.has(chapter.id)
                        ? "scale-110 rotate-12"
                        : "scale-100"
                    }`}
                  >
                    {chapter.icon}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {chapter.year}
                    </span>
                  </div>
                </div>

                <div className="flex-1 max-w-2xl">
                  <div
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-blue-200 shadow-xl transform transition-all duration-700 delay-300 hover:bg-white ${
                      visibleSections.has(chapter.id)
                        ? "translate-y-0 opacity-100 scale-100"
                        : "translate-y-10 opacity-0 scale-95"
                    }`}
                  >
                    <h3 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {chapter.title}
                    </h3>
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {chapter.content}
                    </p>

                    <div
                      className={`mt-6 h-1 bg-gradient-to-r ${
                        chapter.color
                      } rounded-full transform transition-all duration-1000 delay-500 ${
                        visibleSections.has(chapter.id) ? "w-full" : "w-0"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          className={`text-center mt-32 transform transition-all duration-1000 ${
            scrollProgress > 80
              ? "translate-y-0 opacity-100"
              : "translate-y-20 opacity-0"
          }`}
        >
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-8 max-w-2xl mx-auto shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Te gustaría escribir el próximo capítulo juntos?
            </h3>
            <p className="text-blue-100 mb-6">
              Creemos algo increíble que también agregue valor a tu historia.
            </p>
            <button
              className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-50 transform hover:scale-105 transition-all duration-300 shadow-lg cursor-pointer"
              onClick={handleConnect}
            >
              Conectemos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressiveStoryReveal;
