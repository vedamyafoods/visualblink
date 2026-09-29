import React, { useState } from 'react';
import { FileText, Tag, Plus, X } from 'lucide-react';

export const PaperSizesSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (formData.enablePaperSizes === false) return null;

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSizeInput, setCustomSizeInput] = useState('');

  // Default paper sizes if catalogOptions is not populated yet
  const defaultSizes = ['A3', 'A4', 'A5', 'A6', 'DL', 'Letter', 'Legal', '1/3 Size', '1/4 Size', '1/6 Size'];

  // Master paper size list from catalogOptions or default
  const masterSizes = catalogOptions?.paperSizesOptions || defaultSizes;

  const handleToggleSize = (size) => {
    const current = formData.paperSizes || [];
    const updated = current.includes(size)
      ? current.filter(s => s !== size)
      : [...current, size];
    setFormData({ ...formData, paperSizes: updated });
  };

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    if (!customSizeInput.trim()) return;

    const newSize = customSizeInput.trim();

    // Add to master sizes list if not present
    if (!masterSizes.includes(newSize)) {
      const updatedMaster = [...masterSizes, newSize];
      if (updateCatalogOptions && catalogOptions) {
        updateCatalogOptions({
          ...catalogOptions,
          paperSizesOptions: updatedMaster
        });
      }
    }

    // Automatically select the new size in product formData
    const current = formData.paperSizes || [];
    if (!current.includes(newSize)) {
      setFormData({
        ...formData,
        paperSizes: [...current, newSize]
      });
    }

    setCustomSizeInput('');
    setIsAddingCustom(false);
  };

  const handleDeleteSizeOption = (sizeToDelete, e) => {
    e.stopPropagation(); // prevent toggling selection
    // Remove from master catalogOptions
    const updatedMaster = masterSizes.filter(s => s !== sizeToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({
        ...catalogOptions,
        paperSizesOptions: updatedMaster
      });
    }
    // Remove from active product selection
    const current = formData.paperSizes || [];
    if (current.includes(sizeToDelete)) {
      setFormData({
        ...formData,
        paperSizes: current.filter(s => s !== sizeToDelete)
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-blue-500" /> Paper Sizes Supported
        </label>
        <span className="text-[10px] font-bold text-slate-400">
          Hover option to delete cross (✕)
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {masterSizes.map((size) => {
          const isSelected = (formData.paperSizes || []).includes(size);
          return (
            <div
              key={size}
              onClick={() => handleToggleSize(size)}
              className={`group relative px-3 py-1.5 rounded-xl border-2 font-extrabold text-[12px] transition-all cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
              }`}
            >
              <Tag className="w-3 h-3" />
              <span>{size}</span>

              {/* Hover Delete Cross Icon */}
              <button
                type="button"
                onClick={(e) => handleDeleteSizeOption(size, e)}
                className={`ml-1 p-0.5 rounded-full hover:bg-red-500 hover:text-white transition-opacity border-none bg-transparent cursor-pointer ${
                  isSelected ? 'text-blue-100 hover:text-white' : 'text-slate-400 hover:text-white'
                }`}
                title={`Delete ${size} size option`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}

        {/* Custom Paper Size Button */}
        <button
          type="button"
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="px-3 py-1.5 rounded-xl border-2 border-dashed border-blue-400 font-extrabold text-[12px] text-blue-600 bg-blue-50/60 hover:bg-blue-100 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Custom Size
        </button>
      </div>

      {/* Input box for Custom Paper Size */}
      {isAddingCustom && (
        <div className="p-3 bg-blue-50/80 border border-blue-300 rounded-xl space-y-2 animate-in fade-in">
          <span className="text-[11px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-blue-600" /> Enter Custom Paper Size
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customSizeInput}
              onChange={(e) => setCustomSizeInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSize(e)}
              placeholder="e.g. B5 (176 x 250mm) or 10x12 inch"
              className="flex-1 p-2 rounded-lg border border-blue-300 font-bold text-slate-800 text-[13px] bg-white focus:outline-none focus:border-blue-600"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddCustomSize}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[12.5px] cursor-pointer border-none shadow-3xs shrink-0"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 cursor-pointer border-none shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {(formData.paperSizes || []).length > 0 && (
        <p className="mt-2 text-[11px] text-slate-500 font-medium">
          Selected: <span className="font-bold text-blue-600">{(formData.paperSizes || []).join(', ')}</span>
        </p>
      )}
    </div>
  );
};
