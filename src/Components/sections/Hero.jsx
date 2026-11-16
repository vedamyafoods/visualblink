import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiShield, FiTruck, FiAward } from 'react-icons/fi'
import heroBannerImg from '../../assets/hero_banner.webp'
import { subscribeToHomepageSettings, DEFAULT_HOMEPAGE_SETTINGS } from '../../services/firebase'

export function Hero({ setCurrentPage }) {
  const [heroData, setHeroData] = useState(() => {
    try {
      const cached = localStorage.getItem('visualblink_homepage_settings')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed?.hero) return parsed.hero
      }
    } catch (e) { }
    return DEFAULT_HOMEPAGE_SETTINGS.hero
  })

  useEffect(() => {
    const unsub = subscribeToHomepageSettings((settings) => {
      if (settings?.hero) {
        setHeroData(settings.hero)
      }
    })

    const handleCustomUpdate = () => {
      try {
        const cached = localStorage.getItem('visualblink_homepage_settings')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed?.hero) setHeroData(parsed.hero)
        }
      } catch (e) { }
    }
    window.addEventListener('homepage_settings_updated', handleCustomUpdate)

    return () => {
      unsub()
      window.removeEventListener('homepage_settings_updated', handleCustomUpdate)
    }
  }, [])

  // Resolve banner image URL: Cloudinary / custom URL -> bundled webp fallback
  const dynamicBannerUrl = heroData?.bannerImage && heroData.bannerImage !== '/hero_banner.png'
    ? heroData.bannerImage
    : heroBannerImg

  const [imgSrc, setImgSrc] = useState(dynamicBannerUrl)

  useEffect(() => {
    setImgSrc(dynamicBannerUrl)
  }, [dynamicBannerUrl])

  const handleLink = (page, extraParams = {}, fragment = '') => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage(page, extraParams, fragment)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="relative bg-[#F9FAFB] text-[#0F172A] py-10 sm:py-14 lg:py-16 overflow-hidden font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">

          {/* Left Column (50% Width on Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-6 flex flex-col text-left"
          >
            {/* Eyebrow Tag */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#025afc] text-[14px] sm:text-[14px] font-bold tracking-widest uppercase">
                {heroData?.eyebrowText || 'PRINTING MEETS CREATIVITY'}
              </span>
              <span className="h-[2px] w-8 bg-gradient-to-r from-[#05defd] to-[#6a32f0] inline-block rounded-full" />
            </div>

            {/* SEO-Only H1 Heading */}
            <h1
              className="sr-only"
              style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                padding: 0,
                margin: '-1px',
                overflow: 'hidden',
                clip: 'rect(0, 0, 0, 0)',
                whiteSpace: 'nowrap',
                border: 0,
                visibility: 'hidden'
              }}
            >
              visualblink | Premium Custom Printing & Packaging Studio
            </h1>

            {/* Dominant Headline */}
            <h2 className="text-4xl sm:text-5xl lg:text-[54px] font-bold text-[#0F172A] leading-[1.06] tracking-tight mb-4">
              {heroData?.headlineLine1 || 'Ideas in Print.'} <br />
              <span className="text-gradient">
                {heroData?.headlineLine2 || 'Impact in Real Life.'}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="text-slate-600 text-[15.5px] sm:text-[16.5px] font-normal leading-relaxed mb-8 max-w-lg">
              {heroData?.description || 'Premium printing and design solutions for businesses, events and everyday needs.'}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => handleLink('products')}
                className="btn-gradient inline-flex items-center justify-center font-bold text-[14.5px] px-7 py-3.5 rounded-full shadow-md cursor-pointer border-none gap-2 group"
              >
                <span>{heroData?.primaryCtaText || 'Explore Products'}</span>
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => handleLink('quote')}
                className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-[14.5px] px-6 py-3.5 rounded-full border border-slate-300 transition-all cursor-pointer shadow-2xs"
              >
                {heroData?.secondaryCtaText || 'Get Custom Quote'}
              </button>
            </div>

            {/* 3 Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/90 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#025afc] flex items-center justify-center flex-shrink-0">
                  <FiAward className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#0F172A]">Premium Quality</div>
                  <div className="text-[14px] text-slate-500">Vibrant & Durable</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#025afc] flex items-center justify-center flex-shrink-0">
                  <FiTruck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#0F172A]">Fast Delivery</div>
                  <div className="text-[14px] text-slate-500">Pan India</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-[#025afc] flex items-center justify-center flex-shrink-0">
                  <FiShield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#0F172A]">Trusted Support</div>
                  <div className="text-[14px] text-slate-500">Always Here</div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column Studio Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-6 relative w-full flex justify-end"
          >
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xl p-2 group">
              <div className="relative h-[320px] sm:h-[380px] lg:h-[410px] w-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={imgSrc}
                  onError={() => setImgSrc(heroBannerImg)}
                  alt={heroData?.productTitle || 'Ideas in Print Visual Blink Showcase'}
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
                {heroData?.badgeText && (
                  <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full border border-white/20 shadow-md">
                    {heroData.badgeText}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}
