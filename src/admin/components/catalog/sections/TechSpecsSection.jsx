import React, { useState } from 'react';
import { Trash2, Plus, ArrowUp, ArrowDown, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react';

export const DEFAULT_DESIGN_GUIDELINES = [
  "Submit files in CMYK. Printed colors may vary slightly from screen colors.",
  "Add 3 mm bleed on all sides. Keep text and logos at least 3–5 mm inside the trim edge.",
  "Convert fonts to curves/outlines and embed all images.",
  "For CorelDRAW files, provide a .CDR file and print-ready PDF.",
  "Use high-resolution images (300 DPI recommended).",
  "Check all text, logos, QR codes, details, and alignment. Artwork will be printed exactly as submitted.",
  "AI-generated images are not guaranteed to be error-free. Please review and approve the artwork before printing.",
  "Printing and cutting may have slight color or alignment variations."
];

export const TechSpecsSection = ({
  formData,
  setFormData
}) => {
  const [newGuideline, setNewGuideline] = useState('');

  const guidelines = Array.isArray(formData.designGuidelines) && formData.designGuidelines.length > 0
    ? formData.designGuidelines
    : DEFAULT_DESIGN_GUIDELINES;

  const updateGuidelines = (newList) => {
    setFormData(prev => ({
      ...prev,
      designGuidelines: newList
    }));
  };

  const handleAdd = () => {
    if (!newGuideline.trim()) return;
    updateGuidelines([...guidelines, newGuideline.trim()]);
    setNewGuideline('');
  };

  const handleUpdate = (index, value) => {
    const updated = [...guidelines];
    updated[index] = value;
    updateGuidelines(updated);
  };

  const handleRemove = (index) => {
    const updated = guidelines.filter((_, i) => i !== index);
    updateGuidelines(updated);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...guidelines];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    updateGuidelines(updated);
  };

  const handleMoveDown = (index) => {
    if (index === guidelines.length - 1) return;
    const updated = [...guidelines];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    updateGuidelines(updated);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset guidelines to standard default instructions?')) {
      updateGuidelines([...DEFAULT_DESIGN_GUIDELINES]);
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-bold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <span>Design Guidelines (Storefront Preflight Rules)</span>
          </h4>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            These bullet points replace static technical specs and show inside the "Design Guidelines" accordion on the product page.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer border-none transition"
            title="Reset to recommended standard preflight checklist"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Load Default Guidelines</span>
          </button>
          <span className="text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">
            {guidelines.length} Points
          </span>
        </div>
      </div>

      {/* Guidelines List */}
      <div className="space-y-2.5">
        {guidelines.map((item, idx) => (
          <div
            key={idx}
            className="group flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90 hover:border-blue-300 transition-all"
          >
            {/* Number Pill */}
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0 mt-1">
              {idx + 1}
            </span>

            {/* Editable Content */}
            <textarea
              rows={2}
              value={item}
              onChange={(e) => handleUpdate(idx, e.target.value)}
              className="flex-1 p-2 rounded-lg bg-white border border-slate-200 text-[13px] font-medium text-slate-800 focus:outline-none focus:border-blue-500 leading-relaxed resize-y"
              placeholder={`Guideline #${idx + 1}...`}
            />

            {/* Reorder and Delete Controls */}
            <div className="flex items-center gap-1 shrink-0 mt-1">
              <button
                type="button"
                onClick={() => handleMoveUp(idx)}
                disabled={idx === 0}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 border-none bg-transparent cursor-pointer transition"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(idx)}
                disabled={idx === guidelines.length - 1}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 disabled:opacity-30 border-none bg-transparent cursor-pointer transition"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50 border-none bg-transparent cursor-pointer transition ml-1"
                title="Delete this guideline"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Guideline Box */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-3 border-t border-dashed border-slate-200 bg-blue-50/40 p-3 rounded-xl">
        <input
          type="text"
          value={newGuideline}
          onChange={(e) => setNewGuideline(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="Type new guideline point and press Enter or click Add..."
          className="w-full sm:flex-1 p-2.5 rounded-xl border border-slate-300 font-medium text-[13px] focus:outline-none focus:border-blue-500 bg-white text-slate-900"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] cursor-pointer border-none shadow-3xs flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Guideline
        </button>
      </div>
    </div>
  );
};

export const DesignGuidelinesSection = TechSpecsSection;
