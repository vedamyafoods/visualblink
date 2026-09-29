import React from 'react';
import { DollarSign, Plus, Trash2 } from 'lucide-react';

export const TieredPricingSection = ({ formData, setFormData }) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-3xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h4 className="font-extrabold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Volume Quantity Discount Matrix
            </h4>
            <p className="text-[13px] text-slate-500 mt-0.5">Automatically calculates tiered discounts based on order quantity threshold</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const currentTiers = formData.tieredPricing || [];
              const lastMin = currentTiers.length > 0 ? currentTiers[currentTiers.length - 1].tierMin + 500 : 500;
              const lastPrice = currentTiers.length > 0 ? Math.max(currentTiers[currentTiers.length - 1].pricePerUnit - 0.5, 1) : 4.0;
              setFormData({
                ...formData,
                tieredPricing: [...currentTiers, { tierMin: lastMin, pricePerUnit: lastPrice }]
              });
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-[13px] flex items-center gap-1.5 border border-blue-200 cursor-pointer shadow-3xs"
          >
            <Plus className="w-3.5 h-3.5" /> Add Tier Rule
          </button>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-3 px-3 py-2 bg-slate-100/70 rounded-xl text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
            <span className="col-span-5">Minimum Quantity (pcs)</span>
            <span className="col-span-5">Price Per Unit (₹)</span>
            <span className="col-span-2 text-right">Action</span>
          </div>

          {(formData.tieredPricing || []).map((tier, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-center p-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition">
              <div className="col-span-5">
                <input
                  type="number"
                  min="1"
                  value={tier.tierMin}
                  onChange={(e) => {
                    const newTiers = [...formData.tieredPricing];
                    newTiers[idx].tierMin = parseInt(e.target.value) || 1;
                    setFormData({ ...formData, tieredPricing: newTiers });
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-[14px] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-5">
                <input
                  type="number"
                  step="0.01"
                  value={tier.pricePerUnit}
                  onChange={(e) => {
                    const newTiers = [...formData.tieredPricing];
                    newTiers[idx].pricePerUnit = parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, tieredPricing: newTiers });
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-bold text-slate-900 text-[14px] focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="col-span-2 text-right">
                <button
                  type="button"
                  onClick={() => {
                    const newTiers = formData.tieredPricing.filter((_, i) => i !== idx);
                    setFormData({ ...formData, tieredPricing: newTiers });
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition border-none bg-transparent cursor-pointer"
                  title="Delete Tier"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
