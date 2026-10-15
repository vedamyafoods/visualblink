import { useState, useEffect } from 'react'
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiUser,
  FiChevronDown,
  FiSearch,
  FiArrowRight,
  FiTruck,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { SearchModal } from '../common/SearchModal'
import { subscribeToMegamenuCategories, DEFAULT_MEGAMENU_CATEGORIES } from '../../services/firebase'
import { BRANDING } from '../../config/branding'
import { openWhatsApp } from '../../utils/whatsapp'
const createSlug = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function Navbar({ currentPage, setCurrentPage }) {
  const { cartItems, currentUser, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [liveMegamenuCats, setLiveMegamenuCats] = useState(DEFAULT_MEGAMENU_CATEGORIES)
  const [openMobileSubcat, setOpenMobileSubcat] = useState(null)

  useEffect(() => {
    const unsubscribe = subscribeToMegamenuCategories((cats) => {
      if (cats && Array.isArray(cats) && cats.length > 0) {
        setLiveMegamenuCats(cats)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLinkClick = (pageId, extraParams = {}, fragment = '') => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage(pageId, extraParams, fragment)
    }
    setMobileMenuOpen(false)
  }



  return (
    <header className="w-full max-w-full font-sans sticky top-0 z-50 transition-all duration-300">

      {/* Main Single White Header */}
      <div className={`bg-white transition-all duration-300 border-b ${isScrolled ? ' shadow-md border-slate-200' : 'border-[#E2E8F0]'
        }`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-2.5 sm:gap-6 w-full">

          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex items-center text-left border-none bg-transparent cursor-pointer flex-shrink-0 group py-0.5"
          >
            <img src={BRANDING.logoUrl} alt={BRANDING.logoAlt} className="h-12 sm:h-16 lg:h-18 w-auto object-contain transition-transform group-hover:scale-105" />
          </button>

          {/* Navigation Links: Dynamic Categories with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {liveMegamenuCats.map((catData, idx) => {
              const catName = catData.title;
              const subItems = catData.items || [];

              return (
                <div key={`${catData.id || idx}`} className="relative group">
                  <button
                    onClick={() => handleLinkClick('products', { category: catData.categoryQuery || catName }, '#catalog')}
                    className="flex items-center gap-1 py-1 text-[14px] xl:text-[14.5px] font-bold text-[#0F172A] group-hover:text-[#025afc] transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap"
                  >
                    <span>{catName}</span>
                    {subItems.length > 0 && <FiChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#025afc] transition-transform group-hover:rotate-180" />}
                  </button>

                  {/* Dropdown Menu on Hover */}
                  {subItems.length > 0 && (
                    <div className="absolute top-full left-0 pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-1">
                        <div className="text-[10px] font-bold text-[#025afc] uppercase tracking-wider px-2 py-1 border-b border-slate-100 mb-1">
                          {catName}
                        </div>
                        {subItems.map((sub, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleLinkClick('products', { category: catData.categoryQuery || catName, subcategory: createSlug(sub.name) }, '#catalog')}
                            className="block w-full text-left px-2.5 py-1.5 text-[13px] font-bold text-slate-700 hover:text-[#025afc] hover:bg-blue-50/60 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
                          >
                            {sub.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Actions: Search Icon + Get Quote Button + Cart/User */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">

            {/* Search Trigger Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 sm:p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-[#025afc] transition cursor-pointer border-none bg-transparent flex items-center justify-center shrink-0"
              title="Search products..."
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* WhatsApp Get Quote Button: Icon only on mobile, Full pill on desktop */}
            <button
              onClick={() => openWhatsApp('Hello, I need help from a designer.')}
              className="bg-[#25D366] hover:bg-[#1DA851] text-white inline-flex items-center justify-center gap-2 font-bold text-[13.5px] sm:text-[14px] p-2.5 sm:px-5 sm:py-2.5 rounded-full shadow-md cursor-pointer border-none group transition-all hover:scale-105 hover:-translate-y-0.5 shrink-0"
              style={{ animation: 'bounce-subtle 4s infinite' }}
              title="Need a Designer? Chat on WhatsApp"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-4 sm:h-4 shrink-0" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51h-.573c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="hidden sm:inline whitespace-nowrap">Need a Designer?</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleLinkClick('cart')}
              className="relative p-2.5 rounded-full bg-blue-50 hover:bg-pink-100 text-[#025afc] transition cursor-pointer border border-pink-200/60 flex items-center justify-center shrink-0"
              title="Cart"
            >
              <FiShoppingBag className="w-4.5 h-4.5 text-[#025afc]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#6a32f0] text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* User Account Button */}
            <button
              onClick={() => handleLinkClick('account')}
              className="hidden sm:flex p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] transition cursor-pointer border border-slate-200/80 items-center justify-center shrink-0"
              title="Account"
            >
              <FiUser className="w-4.5 h-4.5 text-[#0F172A]" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#0F172A] cursor-pointer rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 py-4 space-y-2 z-40 max-h-[80vh] overflow-y-auto">
          <div
            onClick={() => {
              setMobileMenuOpen(false)
              setIsSearchOpen(true)
            }}
            className="relative mb-3 cursor-pointer"
          >
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              readOnly
              placeholder="Search products..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-900 bg-slate-50 cursor-pointer"
            />
          </div>

          <div className="text-[11px] font-bold uppercase text-[#025afc] tracking-wider pb-1">
            Categories
          </div>

          {liveMegamenuCats.map((catData, idx) => {
            const catName = catData.title;
            const subItems = catData.items || [];
            const isOpen = openMobileSubcat === catName;

            return (
              <div key={`${catData.id || idx}`} className="space-y-1">
                <button
                  onClick={() => {
                    if (subItems.length > 0) {
                      setOpenMobileSubcat(isOpen ? null : catName);
                    } else {
                      handleLinkClick('products', { category: catData.categoryQuery || catName }, '#catalog');
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-[14px] font-bold text-[#0F172A] hover:bg-slate-50 rounded-xl flex items-center justify-between border-none bg-transparent cursor-pointer"
                >
                  <span>{catName}</span>
                  {subItems.length > 0 && (
                    <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {isOpen && subItems.length > 0 && (
                  <div className="pl-4 space-y-1 border-l-2 border-pink-200 ml-3 py-1">
                    {subItems.map((sub, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleLinkClick('products', { category: catData.categoryQuery || catName, subcategory: createSlug(sub.name) }, '#catalog')}
                        className="block w-full text-left px-3 py-1.5 text-[13px] font-bold text-slate-600 hover:text-[#025afc] border-none bg-transparent cursor-pointer"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Quick Tracking Action */}
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleLinkClick('track')}
              className="w-full text-left px-3 py-2.5 text-[14px] font-bold text-slate-800 hover:text-[#025afc] hover:bg-blue-50/60 rounded-xl flex items-center justify-between border border-slate-200/80 bg-slate-50/50 cursor-pointer transition"
            >
              <span className="flex items-center gap-2.5">
                <FiTruck className="w-4 h-4 text-[#025afc]" />
                <span>Track Order</span>
              </span>
              <span className="text-[11px] font-bold text-[#025afc] bg-blue-100/70 px-2 py-0.5 rounded-full">
                Live Status
              </span>
            </button>
          </div>

          {/* Bottom Auth Buttons in Mobile Drawer */}
          <div className="pt-3 mt-2 border-t border-slate-100">
            {currentUser ? (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">
                  Account
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleLinkClick('account')}
                    className="py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-[#025afc] rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border border-blue-200/60 cursor-pointer transition active:scale-95"
                  >
                    <FiUser className="w-4 h-4" />
                    <span>My Account</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      setMobileMenuOpen(false);
                    }}
                    className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 border border-rose-200/60 cursor-pointer transition active:scale-95"
                  >
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">
                  Account
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleLinkClick('login')}
                    className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-2 border border-slate-200 cursor-pointer transition active:scale-95 shadow-xs"
                  >
                    <FiUser className="w-4 h-4 text-slate-600" />
                    <span>Login</span>
                  </button>
                  <button
                    onClick={() => handleLinkClick('signup')}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-[#025afc] to-[#6a32f0] hover:opacity-95 text-white rounded-xl font-bold text-[13.5px] flex items-center justify-center gap-2 border-none shadow-md shadow-blue-500/20 cursor-pointer transition active:scale-95"
                  >
                    <FiArrowRight className="w-4 h-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Instant Search Command Palette Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(prod) => {
          const prodSlug = prod.slug || (prod.title || prod.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || prod.id;
          handleLinkClick('products', { slug: prodSlug }, '#specs')
        }}
        onNavigateSearch={(term) => {
          handleLinkClick('products', { search: term }, '#catalog')
        }}
      />

    </header>
  )
}
