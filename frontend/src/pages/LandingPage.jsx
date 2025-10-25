import React, { useState, useEffect } from 'react';
import Header from '../components/layout/Header';
import HeroSection from '../components/layout/HeroSection';
import CategorySection from '../components/layout/CategorySection';
import TestimonialsSection from '../components/layout/TestimonialsSection';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <HeroSection />
      <CategorySection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;