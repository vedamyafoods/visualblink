import React, { useState } from 'react';
import { Maximize2, AlignJustify, AlignCenter, Plus, X } from 'lucide-react';

export const OrientationSection = ({ formData, setFormData, catalogOptions, updateCatalogOptions }) => {
  if (formData.enableOrientation === false) return null;

  const [isAdding, setIsAdding] = useState(false);
  const [customInput, setCustomInput] = useState('');

  const defaultOrientations = [
    { key: 'horizontal', title: 'Landscape', subtitle: 'Width > Height' },
    { key: 'vertical', title: 'Portrait', subtitle: 'Height > Width' }
  ];

  const masterOrientations = catalogOptions?.orientationOptions || defaultOrientations;

  const handleSelect = (key) => {
    setFormData({ ...formData, orientation: key });
  };

  const handleAddCustom = (e) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;

    const titleStr = customInput.trim();
    const keyStr = titleStr.toLowerCase().replace(/\s+/g, '-');
    const newObj = { key: keyStr, title: titleStr, subtitle: 'Custom Orientation' };

    const updatedMaster = [...masterOrientations, newObj];
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({
        ...catalogOptions,
        orientationOptions: updatedMaster
      });
    }

    setFormData({ ...formData, orientation: keyStr });
    setCustomInput('');
    setIsAdding(false);
  };

  const handleDeleteOption = (keyToDelete, e) => {
    e.stopPropagation();
    const updatedMaster = masterOrientations.filter(o => o.key !== keyToDelete);
    if (updateCatalogOptions && catalogOptions) {
      updateCatalogOptions({
        ...catalogOptions,
        orientationOptions: updatedMaster
      });
    }

    if (formData.orientation === keyToDelete) {
      setFormData({
        ...formData,
        orientation: updatedMaster[0]?.key || 'horizontal'
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
          <Maximize2 className="w-3.5 h-3.5 text-blue-500" /> Print Orientation
        </label>
        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="text-[11px] font-extrabold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> + Custom Orientation
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {masterOrientations.map((item) => {
          const isSelected = formData.orientation === item.key;
          return (
            <div
              key={item.key}
              onClick={() => handleSelect(item.key)}
              className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer font-extrabold text-[13px] ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
              }`}
            >
              <button
                type="button"
                onClick={(e) => handleDeleteOption(item.key, e)}
                className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 border-none bg-transparent cursor-pointer transition"
                title={`Delete ${item.title}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              <div className={`w-10 h-7 rounded-lg border-2 flex items-center justify-center ${
                isSelected ? 'border-blue-500 bg-blue-100' : 'border-slate-300 bg-slate-50'
              }`}>
                {item.key === 'vertical' ? (
                  <AlignCenter className="w-4 h-4 text-blue-600" />
                ) : (
                  <AlignJustify className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <span className="text-center">{item.title}</span>
              <span className="text-[10px] font-semibold text-slate-400">{item.subtitle}</span>
            </div>
          );
        })}
      </div>

      {isAdding && (
        <div className="p-3 bg-blue-50/80 border border-blue-300 rounded-xl space-y-2 animate-in fade-in">
          <span className="text-[11px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-blue-600" /> Enter Custom Orientation Name
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCustom(e)}
              placeholder="e.g. Square (1:1 Ratio) or Folded Tent"
              className="flex-1 p-2 rounded-lg border border-blue-300 font-bold text-slate-800 text-[13px] bg-white focus:outline-none focus:border-blue-600"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddCustom}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[12.5px] cursor-pointer border-none shadow-3xs shrink-0"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 cursor-pointer border-none shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
