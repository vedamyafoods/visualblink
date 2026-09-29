import React, { useState } from 'react';
import { Trash2, X, Plus } from 'lucide-react';

export const TechSpecsSection = ({
  formData,
  setFormData,
  newSpecKey,
  setNewSpecKey,
  newSpecVal,
  setNewSpecVal,
  catalogOptions,
  updateCatalogOptions
}) => {
  if (formData.enableTechSpecs === false) return null;

  const [isAdding, setIsAdding] = useState(false);

  const handleAddSpec = () => {
    if (newSpecKey.trim() && newSpecVal.trim()) {
      const updatedSpecs = { ...formData.specs, [newSpecKey.trim()]: newSpecVal.trim() };
      setFormData({
        ...formData,
        specs: updatedSpecs
      });

      // Update catalogOptions in Firebase if provided
      if (updateCatalogOptions && catalogOptions) {
        updateCatalogOptions({
          ...catalogOptions,
          techSpecsMaster: { ...(catalogOptions.techSpecsMaster || {}), [newSpecKey.trim()]: newSpecVal.trim() }
        });
      }

      setNewSpecKey('');
      setNewSpecVal('');
      setIsAdding(false);
    }
  };

  const handleRemoveSpec = (key) => {
    const updated = { ...formData.specs };
    delete updated[key];
    setFormData({ ...formData, specs: updated });

    if (updateCatalogOptions && catalogOptions && catalogOptions.techSpecsMaster) {
      const updatedMaster = { ...catalogOptions.techSpecsMaster };
      delete updatedMaster[key];
      updateCatalogOptions({
        ...catalogOptions,
        techSpecsMaster: updatedMaster
      });
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-extrabold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600 flex items-center gap-2">
          <span>Technical Specifications & Custom Attributes</span>
        </h4>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> + Add Custom Spec
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(formData.specs || {}).map(([key, val]) => (
          <div key={key} className="group flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
            <input
              type="text"
              value={key}
              readOnly
              className="w-1/3 p-2 rounded-lg bg-slate-100 font-bold text-slate-700 text-[13px] border border-slate-200 uppercase"
            />
            <input
              type="text"
              value={val}
              onChange={(e) => {
                const updated = { ...formData.specs, [key]: e.target.value };
                setFormData({ ...formData, specs: updated });
              }}
              className="flex-1 p-2 rounded-lg bg-white font-bold text-slate-900 text-[13px] border border-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => handleRemoveSpec(key)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer transition"
              title={`Delete ${key} specification`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Custom Spec Row */}
      {(isAdding || Object.keys(formData.specs || {}).length === 0) && (
        <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-dashed border-slate-200 bg-blue-50/50 p-3 rounded-xl">
          <input
            type="text"
            value={newSpecKey}
            onChange={(e) => setNewSpecKey(e.target.value)}
            placeholder="Spec Key (e.g. Turnaround)"
            className="w-full sm:w-1/3 p-2 rounded-xl border border-slate-300 font-bold text-[13px] focus:outline-none focus:border-blue-500 bg-white"
          />
          <input
            type="text"
            value={newSpecVal}
            onChange={(e) => setNewSpecVal(e.target.value)}
            placeholder="Spec Value (e.g. Same Day Express)"
            className="w-full sm:flex-1 p-2 rounded-xl border border-slate-300 font-bold text-[13px] focus:outline-none focus:border-blue-500 bg-white"
          />
          <button
            type="button"
            onClick={handleAddSpec}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-[13px] hover:bg-blue-700 cursor-pointer border-none shadow-3xs"
          >
            Add Spec
          </button>
        </div>
      )}
    </div>
  );
};
