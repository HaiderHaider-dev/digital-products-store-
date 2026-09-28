/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { AboutContactModal } from './components/AboutContactModal';
import { AdminSalesDashboard } from './components/AdminSalesDashboard';
import { SLIDES } from './data/storeData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [modalType, setModalType] = useState<'about' | 'contact' | null>(null);
  const [showAdminDashboard, setShowAdminDashboard] = useState<boolean>(false);

  const catalogRef = useRef<HTMLDivElement>(null);

  const handleSelectTab = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'shop') {
      handleExploreStore();
    } else if (tab === 'about') {
      setModalType('about');
    } else if (tab === 'contact') {
      setModalType('contact');
    }
  };

  const handleExploreStore = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectCategory = (categoryName: string) => {
    const formatted =
      categoryName.toUpperCase().includes('AI')
        ? 'AI Tools'
        : categoryName.toUpperCase().includes('TEMPLATE')
        ? 'Templates'
        : categoryName.toUpperCase().includes('PLANNER')
        ? 'Planners'
        : 'All';
    setSelectedCategoryFilter(formatted);
    handleExploreStore();
  };

  const currentSlide = SLIDES[currentSlideIndex];

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-[#E58A36] selection:text-black flex flex-col justify-between overflow-x-hidden">
      {/* Fixed subtle ambient vignette ensuring depth without violating plain black rule */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.02),rgba(255,255,255,0))]" />

      {/* Hero Section Container (Full Viewport 100dvh) */}
      <HeroSection
        currentSlide={currentSlide}
        activeSlideIndex={currentSlideIndex}
        totalSlides={SLIDES.length}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onSelectSlide={(index) => setCurrentSlideIndex(index)}
        onExploreStore={handleExploreStore}
        onSelectCategory={handleSelectCategory}
        onScrollDown={handleExploreStore}
      />

      {/* Catalog & Store Section (revealed on scroll or Explore Store click) */}
      <div ref={catalogRef}>
        <ProductCatalog
          selectedCategoryFilter={selectedCategoryFilter}
        />
      </div>

      {/* Minimal Footer */}
      <footer className="w-full max-w-[1720px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20 py-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            V
          </span>
          <span>© {new Date().getFullYear()} V Digital Products Store. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowAdminDashboard(true)}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Haider
          </button>
          <button
            onClick={() => setModalType('about')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Philosophy
          </button>
          <button
            onClick={() => setModalType('contact')}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Inquiries
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-[#E58A36] transition-colors cursor-pointer"
          >
            Back to Top ↑
          </button>
        </div>
      </footer>

      {/* Modals for About & Contact */}
      <AboutContactModal
        type={modalType}
        onClose={() => {
          setModalType(null);
          setActiveTab('home');
        }}
      />

      {/* Private Owner Sales & Analytics Dashboard */}
      <AdminSalesDashboard
        isOpen={showAdminDashboard}
        onClose={() => setShowAdminDashboard(false)}
      />
    </div>
  );
}
