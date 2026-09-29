import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, 
  FiX, 
  FiArrowRight, 
  FiTrendingUp, 
  FiClock, 
  FiPackage, 
  FiChevronRight,
  FiShoppingBag,
  FiZap
} from 'react-icons/fi';
import { subscribeToProducts } from '../../services/firebase';

export function SearchModal({ isOpen, onClose, onSelectProduct, onNavigateSearch }) {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('printo_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (e) {}
  }, [isOpen]);

  // Subscribe to live Firestore products
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = subscribeToProducts((prods) => {
      setProducts(prods || []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [isOpen]);

  // Focus input automatically on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle global escape key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter live products by query
  const trimmed = query.trim().toLowerCase();
  const searchResults = trimmed
    ? products.filter((p) => {
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(trimmed);
        const categoryMatch = (p.category || '').toLowerCase().includes(trimmed);
        const descMatch = (p.description || '').toLowerCase().includes(trimmed);
        const aliasMatch = (p.searchAliases || []).some(alias => alias.toLowerCase().includes(trimmed));

        // Built-in Vernacular Alias Fallbacks
        let vernacularMatch = false;
        if (trimmed.includes('parcha') || trimmed.includes('pamplet') || trimmed.includes('pamphlet') || trimmed.includes('leaflet')) {
          if ((p.title + p.category).toLowerCase().includes('flyer') || (p.title + p.category).toLowerCase().includes('leaflet')) vernacularMatch = true;
        }
        if (trimmed.includes('rasid') || trimmed.includes('receipt') || trimmed.includes('challan') || trimmed.includes('invoice')) {
          if ((p.title + p.category).toLowerCase().includes('bill') || (p.title + p.category).toLowerCase().includes('book')) vernacularMatch = true;
        }
        if (trimmed.includes('flex') || trimmed.includes('banner') || trimmed.includes('hoarding')) {
          if ((p.title + p.category).toLowerCase().includes('banner') || (p.title + p.category).toLowerCase().includes('flex')) vernacularMatch = true;
        }
        if (trimmed.includes('visiting')) {
          if ((p.title + p.category).toLowerCase().includes('card')) vernacularMatch = true;
        }

        return titleMatch || categoryMatch || descMatch || aliasMatch || vernacularMatch;
      })
    : [];

  const saveRecentSearch = (searchTerm) => {
    try {
      const updated = [searchTerm, ...recentSearches.filter((s) => s !== searchTerm)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('printo_recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleProductClick = (prod) => {
    saveRecentSearch(prod.title || prod.name);
    onClose();
    if (onSelectProduct) {
      onSelectProduct(prod);
    } else if (onNavigateSearch) {
      onNavigateSearch(prod.title || prod.name);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (trimmed) {
      saveRecentSearch(trimmed);
      onClose();
      if (onNavigateSearch) {
        onNavigateSearch(trimmed);
      }
    }
  };

  const popularChips = [
    'Business Cards',
    'Brochures & Flyers',
    'Banners & Standees',
    'Custom Packaging',
    'Vinyl Stickers',
    'Photo Books'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-xl transition-all duration-300 animate-fadeIn">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Search Command Dialog */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 font-sans flex flex-col max-h-[80vh]">
        
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <FiSearch className="w-5 h-5 text-[#FF5A1F] shrink-0 mr-3.5" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products (e.g. Business Cards, Banners, Packaging)..."
            className="w-full bg-transparent text-sm sm:text-base font-extrabold text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 mr-2 border-none bg-transparent cursor-pointer"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2.5 py-1 rounded-xl bg-slate-200/80 hover:bg-slate-300/80 text-[14px] font-black text-slate-600 transition border-none cursor-pointer"
          >
            ESC
          </button>
        </form>

        {/* Content Body: Live Search Results OR Popular / Recent Suggestions */}
        <div className="p-5 overflow-y-auto space-y-6">
          {trimmed ? (
            /* Search Results */
            <div>
              <div className="flex items-center justify-between mb-3 text-[14px] text-slate-400 font-extrabold uppercase tracking-wider">
                <span>Matching Products ({searchResults.length})</span>
                {searchResults.length > 0 && <span className="text-[#FF5A1F]">Press Enter to view all</span>}
              </div>

              {searchResults.length > 0 ? (
                <div className="space-y-2.5">
                  {searchResults.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={() => handleProductClick(prod)}
                      className="group flex items-center gap-4 p-3 rounded-2xl bg-slate-50 hover:bg-[#FF5A1F]/10 border border-slate-100 hover:border-[#FF5A1F]/30 transition-all cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 shadow-xs">
                        <img
                          src={prod.image || (prod.images && prod.images[0]) || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=300'}
                          alt={prod.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="px-2 py-0.5 rounded-full bg-[#FF5A1F]/10 text-[#FF5A1F] text-[10px] font-black uppercase">
                            {prod.category}
                          </span>
                          <span className="text-[14px] font-bold text-slate-400">
                            Min {prod.minOrderQty || 1} pcs
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 truncate group-hover:text-[#FF5A1F] transition-colors">
                          {prod.title}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-[#FF5A1F] block">
                          ₹{prod.basePrice || prod.price || 0}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold block">Starting at</span>
                      </div>
                      <FiChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF5A1F] group-hover:translate-x-0.5 transition-all" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center text-slate-400">
                  <FiPackage className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-[14px] font-bold text-slate-600">No products found matching "{query}"</p>
                  <p className="text-[14px] text-slate-400 mt-1">Try searching for "Business Cards", "Banners", or "Brochures"</p>
                </div>
              )}
            </div>
          ) : (
            /* Popular & Recent Suggestions when search field is empty */
            <div className="space-y-6">
              {/* Popular Trending Queries */}
              <div>
                <div className="flex items-center gap-1.5 text-[14px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">
                  <FiTrendingUp className="w-3.5 h-3.5 text-[#FF5A1F]" />
                  <span>Popular Product Categories</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => {
                        setQuery(chip);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#FF5A1F]/10 text-slate-800 hover:text-[#FF5A1F] text-[14px] font-bold transition border border-slate-200/80 hover:border-[#FF5A1F]/30 cursor-pointer flex items-center gap-1.5"
                    >
                      <FiZap className="w-3 h-3 text-[#FF5A1F]" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Search History if available */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[14px] text-slate-400 font-extrabold uppercase tracking-wider mb-3">
                    <span className="flex items-center gap-1.5">
                      <FiClock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setRecentSearches([]);
                        localStorage.removeItem('printo_recent_searches');
                      }}
                      className="text-[10px] text-slate-400 hover:text-rose-600 border-none bg-transparent cursor-pointer font-bold"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {recentSearches.map((term, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="w-full px-3.5 py-2 rounded-xl hover:bg-slate-100 text-left text-[14px] font-bold text-slate-700 flex items-center justify-between transition border-none bg-transparent cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <FiSearch className="w-3.5 h-3.5 text-slate-400" />
                          <span>{term}</span>
                        </span>
                        <FiArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[14px] text-slate-400 font-bold">
          <div className="flex items-center gap-3">
            <span>Press <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">ESC</kbd> to exit</span>
          </div>
          <span>Press <kbd className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">Ctrl+K</kbd> anytime</span>
        </div>

      </div>
    </div>
  );
}
