import React from 'react';
import { CreditCard, Sparkles } from 'lucide-react';
import { CustomDropdownSelect } from './CustomDropdownSelect';

export const VisitingCardEngineSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (!formData.enableVisitingCardEngine) return null;

  const cardConfig = formData.visitingCardConfig || {
    requireSpotUvMask: true,
    requireFoilMask: true,
    cardCornerStyle: 'Standard Square',
    presetDimensions: '89mm x 51mm (Standard India)'
  };

  const defaultDimensions = [
    'Standard India (89mm x 51mm / 3.5" x 2.0")',
    'Euro Standard (90mm x 55mm)',
    'Square Card (60mm x 60mm)'
  ];

  const defaultCorners = [
    'Standard Square Corners (90° Sharp)',
    'Round 4 Corners (3mm Radius)',
    'Round 4 Corners (6mm Radius)',
    'Diagonal Cut / Custom Shape Die'
  ];

  const dimensionsOptions = catalogOptions?.visitingCardDimensionsOptions || defaultDimensions;
  const cornerOptions = catalogOptions?.visitingCardCornerStylesOptions || defaultCorners;

  const updateCard = (key, val) => {
    setFormData({
      ...formData,
      visitingCardConfig: { ...cardConfig, [key]: val }
    });
  };

  // Dimensions Handlers
  const handleAddDimension = (newName) => {
    const updated = [...dimensionsOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, visitingCardDimensionsOptions: updated });
    }
  };

  const handleDeleteDimension = (optToDelete) => {
    const updated = dimensionsOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, visitingCardDimensionsOptions: updated });
    }
  };

  // Corner Cut Handlers
  const handleAddCorner = (newName) => {
    const updated = [...cornerOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, visitingCardCornerStylesOptions: updated });
    }
  };

  const handleDeleteCorner = (optToDelete) => {
    const updated = cornerOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, visitingCardCornerStylesOptions: updated });
    }
  };

  return (
    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-200/80 shadow-3xs space-y-4">
      <div className="flex items-center justify-between border-b border-purple-200/60 pb-2.5">
        <h4 className="font-extrabold text-purple-900 text-[14px] uppercase tracking-wider flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-purple-600" />
          Visiting Card Masks & Artwork Rules Engine
        </h4>
        <span className="text-[10px] font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full border border-purple-300">
          Spot UV & Foil Mask Engine Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Standard Card Dimensions */}
        <CustomDropdownSelect
          label="Standard Card Dimensions"
          value={cardConfig.presetDimensions}
          options={dimensionsOptions}
          onChange={(val) => updateCard('presetDimensions', val)}
          onAddOption={handleAddDimension}
          onDeleteOption={handleDeleteDimension}
          placeholder="e.g. Mini Slim (85mm x 40mm)"
        />

        {/* Corner Cutting Options */}
        <CustomDropdownSelect
          label="Corner Cutting Options"
          value={cardConfig.cardCornerStyle}
          options={cornerOptions}
          onChange={(val) => updateCard('cardCornerStyle', val)}
          onAddOption={handleAddCorner}
          onDeleteOption={handleDeleteCorner}
          placeholder="e.g. Oval / Arch Custom Cut"
        />

        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[13px] text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Spot UV Mask File Upload
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Require customer to upload 100% K Black mask layer</p>
            </div>
            <button
              type="button"
              onClick={() => updateCard('requireSpotUvMask', !cardConfig.requireSpotUvMask)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer border transition ${
                cardConfig.requireSpotUvMask
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {cardConfig.requireSpotUvMask ? 'REQUIRED' : 'OPTIONAL'}
            </button>
          </div>

          <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between">
            <div>
              <span className="font-extrabold text-[13px] text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Metallic Foil Mask Layer
              </span>
              <p className="text-[11px] text-slate-500 font-medium">Require customer foil mask for Gold/Silver foil</p>
            </div>
            <button
              type="button"
              onClick={() => updateCard('requireFoilMask', !cardConfig.requireFoilMask)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-black cursor-pointer border transition ${
                cardConfig.requireFoilMask
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {cardConfig.requireFoilMask ? 'REQUIRED' : 'OPTIONAL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
