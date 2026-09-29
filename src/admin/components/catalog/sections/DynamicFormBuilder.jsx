import React, { useState } from 'react';
import { Plus, Trash2, X, Sliders, Layers, CheckSquare, Type, Hash, List, Radio, Maximize2, AlignJustify, AlignCenter } from 'lucide-react';
import { generateId } from '../../../../utils/customSectionsHelper';

export const DynamicFormBuilder = ({ customSections = [], onChange }) => {

  // Update a section by ID
  const updateSection = (sectionId, updatedData) => {
    const next = customSections.map(sec =>
      sec.id === sectionId ? { ...sec, ...updatedData } : sec
    );
    onChange(next);
  };

  // Add a new empty section
  const handleAddSection = () => {
    const newSection = {
      id: generateId('sec'),
      title: 'New Product Section',
      enabled: true,
      fields: [
        {
          id: generateId('f'),
          label: 'New Field Label',
          type: 'dropdown',
          required: true,
          placeholder: 'Select option...',
          helpText: '',
          options: [
            { id: generateId('opt'), label: 'Option 1', value: 'Option 1', priceModifier: 0 },
            { id: generateId('opt'), label: 'Option 2', value: 'Option 2', priceModifier: 0 }
          ]
        }
      ]
    };
    onChange([...customSections, newSection]);
  };

  // Delete a section
  const handleDeleteSection = (sectionId) => {
    if (window.confirm("Are you sure you want to remove this section from the product configuration?")) {
      onChange(customSections.filter(sec => sec.id !== sectionId));
    }
  };

  // Add a field inside a section
  const handleAddField = (sectionId) => {
    const targetSection = customSections.find(sec => sec.id === sectionId);
    if (!targetSection) return;

    const newField = {
      id: generateId('f'),
      label: 'New Custom Field',
      type: 'dropdown',
      required: false,
      placeholder: 'Enter or select...',
      helpText: '',
      options: [
        { id: generateId('opt'), label: 'Standard Option', value: 'Standard Option', priceModifier: 0 }
      ]
    };

    updateSection(sectionId, {
      fields: [...(targetSection.fields || []), newField]
    });
  };

  // Update a specific field inside a section
  const updateField = (sectionId, fieldId, updatedFieldData) => {
    const targetSection = customSections.find(sec => sec.id === sectionId);
    if (!targetSection) return;

    const updatedFields = (targetSection.fields || []).map(f =>
      f.id === fieldId ? { ...f, ...updatedFieldData } : f
    );

    updateSection(sectionId, { fields: updatedFields });
  };

  // Delete a field inside a section
  const handleDeleteField = (sectionId, fieldId) => {
    const targetSection = customSections.find(sec => sec.id === sectionId);
    if (!targetSection) return;

    updateSection(sectionId, {
      fields: (targetSection.fields || []).filter(f => f.id !== fieldId)
    });
  };

  // Options Manager Handlers
  const handleAddOption = (sectionId, fieldId) => {
    const targetSection = customSections.find(sec => sec.id === sectionId);
    if (!targetSection) return;
    const targetField = targetSection.fields?.find(f => f.id === fieldId);
    if (!targetField) return;

    const newOpt = {
      id: generateId('opt'),
      label: `New Option ${(targetField.options?.length || 0) + 1}`,
      value: `New Option ${(targetField.options?.length || 0) + 1}`,
      priceModifier: 0
    };

    updateField(sectionId, fieldId, {
      options: [...(targetField.options || []), newOpt]
    });
  };

  const updateOption = (sectionId, fieldId, optionId, updatedOptData) => {
    const targetSection = customSections.find(sec => sec.id === sectionId);
    if (!targetSection) return;
    const targetField = targetSection.fields?.find(f => f.id === fieldId);
    if (!targetField) return;

    const updatedOptions = (targetField.options || []).map(opt => {
      if (opt.id === optionId) {
        const nextOpt = { ...opt, ...updatedOptData };
        if (updatedOptData.label !== undefined && !updatedOptData.value) {
          nextOpt.value = updatedOptData.label;
        }
        return nextOpt;
      }
      return opt;
    });

    updateField(sectionId, fieldId, { options: updatedOptions });
  };

  const handleDeleteOption = (sectionId, fieldId, optionId) => {
    const targetSection = customSections.find(sec => sec.id === sectionId);
    if (!targetSection) return;
    const targetField = targetSection.fields?.find(f => f.id === fieldId);
    if (!targetField) return;

    updateField(sectionId, fieldId, {
      options: (targetField.options || []).filter(opt => opt.id !== optionId)
    });
  };

  return (
    <div className="space-y-6">

      {/* Top Section Header & Global Add Button */}
      <div className="bg-gradient-to-r from-blue-900 via-[#07152F] to-slate-900 p-5 rounded-2xl text-white shadow-md flex items-center justify-between flex-wrap gap-4">
        <div>
          <h4 className="font-extrabold text-base uppercase tracking-wider text-white flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            Dynamic Product Form Builder & Section Customizer
          </h4>
          <p className="text-[12.5px] text-slate-300 font-medium mt-1">
            Create custom sections, add fields (Dropdown, Text, Number, Radio, Checkbox), and configure options & prices. Everything syncs live to Firebase.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddSection}
          className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-black text-[13px] shadow-sm flex items-center gap-2 cursor-pointer border-none transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" /> + Add Section
        </button>
      </div>

      {/* Sections List */}
      {customSections.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-2xl border-2 border-dashed border-slate-300 space-y-3">
          <Layers className="w-12 h-12 text-slate-400 mx-auto" />
          <h4 className="font-black text-slate-800 text-base">No Custom Sections Added Yet</h4>
          <p className="text-[13px] text-slate-500 max-w-md mx-auto font-medium">
            Click "+ Add Section" above to create custom product configuration sections like Paper Specs, Printing Options, or Delivery Info.
          </p>
          <button
            type="button"
            onClick={handleAddSection}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-[13px] cursor-pointer border-none shadow-3xs"
          >
            + Add First Section
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {customSections.map((sec, secIdx) => (
            <div
              key={sec.id || secIdx}
              className={`bg-white rounded-2xl border shadow-3xs transition-all ${sec.enabled !== false ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50/50 opacity-75'
                }`}
            >
              {/* SECTION HEADER BAR */}
              <div className="bg-slate-100/70 p-4 rounded-t-2xl border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                  <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-[12px] font-black flex items-center justify-center shrink-0">
                    {secIdx + 1}
                  </span>
                  <input
                    type="text"
                    value={sec.title || ''}
                    onChange={(e) => updateSection(sec.id, { title: e.target.value })}
                    placeholder="Section Title (e.g. Printing Configuration)"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 font-black text-slate-900 text-[14px] bg-white focus:outline-none focus:border-blue-600"
                  />
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    {(sec.fields || []).length} field(s)
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateSection(sec.id, { enabled: sec.enabled === false })}
                    className={`px-3 py-1 rounded-lg text-[11px] font-black cursor-pointer border transition ${sec.enabled !== false
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                      }`}
                  >
                    {sec.enabled !== false ? 'ENABLED' : 'DISABLED'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSection(sec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 border-none bg-transparent cursor-pointer transition"
                    title="Delete Section (✕)"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* SECTION FIELDS BODY */}
              <div className="p-4 sm:p-5 space-y-4">
                {(sec.fields || []).length === 0 ? (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-[13px] font-medium text-center">
                    No fields added in this section yet. Click "+ Add Field" below to add inputs.
                  </div>
                ) : (
                  (sec.fields || []).map((field, fIdx) => (
                    <div
                      key={field.id || fIdx}
                      className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3 hover:border-blue-300 transition"
                    >
                      {/* FIELD TOP ROW */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                            Field Label / Title
                          </label>
                          <input
                            type="text"
                            value={field.label || ''}
                            onChange={(e) => updateField(sec.id, field.id, { label: e.target.value })}
                            placeholder="Field Label (e.g. Top Sheet Printing Colour)"
                            className="w-full p-2 rounded-xl border border-slate-300 font-extrabold text-slate-900 text-[13.5px] bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-1">
                            Control Type
                          </label>
                          <select
                            value={field.type || 'dropdown'}
                            onChange={(e) => updateField(sec.id, field.id, { type: e.target.value })}
                            className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-[13px] bg-white focus:outline-none focus:border-blue-600"
                          >
                            <option value="dropdown">Dropdown (Select list)</option>
                            <option value="text">Text Input (Short text)</option>
                            <option value="number">Number Input (Numeric)</option>
                            <option value="radio">Radio Buttons (Single choice)</option>
                            <option value="checkbox">Checkboxes (Multiple choice)</option>
                            <option value="orientation">Orientation Selector</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-2 pt-4 sm:pt-0">
                          <button
                            type="button"
                            onClick={() => updateField(sec.id, field.id, { required: !field.required })}
                            className={`w-full py-2 px-2.5 rounded-xl text-[11px] font-black border cursor-pointer transition ${field.required
                                ? 'bg-blue-600 text-white border-blue-600 shadow-3xs'
                                : 'bg-slate-200 text-slate-600 border-slate-300'
                              }`}
                          >
                            {field.required ? 'REQUIRED: ON' : 'REQUIRED: OFF'}
                          </button>
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleDeleteField(sec.id, field.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer transition"
                            title="Remove Field (✕)"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* FIELD DETAILS: Placeholder & Help Text */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <input
                            type="text"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(sec.id, field.id, { placeholder: e.target.value })}
                            placeholder="Placeholder text (e.g. 001 or Select Option...)"
                            className="w-full p-2 rounded-lg border border-slate-200 text-[12.5px] font-bold text-slate-700 bg-white"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={field.helpText || ''}
                            onChange={(e) => updateField(sec.id, field.id, { helpText: e.target.value })}
                            placeholder="Help text under input (e.g. choose starting invoice number)"
                            className="w-full p-2 rounded-lg border border-slate-200 text-[12.5px] font-medium text-slate-600 bg-white"
                          />
                        </div>
                      </div>

                      {/* OPTIONS MANAGER (For Dropdown, Radio, Checkbox, Orientation) */}
                      {['dropdown', 'radio', 'checkbox', 'orientation'].includes(field.type) && (
                        <div className="pt-2 border-t border-slate-200/80 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10.5px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                              <List className="w-3.5 h-3.5 text-blue-600" /> Options & Price Adjustments ({(field.options || []).length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddOption(sec.id, field.id)}
                              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-transparent border-none cursor-pointer flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> + Add Option
                            </button>
                          </div>

                          {field.type === 'orientation' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {(field.options || []).map((opt) => (
                                <div key={opt.id} className="relative flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 border-blue-600 bg-blue-50 text-blue-700 shadow-sm transition-all font-extrabold text-[13px]">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOption(sec.id, field.id, opt.id)}
                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 border-none bg-transparent cursor-pointer transition"
                                    title="Delete Option"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>

                                  <div className="w-10 h-7 rounded-lg border-2 border-blue-500 bg-blue-100 flex items-center justify-center">
                                    {opt.value.toLowerCase().includes('portrait') || opt.label.toLowerCase().includes('portrait') ? (
                                      <AlignCenter className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <AlignJustify className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>

                                  <input
                                    type="text"
                                    value={opt.label || ''}
                                    onChange={(e) => updateOption(sec.id, field.id, opt.id, { label: e.target.value, value: e.target.value })}
                                    placeholder="e.g. Landscape"
                                    className="w-full text-center p-1 rounded-md border border-blue-200 font-extrabold text-blue-800 text-[12px] bg-white focus:outline-none focus:border-blue-500"
                                  />
                                  <div className="flex items-center gap-1 w-full relative">
                                    <span className="absolute left-1 top-1.5 text-[10px] font-bold text-slate-400">₹</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={opt.priceModifier !== undefined ? opt.priceModifier : 0}
                                      onChange={(e) => updateOption(sec.id, field.id, opt.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                                      placeholder="+ Price"
                                      className="w-full pl-4 pr-1 py-1 rounded-md border border-blue-200 font-bold text-blue-800 text-[12px] bg-white focus:outline-none focus:border-blue-500 text-center"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {(field.options || []).map((opt, oIdx) => (
                                <div key={opt.id || oIdx} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                                  <span className="text-[11px] font-bold text-slate-400 w-5 shrink-0 text-center">
                                    {oIdx + 1}.
                                  </span>
                                  <input
                                    type="text"
                                    value={opt.label || ''}
                                    onChange={(e) => updateOption(sec.id, field.id, opt.id, { label: e.target.value, value: e.target.value })}
                                    placeholder="Option Label (e.g. Black and White)"
                                    className="flex-1 p-1.5 rounded-lg border border-slate-200 font-bold text-slate-800 text-[13px] bg-white focus:outline-none focus:border-blue-500"
                                  />
                                  <div className="relative w-28 shrink-0">
                                    <span className="absolute left-2 top-1.5 text-[11px] font-bold text-slate-400">₹</span>
                                    <input
                                      type="number"
                                      step="0.5"
                                      value={opt.priceModifier !== undefined ? opt.priceModifier : 0}
                                      onChange={(e) => updateOption(sec.id, field.id, opt.id, { priceModifier: parseFloat(e.target.value) || 0 })}
                                      placeholder="+ Price"
                                      className="w-full pl-5 pr-2 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-800 text-[12.5px] bg-white focus:outline-none focus:border-blue-500 text-right"
                                      title="Price adjustment (+/- ₹)"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteOption(sec.id, field.id, opt.id)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer transition"
                                    title="Delete Option (✕)"
                                  >
                                    <X className="w-3.5 h-3.5 text-slate-400 hover:text-red-600" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}

                {/* ADD FIELD BUTTON AT BOTTOM OF SECTION */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleAddField(sec.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold text-[13px] border border-blue-200 shadow-3xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                  >
                    <Plus className="w-4 h-4 text-blue-600" /> + Add Field to "{sec.title || 'Section'}"
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
