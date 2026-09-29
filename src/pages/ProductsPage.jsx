import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  FiArrowRight,
  FiCheck,
  FiFilter,
  FiUploadCloud,
  FiX,
  FiShoppingBag,
  FiStar,
  FiSliders,
  FiHeart,
  FiPlusCircle,
  FiSearch,
  FiZap,
  FiClock,
  FiTag,
  FiRotateCcw,
  FiGrid,
  FiMaximize2,
  FiFileText,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiDollarSign,
  FiLayers
} from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import { subscribeToProducts } from '../services/firebase'
import { ProductDetailPage } from './ProductDetailPage'

// Helper to normalize product categories into the 6 primary site categories
export const getCanonicalCategory = (categoryName) => {
  if (!categoryName) return 'Printing';
  const c = categoryName.toLowerCase().trim();
  if (c === 'business cards' || (c.includes('card') && !c.includes('wedding') && !c.includes('invitation') && !c.includes('id'))) return 'Business Cards';
  if (c === 'apparel' || c.includes('apparel') || c.includes('t-shirt') || c.includes('polo') || c.includes('shirt') || c.includes('hoodie')) return 'Apparel';
  if (c === 'gifts' || (c.includes('gift') && !c.includes('corporate')) || c.includes('mug') || c.includes('frame') || c.includes('lamp')) return 'Gifts';
  if (c === 'invitations' || c.includes('invitation') || c.includes('wedding') || c.includes('birthday')) return 'Invitations';
  if (c === 'corporate gifting' || c.includes('corporate') || c.includes('packaging') || c.includes('box') || c.includes('merch')) return 'Corporate Gifting';
  if (c === 'printing' || c.includes('print') || c.includes('stationery') || c.includes('banner') || c.includes('flyer') || c.includes('sticker') || c.includes('bill')) return 'Printing';
  return categoryName;
};



export function ProductsPage({ onNavigateCart, setCurrentPage }) {
  const { addToCart, toggleWishlist, isInWishlist } = useAuth()
  const prefersReducedMotion = useReducedMotion()

  const getSearchParams = () => new URLSearchParams(window.location.search);

  const [activeCategory, setActiveCategoryState] = useState(() => {
    return getSearchParams().get('category') || 'All';
  });

  const [searchTerm, setSearchTermState] = useState(() => {
    return getSearchParams().get('search') || '';
  });

  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [selectedFinish, setSelectedFinish] = useState('All');
  const [selectedTurnaround, setSelectedTurnaround] = useState('All');
  const [selectedOrientation, setSelectedOrientation] = useState('All');
  const [selectedPaperSize, setSelectedPaperSize] = useState('All');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(3000);
  const [sortBy, setSortBy] = useState('featured');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [selectedProduct, setSelectedProductState] = useState(null);

  // Real-time Products State from Firestore
  const [liveProducts, setLiveProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Subscribe to live Firestore products
  useEffect(() => {
    const unsubscribe = subscribeToProducts((prods) => {
      setLiveProducts(prods || []);
      setLoadingProducts(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen & sync state automatically with URL searchParams (popstate, urlchange & hashchange)
  useEffect(() => {
    const handleUrlSync = () => {
      const searchParams = getSearchParams();
      const cat = searchParams.get('category') || 'All';
      const q = searchParams.get('search') || '';
      const currentSku = searchParams.get('sku');

      setActiveCategoryState(cat);
      setSearchTermState(q);
      setSelectedSubcategory('All');

      const allProds = liveProducts;
      if (currentSku && allProds.length > 0) {
        const found = allProds.find(p => p.id === currentSku || p.slug === currentSku);
        if (found) setSelectedProductState(found);
      } else if (!currentSku) {
        setSelectedProductState(null);
      }
    };

    handleUrlSync();
    window.addEventListener('popstate', handleUrlSync);
    window.addEventListener('urlchange', handleUrlSync);
    window.addEventListener('hashchange', handleUrlSync);
    return () => {
      window.removeEventListener('popstate', handleUrlSync);
      window.removeEventListener('urlchange', handleUrlSync);
      window.removeEventListener('hashchange', handleUrlSync);
    };
  }, [liveProducts]);

  // Sidebar Category Selection Handler - Clears stale search queries
  const setActiveCategory = (cat) => {
    setActiveCategoryState(cat);
    setSelectedSubcategory('All');
    setSearchTermState(''); // Clear stale search term on sidebar category click!
    if (setCurrentPage) {
      setCurrentPage('products', { category: cat === 'All' ? '' : cat }, '#catalog');
    }
  };

  const clearAllFilters = () => {
    setSearchTermState('');
    setActiveCategoryState('All');
    setSelectedSubcategory('All');
    setSelectedFinish('All');
    setSelectedTurnaround('All');
    setSelectedOrientation('All');
    setSelectedPaperSize('All');
    setMinPrice(0);
    setMaxPrice(3000);
    setSortBy('featured');
    if (setCurrentPage) {
      setCurrentPage('products', {}, '#catalog');
    }
  };

  const setSelectedProduct = (prod) => {
    setSelectedProductState(prod);
    if (setCurrentPage) {
      if (prod) {
        setCurrentPage('products', { sku: prod.id, category: activeCategory !== 'All' ? activeCategory : '' }, '#specs');
      } else {
        setCurrentPage('products', { category: activeCategory !== 'All' ? activeCategory : '' }, '#catalog');
      }
    }
  };

  const categories = [
    'All',
    'Business Cards',
    'Apparel',
    'Gifts',
    'Invitations',
    'Corporate Gifting',
    'Printing'
  ];

  // Subcategories mapping by main category
  const subcategoryMap = {
    'Business Cards': ['Standard Cards', 'Spot UV Cards', 'Die Cut Cards', 'Metallic Foil Cards', 'Soft-Touch Velvet Cards', 'Luxury Thick Cards'],
    'Apparel': ['Custom T-Shirts & Polos', 'Polo T-Shirts', 'Custom T-Shirts', 'Hoodies & Sweatshirts', 'Caps & Hats', 'Tote Bags & Aprons'],
    'Gifts': ['Photo Mugs', 'Customized Keychains', 'Custom Wall Calendars', 'Water Bottles', 'Desk Accessories', 'Frames & Lamps'],
    'Invitations': ['Wedding Cards', 'Birthday Cards', 'Thank You Cards', 'Save the Date Cards', 'Luxury Foil Invitations', 'Envelope & Seal Sets'],
    'Corporate Gifting': ['Executive Gift Sets', 'Branded Pens & Notebooks', 'Custom Lanyards & Badges', 'Desk Organizers', 'Custom Packaging Boxes', 'Rigid Gift Boxes'],
    'Printing': ['Flyers & Pamphlets', 'Flex & Vinyl Banners', 'GST Bill Books (NCR)', 'Custom Stickers & Labels', 'Brochures & Folders', 'Posters & Wall Art']
  };

  const availableSubcategories = activeCategory !== 'All' && subcategoryMap[activeCategory]
    ? subcategoryMap[activeCategory]
    : Object.values(subcategoryMap).flat();

  const finishes = ['All', 'Spot UV', 'Metallic Foil', 'Soft-Touch Velvet', 'Die Cut', 'Textured Paper', 'Matte/Gloss', 'Vinyl Waterproof'];

  const pool = liveProducts;

  // Exact & Canonical Category Filtering
  const filteredProducts = pool.filter((p) => {
    const pCanonical = getCanonicalCategory(p.category);

    // Category Matching
    const matchesCategory = activeCategory === 'All' ||
      pCanonical === activeCategory ||
      (p.industries && Array.isArray(p.industries) && p.industries.some(i => i.toLowerCase() === activeCategory.toLowerCase()));

    // Subcategory Matching
    const matchesSubcategory = selectedSubcategory === 'All' ||
      (p.subcategory || '').toLowerCase() === selectedSubcategory.toLowerCase() ||
      (p.tags && Array.isArray(p.tags) && p.tags.some(t => t.toLowerCase() === selectedSubcategory.toLowerCase()));

    // Finish Matching
    const matchesFinish = selectedFinish === 'All' ||
      (p.finish || '').toLowerCase().includes(selectedFinish.toLowerCase()) ||
      (p.variants?.finishes && Array.isArray(p.variants.finishes) && p.variants.finishes.some(f => (f.name || f).toLowerCase().includes(selectedFinish.toLowerCase())));

    // Price Matching
    const pPrice = Number(p.basePrice || p.price || 0);
    const matchesPrice = pPrice >= minPrice && pPrice <= maxPrice;

    // Search Query Matching with Smart Token & Subcategory Check
    const searchTrimmed = searchTerm.trim().toLowerCase();
    let matchesSearch = !searchTrimmed;

    if (searchTrimmed) {
      const titleLower = (p.title || '').toLowerCase();
      const catP = (p.category || '').toLowerCase();
      const canonicalP = pCanonical.toLowerCase();
      const subcatP = (p.subcategory || '').toLowerCase();
      const summaryP = (p.summary || p.description || '').toLowerCase();
      const aliasesP = (p.searchAliases || []).map(a => a.toLowerCase()).join(' ');
      const tagsP = (p.tags || []).map(t => t.toLowerCase()).join(' ');

      const fullText = `${titleLower} ${catP} ${canonicalP} ${subcatP} ${summaryP} ${aliasesP} ${tagsP}`;

      if (fullText.includes(searchTrimmed)) {
        matchesSearch = true;
      } else {
        const tokens = searchTrimmed.split(/[\s&,/+]+/).filter(Boolean);
        matchesSearch = tokens.length > 0 && tokens.every(token => fullText.includes(token));
      }
    }

    return matchesCategory && matchesSubcategory && matchesFinish && matchesPrice && matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.basePrice - b.basePrice;
    if (sortBy === 'price-high') return b.basePrice - a.basePrice;
    if (sortBy === 'title-az') return a.title.localeCompare(b.title);
    return 0;
  });

  if (selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
        onNavigateCart={onNavigateCart}
        allProducts={pool}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] pb-24">

      {/* Hero Catalog Header Banner */}
      <div className="bg-gradient-to-r from-[#07152F] via-[#0B1A3A] to-[#12264F] text-white py-12 sm:py-16 px-4 sm:px-8 border-b border-slate-800 shadow-lg relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-[13px] font-bold text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F]">Shop Catalog</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Full Print & Packaging Catalog
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-medium max-w-2xl mt-2">
                Explore custom business cards, apparel, gifts, invitations, corporate swag & flex printing.
              </p>
            </div>

            {/* Catalog Search Bar */}
            <div className="relative w-full md:w-96">
              <FiSearch className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchTermState(val);
                  if (setCurrentPage) {
                    setCurrentPage('products', { category: activeCategory !== 'All' ? activeCategory : '', search: val }, '#catalog');
                  }
                }}
                placeholder="Search products, SKUs or keywords..."
                className="w-full pl-12 pr-10 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-slate-400 font-bold text-sm focus:outline-none focus:border-[#FF5A1F] focus:ring-2 focus:ring-[#FF5A1F]/30"
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTermState('');
                    if (setCurrentPage) {
                      setCurrentPage('products', { category: activeCategory !== 'All' ? activeCategory : '' }, '#catalog');
                    }
                  }}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
                >
                  <FiX className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Main Layout */}
      <div id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">

        {/* Results Bar & Active Filter Chips */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-extrabold text-[#0B1633] text-sm">
              Showing <span className="text-[#FF5A1F] font-black">{filteredProducts.length}</span> of {pool.length} SKUs
            </span>

            {/* Active Category Filter Chip */}
            {activeCategory !== 'All' && (
              <span className="px-3 py-1 rounded-full bg-[#07152F] text-white text-[12px] font-extrabold flex items-center gap-1.5 shadow-xs">
                <span>Category: {activeCategory}</span>
                <button
                  onClick={() => setActiveCategory('All')}
                  className="hover:text-rose-400 bg-transparent border-none cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {/* Active Search Term Filter Chip */}
            {searchTerm && (
              <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-[12px] font-extrabold flex items-center gap-1.5 border border-purple-200">
                <span>Keyword: "{searchTerm}"</span>
                <button
                  onClick={() => {
                    setSearchTermState('');
                    if (setCurrentPage) {
                      setCurrentPage('products', { category: activeCategory !== 'All' ? activeCategory : '' }, '#catalog');
                    }
                  }}
                  className="hover:text-purple-950 bg-transparent border-none cursor-pointer"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(activeCategory !== 'All' || searchTerm || selectedSubcategory !== 'All' || selectedFinish !== 'All') && (
              <button
                onClick={clearAllFilters}
                className="text-[12px] font-bold text-rose-600 hover:text-rose-800 underline bg-transparent border-none cursor-pointer ml-1"
              >
                Reset All
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden px-4 py-2 rounded-xl bg-slate-100 font-bold text-xs flex items-center gap-2 border border-slate-200 text-slate-800 cursor-pointer"
            >
              <FiFilter className="w-4 h-4 text-[#FF5A1F]" /> Filters
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:border-[#FF5A1F] cursor-pointer"
              >
                <option value="featured">Featured SKUs</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="title-az">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: FILTERS SIDEBAR (3 cols) */}
          <div className={`lg:col-span-3 space-y-6 ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>

            {/* Categories Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span>Categories</span>
                <span className="text-[10px] font-bold text-slate-400">{categories.length - 1}</span>
              </h3>
              <div className="space-y-1.5">
                {categories.map((cat) => {
                  const isSelected = activeCategory === cat;

                  // Calculate exact matching count
                  const catCount = cat === 'All'
                    ? pool.length
                    : pool.filter(p => getCanonicalCategory(p.category) === cat).length;

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-[13px] font-extrabold transition-all flex items-center justify-between border cursor-pointer ${isSelected
                        ? 'bg-[#FF5A1F] text-white border-[#FF5A1F] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'
                        }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategories Filter Card */}
            {availableSubcategories.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
                <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span>Subcategories</span>
                </h3>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
                  {['All', ...availableSubcategories].map((sub) => {
                    const isSelected = selectedSubcategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-bold transition border cursor-pointer ${isSelected
                          ? 'bg-[#07152F] text-white border-[#07152F]'
                          : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                          }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Filter Slider Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between border-b border-slate-100 pb-2.5">
                <span>Price Range (₹)</span>
                <span className="text-[11px] font-bold text-[#FF5A1F]">₹{minPrice} - ₹{maxPrice}+</span>
              </h3>
              <input
                type="range"
                min="0"
                max="3000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#FF5A1F] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>₹0</span>
                <span>₹3,000+</span>
              </div>
            </div>

            {/* Finishes Filter Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2.5">
                Finishing Effects
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {finishes.map((f) => {
                  const isSelected = selectedFinish === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setSelectedFinish(f)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${isSelected
                        ? 'bg-[#FF5A1F] text-white border-[#FF5A1F]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: PRODUCTS GRID (9 cols) */}
          <div className="lg:col-span-9 space-y-6">

            {loadingProducts ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
                <div className="flex justify-center mb-4">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-[#FF5A1F] rounded-full animate-spin"></div>
                </div>
                <h3 className="text-lg font-black text-slate-900">Loading Products...</h3>
                <p className="text-slate-500 text-xs font-medium">Please wait while we fetch the latest catalog.</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5A1F] flex items-center justify-center mx-auto text-2xl">
                  <FiShoppingBag />
                </div>
                <h3 className="text-lg font-black text-slate-900">No Products Listed</h3>
                <p className="text-slate-500 text-xs font-medium">
                  There are currently no products matching your active filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 rounded-2xl bg-[#07152F] text-white font-extrabold text-xs uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer border-none shadow-md"
                >
                  Reset All Filters & View Full Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const isSaved = isInWishlist(prod.id);
                  const prodImage = (prod.images && prod.images[0]) || prod.image || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800';

                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Image Stage */}
                        <div
                          onClick={() => setSelectedProduct(prod)}
                          className="h-52 bg-slate-100 relative overflow-hidden cursor-pointer"
                        >
                          <img
                            src={prodImage}
                            alt={prod.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                          />

                          {/* Price Tag Badge */}
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-[#07152F]/90 backdrop-blur-xs text-white font-black text-xs border border-white/20">
                            From ₹{prod.basePrice || prod.price}
                          </div>

                          {/* Category Tag */}
                          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#FF5A1F] font-black text-[10px] uppercase tracking-wider border border-slate-200">
                            {getCanonicalCategory(prod.category)}
                          </div>

                          {/* Wishlist Toggle Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(prod);
                            }}
                            className={`absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs shadow-md flex items-center justify-center transition border-none cursor-pointer hover:scale-110 ${isSaved ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'
                              }`}
                            title="Add to Wishlist"
                          >
                            <FiHeart className={`w-4 h-4 ${isSaved ? 'fill-rose-600 text-rose-600' : ''}`} />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className="p-5 space-y-2">
                          <h3
                            onClick={() => setSelectedProduct(prod)}
                            className="font-black text-base text-[#0B1633] line-clamp-1 group-hover:text-[#FF5A1F] transition-colors cursor-pointer"
                          >
                            {prod.title}
                          </h3>

                          <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                            {prod.summary || prod.description}
                          </p>

                          {/* Subcategory & Tag Pills */}
                          <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-bold text-slate-600">
                            {prod.subcategory && (
                              <span className="px-2 py-0.5 rounded-md bg-orange-50 text-[#FF5A1F] border border-orange-100">
                                {prod.subcategory}
                              </span>
                            )}
                            {prod.finish && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                                {prod.finish}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="p-5 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setSelectedProduct(prod)}
                          className="flex-1 py-2.5 px-3 rounded-2xl bg-[#07152F] hover:bg-[#FF5A1F] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer shadow-xs"
                        >
                          Configure & Buy <FiArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  )
}
