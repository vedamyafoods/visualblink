import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { CustomDropdownSelect } from './CustomDropdownSelect';

export const NcrEngineSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (!formData.enableNcrEngine) return null;

  const ncrConfig = formData.ncrConfig || {
    parts: 'Duplicate (1 + 1 = 2 Parts)',
    paperColors: 'Top White / Bottom Pink (Standard 2-Part)',
    numbering: true,
    startNumber: 1001,
    binding: 'Stapled Book + Perforation + Craft Cover'
  };

  const defaultParts = [
    'Duplicate (1 + 1 = 2 Parts)',
    'Triplicate (1 + 2 = 3 Parts)',
    'Quadruplicate (1 + 3 = 4 Parts)'
  ];

  const defaultPaperColors = [
    'Top White / Bottom Pink (Standard 2-Part)',
    'Top White / Bottom Yellow',
    'Top White / Middle Pink / Bottom Yellow (3-Part)',
    'Top White / Pink / Yellow / Blue (4-Part)'
  ];

  const defaultBindingOptions = [
    { name: 'Stapled Book + Perforation + Craft Cover', price: 0 },
    { name: 'Pad Binding (Top Glued Tear-Off)', price: 15 },
    { name: 'Loose Sets Pack (Unbound)', price: 0 }
  ];

  const partsOptions = catalogOptions?.ncrPartsOptions || defaultParts;
  const paperColorsOptions = catalogOptions?.ncrPaperColorsOptions || defaultPaperColors;
  const bindingOptions = catalogOptions?.ncrBindingOptions || defaultBindingOptions;

  const updateNcr = (key, val) => {
    setFormData({
      ...formData,
      ncrConfig: { ...ncrConfig, [key]: val }
    });
  };

  // 1. Handlers for Copy Parts / Sets
  const handleAddPartsOption = (newName) => {
    const updated = [...partsOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrPartsOptions: updated });
    }
  };

  const handleDeletePartsOption = (optToDelete) => {
    const updated = partsOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrPartsOptions: updated });
    }
  };

  // 2. Handlers for Paper Color Sequence
  const handleAddColorOption = (newName) => {
    const updated = [...paperColorsOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrPaperColorsOptions: updated });
    }
  };

  const handleDeleteColorOption = (optToDelete) => {
    const updated = paperColorsOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrPaperColorsOptions: updated });
    }
  };

  // 3. Handlers for Binding & Book Finish (Requirement 3: Custom Prices!)
  const handleAddBindingOption = (newName, newPrice) => {
    const updated = [...bindingOptions, { name: newName, price: newPrice }];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrBindingOptions: updated });
    }
  };

  const handleDeleteBindingOption = (optToDelete) => {
    const updated = bindingOptions.filter(o => (typeof o === 'string' ? o !== optToDelete : o.name !== optToDelete));
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrBindingOptions: updated });
    }
  };

  const handleUpdateBindingPrice = (optName, newPrice) => {
    const updated = bindingOptions.map(o => {
      const name = typeof o === 'string' ? o : o.name;
      if (name === optName) {
        return { name, price: newPrice };
      }
      return typeof o === 'string' ? { name: o, price: 0 } : o;
    });
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, ncrBindingOptions: updated });
    }
  };

  return (
    <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/80 shadow-3xs space-y-4">
      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
        <h4 className="font-extrabold text-emerald-900 text-[14px] uppercase tracking-wider flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          NCR Bill Book Engine Settings
        </h4>
        <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
          Carbonless Receipt Engine Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Copy Parts / Sets */}
        <CustomDropdownSelect
          label="Copy Parts / Sets"
          value={ncrConfig.parts}
          options={partsOptions}
          onChange={(val) => updateNcr('parts', val)}
          onAddOption={handleAddPartsOption}
          onDeleteOption={handleDeletePartsOption}
          placeholder="e.g. Quintruplicate (5-Part)"
        />

        {/* Paper Color Sequence */}
        <CustomDropdownSelect
          label="Paper Color Sequence"
          value={ncrConfig.paperColors}
          options={paperColorsOptions}
          onChange={(val) => updateNcr('paperColors', val)}
          onAddOption={handleAddColorOption}
          onDeleteOption={handleDeleteColorOption}
          placeholder="e.g. Top White / Middle Pink / Bottom Green"
        />

        {/* Sequential Serial Numbering */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Sequential Serial Numbering
          </label>
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-emerald-300">
            <button
              type="button"
              onClick={() => updateNcr('numbering', !ncrConfig.numbering)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-bold border cursor-pointer transition ${
                ncrConfig.numbering
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {ncrConfig.numbering ? '✓ Numbering Included' : 'No Numbering'}
            </button>
            {ncrConfig.numbering && (
              <div className="flex items-center gap-1 flex-1">
                <span className="text-[11px] font-bold text-slate-500">Start #:</span>
                <input
                  type="number"
                  value={ncrConfig.startNumber || 1001}
                  onChange={(e) => updateNcr('startNumber', parseInt(e.target.value) || 1)}
                  className="w-full p-1.5 rounded-md border border-slate-200 font-bold text-[13px]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Binding & Book Finish (Requirement 3: Custom Prices!) */}
        <CustomDropdownSelect
          label="Binding & Book Finish"
          value={ncrConfig.binding}
          options={bindingOptions}
          onChange={(val) => updateNcr('binding', val)}
          onAddOption={handleAddBindingOption}
          onDeleteOption={handleDeleteBindingOption}
          onUpdatePrice={handleUpdateBindingPrice}
          allowPrice={true}
          placeholder="e.g. Hardbound Book Binding + Perforation"
        />
      </div>
    </div>
  );
};
