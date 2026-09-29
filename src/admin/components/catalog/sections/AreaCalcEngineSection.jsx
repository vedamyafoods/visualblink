import React from 'react';
import { Maximize2, Calculator } from 'lucide-react';
import { CustomDropdownSelect } from './CustomDropdownSelect';

export const AreaCalcEngineSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (!formData.enableCustomArea) return null;

  const areaConfig = formData.areaConfig || {
    ratePerSqFt: 18.0,
    minBillableSqFt: 5.0,
    unit: 'ft',
    maxHeightFt: 20,
    maxWidthFt: 50,
    eyeletGrommets: true
  };

  const defaultUnits = [
    'Feet (ft)',
    'Inches (in)',
    'Millimeters (mm)',
    'Meters (m)',
    'Centimeters (cm)'
  ];

  const unitsOptions = catalogOptions?.areaUnitsOptions || defaultUnits;

  const updateArea = (key, val) => {
    setFormData({
      ...formData,
      areaConfig: { ...areaConfig, [key]: val }
    });
  };

  // Measurement Unit Handlers
  const handleAddUnit = (newName) => {
    const updated = [...unitsOptions, newName];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, areaUnitsOptions: updated });
    }
  };

  const handleDeleteUnit = (optToDelete) => {
    const updated = unitsOptions.filter(o => o !== optToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({ ...catalogOptions, areaUnitsOptions: updated });
    }
  };

  return (
    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-200/80 shadow-3xs space-y-4">
      <div className="flex items-center justify-between border-b border-orange-200/60 pb-2.5">
        <h4 className="font-extrabold text-orange-900 text-[14px] uppercase tracking-wider flex items-center gap-2">
          <Calculator className="w-4 h-4 text-orange-600" />
          Area Calculator & Rate Engine (Sq.Ft / Custom Size)
        </h4>
        <span className="text-[10px] font-black text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full border border-orange-300">
          Height × Width Calculator Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Rate Per Sq.Ft (₹)
          </label>
          <input
            type="number"
            step="0.5"
            value={areaConfig.ratePerSqFt}
            onChange={(e) => updateArea('ratePerSqFt', parseFloat(e.target.value) || 0)}
            className="w-full p-2.5 rounded-xl border border-orange-300 font-extrabold text-slate-800 text-[14px] bg-white focus:outline-none focus:border-orange-600"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Minimum Billable Area (Sq.Ft)
          </label>
          <input
            type="number"
            step="1"
            value={areaConfig.minBillableSqFt}
            onChange={(e) => updateArea('minBillableSqFt', parseFloat(e.target.value) || 1)}
            className="w-full p-2.5 rounded-xl border border-orange-300 font-extrabold text-slate-800 text-[14px] bg-white focus:outline-none focus:border-orange-600"
          />
        </div>

        {/* Measurement Unit */}
        <CustomDropdownSelect
          label="Measurement Unit"
          value={areaConfig.unit}
          options={unitsOptions}
          onChange={(val) => updateArea('unit', val)}
          onAddOption={handleAddUnit}
          onDeleteOption={handleDeleteUnit}
          placeholder="e.g. Yards (yd)"
        />

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Max Height (ft)
          </label>
          <input
            type="number"
            value={areaConfig.maxHeightFt}
            onChange={(e) => updateArea('maxHeightFt', parseFloat(e.target.value) || 0)}
            className="w-full p-2.5 rounded-xl border border-orange-300 font-bold text-slate-800 text-[13.5px] bg-white focus:outline-none focus:border-orange-600"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">
            Max Width (ft)
          </label>
          <input
            type="number"
            value={areaConfig.maxWidthFt}
            onChange={(e) => updateArea('maxWidthFt', parseFloat(e.target.value) || 0)}
            className="w-full p-2.5 rounded-xl border border-orange-300 font-bold text-slate-800 text-[13.5px] bg-white focus:outline-none focus:border-orange-600"
          />
        </div>

        <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-orange-200">
          <div>
            <span className="font-extrabold text-[12.5px] text-slate-800">Eyelets / Grommets Option</span>
            <p className="text-[10px] text-slate-400 font-medium">Metal rings every 2ft</p>
          </div>
          <button
            type="button"
            onClick={() => updateArea('eyeletGrommets', !areaConfig.eyeletGrommets)}
            className={`px-3 py-1 rounded-lg text-[11px] font-black cursor-pointer border transition ${
              areaConfig.eyeletGrommets
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            {areaConfig.eyeletGrommets ? 'YES' : 'NO'}
          </button>
        </div>
      </div>
    </div>
  );
};
