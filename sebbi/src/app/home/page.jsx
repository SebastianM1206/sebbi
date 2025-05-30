"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "./components/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  BookOpen,
  Lightbulb,
  Users,
  Star,
  CheckCircle,
  Play,
  Menu,
  X,
} from "lucide-react";
import HeroSection from "./components/HeroSection";
import FeatureSection from "./components/FeatureSection";
import TestimonialSection from "./components/TestimonialSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import PricingSection from "./components/PricingSection";
import AboutSection from "./components/AboutSection";
import ProgressiveStoryReveal from "./components/ProgressiveStoryReveal";

export default function SebbiAILanding() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <TestimonialSection />
      <CtaSection />
      <PricingSection />
      <AboutSection />
      <ProgressiveStoryReveal />
      <Footer />
    </div>
  );
}
