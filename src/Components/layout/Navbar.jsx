import { useState, useEffect } from 'react'
import {
  FiMenu,
  FiX,
  FiShoppingBag,
  FiUser,
  FiChevronDown,
  FiSearch,
  FiArrowRight,
} from 'react-icons/fi'
import { useAuth } from '../../context/AuthContext'
import { SearchModal } from '../common/SearchModal'
import { subscribeToMegamenuCategories, DEFAULT_MEGAMENU_CATEGORIES } from '../../services/firebase'

export function Navbar({ currentPage, setCurrentPage }) {
  const { cartItems } = useAuth()
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

  // Target 6 Categories in specific order required
  const targetCategories = [
    'Business Cards',
    'Apparel',
    'Gifts',
    'Invitations',
    'Corporate Gifting',
    'Printing'
  ]

  // Get matching category object from live data or fallback defaults
  const getCategoryData = (catName) => {
    const found = liveMegamenuCats.find(
      (c) => (c.title || c.categoryQuery || '').toLowerCase() === catName.toLowerCase()
    )
    if (found) return found;

    const defaultFound = DEFAULT_MEGAMENU_CATEGORIES.find(
      (c) => (c.title || c.categoryQuery || '').toLowerCase() === catName.toLowerCase()
    )
    return defaultFound || { title: catName, categoryQuery: catName, items: [] }
  }

  return (
    <header className="w-full font-sans sticky top-0 z-50 transition-all duration-300">

      {/* Main Single White Header */}
      <div className={`bg-white transition-all duration-300 border-b ${
        isScrolled ? 'py-3 shadow-md border-slate-200' : 'py-4 border-[#E2E8F0]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 sm:gap-6">

          {/* Brand Logo */}
          <button
            onClick={() => handleLinkClick('home')}
            className="flex flex-col text-left border-none bg-transparent cursor-pointer flex-shrink-0 group"
          >
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-2xl sm:text-[26px] font-black text-[#0F172A] tracking-tight">
                Visual
              </span>
              <span className="text-2xl sm:text-[26px] font-black text-gradient tracking-tight">
                BLINK
              </span>
            </div>
            <span className="text-[8px] sm:text-[8.5px] font-black text-slate-400 tracking-[0.25em] uppercase mt-1">
              DESIGN • PRINT • BRAND
            </span>
          </button>

          {/* Navigation Links: Exactly 6 Categories with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {targetCategories.map((catName) => {
              const catData = getCategoryData(catName);
              const subItems = catData.items || [];

              return (
                <div key={catName} className="relative group">
                  <button
                    onClick={() => handleLinkClick('products', { category: catData.categoryQuery || catName }, '#catalog')}
                    className="flex items-center gap-1 py-1 text-[14px] xl:text-[14.5px] font-extrabold text-[#0F172A] group-hover:text-[#C026D3] transition-colors border-none bg-transparent cursor-pointer whitespace-nowrap"
                  >
                    <span>{catName}</span>
                    <FiChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#C026D3] transition-transform group-hover:rotate-180" />
                  </button>

                  {/* Dropdown Menu on Hover */}
                  {subItems.length > 0 && (
                    <div className="absolute top-full left-0 pt-2 w-60 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-3 space-y-1">
                        <div className="text-[10px] font-black text-[#C026D3] uppercase tracking-wider px-2 py-1 border-b border-slate-100 mb-1">
                          {catName}
                        </div>
                        {subItems.map((sub) => (
                          <button
                            key={sub.name}
                            onClick={() => handleLinkClick('products', { category: catData.categoryQuery || catName, search: sub.name }, '#catalog')}
                            className="block w-full text-left px-2.5 py-1.5 text-[13px] font-bold text-slate-700 hover:text-[#C026D3] hover:bg-pink-50/60 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
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

          {/* Right Actions: Search Icon + Get Quote Gradient Button + Cart/User */}
          <div className="flex items-center gap-3 shrink-0">

            {/* Search Trigger Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2.5 rounded-full hover:bg-slate-100 text-slate-700 hover:text-[#C026D3] transition cursor-pointer border-none bg-transparent flex items-center justify-center"
              title="Search products..."
            >
              <FiSearch className="w-5 h-5" />
            </button>

            {/* Get Quote Button */}
            <button
              onClick={() => handleLinkClick('quote')}
              className="btn-gradient inline-flex items-center gap-2 font-bold text-[13.5px] sm:text-[14px] px-5 sm:px-6 py-2.5 rounded-full shadow-sm cursor-pointer border-none group"
            >
              <span>Get Quote</span>
              <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            {/* Cart Button */}
            <button
              onClick={() => handleLinkClick('cart')}
              className="relative p-2.5 rounded-full bg-pink-50 hover:bg-pink-100 text-[#C026D3] transition cursor-pointer border border-pink-200/60 flex items-center justify-center"
              title="Cart"
            >
              <FiShoppingBag className="w-4.5 h-4.5 text-[#C026D3]" />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E11D48] text-white font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartItems.length}
                </span>
              )}
            </button>

            {/* User Account Button */}
            <button
              onClick={() => handleLinkClick('account')}
              className="hidden sm:flex p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0F172A] transition cursor-pointer border border-slate-200/80 items-center justify-center"
              title="Account"
            >
              <FiUser className="w-4.5 h-4.5 text-[#0F172A]" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#0F172A] cursor-pointer rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent"
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
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-900 bg-slate-50"
            />
          </div>

          <div className="text-[11px] font-black uppercase text-[#C026D3] tracking-wider pb-1">
            Categories
          </div>

          {targetCategories.map((catName) => {
            const catData = getCategoryData(catName);
            const subItems = catData.items || [];
            const isOpen = openMobileSubcat === catName;

            return (
              <div key={catName} className="space-y-1">
                <button
                  onClick={() => {
                    if (subItems.length > 0) {
                      setOpenMobileSubcat(isOpen ? null : catName);
                    } else {
                      handleLinkClick('products', { category: catData.categoryQuery || catName }, '#catalog');
                    }
                  }}
                  className="w-full text-left px-3 py-2 text-[14px] font-extrabold text-[#0F172A] hover:bg-slate-50 rounded-xl flex items-center justify-between border-none bg-transparent cursor-pointer"
                >
                  <span>{catName}</span>
                  {subItems.length > 0 && (
                    <FiChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {isOpen && subItems.length > 0 && (
                  <div className="pl-4 space-y-1 border-l-2 border-pink-200 ml-3 py-1">
                    {subItems.map((sub) => (
                      <button
                        key={sub.name}
                        onClick={() => handleLinkClick('products', { category: catData.categoryQuery || catName, search: sub.name }, '#catalog')}
                        className="block w-full text-left px-3 py-1.5 text-[13px] font-bold text-slate-600 hover:text-[#C026D3] border-none bg-transparent cursor-pointer"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Instant Search Command Palette Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(prod) => {
          handleLinkClick('products', { sku: prod.id }, '#specs')
        }}
        onNavigateSearch={(term) => {
          handleLinkClick('products', { search: term }, '#catalog')
        }}
      />

    </header>
  )
}
