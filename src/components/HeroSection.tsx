import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SlideData } from '../types';
import { useFrameScrubber } from '../hooks/useFrameScrubber';
import { useFramePreloader } from '../hooks/useFramePreloader';
import { CharacterCanvas } from './CharacterCanvas';
import { Navbar } from './Navbar';

interface HeroSectionProps {
  currentSlide: SlideData;
  activeSlideIndex: number;
  totalSlides: number;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onSelectSlide: (index: number) => void;
  onExploreStore: () => void;
  onSelectCategory?: (category: string) => void;
  onScrollDown: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentSlide,
  activeSlideIndex,
  totalSlides,
  activeTab,
  onSelectTab,
  onSelectSlide,
  onExploreStore,
  onSelectCategory,
  onScrollDown,
}) => {
  const heroRef = useRef<HTMLElement>(null);
  const { isLoaded, progress, frames } = useFramePreloader();
  const { currentFrame } = useFrameScrubber(heroRef);

  return (
    <section
      ref={heroRef}
      className="relative w-full h-[100dvh] min-h-[660px] sm:min-h-[720px] flex flex-col justify-between select-none overflow-hidden bg-black"
    >
      {/* ─── 1. FULL VIEWPORT BACKGROUND CANVAS LAYER (0 to 100dvh cover) ─── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {isLoaded ? (
          <div className="relative w-full h-full">
            {/* Character Canvas — covers the entire hero viewport across ALL devices */}
            <CharacterCanvas
              frames={frames}
              currentFrame={currentFrame}
              className="w-full h-full"
            />
            
            {/* Top gradient for Navbar readability */}
            <div className="absolute top-0 left-0 right-0 h-[22%] lg:h-[28%] bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none z-10" />
            
            {/* Bottom gradient — taller on mobile so text is readable without a box */}
            <div className="lg:hidden absolute bottom-0 left-0 right-0 h-[65%] sm:h-[55%] pointer-events-none z-10"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 25%, rgba(0,0,0,0.5) 55%, rgba(0,0,0,0.1) 80%, transparent 100%)' }}
            />
            {/* Desktop bottom gradient — subtle blend */}
            <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-[22%] bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

            {/* Desktop Left gradient for text legibility */}
            <div className="hidden lg:block absolute top-0 bottom-0 left-0 w-[42%] bg-gradient-to-r from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

            {/* Desktop Right gradient */}
            <div className="hidden lg:block absolute top-0 bottom-0 right-0 w-[22%] bg-gradient-to-l from-black/60 to-transparent pointer-events-none z-10" />
          </div>
        ) : (
          /* Loading State */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 z-20">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-2 border-[#E58A36]/20" />
              <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r="30"
                  fill="none"
                  stroke="#E58A36"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 60}`}
                  strokeDashoffset={`${Math.PI * 60 * (1 - progress)}`}
                  style={{ transition: 'stroke-dashoffset 0.3s ease' }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-[#E58A36] tracking-wider">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <p className="text-[11px] tracking-[0.25em] uppercase text-neutral-500 font-medium">
              Loading 3D Experience
            </p>
          </div>
        )}
      </div>

      {/* ─── 2. TOP NAVBAR LAYER (Floating over background canvas) ─── */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        onOpenStore={onExploreStore}
      />

      {/* ─── 3. HERO CONTENT LAYER (Responsive grid & Glass layout) ─── */}
      <div className="relative z-20 max-w-[1720px] w-full mx-auto flex-1 flex flex-col justify-end lg:justify-between px-4 sm:px-8 md:px-14 lg:px-20 xl:px-24 pt-2 sm:pt-4 pb-4 sm:pb-6">
        
        {/* Mobile spacer — pushes content to bottom so character is visible on top */}
        <div className="flex-1 lg:hidden min-h-[35%]" aria-hidden="true" />
        
        {/* Main Content Area */}
        <div className="w-full lg:my-auto py-2 grid grid-cols-1 lg:grid-cols-12 items-end lg:items-center gap-4 sm:gap-6 lg:gap-8">
          
          {/* ── LEFT COLUMN (Headline, Description, CTA) ── */}
          <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-end lg:justify-center">
            {/* Text sits directly on the background — no box/card wrapper */}
            <div className="max-w-xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Kicker Tagline */}
                  <p className="text-[10px] sm:text-[11px] md:text-[12px] font-semibold tracking-[0.24em] text-[#E58A36] uppercase mb-2.5 sm:mb-4">
                    {currentSlide.kicker}
                  </p>

                  {/* Main Responsive Headline */}
                  <h1
                    className="text-[28px] sm:text-[46px] md:text-[56px] lg:text-[68px] xl:text-[78px] 2xl:text-[84px] font-extrabold tracking-[-0.035em] leading-[1.02] sm:leading-[0.98] text-white"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    <span className="block">{currentSlide.titleLine1}</span>
                    <span className="block">{currentSlide.titleLine2}</span>
                    <span className="block text-[#F4A143]">{currentSlide.highlightWord}</span>
                  </h1>

                  {/* Description — hidden on very small screens to save space, visible from sm up */}
                  <p className="hidden sm:block mt-3 sm:mt-5 md:mt-6 text-neutral-300 lg:text-neutral-400 text-[12.5px] sm:text-[14px] md:text-[15px] font-normal leading-[1.6] max-w-xs sm:max-w-md">
                    {currentSlide.description}
                  </p>

                </motion.div>
              </AnimatePresence>

              {/* Primary CTA Button */}
              <div className="mt-3 sm:mt-7 md:mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={onExploreStore}
                  className="group inline-flex items-center gap-2.5 bg-[#F79A39] hover:bg-[#ffaa4c] active:bg-[#e0892c] text-black font-semibold text-[12.5px] sm:text-[13.5px] px-5 sm:px-7 py-2.5 sm:py-3 rounded-full transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_22px_rgba(247,154,57,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-[#F79A39] cursor-pointer"
                  aria-label="Explore Store products"
                >
                  <span className="tracking-wide">Explore Store</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 stroke-[2.2]" />
                </button>
              </div>

              {/* Mobile Category Pill Chips */}
              <div className="lg:hidden mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                {currentSlide.categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory && onSelectCategory(cat)}
                    className="text-[10.5px] font-semibold tracking-wider text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full border border-white/10 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── CENTER GAP FOR CHARACTER VISIBILITY ON DESKTOP ── */}
          <div className="hidden lg:block lg:col-span-1 xl:col-span-2" aria-hidden="true" />

          {/* ── RIGHT COLUMN (Category list & Microcopy on Desktop) ── */}
          <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 flex-col justify-center items-start lg:pl-4 xl:pl-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                className="relative pl-4 border-l-[2px] border-[#E58A36]"
              >
                {/* Category Links with Slashes */}
                <div className="flex flex-wrap items-center gap-x-2 text-[11.5px] font-semibold tracking-[0.15em] text-white">
                  {currentSlide.categories.map((cat, idx) => (
                    <React.Fragment key={cat}>
                      <button
                        onClick={() => onSelectCategory && onSelectCategory(cat)}
                        className="hover:text-[#E58A36] transition-colors focus:outline-none focus-visible:underline cursor-pointer"
                      >
                        {cat}
                      </button>
                      {idx < currentSlide.categories.length - 1 && (
                        <span className="text-neutral-500 font-normal select-none" aria-hidden="true">
                          /
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Explanatory Micro-Copy */}
                <div className="mt-3 text-[12.5px] text-neutral-400 font-normal leading-[1.5] space-y-0.5">
                  <p>{currentSlide.subtext1}</p>
                  <p>{currentSlide.subtext2}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── 4. BOTTOM BAR CONTROLS (Slide Pagination & Scroll Down) ── */}
        <div className="w-full flex items-end justify-between pt-3 sm:pt-6 mt-auto relative z-30">
          {/* Bottom Left: Slide Indicator */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 text-[11px] sm:text-[12.5px] font-mono tracking-wider">
            <span className="text-white font-medium select-none">
              {String(activeSlideIndex + 1).padStart(2, '0')}
            </span>

            <div
              className="flex items-center gap-1.5 cursor-pointer py-1"
              onClick={() => onSelectSlide((activeSlideIndex + 1) % totalSlides)}
              title="Click to next slide"
            >
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSlide(idx);
                  }}
                  className="h-[1.5px] transition-all duration-300 focus:outline-none cursor-pointer"
                  style={{
                    width: idx === activeSlideIndex ? '24px' : '12px',
                    backgroundColor: idx === activeSlideIndex ? '#E58A36' : '#525252',
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <span className="text-neutral-500 font-medium select-none">
              {String(totalSlides).padStart(2, '0')}
            </span>
          </div>

          {/* Bottom Right: Scroll Down Indicator */}
          <button
            onClick={onScrollDown}
            className="group flex flex-col items-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#E58A36] p-1 rounded transition-opacity hover:opacity-100 opacity-80 cursor-pointer"
            aria-label="Scroll down to explore products"
          >
            <div className="w-[14px] sm:w-[16px] h-[22px] sm:h-[26px] rounded-full border-[1.5px] border-neutral-400/80 group-hover:border-[#E58A36] flex items-start justify-center p-1 transition-colors duration-300">
              <motion.div
                animate={{
                  y: [0, 5, 0],
                  opacity: [1, 0.4, 1],
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-[2.5px] sm:w-[3px] h-[3.5px] sm:h-[4px] rounded-full bg-[#E58A36]"
              />
            </div>

            <span className="mt-1 text-[9.5px] sm:text-[10.5px] font-normal tracking-[0.14em] text-neutral-400 uppercase group-hover:text-white transition-colors duration-200 select-none">
              Scroll Down
            </span>

            <div className="w-[1px] h-4 sm:h-6 bg-neutral-700 group-hover:bg-[#E58A36]/60 transition-colors duration-300 mt-1 sm:mt-2" />
          </button>
        </div>
      </div>

    </section>
  );
};
