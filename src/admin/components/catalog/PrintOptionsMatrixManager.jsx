import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Search, 
  RotateCcw,
  Sliders,
  DollarSign,
  AlertCircle,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { DEFAULT_CATALOG_OPTIONS } from '../../../services/firebase';

export const PrintOptionsMatrixManager = () => {
  const { catalogOptions, updateCatalogOptions } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Add New Custom Section Modal state
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionKey, setNewSectionKey] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  // Standard Section Titles Human Mapping
  const sectionTitleMap = {
    paperStock: '1. Paper Stock & Board Weight',
    finishes: '2. Special Finishes',
    sides: '3. Print Sides Option',
    corners: '4. Edge Cuts & Corner Finishing',
    lamination: '5. Lamination Finish & Coating',
    sizeFormat: '6. Size Formats & Aspect Ratio',
    foilAccents: '7. Metallic Foil Accents & Stamping',
    spotUV: '8. Spot UV & Raised Gloss Textures',
    bindingStyle: '9. Binding & Booklet Construction',
    proofService: '10. Prepress Proofing Service',
    packagingStyle: '11. Packaging & Presentation Style',
    customAreaPricing: '12. Custom Area Tier Pricing & Calculation (cm²)'
  };

  // Currently disabled sections array
  const disabledSections = catalogOptions?.disabledSections || [];

  // Toggle Section Enabled / Disabled for Storefront
  const handleToggleSectionVisibility = async (groupKey) => {
    const isCurrentlyDisabled = disabledSections.includes(groupKey);
    let newDisabledList;
    if (isCurrentlyDisabled) {
      newDisabledList = disabledSections.filter(k => k !== groupKey);
    } else {
      newDisabledList = [...disabledSections, groupKey];
    }
    const updated = {
      ...catalogOptions,
      disabledSections: newDisabledList
    };
    await updateCatalogOptions(updated);
    triggerToast(`Section ${isCurrentlyDisabled ? 'ENABLED' : 'DISABLED'} for storefront customers.`);
  };

  // 1-Click Clear Section
  const handleClearSection = async (groupKey, title) => {
    if (window.confirm(`Are you sure you want to remove ALL options from "${title}" in 1 click?`)) {
      const updated = {
        ...catalogOptions,
        [groupKey]: []
      };
      await updateCatalogOptions(updated);
      triggerToast(`All options cleared from "${title}" and uploaded to Firebase.`);
    }
  };

  // Restore Defaults for a section
  const handleRestoreSectionDefaults = async (groupKey, title) => {
    const defaultItems = DEFAULT_CATALOG_OPTIONS[groupKey] || [];
    const updated = {
      ...catalogOptions,
      [groupKey]: defaultItems
    };
    await updateCatalogOptions(updated);
    triggerToast(`Restored default options for "${title}".`);
  };

  // Edit item name or priceModifier in section
  const handleUpdateOptionItem = async (groupKey, index, updatedObj) => {
    const currentList = [...(catalogOptions[groupKey] || [])];
    currentList[index] = updatedObj;
    const updated = {
      ...catalogOptions,
      [groupKey]: currentList
    };
    await updateCatalogOptions(updated);
  };

  // Delete individual item from section
  const handleDeleteOptionItem = async (groupKey, index) => {
    const currentList = catalogOptions[groupKey] || [];
    const updatedList = currentList.filter((_, i) => i !== index);
    const updated = {
      ...catalogOptions,
      [groupKey]: updatedList
    };
    await updateCatalogOptions(updated);
    triggerToast(`Option deleted & saved.`);
  };

  // Add New Custom Matrix Section
  const handleCreateNewSection = async () => {
    if (!newSectionTitle.trim()) return;
    const formattedKey = newSectionKey.trim() 
      ? newSectionKey.trim().replace(/\s+/g, '') 
      : newSectionTitle.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

    const updated = {
      ...catalogOptions,
      [formattedKey]: []
    };
    await updateCatalogOptions(updated);
    setNewSectionTitle('');
    setNewSectionKey('');
    setShowAddSectionModal(false);
    triggerToast(`Created new option matrix "${newSectionTitle}".`);
  };

  // All matrix keys (excluding metadata like disabledSections)
  const allMatrixKeys = Object.keys(catalogOptions || {}).filter(k => k !== 'disabledSections');

  // Filter keys by search term
  const filteredMatrixKeys = allMatrixKeys.filter(groupKey => {
    const title = sectionTitleMap[groupKey] || groupKey;
    const items = catalogOptions[groupKey] || [];
    const matchesTitle = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesItems = Array.isArray(items) && items.some(it => (it.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTitle || matchesItems;
  });

  const totalActiveOptionsCount = allMatrixKeys.reduce((acc, k) => {
    const items = catalogOptions[k];
    return acc + (Array.isArray(items) ? items.length : 0);
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#07152F] text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 text-[14px] font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-[#07152F] to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black border border-blue-400/30 uppercase tracking-widest">
              Global Matrix Controller
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-blue-400" />
            Manage Print Options & Finishes Matrix
          </h2>
          <p className="text-[14px] text-slate-300 max-w-2xl mt-1.5 font-medium leading-relaxed">
            Control which print option sections appear on product pages, enable/disable matrices, add custom options with price modifiers, or wipe section items in 1 click. All synced live with Firebase.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setShowAddSectionModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] flex items-center gap-2 shadow-lg shadow-[#FF5A1F]/30 transition cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" /> Add Custom Matrix Section
          </button>
        </div>
      </div>

      {/* Metrics Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{allMatrixKeys.length}</div>
            <div className="text-[14px] font-semibold text-slate-500">Option Matrices</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-extrabold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{totalActiveOptionsCount}</div>
            <div className="text-[14px] font-semibold text-slate-500">Total Configured Options</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-extrabold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{allMatrixKeys.length - disabledSections.length}</div>
            <div className="text-[14px] font-semibold text-slate-500">Active on Storefront</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-extrabold">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900">{disabledSections.length}</div>
            <div className="text-[14px] font-semibold text-slate-500">Disabled Matrices</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter matrix sections or option names..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-blue-500 text-slate-800"
          />
        </div>

        <div className="text-[14px] text-slate-500 font-bold hidden sm:block">
          💡 Toggling visibility or deleting items syncs live with Firebase Firestore.
        </div>
      </div>

      {/* Matrix Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMatrixKeys.map((groupKey) => {
          const title = sectionTitleMap[groupKey] || groupKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          const items = Array.isArray(catalogOptions[groupKey]) ? catalogOptions[groupKey] : [];
          const isDisabled = disabledSections.includes(groupKey);

          return (
            <MatrixSectionCard
              key={groupKey}
              groupKey={groupKey}
              title={title}
              items={items}
              isDisabled={isDisabled}
              onToggleVisibility={() => handleToggleSectionVisibility(groupKey)}
              onClearSection={() => handleClearSection(groupKey, title)}
              onRestoreDefaults={() => handleRestoreSectionDefaults(groupKey, title)}
              onUpdateOptionItem={(idx, obj) => handleUpdateOptionItem(groupKey, idx, obj)}
              onDeleteOptionItem={(idx) => handleDeleteOptionItem(groupKey, idx)}
              onAddOption={(obj) => handleAddOptionToSection(groupKey, obj)}
            />
          );
        })}
      </div>

      {/* Add Custom Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <FolderPlus className="w-5 h-5 text-[#FF5A1F]" />
                <span>Add Custom Option Matrix</span>
              </div>
              <button
                onClick={() => setShowAddSectionModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[14px]">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Matrix Title *</label>
                <input
                  type="text"
                  value={newSectionTitle}
                  onChange={(e) => setNewSectionTitle(e.target.value)}
                  placeholder="e.g. Ink Color Specification"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Data Key Name (Optional)</label>
                <input
                  type="text"
                  value={newSectionKey}
                  onChange={(e) => setNewSectionKey(e.target.value)}
                  placeholder="e.g. inkColor"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSectionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-extrabold text-[14px] cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewSection}
                className="px-5 py-2 rounded-xl bg-[#FF5A1F] text-white font-extrabold text-[14px] cursor-pointer border-none shadow-md shadow-[#FF5A1F]/20"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// Sub-Component for an Individual Option Matrix Card
const MatrixSectionCard = ({
  groupKey,
  title,
  items,
  isDisabled,
  onToggleVisibility,
  onClearSection,
  onRestoreDefaults,
  onUpdateOptionItem,
  onDeleteOptionItem,
  onAddOption
}) => {
  const [newOptName, setNewOptName] = useState('');
  const [newOptPrice, setNewOptPrice] = useState('');
  const [newMaxArea, setNewMaxArea] = useState('');

  const handleAdd = () => {
    if (!newOptName.trim()) return;
    const priceVal = parseFloat(newOptPrice) || 0;
    const areaVal = parseFloat(newMaxArea) || 0;
    onAddOption({ 
      name: newOptName.trim(), 
      priceModifier: priceVal,
      ...(groupKey === 'customAreaPricing' || areaVal > 0 ? { maxArea: areaVal } : {})
    });
    setNewOptName('');
    setNewOptPrice('');
    setNewMaxArea('');
  };

  const isAreaSection = groupKey === 'customAreaPricing';

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between overflow-hidden ${
      isDisabled ? 'border-amber-300/80 bg-amber-50/20' : 'border-slate-200/90 hover:border-slate-300'
    }`}>
      {/* Header Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isDisabled ? 'bg-amber-400' : 'bg-emerald-500'}`} />
          <h4 className="font-extrabold text-slate-900 text-[14px] uppercase tracking-wider truncate">
            {title}
          </h4>
          <span className="text-[10px] font-black text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
            ({items.length})
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Enable / Disable Storefront Toggle */}
          <button
            type="button"
            onClick={onToggleVisibility}
            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-extrabold flex items-center gap-1 transition cursor-pointer border-none ${
              isDisabled 
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' 
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
            title={isDisabled ? "Click to Show on Storefront" : "Click to Hide on Storefront"}
          >
            {isDisabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{isDisabled ? 'Hidden' : 'Visible'}</span>
          </button>

          {/* 1-Click Clear Section */}
          {items.length > 0 && (
            <button
              type="button"
              onClick={onClearSection}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer transition"
              title="Remove all options in 1 click"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Option Items Body */}
      <div className="p-4 space-y-2.5 flex-1 max-h-[300px] overflow-y-auto custom-scrollbar">
        {items.length === 0 ? (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center text-[14px] space-y-2">
            <p className="text-slate-500 font-medium">No active options in this section.</p>
            <button
              type="button"
              onClick={onRestoreDefaults}
              className="text-[14px] font-extrabold text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
            >
              Restore Standard Options
            </button>
          </div>
        ) : (
          items.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-slate-50/60 p-1.5 rounded-xl border border-slate-200/70 hover:bg-white transition">
              <input
                type="text"
                value={opt.name}
                onChange={(e) => onUpdateOptionItem(idx, { ...opt, name: e.target.value })}
                className="flex-1 min-w-0 p-1.5 rounded-lg border border-slate-200 bg-white font-semibold text-[14px] focus:outline-none focus:border-blue-500"
                placeholder="Option name"
              />
              {isAreaSection && (
                <div className="relative w-20 shrink-0">
                  <input
                    type="number"
                    step="1"
                    value={opt.maxArea || ''}
                    onChange={(e) => onUpdateOptionItem(idx, { ...opt, maxArea: parseFloat(e.target.value) || 0 })}
                    placeholder="Max cm²"
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[14px] focus:outline-none focus:border-blue-500"
                    title="Max Area in sq cm (cm²)"
                  />
                </div>
              )}
              <div className="relative w-22 shrink-0">
                <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  step="1"
                  value={opt.priceModifier !== undefined ? opt.priceModifier : (opt.price || 0)}
                  onChange={(e) => onUpdateOptionItem(idx, { ...opt, priceModifier: parseFloat(e.target.value) || 0, price: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-5 pr-2 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-[14px] focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => onDeleteOptionItem(idx)}
                className="p-1.5 text-slate-400 hover:text-red-600 border-none bg-transparent cursor-pointer transition"
                title="Delete Option"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* At-Last Custom Option Adder */}
      <div className="p-3 bg-blue-50/40 border-t border-slate-100 flex items-center gap-2">
        <input
          type="text"
          value={newOptName}
          onChange={(e) => setNewOptName(e.target.value)}
          placeholder={isAreaSection ? "e.g. Up to 50 sq cm" : "+ New Custom Option"}
          className="flex-1 min-w-0 p-2 rounded-lg border border-blue-200 font-bold text-[14px] focus:outline-none focus:border-blue-500 bg-white"
        />
        {isAreaSection && (
          <input
            type="number"
            value={newMaxArea}
            onChange={(e) => setNewMaxArea(e.target.value)}
            placeholder="Max cm²"
            className="w-20 p-2 rounded-lg border border-blue-200 font-bold text-[14px] focus:outline-none focus:border-blue-500 bg-white"
            title="Max Area limit in cm²"
          />
        )}
        <div className="relative w-20 shrink-0">
          <span className="absolute left-2 top-2 text-[10px] text-slate-400 font-bold">₹</span>
          <input
            type="number"
            step="1"
            value={newOptPrice}
            onChange={(e) => setNewOptPrice(e.target.value)}
            placeholder="Price"
            className="w-full pl-5 pr-2 py-2 rounded-lg border border-blue-200 font-bold text-[14px] focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] cursor-pointer border-none shrink-0 shadow-3xs"
        >
          Add
        </button>
      </div>
    </div>
  );
};
