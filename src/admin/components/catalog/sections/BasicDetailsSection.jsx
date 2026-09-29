import React, { useState } from 'react';
import { Package, Plus, Check } from 'lucide-react';
import { saveHomepageCategory } from '../../../../services/firebase';

export const BasicDetailsSection = ({
  formData,
  setFormData,
  products = [],
  megamenuCategories,
  updateMegamenuCategories,
  showInlineCatInput,
  setShowInlineCatInput,
  inlineCatInput,
  setInlineCatInput,
  showInlineSubcatInput,
  setShowInlineSubcatInput,
  inlineSubcatInput,
  setInlineSubcatInput
}) => {
  const [relatedSearch, setRelatedSearch] = useState('');
  const selectedRelatedIds = formData.relatedProductIds || [];

  const toggleRelatedProduct = (prodId) => {
    const current = [...selectedRelatedIds];
    const idx = current.indexOf(prodId);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(prodId);
    }
    setFormData({ ...formData, relatedProductIds: current });
  };

  const filteredCatalogProducts = products.filter(
    (p) => p.id !== formData.id && (p.title || '').toLowerCase().includes(relatedSearch.toLowerCase())
  );

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
      <h4 className="font-extrabold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600 flex items-center gap-2">
        <Package className="w-4 h-4" /> Basic Details & Classification
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Product Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })}
            required
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px]"
            placeholder="e.g. Luxury Velvet Soft-Touch Business Cards"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Base Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
            className="w-full p-3 rounded-xl border border-slate-200 font-extrabold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px]"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Pricing Unit *</label>
          <input
            type="text"
            value={formData.unit || 'pcs'}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g. pcs, pages, kg, bundle"
            className="w-full p-3 rounded-xl border border-slate-200 font-extrabold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px]"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Minimum Order Qty (MOQ) *</label>
          <input
            type="number"
            min="1"
            value={formData.minOrderQty || 100}
            onChange={(e) => setFormData({ ...formData, minOrderQty: parseInt(e.target.value) || 1 })}
            className="w-full p-3 rounded-xl border border-slate-200 font-extrabold text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px]"
          />
        </div>

        {/* Main Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">Main Category *</label>
            <button
              type="button"
              onClick={() => setShowInlineCatInput(!showInlineCatInput)}
              className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer border-none"
            >
              <Plus className="w-3 h-3" /> Quick Add Category
            </button>
          </div>

          {showInlineCatInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inlineCatInput}
                onChange={(e) => setInlineCatInput(e.target.value)}
                placeholder="e.g. Stickers & Decals"
                className="flex-1 p-2.5 rounded-xl border border-blue-400 font-semibold text-[14px] focus:outline-none focus:border-blue-600 bg-blue-50/50"
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

                    // Automatically add to Shop By Category (homepage_categories)
                    await saveHomepageCategory({
                      id: newCat.id,
                      title: name,
                      query: newCat.id,
                      sub: '',
                      img: '',
                      icon: 'FiBox'
                    });

                    setFormData({ ...formData, category: name, subcategory: '' });
                    setInlineCatInput('');
                    setShowInlineCatInput(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-[14px] hover:bg-blue-700 cursor-pointer border-none shrink-0 shadow-3xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowInlineCatInput(false)}
                className="px-2 py-2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          ) : (
            <select
              value={formData.category}
              onChange={(e) => {
                const newCat = e.target.value;
                const matched = (megamenuCategories || []).find(c => (c.categoryQuery || c.title) === newCat || c.title === newCat);
                const firstSub = matched?.items?.[0]?.name || '';
                setFormData({ ...formData, category: newCat, subcategory: firstSub });
              }}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-white text-[14px]"
            >
              {(megamenuCategories && megamenuCategories.length > 0
                ? megamenuCategories.map(c => c.categoryQuery || c.title)
                : ['Business Cards', 'Apparel', 'Gifts', 'Invitations', 'Corporate Gifting', 'Printing']
              ).map((catName, idx) => (
                <option key={idx} value={catName}>{catName}</option>
              ))}
            </select>
          )}
        </div>

        {/* Subcategory / Item Type Dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">Subcategory / Item Type *</label>
            <button
              type="button"
              onClick={() => setShowInlineSubcatInput(!showInlineSubcatInput)}
              className="text-[10px] font-extrabold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg flex items-center gap-1 cursor-pointer border-none"
            >
              <Plus className="w-3 h-3" /> Quick Add Subcategory
            </button>
          </div>

          {showInlineSubcatInput ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inlineSubcatInput}
                onChange={(e) => setInlineSubcatInput(e.target.value)}
                placeholder="e.g. Spot UV Cards"
                className="flex-1 p-2.5 rounded-xl border border-blue-400 font-semibold text-[14px] focus:outline-none focus:border-blue-600 bg-blue-50/50"
              />
              <button
                type="button"
                onClick={async () => {
                  if (inlineSubcatInput.trim() && formData.category) {
                    const subName = inlineSubcatInput.trim();
                    let updatedCategory = null;
                    const updatedCats = (megamenuCategories || []).map(c => {
                      if ((c.categoryQuery || c.title) === formData.category || c.title === formData.category) {
                        updatedCategory = {
                          ...c,
                          items: [...(c.items || []), { name: subName, search: subName, tag: 'Custom Spec' }]
                        };
                        return updatedCategory;
                      }
                      return c;
                    });

                    if (updateMegamenuCategories) {
                      await updateMegamenuCategories(updatedCats);
                    } else if (updatedCategory) {
                      // Save updated category object directly to Firebase
                      await saveHomepageCategory(updatedCategory);
                    }

                    setFormData({ ...formData, subcategory: subName });
                    setInlineSubcatInput('');
                    setShowInlineSubcatInput(false);
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-extrabold text-[14px] hover:bg-blue-700 cursor-pointer border-none shrink-0 shadow-3xs"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setShowInlineSubcatInput(false)}
                className="px-2 py-2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>
          ) : (
            <select
              value={formData.subcategory || ''}
              onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-800 focus:outline-none focus:border-blue-500 bg-white text-[14px]"
            >
              <option value="">-- Select Subcategory (Optional) --</option>
              {((megamenuCategories || []).find(c => (c.categoryQuery || c.title) === formData.category || c.title === formData.category)?.items || []).map((sub, i) => (
                <option key={i} value={sub.name}>{sub.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* Short Product Summary */}
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Short Product Summary *</label>
          <textarea
            rows={2}
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full p-3 rounded-xl border border-slate-200 font-medium text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px]"
            placeholder="Brief description visible on product cards..."
          />
        </div>

        {/* Search Keywords / Aliases Input */}
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Search Keywords / Aliases (e.g. parcha, pamplet, rasid book, flex)
          </label>
          <input
            type="text"
            value={(formData.searchAliases || []).join(', ')}
            onChange={(e) => {
              const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
              setFormData({ ...formData, searchAliases: arr });
            }}
            placeholder="Enter keywords separated by comma..."
            className="w-full p-3 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-blue-500 text-[13.5px] bg-slate-50/50"
          />
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            Help customers find this product using local/vernacular search queries.
          </span>
        </div>

        {/* Industry / Built for Your Business Selection */}
        <div className="md:col-span-2">
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Industry / 'Built for Your Business' Assignment
          </label>
          <div className="flex flex-wrap gap-2">
            {['Startups', 'Restaurant', 'Events', 'Corporate'].map(industry => {
              const isSelected = (formData.industries || []).includes(industry);
              return (
                <button
                  key={industry}
                  type="button"
                  onClick={() => {
                    const current = formData.industries || [];
                    if (isSelected) {
                      setFormData({ ...formData, industries: current.filter(i => i !== industry) });
                    } else {
                      setFormData({ ...formData, industries: [...current, industry] });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                >
                  {isSelected ? '✓ ' : '+ '}{industry}
                </button>
              );
            })}
          </div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">
            Click to assign this product to one or more industry categories shown on the homepage.
          </span>
        </div>

        {/* Related Products Selection Card Scroller */}
        <div className="md:col-span-2 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <label className="block font-extrabold text-slate-900 text-[13px] uppercase tracking-wider text-blue-600">
                Related Products Selection (Cross-sell on Detail Page)
              </label>
              <p className="text-[11px] text-slate-500 font-medium">
                Click any product card below to select or deselect it. Selected products will show under "Related products" on storefront.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedRelatedIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, relatedProductIds: [] })}
                  className="text-[10px] font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 cursor-pointer transition border-none"
                >
                  Clear All ({selectedRelatedIds.length})
                </button>
              )}
              <span className="text-[10.5px] font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {selectedRelatedIds.length} Selected
              </span>
            </div>
          </div>

          {/* Horizontal Scroller Box Container */}
          <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-3 space-y-2">
            {products.filter(p => p.id !== formData.id).length > 4 && (
              <div className="relative">
                <input
                  type="text"
                  value={relatedSearch}
                  onChange={(e) => setRelatedSearch(e.target.value)}
                  placeholder="Type to search/filter catalog products..."
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-[12px] font-medium focus:outline-none focus:border-blue-500 text-slate-800"
                />
              </div>
            )}

            <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1 custom-scrollbar">
              {filteredCatalogProducts.length === 0 ? (
                <div className="p-4 text-slate-400 font-bold text-[12px] italic text-center w-full">
                  No other products found in catalog.
                </div>
              ) : (
                filteredCatalogProducts.map((p) => {
                  const isSelected = selectedRelatedIds.includes(p.id);
                  const imgSrc = p.images?.[0] || p.image;

                  return (
                    <div
                      key={p.id}
                      onClick={() => toggleRelatedProduct(p.id)}
                      className={`w-48 shrink-0 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden bg-white group select-none flex flex-col justify-between ${isSelected
                        ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-500/20 shadow-md scale-[1.02]'
                        : 'border-slate-200/90 hover:border-blue-300 hover:shadow-sm'
                        }`}
                    >
                      {/* Product Thumbnail & Badges */}
                      <div className="h-28 bg-slate-100 relative overflow-hidden">
                        {imgSrc ? (
                          <img
                            src={imgSrc}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center text-slate-400">
                            <Package className="w-6 h-6 text-slate-300" />
                          </div>
                        )}

                        {/* Top-Right Selection Badge */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md transition-all ${isSelected ? 'bg-blue-600 text-white scale-110 font-black text-xs' : 'bg-white/90 text-slate-400 text-[10px] border border-slate-300'
                          }`}>
                          {isSelected ? '✓' : '○'}
                        </div>

                        {/* Category Pill Tag */}
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white font-black text-[9px] uppercase tracking-wider">
                          {p.category || 'SKU'}
                        </span>
                      </div>

                      {/* Product Info */}
                      <div className="p-2.5 space-y-1">
                        <h5 className="font-extrabold text-[12.5px] text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </h5>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-black text-blue-600">Base ₹{p.basePrice || p.price || 0}</span>
                          {isSelected && (
                            <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
