import React, { useState } from 'react';
import { Plus, X, Trash2, Check, DollarSign } from 'lucide-react';

export const CustomDropdownSelect = ({
  label,
  value,
  options = [],
  onChange,
  onAddOption,
  onDeleteOption,
  onUpdatePrice,
  allowPrice = false,
  placeholder = "Enter custom option..."
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [showManageList, setShowManageList] = useState(false);

  // Normalize options array: can be array of strings or objects { name, price }
  const normalizedOptions = options.map(opt => {
    if (typeof opt === 'string') return { name: opt, price: 0 };
    return { name: opt.name || opt.label || '', price: opt.price || opt.priceModifier || 0 };
  });

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === '__CUSTOM_ADD__') {
      setIsAdding(true);
    } else {
      setIsAdding(false);
      onChange(val);
    }
  };

  const handleAddSubmit = (e) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;

    const priceVal = parseFloat(customPrice) || 0;
    const newName = customInput.trim();

    if (onAddOption) {
      onAddOption(newName, priceVal);
    }
    onChange(newName);
    setCustomInput('');
    setCustomPrice('');
    setIsAdding(false);
  };

  const handleDelete = (optName) => {
    if (onDeleteOption) {
      onDeleteOption(optName);
    }
  };

  // Find price of currently selected item if allowPrice is true
  const selectedObj = normalizedOptions.find(o => o.name === value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {label && (
          <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setShowManageList(!showManageList)}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer"
        >
          {showManageList ? 'Close List Manager' : 'Manage / Remove Options'}
        </button>
      </div>

      <div className="relative flex items-center gap-2">
        <select
          value={isAdding ? '__CUSTOM_ADD__' : (value || '')}
          onChange={handleSelectChange}
          className="flex-1 p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-[13.5px] bg-white focus:outline-none focus:border-blue-600 shadow-3xs"
        >
          {normalizedOptions.map((opt, idx) => (
            <option key={idx} value={opt.name}>
              {opt.name} {allowPrice && opt.price ? `(+₹${opt.price})` : ''}
            </option>
          ))}
          <option value="__CUSTOM_ADD__">➕ Custom (+ Add New Option)...</option>
        </select>

        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-extrabold text-[12px] border border-blue-200 cursor-pointer shrink-0 flex items-center gap-1 transition"
            title="Add Custom Option"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            Custom
          </button>
        )}
      </div>

      {/* Inline Input Box when Custom is selected or clicked */}
      {isAdding && (
        <div className="p-3 bg-blue-50/70 border border-blue-300 rounded-xl space-y-2 animate-in fade-in">
          <span className="text-[11px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-blue-600" /> Enter Custom Option Details
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubmit(e)}
              placeholder={placeholder}
              className="flex-1 p-2 rounded-lg border border-blue-300 font-bold text-slate-800 text-[13px] bg-white focus:outline-none focus:border-blue-600"
              autoFocus
            />
            {allowPrice && (
              <div className="relative w-24 shrink-0">
                <span className="absolute left-2.5 top-2.5 text-[11px] font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="Price"
                  className="w-full pl-6 pr-2 py-2 rounded-lg border border-blue-300 font-bold text-slate-800 text-[13px] bg-white focus:outline-none focus:border-blue-600"
                />
              </div>
            )}
            <button
              type="button"
              onClick={handleAddSubmit}
              className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[12.5px] cursor-pointer border-none shadow-3xs shrink-0"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 cursor-pointer border-none shrink-0"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Selected Option Custom Price Setting Input (Requirement 3 for Binding & Finish, etc.) */}
      {allowPrice && selectedObj && !isAdding && onUpdatePrice && (
        <div className="flex items-center justify-between p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
          <span className="text-[11.5px] font-extrabold text-emerald-900 flex items-center gap-1">
            💵 Custom Price for "{selectedObj.name}":
          </span>
          <div className="flex items-center gap-1.5 w-32">
            <span className="text-[12px] font-black text-emerald-700">₹</span>
            <input
              type="number"
              step="0.5"
              value={selectedObj.price}
              onChange={(e) => onUpdatePrice(selectedObj.name, parseFloat(e.target.value) || 0)}
              className="w-full p-1.5 rounded-lg border border-emerald-300 font-black text-emerald-900 text-[13px] bg-white focus:outline-none focus:border-emerald-600 text-right"
              placeholder="0"
            />
          </div>
        </div>
      )}

      {/* Option Badges & Management Drawer with Cross (X) icons */}
      {showManageList && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
              Existing Options ({normalizedOptions.length}) - Hover to Delete
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-1 custom-scrollbar">
            {normalizedOptions.map((opt, idx) => (
              <div
                key={idx}
                className="group relative flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 shadow-2xs hover:border-red-300 transition"
              >
                <span>{opt.name}</span>
                {allowPrice && opt.price > 0 && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 rounded">
                    +₹{opt.price}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(opt.name)}
                  className="ml-1 text-slate-400 hover:text-red-600 hover:bg-red-50 p-0.5 rounded transition cursor-pointer border-none bg-transparent"
                  title={`Delete option "${opt.name}"`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
