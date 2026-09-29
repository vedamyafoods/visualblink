import React from 'react';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { Maximize2, AlignJustify, AlignCenter } from 'lucide-react';

export const DynamicStorefrontForm = ({
  customSections = [],
  formValues = {},
  onValueChange
}) => {
  if (!customSections || customSections.length === 0) return null;
c
  return (
    <div className="space-y-8">
      {customSections.map((sec, sIdx) => {
        if (sec.enabled === false) return null;
        const activeFields = (sec.fields || []).filter(f => f.enabled !== false);
        if (activeFields.length === 0) return null;

        return (
          <div key={sec.id || sIdx} className="space-y-5">
            {/* Section Title Header */}
            {sec.title && (
              <div className="border-b border-slate-200 pb-2">
                <h3 className="font-extrabold text-[15px] text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA580C]"></span>
                  {sec.title}
                </h3>
              </div>
            )}

            {/* Section Fields Rendered in Structured Vertical Stack */}
            <div className="space-y-5">
              {activeFields.map((field, fIdx) => {
                const fieldId = field.id || `f_${fIdx}`;
                const currentValue = formValues[fieldId] !== undefined ? formValues[fieldId] : (field.defaultValue || '');

                return (
                  <div key={fieldId} className="space-y-1.5">
                    {/* Field Label / Title */}
                    <div className="flex items-center justify-between">
                      <label className="block text-[14px] font-bold text-slate-900">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>

                    {/* CONTROL TYPE 1: DROPDOWN */}
                    {field.type === 'dropdown' && (
                      <div className="relative">
                        <select
                          value={currentValue}
                          onChange={(e) => onValueChange(fieldId, e.target.value, field)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-[14px] font-bold text-slate-800 appearance-none focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 shadow-3xs cursor-pointer"
                        >
                          {(!field.options || field.options.length === 0) ? (
                            <option value="">No options configured</option>
                          ) : (
                            field.options.map((opt, oIdx) => {
                              const optVal = opt.value || opt.label || opt;
                              const optLabel = opt.label || opt.value || opt;
                              const priceMod = opt.priceModifier ? ` (+₹${opt.priceModifier})` : '';
                              return (
                                <option key={opt.id || oIdx} value={optVal}>
                                  {optLabel}{priceMod}
                                </option>
                              );
                            })
                          )}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                          <FiChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    )}

                    {/* CONTROL TYPE 2: TEXT INPUT */}
                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={currentValue}
                        onChange={(e) => onValueChange(fieldId, e.target.value, field)}
                        placeholder={field.placeholder || 'Enter text...'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 shadow-3xs"
                      />
                    )}

                    {/* CONTROL TYPE 3: NUMBER INPUT */}
                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={currentValue}
                        onChange={(e) => onValueChange(fieldId, e.target.value, field)}
                        placeholder={field.placeholder || '1'}
                        className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-[14px] font-bold text-slate-800 focus:outline-none focus:border-[#EA580C] focus:ring-2 focus:ring-[#EA580C]/10 shadow-3xs"
                      />
                    )}

                    {/* CONTROL TYPE 4: RADIO / SINGLE CHOICE */}
                    {field.type === 'radio' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const optVal = opt.value || opt.label;
                          const optLabel = opt.label || opt.value;
                          const isSelected = currentValue === optVal;
                          return (
                            <button
                              key={opt.id || oIdx}
                              type="button"
                              onClick={() => onValueChange(fieldId, optVal, field)}
                              className={`p-3 rounded-xl border-2 font-bold text-[13.5px] transition-all cursor-pointer flex items-center justify-between ${isSelected
                                  ? 'bg-[#FFF7ED] border-[#EA580C] text-[#EA580C] shadow-3xs'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-orange-300'
                                }`}
                            >
                              <span>{optLabel}</span>
                              {opt.priceModifier > 0 && (
                                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  +₹{opt.priceModifier}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* CONTROL TYPE 5: CHECKBOX / MULTIPLE CHOICE */}
                    {field.type === 'checkbox' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const optVal = opt.value || opt.label;
                          const optLabel = opt.label || opt.value;
                          const selectedList = Array.isArray(currentValue) ? currentValue : [];
                          const isChecked = selectedList.includes(optVal);

                          return (
                            <button
                              key={opt.id || oIdx}
                              type="button"
                              onClick={() => {
                                const nextList = isChecked
                                  ? selectedList.filter(item => item !== optVal)
                                  : [...selectedList, optVal];
                                onValueChange(fieldId, nextList, field);
                              }}
                              className={`p-3 rounded-xl border-2 font-bold text-[13.5px] transition-all cursor-pointer flex items-center justify-between ${isChecked
                                  ? 'bg-[#FFF7ED] border-[#EA580C] text-[#EA580C] shadow-3xs'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-orange-300'
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${isChecked ? 'bg-[#EA580C] border-[#EA580C] text-white' : 'border-slate-300 bg-white'
                                  }`}>
                                  {isChecked && <FiCheck className="w-3 h-3 text-white" />}
                                </div>
                                <span>{optLabel}</span>
                              </div>
                              {opt.priceModifier > 0 && (
                                <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  +₹{opt.priceModifier}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* CONTROL TYPE 6: ORIENTATION */}
                    {field.type === 'orientation' && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                        {(field.options || []).map((opt, oIdx) => {
                          const optVal = opt.value || opt.label;
                          const optLabel = opt.label || opt.value;
                          const isSelected = currentValue === optVal;
                          const isPortrait = optVal.toLowerCase().includes('portrait') || optLabel.toLowerCase().includes('portrait');

                          return (
                            <button
                              key={opt.id || oIdx}
                              type="button"
                              onClick={() => onValueChange(fieldId, optVal, field)}
                              className={`group relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer font-extrabold text-[13px] ${isSelected
                                  ? 'bg-[#FFF7ED] border-[#EA580C] text-[#EA580C] shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-800 hover:border-orange-300'
                                }`}
                            >
                              <div className={`w-10 h-7 rounded-lg border-2 flex items-center justify-center ${isSelected ? 'border-[#EA580C] bg-orange-100' : 'border-slate-300 bg-slate-50'
                                }`}>
                                {isPortrait ? (
                                  <AlignCenter className={`w-4 h-4 ${isSelected ? 'text-[#EA580C]' : 'text-slate-600'}`} />
                                ) : (
                                  <AlignJustify className={`w-4 h-4 ${isSelected ? 'text-[#EA580C]' : 'text-slate-600'}`} />
                                )}
                              </div>
                              <span className="text-center mt-1">{optLabel}</span>
                              {opt.priceModifier > 0 && (
                                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 rounded-md">
                                  +₹{opt.priceModifier}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Help Text / Subtitle under control */}
                    {field.helpText && (
                      <p className="text-[12px] text-slate-500 font-medium pt-0.5">
                        {field.helpText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
