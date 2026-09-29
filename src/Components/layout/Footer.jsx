import { useState } from 'react'
import { FiFacebook, FiInstagram, FiLinkedin, FiYoutube, FiArrowRight } from 'react-icons/fi'

export function Footer({ setCurrentPage }) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleLink = (pageId, extraParams = {}, fragment = '') => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage(pageId, extraParams, fragment)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <footer className="bg-[#F9FAFB] text-[#0F172A] font-sans pt-14 pb-8 border-t border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top 4 Column Grid (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-slate-200">
          
          {/* Col 1: Brand Info & Socials (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col text-left">
            <button
              onClick={() => handleLink('home')}
              className="flex flex-col text-left mb-3 border-none bg-transparent cursor-pointer group w-fit"
            >
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-2xl font-black text-[#0F172A] tracking-tight">
                  Visual
                </span>
                <span className="text-2xl font-black text-gradient tracking-tight">
                  BLINK
                </span>
              </div>
              <span className="text-[8px] font-black text-slate-400 tracking-[0.25em] uppercase mt-1">
                DESIGN • PRINT • BRAND
              </span>
            </button>

            <p className="text-[13.5px] text-slate-500 font-normal leading-relaxed mb-6 max-w-sm">
              Turning your ideas into prints that people remember.
            </p>

            {/* Social Icons (Rounded Outline Buttons matching Screenshot 2) */}
            <div className="flex gap-2.5 text-slate-600">
              <a href="#" className="w-8.5 h-8.5 rounded-full border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-[#D946EF] hover:to-[#E11D48] hover:border-transparent hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <FiInstagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8.5 h-8.5 rounded-full border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-[#D946EF] hover:to-[#E11D48] hover:border-transparent hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <FiFacebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8.5 h-8.5 rounded-full border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-[#D946EF] hover:to-[#E11D48] hover:border-transparent hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <FiLinkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8.5 h-8.5 rounded-full border border-slate-200 bg-white hover:bg-gradient-to-r hover:from-[#D946EF] hover:to-[#E11D48] hover:border-transparent hover:text-white flex items-center justify-center transition-all shadow-2xs">
                <FiYoutube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2 Cols) */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-[14px] font-black text-[#0F172A] uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-[14px] font-semibold text-slate-500">
              <li><button onClick={() => handleLink('home')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Home</button></li>
              <li><button onClick={() => handleLink('products')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Products</button></li>
              <li><button onClick={() => handleLink('services')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Services</button></li>
              <li><button onClick={() => handleLink('about')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">About</button></li>
              <li><button onClick={() => handleLink('contact')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Contact</button></li>
            </ul>
          </div>

          {/* Col 3: Our Services (3 Cols) */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-[14px] font-black text-[#0F172A] uppercase tracking-wider mb-4">Our Services</h4>
            <ul className="space-y-2.5 text-[14px] font-semibold text-slate-500">
              <li><button onClick={() => handleLink('services')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Design Support</button></li>
              <li><button onClick={() => handleLink('products')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Custom Printing</button></li>
              <li><button onClick={() => handleLink('products', { category: 'Gifts' })} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Corporate Gifting</button></li>
              <li><button onClick={() => handleLink('quote')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Bulk Orders</button></li>
              <li><button onClick={() => handleLink('help')} className="hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer p-0">Pan India Delivery</button></li>
            </ul>
          </div>

          {/* Col 4: Newsletter (3 Cols - Matching Screenshot 2) */}
          <div className="lg:col-span-3 text-left">
            <h4 className="text-[14px] font-black text-[#0F172A] uppercase tracking-wider mb-2">Newsletter</h4>
            <p className="text-[14px] text-slate-500 font-normal leading-relaxed mb-4">
              Get updates on new products & offers.
            </p>

            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-slate-200/60 border border-slate-200 rounded-full py-2.5 pl-4 pr-12 text-[14px] text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#C026D3] font-medium"
                required
              />
              <button
                type="submit"
                className="absolute right-1 w-8.5 h-8.5 rounded-full btn-gradient text-white flex items-center justify-center transition-transform hover:scale-105 border-none cursor-pointer"
              >
                {subscribed ? '✓' : <FiArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Sub-footer Row (Matching Screenshot 2) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 text-[14px] font-semibold text-slate-400">
          <p>© 2026 Visual Blink. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed to Print a Better Tomorrow. <span className="text-[#E11D48]">❤️</span>
          </p>
        </div>

      </div>
    </footer>
  )
}

