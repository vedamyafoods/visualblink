import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export function DiscountCTA({ setCurrentPage }) {
  const handleLink = (page) => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage(page || 'products', {}, '#catalog')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-12 sm:py-16 bg-[#F9FAFB] font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dark Slate Container (Matching Screenshot 2) */}
        <div className="bg-[#0F172A] rounded-3xl p-8 sm:p-12 lg:p-14 relative overflow-hidden text-white shadow-2xl">
          
          {/* Subtle Background Radial Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#D946EF]/20 to-[#E11D48]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-400 text-[14px] font-black tracking-widest uppercase">
                  LET'S CREATE TOGETHER
                </span>
                <span className="h-[2px] w-8 bg-gradient-to-r from-[#D946EF] to-[#E11D48] inline-block rounded-full" />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white leading-tight tracking-tight mb-3">
                Bring Your Ideas to Life.
              </h2>

              <p className="text-slate-300 text-[15.5px] sm:text-[16.5px] font-normal leading-relaxed mb-8 max-w-lg">
                High-quality prints with professional design support.
              </p>

              {/* Action Pill Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={() => handleLink('quote')}
                  className="btn-gradient inline-flex items-center gap-2 font-bold text-[14.5px] px-7 py-3.5 rounded-full shadow-lg cursor-pointer border-none group"
                >
                  <span>Get Quote Now</span>
                  <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => handleLink('products')}
                  className="inline-flex items-center justify-center bg-transparent hover:bg-white/10 text-white font-bold text-[14.5px] px-6 py-3.5 rounded-full border border-slate-600 transition-all cursor-pointer"
                >
                  Explore Products
                </button>
              </div>

            </div>

            {/* Right Printed Box Mockup Showcase (5 Cols - Matching Screenshot 2) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[340px] rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/60 p-2 shadow-2xl group">
                <div className="relative h-[200px] sm:h-[220px] w-full rounded-xl overflow-hidden bg-slate-800 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=600"
                    alt="Visual Blink Printed Box Packaging"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay Watermark Badge */}
                  <div className="absolute bottom-3 right-3 text-right bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700/60">
                    <span className="block text-[10px] font-black text-white tracking-widest">Visual BLINK</span>
                    <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-wider">Print • Create • Repeat</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  )
}

