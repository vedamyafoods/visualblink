import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiShoppingBag,
  FiHeart,
  FiCheckCircle,
  FiTruck,
  FiShield,
  FiUploadCloud,
  FiZap,
  FiFileText,
  FiPackage,
  FiStar,
  FiChevronDown,
  FiChevronUp,
  FiInfo,
  FiShare2,
  FiZoomIn
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_CATALOG_OPTIONS } from '../services/firebase';
import { ArtworkUploadModal } from '../Components/cart/ArtworkUploadModal';
import { subscribeToHomepageTestimonials } from '../services/firebase';
import { GoogleReviewsSection } from '../Components/sections/GoogleReviewsSection';
import { DynamicStorefrontForm } from '../Components/sections/DynamicStorefrontForm';
import { ensureCustomSections } from '../utils/customSectionsHelper';

// Helper to convert camelCase keys like 'paperStock' -> 'Paper Stock'
const formatKeyToTitle = (key) => {
  const titles = {
    paperStock: 'Paper Stock & Weight',
    finishes: 'Special Finishes',
    sides: 'Print Sides',
    corners: 'Edge Cutting',
    sizeFormat: 'Card Size & Format',
    lamination: 'Lamination Finish',
    foilAccents: 'Metallic Foil Accents',
    spotUV: 'Spot UV Texture',
    bindingStyle: 'Binding Style',
    proofService: 'Proofing Service',
    packagingStyle: 'Packaging Option',
    customAreaPricing: 'Dimensions (Height × Width in sq. ft)',
  };
  if (titles[key]) return titles[key];
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase());
};

// Helper for option subtitles matching reference screenshots (e.g. Single sided -> Front only)
const getOptionSubtitle = (val, optObj) => {
  if (optObj && typeof optObj === 'object' && optObj.subtitle) return optObj.subtitle;
  if (typeof val !== 'string') return '';
  const lower = val.toLowerCase();
  if (lower.includes('single')) return 'Front only';
  if (lower.includes('double') || lower.includes('both')) return 'Front & Back';
  if (lower.includes('standard') || lower.includes('regular') || lower.includes('square')) return 'Included';
  if (lower.includes('round')) return '+₹0.3';
  if (lower.includes('gloss')) return 'Vibrant Shine';
  if (lower.includes('matt')) return 'Smooth Non-reflective';
  if (lower.includes('velvet')) return 'Soft Touch Premium';
  return '';
};

export function ProductDetailPage({ product, onBack, onNavigateCart, allProducts = [], onSelectProduct }) {
  const { addToCart, toggleWishlist, isInWishlist } = useAuth();

  const imagesList = product.images && product.images.length > 0
    ? product.images
    : (product.image ? [product.image] : []);

  const [selectedImage, setSelectedImage] = useState(
    imagesList.length > 0 ? imagesList[0] : null
  );

  useEffect(() => {
    if (imagesList.length > 0) {
      setSelectedImage(imagesList[0]);
    }
  }, [product]);

  const [testimonials, setTestimonials] = useState([]);
  useEffect(() => {
    const unsub = subscribeToHomepageTestimonials((data) => {
      setTestimonials(data || []);
    });
    return () => unsub();
  }, []);

  const totalReviews = testimonials.length;
  const avgRating = totalReviews > 0 ? (testimonials.reduce((sum, t) => sum + (t.rating || 5), 0) / totalReviews).toFixed(1) : '5.0';



  // Minimum Order Quantity from product or default 100
  const minPieces = product.minOrderQty || 100;

  const [isCustomQty, setIsCustomQty] = useState(false);
  const [customQtyInput, setCustomQtyInput] = useState(minPieces);
  const [quantity, setQuantity] = useState(minPieces);

  // Design Notes state
  const [designNotes, setDesignNotes] = useState('');
  const [uploadedFrontFile, setUploadedFrontFile] = useState(null);
  const [uploadedBackFile, setUploadedBackFile] = useState(null);

  // Accordion Tabs Toggle
  const [openAccordion, setOpenAccordion] = useState('description');

  // Custom Height & Width Area Calculation States (ft)
  const [customHeight, setCustomHeight] = useState('2');
  const [customWidth, setCustomWidth] = useState('3');

  const parsedH = parseFloat(customHeight) || 0;
  const parsedW = parseFloat(customWidth) || 0;
  const calculatedAreaSqCm = Math.round(parsedH * parsedW * 100) / 100;

  // Effective variants merging product.variants with catalog defaults
  const effectiveVariants = React.useMemo(() => {
    const rawVariants = product.variants || {};
    const merged = { ...rawVariants };
    if (merged.customAreaPricing === undefined) {
      merged.customAreaPricing = DEFAULT_CATALOG_OPTIONS.customAreaPricing;
    }
    return merged;
  }, [product.variants]);

  // Active custom area tier matching
  const getMatchedAreaTier = () => {
    const areaTiers = effectiveVariants.customAreaPricing || [];
    if (!areaTiers || areaTiers.length === 0 || calculatedAreaSqCm <= 0) return null;
    const sorted = [...areaTiers].sort((a, b) => (a.maxArea || 0) - (b.maxArea || 0));
    const matched = sorted.find(t => calculatedAreaSqCm <= (t.maxArea || Infinity));
    return matched || sorted[sorted.length - 1];
  };

  const matchedAreaTier = getMatchedAreaTier();

  // Parse available variants dynamically from effectiveVariants
  const availableVariantEntries = Object.entries(effectiveVariants).filter(
    ([_, options]) => Array.isArray(options) && options.length > 0
  );

  // Initialize selected option values for each available variant category
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const initial = {};
    Object.entries(effectiveVariants).forEach(([key, options]) => {
      if (Array.isArray(options) && options.length > 0) {
        const first = options[0];
        initial[key] = typeof first === 'string' ? first : first.name;
      }
    });
    return initial;
  });

  useEffect(() => {
    const initial = {};
    Object.entries(effectiveVariants).forEach(([key, options]) => {
      if (Array.isArray(options) && options.length > 0) {
        const first = options[0];
        initial[key] = typeof first === 'string' ? first : first.name;
      }
    });
    setSelectedVariants(initial);
  }, [effectiveVariants]);

  const [addedSuccess, setAddedSuccess] = useState(false);
  const [isArtworkModalOpen, setIsArtworkModalOpen] = useState(false);
  const [isBuyNowFlow, setIsBuyNowFlow] = useState(false);

  // Engine States
  const [ncrCopyType, setNcrCopyType] = useState('Duplicate');
  const [ncrCopy1Color, setNcrCopy1Color] = useState('Pink');
  const [ncrCopy2Color, setNcrCopy2Color] = useState('Yellow');
  const [ncrSetsPerBook, setNcrSetsPerBook] = useState('50 Sets');
  const [ncrSerialNoToggle, setNcrSerialNoToggle] = useState(true);
  const [ncrStartSerialNo, setNcrStartSerialNo] = useState('1001');

  const [spotUvMaskFile, setSpotUvMaskFile] = useState(null);
  const [foilArtworkFile, setFoilArtworkFile] = useState(null);
  const [stickerWhiteInk, setStickerWhiteInk] = useState('With White Ink');
  const [brochureFold, setBrochureFold] = useState('Tri Fold');

  const isNcrEngine = product.enableNcrEngine || (product.category && product.category.toLowerCase().includes('bill')) || (product.category && product.category.toLowerCase().includes('book'));
  const isVisitingCardEngine = product.enableVisitingCardEngine || (product.category && product.category.toLowerCase().includes('card'));
  const isBrochureEngine = product.enableBrochureEngine || (product.category && product.category.toLowerCase().includes('brochure'));
  const isStickerEngine = product.enableStickerEngine || (product.category && product.category.toLowerCase().includes('sticker'));

  const isSaved = isInWishlist(product.id);

  // Effective Custom Sections for product (uses helper for legacy product fallback)
  const effectiveCustomSections = React.useMemo(() => {
    return ensureCustomSections(product);
  }, [product]);

  const [dynamicValues, setDynamicValues] = useState({});

  useEffect(() => {
    const initial = {};
    effectiveCustomSections.forEach(sec => {
      if (sec.enabled !== false && sec.fields) {
        sec.fields.forEach(field => {
          const fId = field.id;
          if (field.type === 'checkbox') {
            initial[fId] = Array.isArray(field.defaultValue) ? field.defaultValue : [];
          } else if (field.options && field.options.length > 0) {
            const firstOpt = field.options[0];
            initial[fId] = firstOpt.value || firstOpt.label || firstOpt;
          } else {
            initial[fId] = field.defaultValue || '';
          }
        });
      }
    });
    setDynamicValues(initial);
  }, [effectiveCustomSections]);

  const handleDynamicValueChange = (fieldId, newValue) => {
    setDynamicValues(prev => ({
      ...prev,
      [fieldId]: newValue
    }));
  };

  // Active tier lookup
  const getActiveTier = () => {
    if (!product.tieredPricing || product.tieredPricing.length === 0) return null;
    const sortedTiers = [...product.tieredPricing].sort((a, b) => b.tierMin - a.tierMin);
    const matched = sortedTiers.find(t => quantity >= t.tierMin);
    return matched || sortedTiers[sortedTiers.length - 1];
  };

  const activeTier = getActiveTier();

  const hasDynamicFields = effectiveCustomSections.some(sec => sec.enabled !== false && sec.fields && sec.fields.length > 0);

  // Price Calculation including dynamic fields & custom area
  const calculatePrice = () => {
    const validQty = Math.max(1, quantity || minPieces);
    let baseUnitPrice = product.basePrice || product.price || 5.0;
    if (activeTier) {
      baseUnitPrice = activeTier.pricePerUnit;
    }

    let totalModifiers = 0;

    if (hasDynamicFields) {
      // Sum modifiers from dynamic form fields
      effectiveCustomSections.forEach(sec => {
        if (sec.enabled !== false && sec.fields) {
          sec.fields.forEach(field => {
            const fId = field.id;
            const userVal = dynamicValues[fId];
            if (['dropdown', 'radio', 'orientation'].includes(field.type) && field.options) {
              const match = field.options.find(o => (o.value || o.label || o) === userVal);
              if (match && match.priceModifier) {
                // Modifiers are per-unit. So they add directly to totalModifiers
                totalModifiers += Number(match.priceModifier) || 0;
              }
            } else if (field.type === 'checkbox' && Array.isArray(userVal) && field.options) {
              userVal.forEach(val => {
                const match = field.options.find(o => (o.value || o.label || o) === val);
                if (match && match.priceModifier) {
                  totalModifiers += Number(match.priceModifier) || 0;
                }
              });
            }
          });
        }
      });
    } else {
      // Legacy variants sum fallback if no dynamic modifiers are configured
      Object.entries(effectiveVariants).forEach(([key, options]) => {
        if (key === 'customAreaPricing') return;
        if (Array.isArray(options) && options.length > 0) {
          const selectedVal = selectedVariants[key];
          const match = options.find(
            (opt) => (typeof opt === 'string' ? opt : opt.name) === selectedVal
          );
          if (match && typeof match === 'object' && match.priceModifier) {
            totalModifiers += Number(match.priceModifier) || 0;
          }
        }
      });
    }

    if (matchedAreaTier && calculatedAreaSqCm > 0) {
      const areaPriceVal = Number(matchedAreaTier.priceModifier !== undefined ? matchedAreaTier.priceModifier : (matchedAreaTier.price || 0)) || 0;
      totalModifiers += areaPriceVal;
    }

    const calculatedTotal = (baseUnitPrice + totalModifiers) * validQty;
    return Math.max(1, Math.round(calculatedTotal));
  };

  const totalPrice = calculatePrice();
  const unitPrice = Math.max(0.01, Math.round((totalPrice / Math.max(1, quantity)) * 100) / 100);
  const pUnit = product.unit || 'pcs';

  const handleOptionChange = (key, optionName) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [key]: optionName,
    }));
  };

  const dynamicOptionsSummaryForUI = {};
  effectiveCustomSections.forEach(sec => {
    if (sec.enabled !== false && sec.fields) {
      sec.fields.forEach(field => {
        const val = dynamicValues[field.id];
        if (val !== undefined && val !== '') {
          dynamicOptionsSummaryForUI[field.label] = Array.isArray(val) ? val.join(', ') : val;
        }
      });
    }
  });

  const displayOptions = hasDynamicFields ? dynamicOptionsSummaryForUI : selectedVariants;


  const handleAddToCart = () => {
    // Use already calculated summary
    const dynamicOptionsSummary = dynamicOptionsSummaryForUI;

    addToCart({
      id: product.id,
      name: product.title || product.name,
      qty: quantity,
      selectedOptions: { ...selectedVariants, ...dynamicOptionsSummary },
      dynamicFormValues: dynamicValues,
      paper: selectedVariants.paperStock || '',
      finish: selectedVariants.finishes || '',
      sides: selectedVariants.sides || '',
      corners: selectedVariants.corners || '',
      customHeight: parsedH > 0 ? parsedH : null,
      customWidth: parsedW > 0 ? parsedW : null,
      calculatedArea: calculatedAreaSqCm > 0 ? calculatedAreaSqCm : null,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      image: selectedImage || (imagesList.length > 0 ? imagesList[0] : null),
      artworkFiles: [
        ...(uploadedFrontFile ? [uploadedFrontFile.name] : []),
        ...(uploadedBackFile ? [uploadedBackFile.name] : [])
      ],
      artworkNotes: designNotes || ''
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (onNavigateCart) onNavigateCart();
  };

  const handleConfirmArtworkUpload = ({ artworkFiles, artworkNotes }) => {
    addToCart({
      id: product.id,
      name: product.title || product.name,
      qty: quantity,
      selectedOptions: selectedVariants,
      paper: selectedVariants.paperStock || '',
      finish: selectedVariants.finishes || '',
      sides: selectedVariants.sides || '',
      unitPrice: unitPrice,
      totalPrice: totalPrice,
      image: selectedImage || (imagesList.length > 0 ? imagesList[0] : null),
      artworkFiles: artworkFiles || [],
      artworkNotes: artworkNotes || designNotes || ''
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);

    if (isBuyNowFlow && onNavigateCart) {
      onNavigateCart();
    }
  };

  // Determine starting price badge (e.g. From ₹549.00 for 300 cards)
  const lowestQty = product.tieredPricing && product.tieredPricing.length > 0
    ? product.tieredPricing[0].tierMin
    : minPieces;
  const lowestPrice = product.tieredPricing && product.tieredPricing.length > 0
    ? Math.round(product.tieredPricing[0].tierMin * product.tieredPricing[0].pricePerUnit)
    : Math.round(minPieces * (product.basePrice || 5));

  // Resolve related products from explicit product.relatedProductIds OR fallback to same category products
  const getRelatedProducts = () => {
    if (!allProducts || allProducts.length === 0) return [];
    if (product.relatedProductIds && Array.isArray(product.relatedProductIds) && product.relatedProductIds.length > 0) {
      const explicitMatches = allProducts.filter(p => product.relatedProductIds.includes(p.id) && p.id !== product.id);
      if (explicitMatches.length > 0) return explicitMatches;
    }
    return allProducts.filter(p => (p.category === product.category) && p.id !== product.id).slice(0, 4);
  };

  const relatedProductsList = getRelatedProducts();

  return (
    <div className="bg-white font-sans min-h-screen text-slate-900 pb-20">

      {/* Top Breadcrumb Header Bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-3.5 px-4 sm:px-8 sticky top-0 z-30 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-[13.5px] font-extrabold text-slate-700 hover:text-[#EA580C] transition cursor-pointer bg-transparent border-none"
          >
            <FiArrowLeft className="w-4 h-4 text-[#EA580C]" /> Back to Products
          </button>

          <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#EA580C] font-bold">{product.category}</span>
            <span className="hidden sm:inline">/</span>
            <span className="text-slate-900 font-bold truncate max-w-[200px] hidden sm:inline">{product.title}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* LEFT COLUMN: PRODUCT IMAGES & GALLERY (5 cols) */}
          <div className="lg:col-span-5 sticky top-20 self-start space-y-4">

            {/* Stage Image Container (Matching Screenshot 1) */}
            <div className="relative bg-[#F2F4F7] rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs h-[380px] sm:h-[450px] flex items-center justify-center group">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                  <FiPackage className="w-16 h-16 text-slate-300 mb-2" />
                  <span className="text-[13px] font-bold">No Image Uploaded</span>
                </div>
              )}

              {/* Top Right Share Button */}
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: product.title, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Product link copied to clipboard!');
                  }
                }}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center text-slate-600 hover:text-slate-900 border-none cursor-pointer transition hover:scale-110"
                title="Share product"
              >
                <FiShare2 className="w-4 h-4" />
              </button>

              {/* Bottom Right Hover to Zoom Badge (Matching Screenshot 1) */}
              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
                <FiZoomIn className="w-3.5 h-3.5 text-white" />
                <span>Hover to zoom</span>
              </div>
            </div>

            {/* Thumbnail Carousel Row */}
            {imagesList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                {imagesList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${selectedImage === img
                      ? 'border-[#EA580C] ring-2 ring-[#EA580C]/20 scale-105'
                      : 'border-slate-200 opacity-80 hover:opacity-100'
                      }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges Strip below image */}
            <div className="pt-2 flex items-center justify-center gap-6 text-[12px] font-extrabold text-slate-600">
              <span className="flex items-center gap-1">
                <FiStar className="w-4 h-4 text-amber-500 fill-amber-400" /> 4.9/5 Rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiShield className="w-4 h-4 text-blue-600" /> 40+ Years Trusted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <FiTruck className="w-4 h-4 text-emerald-600" /> Fast Dispatch
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: PRODUCT CONFIGURATION & ORDER SUMMARY (7 cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* Header Information (Matching Screenshot 1) */}
            <div className="space-y-2.5">
              {/* Category Pill Tag */}
              <div>
                <span className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider text-[#EA580C] bg-[#FFF7ED] border border-[#EA580C]/40 inline-block">
                  {product.category || 'PRINTING'}
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Rating Row */}
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <span className="font-extrabold text-slate-900">{avgRating}</span>
                <span className="text-slate-500 font-medium">({totalReviews} reviews)</span>
              </div>

              {/* Price Range Sub-Header (Matching Screenshot 1) */}
              <div className="flex items-baseline gap-2 pt-1">
                <span className="text-sm font-medium text-slate-500">From</span>
                <span className="text-2xl sm:text-3xl font-black text-[#EA580C]">
                  ₹{lowestPrice.toFixed(2)}
                </span>
                <span className="text-sm font-medium text-slate-500">
                  for {lowestQty} {pUnit}
                </span>
              </div>
            </div>

            {/* DYNAMIC STOREFRONT FORM RENDERER (Matching Reference Screenshot Structure) */}
            <div className="space-y-6 pt-2 border-t border-slate-100">
              <DynamicStorefrontForm
                customSections={effectiveCustomSections}
                formValues={dynamicValues}
                onValueChange={handleDynamicValueChange}
              />

              {/* Custom Area Height & Width Pricing Section if enabled */}
              {product.enableCustomArea && (
                <div className="space-y-3 bg-[#FAFBFD] p-4.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-[14px] text-slate-900">Area Dimensions (Sq.Ft):</label>
                    {calculatedAreaSqCm > 0 && matchedAreaTier && (
                      <span className="text-[12px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-0.5 rounded-full">
                        Matched Tier: {matchedAreaTier.name || `Up to ${matchedAreaTier.maxArea} sq.ft`} (+₹{matchedAreaTier.priceModifier || matchedAreaTier.price || 0})
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1">Height (ft):</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={customHeight}
                        onChange={(e) => setCustomHeight(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-[14px] text-slate-900 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-slate-600 mb-1">Width (ft):</label>
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={customWidth}
                        onChange={(e) => setCustomWidth(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 font-bold text-[14px] text-slate-900 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                  </div>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-[13px] font-bold text-slate-700">
                    <span>Calculated Area:</span>
                    <span className="text-sm font-black text-[#EA580C]">
                      {calculatedAreaSqCm > 0 ? `${customHeight}ft × ${customWidth}ft = ${calculatedAreaSqCm} sq.ft` : 'Enter dimensions'}
                    </span>
                  </div>
                </div>
              )}

              {/* QUANTITY CARDS SELECTOR (Matching Screenshot 1) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[14px] text-slate-900 block">
                    Quantity
                  </label>
                  {activeTier && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Tier Rate: ₹{activeTier.pricePerUnit}/{pUnit === 'pcs' ? 'pc' : pUnit.replace(/s$/, '')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(product.tieredPricing && product.tieredPricing.length > 0 ? product.tieredPricing : [
                    { tierMin: product.minOrderQty || 100, pricePerUnit: product.basePrice || 5.0 }
                  ]).map((t, idx) => {
                    const isSelected = !isCustomQty && quantity === t.tierMin;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setIsCustomQty(false);
                          setQuantity(t.tierMin);
                        }}
                        className={`p-3 rounded-xl text-center border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${isSelected
                          ? 'bg-[#FFF7ED] border-[#EA580C] text-[#EA580C] shadow-3xs'
                          : 'bg-white border-slate-200 text-slate-800 hover:border-orange-300'
                          }`}
                      >
                        <span className="font-black text-[14px]">{t.tierMin.toLocaleString()} {pUnit}</span>
                        <span className={`text-[11.5px] font-medium ${isSelected ? 'text-[#EA580C]' : 'text-slate-500'}`}>
                          ₹{t.pricePerUnit.toFixed(2)}/{pUnit === 'pcs' ? 'pc' : pUnit.replace(/s$/, '')}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Quantity Option Toggle */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCustomQty(!isCustomQty)}
                    className="text-[12px] font-bold text-[#EA580C] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    {isCustomQty ? '← Select Preset Quantity Cards' : '+ Enter Custom Quantity'}
                  </button>

                  {isCustomQty && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <label htmlFor="customQtyField" className="font-bold text-[13px] text-slate-700 shrink-0">
                        Custom Quantity (pcs):
                      </label>
                      <input
                        id="customQtyField"
                        type="number"
                        min="1"
                        value={customQtyInput}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setCustomQtyInput(val);
                          setQuantity(val);
                        }}
                        className="w-32 p-2 bg-white border border-slate-300 rounded-lg font-bold text-sm text-slate-900 focus:outline-none focus:border-[#EA580C]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* UPLOAD YOUR DESIGN BOX (Matching Screenshot 2) */}
              <div className="bg-[#FAFBFD] p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <FiUploadCloud className="w-5 h-5 text-[#EA580C]" />
                  <h4 className="font-black text-[14px] text-slate-900 uppercase tracking-wide">
                    Upload Your Design
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Front Design Dropzone */}
                  <label className="border-2 border-dashed border-slate-300 hover:border-[#EA580C] bg-white rounded-2xl p-4 text-center cursor-pointer transition-colors block group">
                    <div className="w-9 h-9 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                      <FiUploadCloud className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-[13px] text-slate-900 block">
                      {uploadedFrontFile ? `Front: ${uploadedFrontFile.name}` : 'Front Design'}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium block">
                      Drop file or <span className="text-[#EA580C] underline font-bold">browse</span>
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setUploadedFrontFile(e.target.files[0])}
                    />
                  </label>

                  {/* Back Design Dropzone (if double-sided or optional) */}
                  {selectedVariants.sides?.toLowerCase().includes('double') || selectedVariants.sides?.toLowerCase().includes('both') ? (
                    <label className="border-2 border-dashed border-slate-300 hover:border-[#EA580C] bg-white rounded-2xl p-4 text-center cursor-pointer transition-colors block group">
                      <div className="w-9 h-9 rounded-full bg-orange-50 text-[#EA580C] flex items-center justify-center mx-auto mb-1.5 group-hover:scale-110 transition-transform">
                        <FiUploadCloud className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-[13px] text-slate-900 block">
                        {uploadedBackFile ? `Back: ${uploadedBackFile.name}` : 'Back Design'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium block">
                        Drop file or <span className="text-[#EA580C] underline font-bold">browse</span>
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => setUploadedBackFile(e.target.files[0])}
                      />
                    </label>
                  ) : null}
                </div>

                <p className="text-[11px] text-slate-400 font-medium text-center">
                  PDF, AI, PSD, JPG, PNG, SVG, CDR — Max 10MB
                </p>

                {/* Design Notes Textarea */}
                <textarea
                  rows={2}
                  value={designNotes}
                  onChange={(e) => setDesignNotes(e.target.value)}
                  placeholder="Design notes or special instructions..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-800 bg-white focus:outline-none focus:border-[#EA580C] resize-none"
                />
              </div>

              {/* ORDER SUMMARY DARK CARD (Matching Screenshot 2) */}
              <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-xl space-y-4">
                <h4 className="font-black text-base text-white border-b border-slate-800 pb-3">
                  Order Summary
                </h4>

                <div className="space-y-2.5 text-[13.5px]">
                  {/* Selected Options List */}
                  {Object.entries(displayOptions).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between font-medium">
                      <span className="text-slate-400">{hasDynamicFields ? key : formatKeyToTitle(key)}</span>
                      <span className="font-bold text-white text-right">{val}</span>
                    </div>
                  ))}

                  {/* Quantity Row */}
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-slate-400">Quantity</span>
                    <span className="font-bold text-white">{quantity.toLocaleString()} {pUnit}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-2">
                    {/* Unit Price Row */}
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-slate-400">Unit Price</span>
                      <span className="font-bold text-white font-mono">₹{unitPrice.toFixed(2)}/{pUnit === 'pcs' ? 'pc' : pUnit.replace(/s$/, '')}</span>
                    </div>

                    {/* Total Row */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-white text-base">Total</span>
                      <span className="font-black text-2xl text-[#EA580C]">
                        ₹{totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADD TO CART MAIN BUTTON (Matching Screenshot 2) */}
              <div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white font-black text-base uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all border-none active:scale-[0.99]"
                >
                  {addedSuccess ? (
                    <>
                      <FiCheckCircle className="w-5 h-5 text-white" /> Added to Cart!
                    </>
                  ) : (
                    <>
                      <FiShoppingBag className="w-5 h-5" /> Add to Cart — ₹{totalPrice.toFixed(2)}
                    </>
                  )}
                </button>
              </div>

              {/* MINT GREEN INFO CARD (Matching Screenshot 1) */}
              <div className="bg-[#ECFDF5] border border-emerald-200/90 rounded-2xl p-4.5 space-y-1 text-slate-800">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[14px]">
                  <FiCheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>No design ready? No problem!</span>
                </div>
                <p className="text-[12.5px] font-medium text-emerald-950/80 leading-relaxed pl-7">
                  Upload your artwork after placing the order, or request free design assistance from our experts during checkout.
                </p>
              </div>

              {/* PRODUCT SUMMARY SNIPPET NOTE (Matching Screenshot 1) */}
              <div className="text-[13px] font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                {product.summary || product.description || 'Lightweight yet sturdy standard cards. Ideal for everyday networking, event handouts, and high-volume distribution.'}
              </div>

              {/* DISPATCH & WHATSAPP SUPPORT LINES (Matching Screenshot 1) */}
              <div className="space-y-2 text-[13px] font-bold text-slate-700 pt-1">
                <div className="flex items-center gap-2">
                  <FiTruck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Dispatch: <strong className="text-slate-900">2-3 Working Days</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="text-[#25D366] font-black">💬</span>
                  <span>Need urgent delivery or custom sizes? <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-[#EA580C] hover:underline font-bold">WhatsApp us</a></span>
                </div>
              </div>

              {/* CTA ACTION BUTTONS: GET QUOTE & CALL NOW (Matching Screenshot 1) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <a
                  href="https://wa.me/919876543210?text=Hello%20Printigly,%20I%20need%20a%20quote%20for%20product%20details"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors border-none text-decoration-none"
                >
                  <FiFileText className="w-4 h-4" /> Get Quote
                </a>
                <a
                  href="tel:+919876543210"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors border-none text-decoration-none"
                >
                  <FiZap className="w-4 h-4" /> Call Now
                </a>
              </div>

            </div>

            {/* PRODUCT DETAILS ACCORDION DROPDOWN TABS */}
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden text-[14px] mt-6">
              {/* Product Description */}
              <div>
                <button
                  type="button"
                  onClick={() => setOpenAccordion(openAccordion === 'description' ? null : 'description')}
                  className="w-full p-4 text-left font-bold text-slate-900 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-slate-50 transition"
                >
                  <span className="flex items-center gap-2">
                    <FiFileText className="w-4 h-4 text-[#EA580C]" /> Product Description & Overview
                  </span>
                  {openAccordion === 'description' ? <FiChevronUp className="w-4 h-4 text-slate-400" /> : <FiChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openAccordion === 'description' && (
                  <div className="p-4 pt-0 text-slate-600 leading-relaxed text-[13.5px]">
                    <p className="font-medium">
                      {product.description || product.summary || 'High-quality custom print product crafted with premium finishing and offset litho precision.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Technical Specifications */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setOpenAccordion(openAccordion === 'specs' ? null : 'specs')}
                    className="w-full p-4 text-left font-bold text-slate-900 flex items-center justify-between cursor-pointer border-none bg-transparent hover:bg-slate-50 transition"
                  >
                    <span className="flex items-center gap-2">
                      <FiInfo className="w-4 h-4 text-[#EA580C]" /> Technical Specifications
                    </span>
                    {openAccordion === 'specs' ? <FiChevronUp className="w-4 h-4 text-slate-400" /> : <FiChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {openAccordion === 'specs' && (
                    <div className="p-4 pt-0 text-slate-600 text-[13px] grid grid-cols-2 gap-2">
                      {Object.entries(product.specs).map(([k, v]) => (
                        <div key={k} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">{k}</span>
                          <span className="font-bold text-slate-800">{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* GOOGLE REVIEWS SECTION (Matching Screenshot 2) */}
      <GoogleReviewsSection reviews={testimonials} avgRating={avgRating} totalReviews={totalReviews} />

      {/* DYNAMIC RELATED PRODUCTS SECTION (Matching Screenshot 3) */}
      {relatedProductsList.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-6">
          <div className="border-t border-slate-200 pt-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              Related products
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProductsList.map((relProd) => {
              const relImg = relProd.images?.[0] || relProd.image;
              const relPrice = relProd.basePrice || relProd.price || 299;
              return (
                <div key={relProd.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-orange-300 transition-all flex flex-col justify-between group">
                  <div>
                    <div className="h-44 bg-slate-100 relative overflow-hidden">
                      {relImg ? (
                        <img src={relImg} alt={relProd.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                          <FiPackage className="w-8 h-8 text-slate-300" />
                        </div>
                      )}
                      <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-[#EA580C] font-extrabold text-[10px] uppercase border border-orange-200">
                        {relProd.category || 'Printing'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <h4 className="font-extrabold text-sm text-slate-900 line-clamp-1 group-hover:text-[#EA580C] transition-colors">
                        {relProd.title}
                      </h4>
                      <div className="flex items-baseline gap-1 text-slate-500 text-xs font-bold">
                        <span>From</span>
                        <span className="text-base font-black text-[#EA580C]">₹{relPrice}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectProduct) {
                          onSelectProduct(relProd);
                        }
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-[#EA580C] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
                    >
                      Select options
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <ArtworkUploadModal
        isOpen={isArtworkModalOpen}
        onClose={() => setIsArtworkModalOpen(false)}
        onConfirmUpload={handleConfirmArtworkUpload}
        productTitle={product.title || product.name}
      />

    </div>
  );
}
