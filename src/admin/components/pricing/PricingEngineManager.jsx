import React from 'react';
import { 
  Calculator, 
  Percent, 
  Zap, 
  Save, 
  ShieldCheck, 
  DollarSign,
  Plus,
  Trash2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const PricingEngineManager = () => {
  const { pricingRules, setPricingRules } = useAdmin();

  const handleSave = () => {
    alert("Dynamic pricing engine settings updated live across storefront & backoffice calculation systems!");
  };

  const addDiscountRule = () => {
    setPricingRules(prev => ({
      ...prev,
      volumeDiscounts: [
        ...prev.volumeDiscounts,
        { threshold: 250000, discountPercent: 15 }
      ]
    }));
  };

  const removeDiscountRule = (index) => {
    setPricingRules(prev => ({
      ...prev,
      volumeDiscounts: prev.volumeDiscounts.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-50/60 via-white to-slate-50 rounded-2xl p-6 text-slate-800 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider text-blue-600 mb-1">
            <Calculator className="w-4 h-4 text-blue-600" /> Taxation & Surcharge Architecture
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Dynamic Pricing Engine & Bulk Discount Matrix
          </h2>
          <p className="text-[14px] text-slate-500 mt-1 max-w-xl font-medium">
            Configure global GST tax defaults, express rush fees, volume threshold rules, and automated invoice calculation logic.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all border-none cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Pricing Engine Rules
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* GST Settings Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Global GST Config (India Tax)
          </div>

          <div className="space-y-3 text-[14px]">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Goods & Services Tax Rate (%)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={pricingRules.globalGstPercent}
                  onChange={(e) => setPricingRules({ ...pricingRules, globalGstPercent: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
                <span className="font-extrabold text-slate-500">% GST</span>
              </div>
              <p className="text-[14px] text-slate-500 mt-1">Applied automatically to subtotal as IGST (18%) or CGST+SGST (9%+9%).</p>
            </div>
          </div>
        </div>

        {/* Rush Fee Modifier Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm border-b border-slate-100 pb-3">
            <Zap className="w-4 h-4 text-red-600 fill-red-500" /> Rush Fee Printing Modifiers
          </div>

          <div className="space-y-3 text-[14px]">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Same-Day Express Surcharge Multiplier</label>
              <input
                type="number"
                step="0.05"
                value={pricingRules.expressSameDayMultiplier}
                onChange={(e) => setPricingRules({ ...pricingRules, expressSameDayMultiplier: parseFloat(e.target.value) || 1.0 })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-red-600 focus:outline-none focus:border-red-500"
              />
              <p className="text-[14px] text-slate-500 mt-1">Multiplier 1.35 adds +35% express priority printing surcharge.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">24-Hour Express Surcharge Multiplier</label>
              <input
                type="number"
                step="0.05"
                value={pricingRules.express24HrMultiplier}
                onChange={(e) => setPricingRules({ ...pricingRules, express24HrMultiplier: parseFloat(e.target.value) || 1.0 })}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-amber-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Volume Discount Rules Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
              <Percent className="w-4 h-4 text-blue-600" /> Volume Discount Builder
            </div>
            <button 
              onClick={addDiscountRule}
              className="p-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[14px] font-bold"
              title="Add Threshold Rule"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 text-[14px]">
            {pricingRules.volumeDiscounts.map((rule, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-800">Cart Total &gt; ₹{rule.threshold.toLocaleString()}</span>
                  <p className="text-[10px] text-emerald-600 font-bold">{rule.discountPercent}% Instant Discount</p>
                </div>
                <button
                  onClick={() => removeDiscountRule(idx)}
                  className="p-1 rounded text-slate-400 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
