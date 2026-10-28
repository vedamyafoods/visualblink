import React from 'react';
import { Sliders } from 'lucide-react';

export const FormSectionCustomizerToolbar = ({ formData, setFormData }) => {
  const isBackDesignEnabled = Boolean(formData.enableBackDesignUpload);

  return (
    <div className="bg-gradient-to-r from-blue-900 via-[#07152F] to-slate-900 p-4 sm:p-5 rounded-2xl text-white shadow-md space-y-3 relative z-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-400" />
          <h4 className="font-bold text-sm uppercase tracking-wider text-white">
            Form Section Customizer & Enabled Modules
          </h4>
        </div>
        <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
          Module Settings
        </span>
      </div>

      <div className="pt-2 border-t border-blue-800/80 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-slate-300 font-medium max-w-xl">
          Toggle back design artwork upload for products that support 2-sided custom printing.
        </p>

        <button
          type="button"
          onClick={() => setFormData(prev => ({ ...prev, enableBackDesignUpload: !prev.enableBackDesignUpload }))}
          className={`px-4 py-2 rounded-xl border text-[13px] font-bold flex items-center gap-2.5 cursor-pointer transition shadow-xs ${isBackDesignEnabled
            ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-500/30'
            : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
        >
          <span className="text-base">🖼️</span>
          <span>Back Design Upload</span>
          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${isBackDesignEnabled ? 'bg-blue-800 text-white' : 'bg-slate-700 text-slate-400'}`}>
            {isBackDesignEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
    </div>
  );
};

