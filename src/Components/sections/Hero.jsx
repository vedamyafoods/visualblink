import { motion } from 'framer-motion'
import { FiArrowRight, FiShield, FiTruck, FiAward } from 'react-icons/fi'
import heroBannerImg from '../../assets/hero_banner.png'

export function Hero({ setCurrentPage }) {
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
              <span className="text-[#C026D3] text-[14px] sm:text-[14px] font-black tracking-widest uppercase">
                PRINTING MEETS CREATIVITY
              </span>
              <span className="h-[2px] w-8 bg-gradient-to-r from-[#D946EF] to-[#E11D48] inline-block rounded-full" />
            </div>

            {/* Dominant Headline (Matching Screenshot 2) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black text-[#0F172A] leading-[1.06] tracking-tight mb-4">
              Ideas in Print. <br />
              <span className="text-gradient">Impact in Real Life.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-[15.5px] sm:text-[16.5px] font-normal leading-relaxed mb-8 max-w-lg">
              Premium printing and design solutions for businesses, events and everyday needs.
            </p>

            {/* CTA Buttons (Pills matching Screenshot 2) */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                onClick={() => handleLink('products')}
                className="btn-gradient inline-flex items-center justify-center font-bold text-[14.5px] px-7 py-3.5 rounded-full shadow-md cursor-pointer border-none gap-2 group"
              >
                <span>Explore Products</span>
                <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => handleLink('quote')}
                className="inline-flex items-center justify-center bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-[14.5px] px-6 py-3.5 rounded-full border border-slate-300 transition-all cursor-pointer shadow-2xs"
              >
                Get Custom Quote
              </button>
            </div>

            {/* 3 Trust Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/90 max-w-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-50 text-[#C026D3] flex items-center justify-center flex-shrink-0">
                  <FiAward className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#0F172A]">Premium Quality</div>
                  <div className="text-[14px] text-slate-500">Vibrant & Durable</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-50 text-[#C026D3] flex items-center justify-center flex-shrink-0">
                  <FiTruck className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#0F172A]">Fast Delivery</div>
                  <div className="text-[14px] text-slate-500">Pan India</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-pink-50 text-[#C026D3] flex items-center justify-center flex-shrink-0">
                  <FiShield className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#0F172A]">Trusted Support</div>
                  <div className="text-[14px] text-slate-500">Always Here</div>
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column Studio Image (50% Width, fits perfectly inside grid without white overflow) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:col-span-6 relative w-full flex justify-end"
          >
            <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-xl p-2 group">
              <div className="relative h-[320px] sm:h-[380px] lg:h-[410px] w-full rounded-xl overflow-hidden bg-slate-100">
                <img
                  src={heroBannerImg}
                  alt="Ideas in Print Visual Blink Showcase"
                  className="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-500"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}