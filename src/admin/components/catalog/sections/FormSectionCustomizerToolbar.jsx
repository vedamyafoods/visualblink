import React from 'react';
import { Sliders } from 'lucide-react';

export const FormSectionCustomizerToolbar = ({ formData, setFormData }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900 via-[#07152F] to-slate-900 p-5 rounded-2xl text-white shadow-md space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
            Form Section Customizer & Enabled Modules
          </h4>
        </div>
        <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
          Customize Form Blocks per Product
        </span>
      </div>
      <p className="text-[12px] text-slate-300 font-medium">
        Toggle ON or OFF any section below to show/hide fields in this form and on the storefront. Keep the form clean and simple for every product type.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-2 border-t border-blue-800/80">
        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableOrientation: !formData.enableOrientation })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableOrientation !== false
              ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>📐 Orientation</span>
          <span className="text-[10px] font-black">{formData.enableOrientation !== false ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enablePaperSizes: !formData.enablePaperSizes })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enablePaperSizes !== false
              ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>📄 Paper Sizes Badges</span>
          <span className="text-[10px] font-black">{formData.enablePaperSizes !== false ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableTechSpecs: !formData.enableTechSpecs })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableTechSpecs !== false
              ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>⚙️ Technical Specs</span>
          <span className="text-[10px] font-black">{formData.enableTechSpecs !== false ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableNcrEngine: !formData.enableNcrEngine })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableNcrEngine
              ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>📑 NCR Bill Book Engine</span>
          <span className="text-[10px] font-black">{formData.enableNcrEngine ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableVisitingCardEngine: !formData.enableVisitingCardEngine })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableVisitingCardEngine
              ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>🎴 Visiting Card Masks</span>
          <span className="text-[10px] font-black">{formData.enableVisitingCardEngine ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableBrochureEngine: !formData.enableBrochureEngine })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableBrochureEngine
              ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>📖 Brochure Folds</span>
          <span className="text-[10px] font-black">{formData.enableBrochureEngine ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableStickerEngine: !formData.enableStickerEngine })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableStickerEngine
              ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>🏷️ Sticker White Ink</span>
          <span className="text-[10px] font-black">{formData.enableStickerEngine ? 'ON' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => setFormData({ ...formData, enableCustomArea: !formData.enableCustomArea })}
          className={`p-2.5 rounded-xl border text-[12px] font-bold flex items-center justify-between cursor-pointer transition ${
            formData.enableCustomArea
              ? 'bg-orange-600 text-white border-orange-400 shadow-xs'
              : 'bg-slate-800/80 text-slate-400 border-slate-700'
          }`}
        >
          <span>📐 Area Calc (Sq.Ft)</span>
          <span className="text-[10px] font-black">{formData.enableCustomArea ? 'ON' : 'OFF'}</span>
        </button>
      </div>
    </div>
  );
};
