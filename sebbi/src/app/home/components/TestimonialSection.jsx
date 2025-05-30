"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { TestimonialLinkedList } from "@/app/home/utils/TestimonialLinkedList";
import { testimonials } from "@/app/home/utils/testimonials"; // Import the testimonials array

export default function TestimonialSection() {
  const [testimonialList] = useState(() => {
    const list = new TestimonialLinkedList();

    // Add testimonials to the linked list
    testimonials.forEach((testimonial) => list.add(testimonial));
    return list;
  });

  const [currentTestimonial, setCurrentTestimonial] = useState(
    testimonialList.getCurrent()
  );
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      testimonialList.moveToNext();
      setCurrentTestimonial(testimonialList.getCurrent());
      setCurrentIndex(testimonialList.getCurrentIndex());
    }, 4000);

    return () => clearInterval(timer);
  }, [testimonialList]);

  const handleIndicatorClick = (index) => {
    testimonialList.moveToIndex(index);
    setCurrentTestimonial(testimonialList.getCurrent());
    setCurrentIndex(index);
  };

  const allTestimonials = testimonialList.getAllTestimonials();

  if (!currentTestimonial) return null;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-12">
          Perfecto para Estudiantes e Investigadores
        </h2>

        <div className="relative">
          <Card className="bg-white border-gray-200 shadow-lg">
            <CardContent className="p-8">
              <div className="flex justify-center mb-4">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>
              <p className="text-xl text-gray-700 mb-6 italic">
                "{currentTestimonial.content}"
              </p>
              <div>
                <p className="text-black font-semibold">
                  {currentTestimonial.name}
                </p>
                <p className="text-gray-500">{currentTestimonial.role}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center mt-6 space-x-2">
            {allTestimonials.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex ? "bg-blue-600 w-8" : "bg-gray-300"
                }`}
                onClick={() => handleIndicatorClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
