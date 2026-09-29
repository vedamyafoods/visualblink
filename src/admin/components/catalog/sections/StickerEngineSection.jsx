import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { CustomDropdownSelect } from './CustomDropdownSelect';

export const StickerEngineSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (!formData.enableStickerEngine) return null;

  const stickerConfig = formData.stickerConfig || {
    inkType: 'White Vinyl Standard',
    cutType: 'Custom Die-Cut Single',
    whiteInkMode: 'Underprint Layer + Full CMYK Color',
    borderMarginMm: 2
  };

  const defaultInkTypes = [
    'White Vinyl Vinyl (Standard Full Color)',
    'Clear Transparent Vinyl (Requires White Ink)',
    'Holographic Rainbow Foil Vinyl',
    'Metallic Gold / Silver Vinyl'
  ];

  const defaultCutTypes = [
    'Custom Die-Cut Single Stickers (Individually Cut)',
    'Kiss-Cut Sticker Sheet (Multiple on A4/A5 Sheet)',
    'Roll Labels (For Packaging Machines)'
  ];

  const defaultWhiteInkModes = [
    'White Underprint Layer + CMYK Color (Opaque Color)',
    'White Ink Only (Pure White Artwork on Clear)',
    'Selective White Mask (Transparent Windows in Art)'
  ];

  const inkTypesOptions = catalogOptions?.stickerInkTypesOptions || defaultInkTypes;
  const cutTypesOptions = catalogOptions?.stickerCutTypesOptions || defaultCutTypes;
  const whiteInkModesOptions = catalogOptions?.stickerWhiteInkModesOptions || defaultWhiteInkModes;

  const updateSticker = (key, val) => {
    setFormData({
      ...formData,
      stickerConfig: { ...stickerConfig, [key]: val }
    });
  };

  // Material & Ink Type Handlers
  const handleAddInkType = (newName) => {
    const updated = [...inkTypesOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, stickerInkTypesOptions: updated });
    }
  };

  const handleDeleteInkType = (optToDelete) => {
    const updated = inkTypesOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, stickerInkTypesOptions: updated });
    }
  };

  // Cut Type Handlers
  const handleAddCutType = (newName) => {
    const updated = [...cutTypesOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, stickerCutTypesOptions: updated });
    }
  };

  const handleDeleteCutType = (optToDelete) => {
    const updated = cutTypesOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, stickerCutTypesOptions: updated });
    }
  };

  // White Ink Mode Handlers
  const handleAddWhiteInkMode = (newName) => {
    const updated = [...whiteInkModesOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, stickerWhiteInkModesOptions: updated });
    }
  };

  const handleDeleteWhiteInkMode = (optToDelete) => {
    const updated = whiteInkModesOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, stickerWhiteInkModesOptions: updated });
    }
  };

  return (
    <div className="bg-amber-50/50 p-5 rounded-2xl border border-amber-200/80 shadow-3xs space-y-4">
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <h4 className="font-extrabold text-amber-900 text-[14px] uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-amber-600" />
          Sticker White Ink & Die-Cut Engine
        </h4>
        <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
          Clear Vinyl & White Ink Engine Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sticker Material & Ink Type */}
        <CustomDropdownSelect
          label="Sticker Material & Ink Type"
          value={stickerConfig.inkType}
          options={inkTypesOptions}
          onChange={(val) => updateSticker('inkType', val)}
          onAddOption={handleAddInkType}
          onDeleteOption={handleDeleteInkType}
          placeholder="e.g. Heavy-Duty Bumper Vinyl"
        />

        {/* Die-Cut Format & Sheet Option */}
        <CustomDropdownSelect
          label="Die-Cut Format & Sheet Option"
          value={stickerConfig.cutType}
          options={cutTypesOptions}
          onChange={(val) => updateSticker('cutType', val)}
          onAddOption={handleAddCutType}
          onDeleteOption={handleDeleteCutType}
          placeholder="e.g. Perforated Backing Sheet"
        />

        {/* White Ink Mode Options */}
        <CustomDropdownSelect
          label="White Ink Mode Options"
          value={stickerConfig.whiteInkMode}
          options={whiteInkModesOptions}
          onChange={(val) => updateSticker('whiteInkMode', val)}
          onAddOption={handleAddWhiteInkMode}
          onDeleteOption={handleDeleteWhiteInkMode}
          placeholder="e.g. Double Strike White Ink Layer"
        />

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            White Border Outline Margin (mm)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="10"
            value={stickerConfig.borderMarginMm}
            onChange={(e) => updateSticker('borderMarginMm', parseFloat(e.target.value) || 0)}
            className="w-full p-2.5 rounded-xl border border-amber-300 font-bold text-slate-800 text-[13.5px] bg-white focus:outline-none focus:border-amber-600"
            placeholder="e.g. 2mm"
          />
        </div>
      </div>
    </div>
  );
};
