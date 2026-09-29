import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit3,
  Trash2,
  Upload,
  CheckCircle2,
  Search,
  Grid,
  Layers,
  Sparkles,
  DollarSign,
  FolderPlus,
  Zap
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { DEFAULT_CATALOG_OPTIONS, subscribeToHomepageCategories } from '../../../services/firebase';

// Sub-Section Components
import { FormSectionCustomizerToolbar } from './sections/FormSectionCustomizerToolbar';
import { BasicDetailsSection } from './sections/BasicDetailsSection';
import { OrientationSection } from './sections/OrientationSection';
import { PaperSizesSection } from './sections/PaperSizesSection';
import { TechSpecsSection } from './sections/TechSpecsSection';
import { NcrEngineSection } from './sections/NcrEngineSection';
import { VisitingCardEngineSection } from './sections/VisitingCardEngineSection';
import { BrochureEngineSection } from './sections/BrochureEngineSection';
import { StickerEngineSection } from './sections/StickerEngineSection';
import { AreaCalcEngineSection } from './sections/AreaCalcEngineSection';
import { TieredPricingSection } from './sections/TieredPricingSection';
import { DynamicFormBuilder } from './sections/DynamicFormBuilder';
import { ensureCustomSections, PRESET_CUSTOM_SECTIONS } from '../../../utils/customSectionsHelper';

// ============================================================================
// Top-Level Component: VariantSectionCard
// Defined OUTSIDE ProductCatalogManager to prevent DOM unmounting & scroll resets
// ============================================================================
const VariantSectionCard = React.memo(({
  title,
  groupKey,
  items,
  onUpdateItems,
  onRestoreDefaults,
  defaultItems
}) => {
  const [newOptName, setNewOptName] = useState('');
  const [newOptPrice, setNewOptPrice] = useState('');
  const [newMaxArea, setNewMaxArea] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const isAreaSection = groupKey === 'customAreaPricing';
  const activeItems = items || [];

  const handleAddCustom = (e) => {
    if (e) e.preventDefault();
    if (!newOptName.trim()) return;
    const priceVal = parseFloat(newOptPrice) || 0;
    const areaVal = parseFloat(newMaxArea) || 0;
    const newObj = {
      name: newOptName.trim(),
      priceModifier: priceVal,
      price: priceVal,
      ...(isAreaSection || areaVal > 0 ? { maxArea: areaVal } : {})
    };

    const updatedList = [...activeItems, newObj];
    onUpdateItems(groupKey, updatedList);

    setNewOptName('');
    setNewOptPrice('');
    setNewMaxArea('');
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const handleRemoveAllOptions = () => {
    if (window.confirm(`Are you sure you want to remove ALL options from "${title}"?`)) {
      onUpdateItems(groupKey, []);
    }
  };

  const handleRemoveSingleOption = (idx) => {
    const updated = activeItems.filter((_, i) => i !== idx);
    onUpdateItems(groupKey, updated);
  };

  const handleItemChange = (idx, field, value) => {
    const updated = activeItems.map((item, i) => {
      if (i === idx) {
        const newItem = { ...item, [field]: value };
        if (field === 'priceModifier') newItem.price = value;
        return newItem;
      }
      return item;
    });
    onUpdateItems(groupKey, updated);
  };

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-3xs space-y-3 hover:border-blue-300 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
        <div className="flex items-center gap-2">
          <h4 className="font-extrabold text-slate-900 text-[13.5px] uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
            {title}
          </h4>
          <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
            {activeItems.length} active
          </span>
        </div>

        {activeItems.length > 0 ? (
          <button
            type="button"
            onClick={handleRemoveAllOptions}
            className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[10.5px] font-black flex items-center gap-1 transition-colors cursor-pointer border border-red-200/80"
            title="Remove all options in this category"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" /> Clear All
          </button>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 italic">No options</span>
        )}
      </div>

      {/* Active Items List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {activeItems.length === 0 ? (
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-800 text-[13px] font-medium flex items-center justify-between">
            <span>⚠️ Section cleared. Storefront customers will see no dropdown for this option.</span>
            {defaultItems && defaultItems.length > 0 && (
              <button
                type="button"
                onClick={() => onRestoreDefaults(groupKey)}
                className="text-[10.5px] font-bold text-amber-900 underline hover:text-amber-950 border-none bg-transparent cursor-pointer ml-2 shrink-0"
              >
                Restore Defaults
              </button>
            )}
          </div>
        ) : (
          activeItems.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50/60 p-1.5 rounded-xl border border-slate-100 hover:border-slate-200 transition">
              <input
                type="text"
                value={opt.name || ''}
                onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                placeholder="Option Name"
                className="flex-1 min-w-0 p-2 rounded-lg border border-slate-200 font-bold text-slate-800 text-[13px] focus:outline-none focus:border-blue-500 bg-white"
              />
              {isAreaSection && (
                <div className="relative w-24 shrink-0">
                  <input
                    type="number"
                    step="0.01"
                    value={opt.maxArea !== undefined ? opt.maxArea : ''}
                    onChange={(e) => handleItemChange(idx, 'maxArea', parseFloat(e.target.value) || 0)}
                    placeholder="Max sq.ft"
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 font-bold text-slate-800 text-[13px] focus:outline-none focus:border-blue-500 bg-white"
                    title="Max Area limit in square feet (sq.ft)"
                  />
                </div>
              )}
              <div className="relative w-22 shrink-0">
                <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={opt.priceModifier !== undefined ? opt.priceModifier : (opt.price || 0)}
                  onChange={(e) => handleItemChange(idx, 'priceModifier', parseFloat(e.target.value) || 0)}
                  className="w-full pl-5 pr-2 py-2 rounded-lg border border-slate-200 font-bold text-slate-800 text-[13px] focus:outline-none focus:border-blue-500 bg-white"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveSingleOption(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer transition-colors shrink-0"
                title="Delete Option"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}

        {/* Add New Custom Option Form */}
        <div className="pt-2 border-t border-dashed border-blue-200 bg-blue-50/40 p-2.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-blue-600" /> Add Custom Option
            </span>
            {showSuccess && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 animate-in fade-in">
                ✓ Added to product!
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newOptName}
              onChange={(e) => setNewOptName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustom(e);
                }
              }}
              placeholder={isAreaSection ? "e.g. Up to 5 sq.ft" : "Option Name"}
              className="flex-1 min-w-0 p-2 rounded-lg border border-blue-300 font-bold text-[13px] focus:outline-none focus:border-blue-600 bg-white"
            />
            {isAreaSection && (
              <input
                type="number"
                step="0.01"
                value={newMaxArea}
                onChange={(e) => setNewMaxArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                placeholder="Max sq.ft"
                className="w-22 p-2 rounded-lg border border-blue-300 font-bold text-[13px] focus:outline-none focus:border-blue-600 bg-white"
                title="Max Area limit in sq. feet"
              />
            )}
            <div className="relative w-20 shrink-0">
              <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">₹</span>
              <input
                type="number"
                step="0.5"
                value={newOptPrice}
                onChange={(e) => setNewOptPrice(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustom(e);
                  }
                }}
                placeholder="0"
                className="w-full pl-5 pr-2 py-2 rounded-lg border border-blue-300 font-bold text-[13px] focus:outline-none focus:border-blue-600 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[12.5px] cursor-pointer border-none shrink-0 shadow-3xs transition-transform active:scale-95"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// Main Component: ProductCatalogManager
// ============================================================================
export const ProductCatalogManager = () => {
  const {
    products,
    saveProduct,
    removeProduct,
    categories,
    deleteCategory,
    catalogOptions,
    updateCatalogOptions,
    megamenuCategories,
    updateMegamenuCategories,
    setActiveTab
  } = useAdmin();

  const [editingProduct, setEditingProduct] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [homepageCats, setHomepageCats] = useState([]);

  React.useEffect(() => {
    const unsub = subscribeToHomepageCategories((data) => {
      setHomepageCats(data && data.length > 0 ? data : [
        { id: 'cat_1', title: 'Business Cards', query: 'business-cards' },
        { id: 'cat_2', title: 'Brochures & Flyers', query: 'brochures' }
      ]);
    });
    return () => unsub();
  }, []);

  // Category & Subcategory Quick-Add States
  const [isCategorySidebarOpen, setIsCategorySidebarOpen] = useState(false);
  const [showInlineCatInput, setShowInlineCatInput] = useState(false);
  const [inlineCatInput, setInlineCatInput] = useState('');
  const [showInlineSubcatInput, setShowInlineSubcatInput] = useState(false);
  const [inlineSubcatInput, setInlineSubcatInput] = useState('');
  const [formActiveTab, setFormActiveTab] = useState('general'); // 'general', 'tiered', 'variants'
  const [variantFilterCategory, setVariantFilterCategory] = useState('all'); // 'all', 'paper', 'sizing', 'enhancements', 'binding'

  // Dynamic Custom Tech Spec Row state
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  const filteredProducts = products.filter(prod => {
    const matchesSearch = (prod.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod.summary || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || prod.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleDeleteProduct = (productId, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from the catalog? This action cannot be undone.`)) {
      removeProduct(productId);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Business Cards',
    basePrice: 5.0,
    minOrderQty: 100,
    summary: '',
    description: '',
    orientation: 'horizontal',
    paperSizes: [],
    specs: {
      paperGsm: '350 GSM',
      dimensions: '91mm x 53mm',
      printTech: 'Offset Litho',
      turnaround: '24-48 Hours'
    },
    images: [],
    variants: catalogOptions || {},
    tieredPricing: [],
    seo: {
      metaTitle: '',
      metaDescription: '',
      indexable: true
    }
  });

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormActiveTab('general');
    setFormData({
      title: '',
      slug: '',
      category: categories[0] || 'Business Cards',
      basePrice: 5.0,
      minOrderQty: 100,
      summary: '',
      description: '',
      orientation: 'horizontal',
      paperSizes: ['A4'],
      enableOrientation: true,
      enablePaperSizes: true,
      enableTechSpecs: true,
      enableTieredPricing: true,
      enableCustomArea: false,
      enableNcrEngine: false,
      enableVisitingCardEngine: false,
      enableBrochureEngine: false,
      enableStickerEngine: false,
      searchAliases: ['stationery', 'custom print'],
      relatedProductIds: [],
      customSections: PRESET_CUSTOM_SECTIONS.businessCard,
      specs: {
        paperGsm: '350 GSM',
        dimensions: '91mm x 53mm',
        printTech: 'Offset Litho',
        turnaround: '24-48 Hours'
      },
      images: [],
      variants: {
        paperStock: catalogOptions?.paperStock ?? DEFAULT_CATALOG_OPTIONS.paperStock,
        finishes: catalogOptions?.finishes ?? DEFAULT_CATALOG_OPTIONS.finishes,
        sides: catalogOptions?.sides ?? DEFAULT_CATALOG_OPTIONS.sides,
        corners: catalogOptions?.corners ?? DEFAULT_CATALOG_OPTIONS.corners,
        lamination: catalogOptions?.lamination ?? DEFAULT_CATALOG_OPTIONS.lamination,
        sizeFormat: catalogOptions?.sizeFormat ?? DEFAULT_CATALOG_OPTIONS.sizeFormat,
        foilAccents: catalogOptions?.foilAccents ?? DEFAULT_CATALOG_OPTIONS.foilAccents,
        spotUV: catalogOptions?.spotUV ?? DEFAULT_CATALOG_OPTIONS.spotUV,
        bindingStyle: catalogOptions?.bindingStyle ?? DEFAULT_CATALOG_OPTIONS.bindingStyle,
        proofService: catalogOptions?.proofService ?? DEFAULT_CATALOG_OPTIONS.proofService,
        packagingStyle: catalogOptions?.packagingStyle ?? DEFAULT_CATALOG_OPTIONS.packagingStyle,
        customAreaPricing: catalogOptions?.customAreaPricing ?? DEFAULT_CATALOG_OPTIONS.customAreaPricing
      },
      tieredPricing: [],
      seo: { metaTitle: '', metaDescription: '', indexable: true }
    });
    setIsCreating(true);
  };

  const openEditForm = (prod) => {
    setFormActiveTab('general');
    setFormData({
      ...prod,
      minOrderQty: prod.minOrderQty || 100,
      orientation: prod.orientation || 'horizontal',
      paperSizes: prod.paperSizes || [],
      enableOrientation: prod.enableOrientation ?? true,
      enablePaperSizes: prod.enablePaperSizes ?? true,
      enableTechSpecs: prod.enableTechSpecs ?? true,
      enableTieredPricing: prod.enableTieredPricing ?? true,
      enableCustomArea: prod.enableCustomArea ?? false,
      enableNcrEngine: prod.enableNcrEngine ?? false,
      enableVisitingCardEngine: prod.enableVisitingCardEngine ?? false,
      enableBrochureEngine: prod.enableBrochureEngine ?? false,
      enableStickerEngine: prod.enableStickerEngine ?? false,
      searchAliases: prod.searchAliases || [],
      relatedProductIds: prod.relatedProductIds || [],
      customSections: ensureCustomSections(prod),
      specs: prod.specs || { paperGsm: '350 GSM', dimensions: '91mm x 53mm', printTech: 'Offset Litho', turnaround: '24 Hours' },
      variants: {
        paperStock: prod.variants?.paperStock ?? catalogOptions?.paperStock ?? DEFAULT_CATALOG_OPTIONS.paperStock,
        finishes: prod.variants?.finishes ?? catalogOptions?.finishes ?? DEFAULT_CATALOG_OPTIONS.finishes,
        sides: prod.variants?.sides ?? catalogOptions?.sides ?? DEFAULT_CATALOG_OPTIONS.sides,
        corners: prod.variants?.corners ?? catalogOptions?.corners ?? DEFAULT_CATALOG_OPTIONS.corners,
        lamination: prod.variants?.lamination ?? catalogOptions?.lamination ?? DEFAULT_CATALOG_OPTIONS.lamination,
        sizeFormat: prod.variants?.sizeFormat ?? catalogOptions?.sizeFormat ?? DEFAULT_CATALOG_OPTIONS.sizeFormat,
        foilAccents: prod.variants?.foilAccents ?? catalogOptions?.foilAccents ?? DEFAULT_CATALOG_OPTIONS.foilAccents,
        spotUV: prod.variants?.spotUV ?? catalogOptions?.spotUV ?? DEFAULT_CATALOG_OPTIONS.spotUV,
        bindingStyle: prod.variants?.bindingStyle ?? catalogOptions?.bindingStyle ?? DEFAULT_CATALOG_OPTIONS.bindingStyle,
        proofService: prod.variants?.proofService ?? catalogOptions?.proofService ?? DEFAULT_CATALOG_OPTIONS.proofService,
        packagingStyle: prod.variants?.packagingStyle ?? catalogOptions?.packagingStyle ?? DEFAULT_CATALOG_OPTIONS.packagingStyle,
        customAreaPricing: prod.variants?.customAreaPricing ?? catalogOptions?.customAreaPricing ?? DEFAULT_CATALOG_OPTIONS.customAreaPricing
      }
    });
    setEditingProduct(prod);
    setIsCreating(true);
  };

  const applyPresetTemplate = (type) => {
    if (type === 'businessCard') {
      setFormData(prev => ({
        ...prev,
        title: 'Premium Velvet Business Cards',
        category: 'Business Cards',
        basePrice: 3.5,
        minOrderQty: 100,
        summary: '350 GSM luxury cardstock with velvet soft-touch coating.',
        enableOrientation: false,
        enablePaperSizes: true,
        enableTechSpecs: true,
        enableVisitingCardEngine: true,
        enableCustomArea: false,
        enableNcrEngine: false,
        enableStickerEngine: false,
        searchAliases: ['visiting card', 'business card', 'name card'],
        paperSizes: ['Standard (89x51mm)', 'Square (60x60mm)'],
        specs: { paperGsm: '350 GSM', dimensions: '89mm x 51mm', printTech: 'Offset Litho', turnaround: '24-48 Hours' },
        tieredPricing: [
          { tierMin: 100, pricePerUnit: 4.5 },
          { tierMin: 500, pricePerUnit: 3.5 },
          { tierMin: 1000, pricePerUnit: 2.8 }
        ]
      }));
    } else if (type === 'flyers') {
      setFormData(prev => ({
        ...prev,
        title: 'A4 Glossy Promotional Flyers',
        category: 'Printing',
        basePrice: 4.0,
        minOrderQty: 250,
        summary: 'Vibrant full-color printed leaflets for sales and promotion.',
        enableOrientation: true,
        enablePaperSizes: true,
        enableTechSpecs: true,
        enableBrochureEngine: true,
        enableCustomArea: false,
        enableNcrEngine: false,
        enableVisitingCardEngine: false,
        enableStickerEngine: false,
        searchAliases: ['parcha', 'pamphlet', 'pamplet', 'leaflet', 'handbill'],
        orientation: 'vertical',
        paperSizes: ['A4', 'A5', 'A6', 'DL', '1/4 Size', '1/6 Size'],
        specs: { paperGsm: '170 GSM Gloss', dimensions: '210mm x 297mm (A4)', printTech: 'Digital Litho', turnaround: '24 Hours' },
        tieredPricing: [
          { tierMin: 250, pricePerUnit: 5.0 },
          { tierMin: 500, pricePerUnit: 4.0 },
          { tierMin: 1000, pricePerUnit: 3.0 }
        ]
      }));
    } else if (type === 'flexBanner') {
      setFormData(prev => ({
        ...prev,
        title: 'Outdoor Vinyl Flex Banner (Sq.Ft)',
        category: 'Printing',
        basePrice: 18.0,
        minOrderQty: 1,
        summary: 'Weatherproof high-resolution flex banner calculated per sq. feet.',
        enableOrientation: false,
        enablePaperSizes: false,
        enableCustomArea: true,
        enableTechSpecs: true,
        enableNcrEngine: false,
        enableVisitingCardEngine: false,
        enableStickerEngine: false,
        searchAliases: ['flex', 'banner', 'hoarding', 'star flex', 'vinyl'],
        specs: { paperGsm: '440 GSM Star Flex', dimensions: 'Custom (Height x Width in ft)', printTech: 'Eco-Solvent', turnaround: '24 Hours' },
        tieredPricing: [
          { tierMin: 1, pricePerUnit: 22.0 },
          { tierMin: 10, pricePerUnit: 18.0 },
          { tierMin: 50, pricePerUnit: 15.0 }
        ]
      }));
    } else if (type === 'billBook') {
      setFormData(prev => ({
        ...prev,
        title: 'GST Invoice / Bill Book (NCR)',
        category: 'Printing',
        basePrice: 120.0,
        minOrderQty: 5,
        summary: 'Carbonless NCR duplicate/triplicate bill books with serial numbering.',
        enableOrientation: false,
        enablePaperSizes: true,
        enableNcrEngine: true,
        enableTechSpecs: true,
        enableCustomArea: false,
        enableVisitingCardEngine: false,
        enableStickerEngine: false,
        searchAliases: ['rasid book', 'bill book', 'invoice book', 'challan book', 'receipt book'],
        paperSizes: ['A4', 'A5', '1/3 Size', '1/4 Size'],
        specs: { paperGsm: 'NCR Carbonless', dimensions: 'A5 (148 x 210mm)', printTech: 'Offset Single/Double Colour', turnaround: '3-4 Days' },
        tieredPricing: [
          { tierMin: 5, pricePerUnit: 140.0 },
          { tierMin: 10, pricePerUnit: 120.0 },
          { tierMin: 25, pricePerUnit: 95.0 }
        ]
      }));
    } else if (type === 'sticker') {
      setFormData(prev => ({
        ...prev,
        title: 'Custom Die-Cut Vinyl Stickers',
        category: 'Printing',
        basePrice: 2.5,
        minOrderQty: 100,
        summary: 'Waterproof die-cut vinyl stickers for products and branding.',
        enableOrientation: false,
        enablePaperSizes: false,
        enableStickerEngine: true,
        enableTechSpecs: true,
        enableCustomArea: false,
        searchAliases: ['sticker', 'label', 'vinyl sticker', 'die cut sticker', 'product label'],
        specs: { paperGsm: 'Vinyl Waterproof', dimensions: 'Custom Shape', printTech: 'UV Cut', turnaround: '48 Hours' },
        tieredPricing: [
          { tierMin: 100, pricePerUnit: 3.5 },
          { tierMin: 500, pricePerUnit: 2.5 },
          { tierMin: 1000, pricePerUnit: 1.8 }
        ]
      }));
    } else if (type === 'boxPackaging') {
      setFormData(prev => ({
        ...prev,
        title: 'Custom Product Packaging Box',
        category: 'Corporate Gifting',
        basePrice: 35.0,
        minOrderQty: 50,
        summary: 'Custom size die-cut corrugated carton product box.',
        enableOrientation: false,
        enablePaperSizes: false,
        enableCustomArea: true,
        enableTechSpecs: true,
        enableNcrEngine: false,
        searchAliases: ['box', 'packaging', 'dabba', 'mailer box'],
        specs: { paperGsm: '350 GSM + Flute', dimensions: 'Custom Die-Cut', printTech: 'UV Offset', turnaround: '3-5 Days' }
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    const res = await uploadToCloudinary(file, 'products');
    if (res.success) {
      setFormData(prev => ({ ...prev, images: [...prev.images, res.url] }));
    }
    setUploadingImage(false);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    await saveProduct(formData);
    if (formData.variants && updateCatalogOptions) {
      await updateCatalogOptions({
        ...catalogOptions,
        ...formData.variants
      });
    }
    setIsCreating(false);
    setEditingProduct(null);
  };

  const handleUpdateVariantItems = (groupKey, newItemsList) => {
    setFormData(prev => ({
      ...prev,
      variants: {
        ...(prev.variants || {}),
        [groupKey]: newItemsList
      }
    }));
  };

  const handleRestoreDefaults = (groupKey) => {
    const defaultList = DEFAULT_CATALOG_OPTIONS[groupKey] || [];
    handleUpdateVariantItems(groupKey, defaultList);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-50/50 via-white to-slate-50 p-6 rounded-3xl border border-slate-200/80 text-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-extrabold border border-blue-200 uppercase tracking-wider">
              Admin Enterprise Catalog
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Print Product Matrix & Pricing Engine
          </h2>
          <p className="text-[14px] text-slate-500 max-w-2xl mt-1 font-medium">
            Manage live print SKUs, volume tier pricing matrices, Cloudinary galleries, and multi-variant pricing rules synced with Firebase.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => setActiveTab && setActiveTab('print_matrix')}
            className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[14px] flex items-center gap-2 border border-purple-200 shadow-3xs transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4 text-purple-600" /> Options Matrix Center
          </button>
          <button
            type="button"
            onClick={() => setIsCategorySidebarOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-extrabold text-[14px] flex items-center gap-2 border border-slate-200 shadow-3xs transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" /> Categories
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer border-none"
          >
            <Plus className="w-4 h-4 text-white" /> Add New Print Product
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{products.length}</div>
            <div className="text-[14px] font-semibold text-slate-500">Active Product SKUs</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{new Set(products.map(p => p.category)).size}</div>
            <div className="text-[14px] font-semibold text-slate-500">Print Categories</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">
              {products.reduce((acc, p) => acc + (p.tieredPricing?.length || 0), 0)}
            </div>
            <div className="text-[14px] font-semibold text-slate-500">Volume Tier Rules</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{Object.keys(catalogOptions || {}).length} Matrices</div>
            <div className="text-[14px] font-semibold text-slate-500">Firebase Presets Active</div>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search SKUs or categories..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-bold text-[14px] shrink-0 cursor-pointer transition border ${selectedCategory === cat
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="h-48 bg-slate-100 relative overflow-hidden">
                {prod.images && prod.images[0] ? (
                  <img
                    src={prod.images[0]}
                    alt={prod.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                    <Package className="w-8 h-8 mb-1 text-slate-300" />
                    <span className="text-[10px] font-bold">No Image Uploaded</span>
                  </div>
                )}
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-900/85 backdrop-blur-xs text-white font-black text-[14px] border border-white/20">
                  Base ₹{prod.basePrice}
                </div>
                <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-white font-extrabold text-[10px]">
                  MOQ {prod.minOrderQty || 100} pcs
                </div>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {prod.category}
                  </span>
                  <span className="text-[14px] font-mono text-slate-400">{prod.id}</span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-1">{prod.title}</h3>
                <p className="text-[14px] text-slate-500 line-clamp-2">{prod.summary}</p>

                {/* Variants Preview Pills */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1 text-[10px] text-slate-600">
                  {prod.variants?.paperStock?.map((v, i) => (
                    <span key={`p-${i}`} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {v.name}
                    </span>
                  ))}
                  {prod.variants?.sides?.map((v, i) => (
                    <span key={`s-${i}`} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                      {v.name} (+₹{v.priceModifier})
                    </span>
                  ))}
                  {prod.variants?.finishes?.map((v, i) => (
                    <span key={`f-${i}`} className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-semibold">
                      {v.name} (+₹{v.priceModifier})
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 border-t border-slate-100 flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => openEditForm(prod)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 font-bold text-[14px] flex items-center justify-center gap-1 text-slate-700 transition-colors border-none cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit SKU & Options
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(prod.id, prod.title)}
                className="py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[14px] flex items-center justify-center gap-1 transition-colors border-none cursor-pointer"
                title="Delete Product"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Form Editor Mode - CLEAN MODULAR TABBED OVERLAY */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex justify-center items-center p-2 sm:p-4 animate-in fade-in duration-200">
          <form
            onSubmit={handleFormSubmit}
            className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl border border-slate-200 text-slate-800 relative overflow-hidden flex flex-col h-[92vh] max-h-[850px]"
          >
            {/* Sticky Top Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold border border-blue-100 shadow-3xs">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-base sm:text-lg tracking-tight text-slate-900">
                    {editingProduct ? `Edit SKU: ${formData.title}` : 'Create New Custom Print Product'}
                  </h3>
                  <p className="text-[13px] text-slate-500 font-medium">
                    Configure details, quantity volume pricing, orientation, paper sizes, and options matrix
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 font-extrabold text-sm transition flex items-center justify-center border-none cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Click Preset Template Bar */}
            {!editingProduct && (
              <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 px-6 py-2.5 border-b border-blue-100 flex items-center justify-between gap-3 text-[13px] flex-wrap shrink-0">
                <span className="font-extrabold text-blue-900 flex items-center gap-1.5 shrink-0">
                  <Zap className="w-4 h-4 text-blue-600 fill-blue-500" />
                  Quick Presets:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('businessCard')}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[12px] border border-blue-200 shadow-3xs transition cursor-pointer"
                  >
                    🎴 Business Cards
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('flyers')}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[12px] border border-blue-200 shadow-3xs transition cursor-pointer"
                  >
                    📄 Flyers & Leaflets
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('flexBanner')}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[12px] border border-blue-200 shadow-3xs transition cursor-pointer"
                  >
                    🖼️ Flex Banner (Sq.Ft)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('billBook')}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[12px] border border-blue-200 shadow-3xs transition cursor-pointer"
                  >
                    📑 NCR Bill Book
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('sticker')}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[12px] border border-blue-200 shadow-3xs transition cursor-pointer"
                  >
                    🏷️ Sticker White Ink
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetTemplate('boxPackaging')}
                    className="px-3 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white text-slate-700 font-bold text-[12px] border border-blue-200 shadow-3xs transition cursor-pointer"
                  >
                    📦 Custom Box
                  </button>
                </div>
              </div>
            )}

            {/* Navigation Tab Bar */}
            <div className="bg-slate-50/90 px-6 py-2 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto shrink-0 select-none">
              <button
                type="button"
                onClick={() => setFormActiveTab('general')}
                className={`px-4 py-2 rounded-xl text-[13.5px] font-bold transition-all flex items-center gap-2 cursor-pointer border ${formActiveTab === 'general'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <Package className="w-4 h-4" /> 1. Core Info & Dynamic Form Builder
              </button>

              {/* Tab 2: Tiered Quantity Pricing */}
              <button
                type="button"
                onClick={() => setFormActiveTab('tiered')}
                className={`px-4 py-2 rounded-xl text-[13.5px] font-bold transition-all flex items-center gap-2 cursor-pointer border ${formActiveTab === 'tiered'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <DollarSign className="w-4 h-4" /> 2. Volume Tier Pricing
              </button>

              {/* Tab 3: Options Matrices */}
              <button
                type="button"
                onClick={() => setFormActiveTab('variants')}
                className={`px-4 py-2 rounded-xl text-[13.5px] font-bold transition-all flex items-center gap-2 cursor-pointer border ${formActiveTab === 'variants'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                <Layers className="w-4 h-4" /> 3. Options Matrices
              </button>
            </div>

            {/* Tabbed Form Body - STRICT INDEPENDENT SCROLL CONTAINER */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-[14px] custom-scrollbar bg-slate-50/30">

              {/* TAB 1: GENERAL INFO, ENGINES & MEDIA */}
              {formActiveTab === 'general' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Basic Details & Classification Section */}
                  <BasicDetailsSection
                    formData={formData}
                    setFormData={setFormData}
                    products={products}
                    megamenuCategories={homepageCats}
                    updateMegamenuCategories={null} // Handled by inner saveHomepageCategory call directly
                    showInlineCatInput={showInlineCatInput}
                    setShowInlineCatInput={setShowInlineCatInput}
                    inlineCatInput={inlineCatInput}
                    setInlineCatInput={setInlineCatInput}
                    showInlineSubcatInput={showInlineSubcatInput}
                    setShowInlineSubcatInput={setShowInlineSubcatInput}
                    inlineSubcatInput={inlineSubcatInput}
                    setInlineSubcatInput={setInlineSubcatInput}
                  />

                  {/* Form Section Customizer Toolbar HIDDEN */}
                  {/* <FormSectionCustomizerToolbar
                    formData={formData}
                    setFormData={setFormData}
                  /> */}

                  {/* DYNAMIC PRODUCT FORM BUILDER & SECTION CUSTOMIZER */}
                  <DynamicFormBuilder
                    customSections={formData.customSections || []}
                    onChange={(updatedSections) => setFormData({ ...formData, customSections: updatedSections })}
                  />

                  {/* Optional Paper Sizes Card (Orientation Hidden) */}
                  {(formData.enableOrientation !== false || formData.enablePaperSizes !== false) && (
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        {/* <OrientationSection
                          formData={formData}
                          setFormData={setFormData}
                          catalogOptions={catalogOptions}
                          updateCatalogOptions={updateCatalogOptions}
                        /> */}
                        <PaperSizesSection
                          formData={formData}
                          setFormData={setFormData}
                          catalogOptions={catalogOptions}
                          updateCatalogOptions={updateCatalogOptions}
                        />
                      </div>
                    </div>
                  )}

                  {/* Technical Specifications Section HIDDEN */}
                  {/* <TechSpecsSection
                    formData={formData}
                    setFormData={setFormData}
                    newSpecKey={newSpecKey}
                    setNewSpecKey={setNewSpecKey}
                    newSpecVal={newSpecVal}
                    setNewSpecVal={setNewSpecVal}
                    catalogOptions={catalogOptions}
                    updateCatalogOptions={updateCatalogOptions}
                  /> */}

                  {/* Dynamic Custom Printing Engines */}
                  <NcrEngineSection
                    formData={formData}
                    setFormData={setFormData}
                    catalogOptions={catalogOptions}
                    updateCatalogOptions={updateCatalogOptions}
                  />
                  <VisitingCardEngineSection
                    formData={formData}
                    setFormData={setFormData}
                    catalogOptions={catalogOptions}
                    updateCatalogOptions={updateCatalogOptions}
                  />
                  <BrochureEngineSection
                    formData={formData}
                    setFormData={setFormData}
                    catalogOptions={catalogOptions}
                    updateCatalogOptions={updateCatalogOptions}
                  />
                  <StickerEngineSection
                    formData={formData}
                    setFormData={setFormData}
                    catalogOptions={catalogOptions}
                    updateCatalogOptions={updateCatalogOptions}
                  />
                  <AreaCalcEngineSection
                    formData={formData}
                    setFormData={setFormData}
                    catalogOptions={catalogOptions}
                    updateCatalogOptions={updateCatalogOptions}
                  />

                  {/* Media Gallery Upload */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600 flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Cloudinary Product Gallery Images ({formData.images?.length || 0})
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium">PNG, JPG, WEBP up to 10MB</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {formData.images.map((imgUrl, i) => (
                        <div key={i} className="relative group/img aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-3xs bg-slate-100">
                          <img src={imgUrl} alt="Gallery" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                          {i === 0 && (
                            <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-[9px] uppercase tracking-wider shadow-2xs">
                              Main Image
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md hover:bg-red-700 border-none cursor-pointer transition-colors"
                            title="Remove Image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {/* Dropzone Upload Button */}
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50 flex flex-col items-center justify-center text-blue-600 cursor-pointer transition-colors p-3 text-center">
                        <Upload className="w-6 h-6 mb-1 text-blue-500" />
                        <span className="text-[14px] font-bold text-slate-800">
                          {uploadingImage ? 'Uploading...' : 'Upload Image'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium mt-0.5">Click to browse</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* SEO Section */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-3">
                    <h4 className="font-extrabold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600">
                      SEO Optimization Controls
                    </h4>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Meta Title Tag</label>
                      <input
                        type="text"
                        value={formData.seo?.metaTitle || ''}
                        onChange={(e) => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                        placeholder="e.g. Buy Luxury Business Cards Online | Printigly"
                        className="w-full p-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-blue-500 text-[14px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TIERED QUANTITY PRICING GRID */}
              {formActiveTab === 'tiered' && (
                <TieredPricingSection
                  formData={formData}
                  setFormData={setFormData}
                />
              )}

              {/* TAB 3: PRINT OPTIONS & FINISHES MATRIX (12 SECTIONS) */}
              {formActiveTab === 'variants' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-2xl text-blue-900 text-[13.5px] flex flex-wrap items-center justify-between gap-3">
                    <span className="font-bold flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                      Add, edit, or remove options. All changes will save cleanly when you submit the form.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to clear ALL options across all 12 option matrices in 1 click?")) {
                          const emptyVariants = {
                            paperStock: [],
                            finishes: [],
                            sides: [],
                            corners: [],
                            lamination: [],
                            sizeFormat: [],
                            foilAccents: [],
                            spotUV: [],
                            bindingStyle: [],
                            proofService: [],
                            packagingStyle: [],
                            customAreaPricing: []
                          };
                          setFormData(prev => ({ ...prev, variants: emptyVariants }));
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-[12.5px] shadow-sm flex items-center gap-1.5 cursor-pointer border-none transition shrink-0"
                      title="Clear options across all 12 sections in 1 click"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All 12 Option Sections
                    </button>
                  </div>

                  {/* Category Quick Filter Sub-Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {[
                      { id: 'all', label: 'All Sections (12)' },
                      { id: 'paper', label: '📄 Paper & Finishes' },
                      { id: 'sizing', label: '📐 Sizing & Area (sq.ft)' },
                      { id: 'enhancements', label: '✨ Foils & Textures' },
                      { id: 'binding', label: '📦 Binding & Delivery' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setVariantFilterCategory(f.id)}
                        className={`px-3 py-1.5 rounded-xl font-extrabold text-[12px] shrink-0 border cursor-pointer transition ${variantFilterCategory === f.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* 12 Option Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(variantFilterCategory === 'all' || variantFilterCategory === 'paper') && (
                      <>
                        <VariantSectionCard
                          title="1. Paper Stock & Board Weight"
                          groupKey="paperStock"
                          items={formData.variants?.paperStock || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.paperStock}
                        />

                        <VariantSectionCard
                          title="2. Special Finishes"
                          groupKey="finishes"
                          items={formData.variants?.finishes || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.finishes}
                        />

                        <VariantSectionCard
                          title="5. Lamination Finish & Coating"
                          groupKey="lamination"
                          items={formData.variants?.lamination || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.lamination}
                        />
                      </>
                    )}

                    {(variantFilterCategory === 'all' || variantFilterCategory === 'sizing') && (
                      <>
                        <VariantSectionCard
                          title="6. Size Formats & Aspect Ratio"
                          groupKey="sizeFormat"
                          items={formData.variants?.sizeFormat || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.sizeFormat}
                        />

                        <VariantSectionCard
                          title="12. Custom Area Tier Pricing & Calculation (sq. feet)"
                          groupKey="customAreaPricing"
                          items={formData.variants?.customAreaPricing || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.customAreaPricing}
                        />
                      </>
                    )}

                    {(variantFilterCategory === 'all' || variantFilterCategory === 'enhancements') && (
                      <>
                        <VariantSectionCard
                          title="3. Print Sides Option"
                          groupKey="sides"
                          items={formData.variants?.sides || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.sides}
                        />

                        <VariantSectionCard
                          title="4. Edge Cuts & Corner Finishing"
                          groupKey="corners"
                          items={formData.variants?.corners || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.corners}
                        />

                        <VariantSectionCard
                          title="7. Metallic Foil Accents & Stamping"
                          groupKey="foilAccents"
                          items={formData.variants?.foilAccents || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.foilAccents}
                        />

                        <VariantSectionCard
                          title="8. Spot UV & Raised Gloss Textures"
                          groupKey="spotUV"
                          items={formData.variants?.spotUV || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.spotUV}
                        />
                      </>
                    )}

                    {(variantFilterCategory === 'all' || variantFilterCategory === 'binding') && (
                      <>
                        <VariantSectionCard
                          title="9. Binding & Booklet Construction"
                          groupKey="bindingStyle"
                          items={formData.variants?.bindingStyle || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.bindingStyle}
                        />

                        <VariantSectionCard
                          title="10. Prepress Proofing Service"
                          groupKey="proofService"
                          items={formData.variants?.proofService || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.proofService}
                        />

                        <VariantSectionCard
                          title="11. Packaging & Presentation Style"
                          groupKey="packagingStyle"
                          items={formData.variants?.packagingStyle || []}
                          onUpdateItems={handleUpdateVariantItems}
                          onRestoreDefaults={handleRestoreDefaults}
                          defaultItems={DEFAULT_CATALOG_OPTIONS.packagingStyle}
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Sticky Bottom Action Bar */}
            <div className="bg-white px-6 py-3.5 border-t border-slate-200/80 flex items-center justify-between rounded-b-3xl shrink-0 shadow-md">
              <span className="text-[13px] font-semibold text-slate-500 hidden sm:inline-block">
                💡 Saved product details and matrices instantly sync to live storefront.
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[14px] transition cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2 border-none active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" /> Save Product & Live Matrix
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Category Management Sidebar Drawer */}
      {isCategorySidebarOpen && (
        <div className="fixed inset-0 z-50 bg-[#07152F]/70 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <FolderPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">Manage Categories</h3>
                    <p className="text-[12px] text-slate-500">Add or delete store categories</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCategorySidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Add New Primary Category
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inlineCatInput}
                      onChange={(e) => setInlineCatInput(e.target.value)}
                      placeholder="Category name..."
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 font-bold text-[14px] focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (inlineCatInput.trim()) {
                          const name = inlineCatInput.trim();
                          const newCat = {
                            id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                            title: name,
                            categoryQuery: name,
                            badge: null,
                            items: []
                          };
                          const updated = [...(megamenuCategories || []), newCat];
                          if (updateMegamenuCategories) await updateMegamenuCategories(updated);
                          setInlineCatInput('');
                        }
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-[14px] hover:bg-blue-700 cursor-pointer border-none shadow-3xs"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    Active Categories List ({categories.length})
                  </label>
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                    {categories.map((cat) => {
                      const prodCount = products.filter(p => p.category === cat).length;
                      return (
                        <div key={cat} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-2">
                            <FolderPlus className="w-4 h-4 text-blue-500" />
                            <span className="font-extrabold text-[14px] text-slate-800">{cat}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              {prodCount} {prodCount === 1 ? 'product' : 'products'}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Delete category "${cat}"? Products in this category will keep their label.`)) {
                                  deleteCategory(cat);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition border-none bg-transparent cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCategorySidebarOpen(false)}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[14px] cursor-pointer border-none"
                >
                  Done / Close Sidebar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
