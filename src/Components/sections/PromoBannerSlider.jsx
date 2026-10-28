import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { subscribeToHomepageSettings } from '../../services/firebase';

export const DEFAULT_PROMO_BANNERS = [
  {
    id: 'promo_1',
    badge: "LET'S CREATE TOGETHER",
    title: 'Bring Your Ideas to Life with Premium Prints.',
    subtitle: 'High-quality prints with professional design support, custom finishes, and express dispatch.',
    image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Get Quote Now',
    ctaLink: 'quote',
    secondaryCtaText: 'Explore Products',
    secondaryCtaLink: 'products'
  },
  {
    id: 'promo_2',
    badge: 'LUXURY PACKAGING STUDIO',
    title: 'Custom Rigid Boxes & Mailer Packaging.',
    subtitle: 'Transform your unboxing experience with bespoke shapes, foil debossing, and eco-friendly cardstock.',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Shop Packaging',
    ctaLink: 'products?category=Corporate Gifting',
    secondaryCtaText: 'Custom Size Box',
    secondaryCtaLink: 'quote'
  },
  {
    id: 'promo_3',
    badge: 'VOLUME COMMERCIAL PRINTING',
    title: 'High-Impact Promotional Flyers & Leaflets.',
    subtitle: 'Vibrant full-color promotional flyers, catalogues, and brochures printed on premium art paper at direct factory rates.',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'View Product Catalog',
    ctaLink: 'products',
    secondaryCtaText: 'Bulk Enquiry',
    secondaryCtaLink: 'quote'
  }
];

export function PromoBannerSlider({ setCurrentPage }) {
  const [banners, setBanners] = useState(DEFAULT_PROMO_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(4500);
  const timerRef = useRef(null);

  // Subscribe to live homepage settings from Firestore
  useEffect(() => {
    const unsub = subscribeToHomepageSettings((settings) => {
      if (settings?.promoBannerSlider?.banners && settings.promoBannerSlider.banners.length > 0) {
        setBanners(settings.promoBannerSlider.banners);
      } else {
        setBanners(DEFAULT_PROMO_BANNERS);
      }
      if (settings?.promoBannerSlider?.autoPlayInterval) {
        setAutoPlayInterval(Number(settings.promoBannerSlider.autoPlayInterval) || 4500);
      }
    });
    return () => unsub();
  }, []);

  // Auto-play timer
  useEffect(() => {
    if (isPaused || banners.length <= 1) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(timerRef.current);
  }, [banners.length, isPaused, autoPlayInterval]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleLink = (link) => {
    if (!link) return;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    if (typeof setCurrentPage === 'function') {
      if (link.includes('category=')) {
        const cat = link.split('category=')[1];
        setCurrentPage('products', { category: decodeURIComponent(cat) }, '#catalog');
      } else if (link === 'quote' || link === 'products' || link === 'cart' || link === 'account') {
        setCurrentPage(link, {}, '#catalog');
      } else {
        setCurrentPage('products', {}, '#catalog');
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentBanner = banners[currentIndex] || banners[0] || DEFAULT_PROMO_BANNERS[0];

  return (
    <section className="py-12 sm:py-16 bg-[#F9FAFB] font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Dark Slate Container matching exactly the original "LET'S CREATE TOGETHER" dimensions */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-[#0F172A] rounded-3xl relative overflow-hidden text-white shadow-2xl min-h-[360px] sm:min-h-[400px] lg:min-h-[440px] flex items-center group select-none"
        >
          {/* Animated Slide Background */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentBanner.id || currentIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.65, ease: 'easeInOut' }}
              className="absolute inset-0"
            >
              <img
                src={currentBanner.image || currentBanner.img || DEFAULT_PROMO_BANNERS[0].image}
                alt={currentBanner.title || 'VisualBlink Promo Banner'}
                className="w-full h-full object-cover object-center"
              />
              {/* Premium Gradient Overlay for Crystal Clear Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-transparent sm:via-[#0F172A]/75 lg:to-slate-950/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-transparent to-transparent sm:hidden" />
            </motion.div>
          </AnimatePresence>

          {/* Slide Content Layer */}
          <div className="relative z-10 w-full p-8 sm:p-12 lg:p-16 max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner.id || currentIndex}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="space-y-4"
              >
                {/* Eyebrow Badge */}
                {currentBanner.badge && (
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] sm:text-[13px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/15 border border-blue-400/30 px-3 py-1 rounded-full backdrop-blur-md">
                      {currentBanner.badge}
                    </span>
                    <span className="h-[2px] w-8 bg-gradient-to-r from-[#05defd] to-[#6a32f0] inline-block rounded-full" />
                  </div>
                )}

                {/* Main Headline */}
                <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-white leading-tight tracking-tight drop-shadow-md">
                  {currentBanner.title}
                </h2>

                {/* Subtitle Description */}
                {currentBanner.subtitle && (
                  <p className="text-slate-200 text-[14.5px] sm:text-[16px] font-normal leading-relaxed max-w-xl drop-shadow-sm">
                    {currentBanner.subtitle}
                  </p>
                )}

                {/* Call-to-Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {currentBanner.ctaText && (
                    <button
                      type="button"
                      onClick={() => handleLink(currentBanner.ctaLink || 'products')}
                      className="btn-gradient inline-flex items-center gap-2 font-bold text-[14px] sm:text-[15px] px-7 py-3.5 rounded-full shadow-lg cursor-pointer border-none group/btn transition-transform hover:scale-105"
                    >
                      <span>{currentBanner.ctaText}</span>
                      <FiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  )}

                  {currentBanner.secondaryCtaText && (
                    <button
                      type="button"
                      onClick={() => handleLink(currentBanner.secondaryCtaLink || 'products')}
                      className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white font-bold text-[14px] sm:text-[15px] px-6 py-3.5 rounded-full border border-white/20 backdrop-blur-md transition-all cursor-pointer"
                    >
                      {currentBanner.secondaryCtaText}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Left Arrow Button */}
          {banners.length > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Banner"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer z-20 shadow-xl"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Right Arrow Button */}
          {banners.length > 1 && (
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Banner"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-900/60 hover:bg-slate-900/90 text-white border border-white/15 backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer z-20 shadow-xl"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Bottom Dot Indicators */}
          {banners.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-slate-950/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer border-none p-0 ${idx === currentIndex
                    ? 'w-7 bg-gradient-to-r from-[#05defd] to-[#6a32f0]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
