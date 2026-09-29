import React from 'react';
import { BookOpen, Folders } from 'lucide-react';
import { CustomDropdownSelect } from './CustomDropdownSelect';

export const BrochureEngineSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (!formData.enableBrochureEngine) return null;

  const brochureConfig = formData.brochureConfig || {
    foldType: 'Tri-Fold (C-Fold)',
    creasingRequired: true,
    flatUnfoldedSize: 'A4 (297 x 210mm)',
    foldedPanelCount: 6
  };

  const defaultFoldTypes = [
    'Half Fold / Bi-Fold (4 Printed Panels)',
    'Tri-Fold / Letter C-Fold (6 Printed Panels)',
    'Z-Fold / Accordion Fold (6 Printed Panels)',
    'Gate Fold (6 Printed Panels)',
    'Double Parallel Fold (8 Printed Panels)',
    'No Fold (Flat Sheet)'
  ];

  const defaultFlatSizes = [
    'A4 Sheet (297 x 210mm)',
    'A3 Oversized (420 x 297mm)',
    'A5 Sheet (210 x 148mm)',
    'DL Tri-Fold Flat (297 x 210mm)'
  ];

  const foldTypesOptions = catalogOptions?.brochureFoldTypesOptions || defaultFoldTypes;
  const flatSizesOptions = catalogOptions?.brochureFlatSizesOptions || defaultFlatSizes;

  const updateBrochure = (key, val) => {
    setFormData({
      ...formData,
      brochureConfig: { ...brochureConfig, [key]: val }
    });
  };

  // Fold Type Handlers
  const handleAddFoldType = (newName) => {
    const updated = [...foldTypesOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, brochureFoldTypesOptions: updated });
    }
  };

  const handleDeleteFoldType = (optToDelete) => {
    const updated = foldTypesOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, brochureFoldTypesOptions: updated });
    }
  };

  // Flat Size Handlers
  const handleAddFlatSize = (newName) => {
    const updated = [...flatSizesOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, brochureFlatSizesOptions: updated });
    }
  };

  const handleDeleteFlatSize = (optToDelete) => {
    const updated = flatSizesOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, brochureFlatSizesOptions: updated });
    }
  };

  return (
    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200/80 shadow-3xs space-y-4">
      <div className="flex items-center justify-between border-b border-indigo-200/60 pb-2.5">
        <h4 className="font-extrabold text-indigo-900 text-[14px] uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Brochure & Leaflet Folds Engine
        </h4>
        <span className="text-[10px] font-black text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full border border-indigo-300">
          Fold Pattern Engine Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fold Pattern Type */}
        <CustomDropdownSelect
          label="Fold Pattern Type"
          value={brochureConfig.foldType}
          options={foldTypesOptions}
          onChange={(val) => updateBrochure('foldType', val)}
          onAddOption={handleAddFoldType}
          onDeleteOption={handleDeleteFoldType}
          placeholder="e.g. Map Fold / Roll Fold"
        />

        {/* Flat Unfolded Sheet Size */}
        <CustomDropdownSelect
          label="Flat Unfolded Sheet Size"
          value={brochureConfig.flatUnfoldedSize}
          options={flatSizesOptions}
          onChange={(val) => updateBrochure('flatUnfoldedSize', val)}
          onAddOption={handleAddFlatSize}
          onDeleteOption={handleDeleteFlatSize}
          placeholder="e.g. Oversized Banner (630 x 297mm)"
        />

        <div className="md:col-span-2 flex items-center justify-between p-3 bg-white rounded-xl border border-indigo-200">
          <div>
            <span className="font-extrabold text-[13px] text-indigo-950 flex items-center gap-1.5">
              <Folders className="w-4 h-4 text-indigo-600" /> Automated Machine Creasing & Scoring
            </span>
            <p className="text-[11px] text-slate-500 font-medium">Prevents paper cracking along fold lines on 170+ GSM cardstocks</p>
          </div>
          <button
            type="button"
            onClick={() => updateBrochure('creasingRequired', !brochureConfig.creasingRequired)}
            className={`px-4 py-2 rounded-xl text-[12px] font-black cursor-pointer border transition ${
              brochureConfig.creasingRequired
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {brochureConfig.creasingRequired ? 'CREASING INCLUDED' : 'NO CREASING'}
          </button>
        </div>
      </div>
    </div>
  );
};
