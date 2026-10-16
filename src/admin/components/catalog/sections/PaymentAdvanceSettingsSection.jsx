import React, { useState } from 'react';
import {
  CreditCard,
  Percent,
  DollarSign,
  ShieldCheck,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calculator
} from 'lucide-react';

export const PaymentAdvanceSettingsSection = ({ formData, setFormData }) => {
  const policy = formData.paymentPolicy || {
    type: 'percentage',
    percentage: 50,
    fixedAmount: 0,
    minAdvance: 0,
    maxAdvance: 0
  };

  const taxRate = formData.taxRate !== undefined ? formData.taxRate : 18;
  const taxInclusive = formData.taxInclusive !== undefined ? formData.taxInclusive : true;
  const hsnCode = formData.hsnCode || '4911';

  // Sample order simulation state for live preview
  const [sampleOrderTotal, setSampleOrderTotal] = useState(10000);

  const handlePolicyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      paymentPolicy: {
        ...(prev.paymentPolicy || {
          type: 'percentage',
          percentage: 50,
          fixedAmount: 0,
          minAdvance: 0,
          maxAdvance: 0
        }),
        [field]: value
      }
    }));
  };

  const handleTaxChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Compute live advance preview for sample order
  const computeSampleAdvance = () => {
    const total = Math.max(0, Number(sampleOrderTotal) || 0);
    if (policy.type === 'percentage') {
      const pct = Math.max(0, Math.min(100, Number(policy.percentage) || 50));
      return Math.round((total * pct) / 100);
    }
    if (policy.type === 'fixed') {
      const fixed = Math.max(0, Number(policy.fixedAmount) || 0);
      return Math.min(fixed, total);
    }
    if (policy.type === 'hybrid') {
      const pct = Math.max(0, Math.min(100, Number(policy.percentage) || 50));
      let calc = Math.round((total * pct) / 100);
      if (policy.minAdvance > 0) calc = Math.max(calc, Number(policy.minAdvance));
      if (policy.maxAdvance > 0) calc = Math.min(calc, Number(policy.maxAdvance));
      return Math.min(calc, total);
    }
    return Math.round(total / 2);
  };

  const sampleAdvance = computeSampleAdvance();
  const sampleRemaining = Math.max(0, sampleOrderTotal - sampleAdvance);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/70 p-5 rounded-2xl border border-purple-200/80 shadow-3xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5 mb-1">
            <CreditCard className="w-4 h-4 text-purple-600" /> Cashfree Advance & Installment Policy
          </span>
          <h4 className="font-bold text-slate-900 text-base tracking-tight">
            Product Payment & Advance Collection Settings
          </h4>
          <p className="text-[13px] text-slate-600 mt-0.5 max-w-xl font-medium">
            Configure how much upfront advance customers pay online via Cashfree for this product, and specify its GST taxation rules.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-3xs shrink-0">
          <span className="text-[11px] font-bold text-purple-900">Current Policy:</span>
          <strong className="text-xs font-bold uppercase text-purple-700">
            {policy.type === 'percentage' ? `${policy.percentage || 50}% Advance` : (policy.type === 'fixed' ? `₹${(policy.fixedAmount || 0).toLocaleString()} Fixed` : 'Hybrid Rule')}
          </strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN: POLICY BUILDER (2 COLS) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Policy Type Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <label className="block text-sm font-bold text-slate-900">
              Select Advance Collection Policy Type:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option 1: Percentage */}
              <button
                type="button"
                onClick={() => handlePolicyChange('type', 'percentage')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-3 ${policy.type === 'percentage'
                  ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-600/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Percent className="w-4 h-4" />
                  </div>
                  {policy.type === 'percentage' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <div>
                  <strong className="text-[13.5px] font-bold text-slate-900 block">Percentage Based</strong>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug block mt-0.5">
                    Customer pays a percentage (e.g. 20%, 30%, 50%) of order total upfront.
                  </span>
                </div>
              </button>

              {/* Option 2: Fixed Amount */}
              <button
                type="button"
                onClick={() => handlePolicyChange('type', 'fixed')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-3 ${policy.type === 'fixed'
                  ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-600/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  {policy.type === 'fixed' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <div>
                  <strong className="text-[13.5px] font-bold text-slate-900 block">Fixed Amount</strong>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug block mt-0.5">
                    Customer pays a fixed monetary amount (e.g. ₹5,000) capped at total.
                  </span>
                </div>
              </button>

              {/* Option 3: Hybrid Policy */}
              <button
                type="button"
                onClick={() => handlePolicyChange('type', 'hybrid')}
                className={`p-4 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between gap-3 ${policy.type === 'hybrid'
                  ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-600/20'
                  : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  {policy.type === 'hybrid' && <CheckCircle2 className="w-4 h-4 text-purple-600" />}
                </div>
                <div>
                  <strong className="text-[13.5px] font-bold text-slate-900 block">Hybrid Rule</strong>
                  <span className="text-[11px] text-slate-500 font-medium leading-snug block mt-0.5">
                    Percentage advance with minimum and maximum capping thresholds.
                  </span>
                </div>
              </button>
            </div>

            {/* Dynamic Inputs Based on Selected Policy */}
            <div className="pt-4 border-t border-slate-100">

              {/* 1. Percentage Configuration */}
              {policy.type === 'percentage' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5">
                      Advance Percentage:
                      <Info className="w-3.5 h-3.5 text-slate-400" />
                    </label>
                    <span className="text-[12px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                      Customer pays {policy.percentage || 50}% online
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={policy.percentage !== undefined ? policy.percentage : 50}
                        onChange={(e) => {
                          const val = Math.max(1, Math.min(100, parseFloat(e.target.value) || 0));
                          handlePolicyChange('percentage', val);
                        }}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-[14px] focus:outline-none focus:border-purple-600 bg-white"
                        placeholder="50"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-sm">%</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {[20, 30, 40, 50, 100].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => handlePolicyChange('percentage', pct)}
                          className={`px-2.5 py-2 rounded-lg font-bold text-[12px] border cursor-pointer transition ${policy.percentage === pct
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[12px] text-slate-500 font-medium">
                    Recommended: <strong>30% - 50%</strong> for custom print products. Set to <strong>100%</strong> for full upfront payment.
                  </p>
                </div>
              )}

              {/* 2. Fixed Amount Configuration */}
              {policy.type === 'fixed' && (
                <div className="space-y-3">
                  <label className="text-[13px] font-bold text-slate-700 block">
                    Fixed Advance Amount (₹):
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                    <input
                      type="number"
                      min="1"
                      step="50"
                      value={policy.fixedAmount || ''}
                      onChange={(e) => handlePolicyChange('fixedAmount', Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-[14px] focus:outline-none focus:border-purple-600 bg-white"
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <p className="text-[12px] text-slate-500 font-medium">
                    Note: If total order value is less than the fixed advance amount, customer is only charged up to the actual order total (never exceeds total).
                  </p>
                </div>
              )}

              {/* 3. Hybrid Policy Configuration */}
              {policy.type === 'hybrid' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[13px] font-bold text-slate-700 block mb-1">
                      Target Percentage (%):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={policy.percentage || 20}
                        onChange={(e) => handlePolicyChange('percentage', Math.max(1, Math.min(100, parseFloat(e.target.value) || 0)))}
                        className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 text-[14px] focus:outline-none focus:border-purple-600 bg-white"
                        placeholder="20"
                      />
                      <span className="absolute right-3 top-2.5 font-bold text-slate-400 text-sm">%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[12px] font-bold text-slate-700 block mb-1">
                        Minimum Advance Floor (₹):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 font-bold text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={policy.minAdvance || ''}
                          onChange={(e) => handlePolicyChange('minAdvance', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-[13px] focus:outline-none focus:border-purple-600 bg-white"
                          placeholder="e.g. 5000"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Will never collect less than this floor</span>
                    </div>

                    <div>
                      <label className="text-[12px] font-bold text-slate-700 block mb-1">
                        Maximum Advance Ceiling (₹):
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 font-bold text-slate-400 text-xs">₹</span>
                        <input
                          type="number"
                          min="0"
                          value={policy.maxAdvance || ''}
                          onChange={(e) => handlePolicyChange('maxAdvance', Math.max(0, parseFloat(e.target.value) || 0))}
                          className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-[13px] focus:outline-none focus:border-purple-600 bg-white"
                          placeholder="e.g. 25000"
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Leave blank or 0 for no upper cap</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Tax Classification & GST Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> GST Tax Classification & Pricing Treatment
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[13px]">
              <div>
                <label className="block font-bold text-slate-700 mb-1">GST Tax Rate (%):</label>
                <select
                  value={taxRate}
                  onChange={(e) => handleTaxChange('taxRate', parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-purple-600 bg-white cursor-pointer"
                >
                  <option value={18}>18% (Standard Print GST)</option>
                  <option value={12}>12% (Books & Periodicals)</option>
                  <option value={5}>5% (Basic Print Materials)</option>
                  <option value={28}>28% (Luxury Surcharge Items)</option>
                  <option value={0}>0% (Tax Exempt)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pricing Mode:</label>
                <select
                  value={taxInclusive ? 'inclusive' : 'exclusive'}
                  onChange={(e) => handleTaxChange('taxInclusive', e.target.value === 'inclusive')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-purple-600 bg-white cursor-pointer"
                >
                  <option value="inclusive">GST Inclusive (MRP includes tax)</option>
                  <option value="exclusive">GST Exclusive (Tax added at checkout)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">HSN / SAC Code:</label>
                <input
                  type="text"
                  value={hsnCode}
                  onChange={(e) => handleTaxChange('hsnCode', e.target.value)}
                  placeholder="e.g. 4911"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 focus:outline-none focus:border-purple-600 bg-white"
                />
              </div>
            </div>
            <p className="text-[11.5px] text-slate-500 font-medium">
              Tax is calculated with integer paise precision and automatically partitioned into CGST (9%) + SGST (9%) for Karnataka buyers or IGST (18%) for inter-state deliveries.
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: LIVE SIMULATOR & POLICY SNAPSHOT (1 COL) */}
        <div className="space-y-4">
          <div className="bg-[#eff6ff] rounded-2xl p-5 border border-blue-200/80 shadow-3xs space-y-4 text-slate-900">
            <div className="flex items-center gap-2 border-b border-blue-200 pb-3">
              <Calculator className="w-4 h-4 text-blue-600" />
              <h5 className="font-bold text-sm text-blue-950">Live Policy Simulator</h5>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Test Sample Order Value (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 font-bold text-slate-400 text-xs">₹</span>
                <input
                  type="number"
                  step="500"
                  value={sampleOrderTotal}
                  onChange={(e) => setSampleOrderTotal(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full pl-7 pr-3 py-2 rounded-xl border border-blue-300 font-bold text-slate-900 text-sm focus:outline-none focus:border-blue-600 bg-white"
                />
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-blue-100 space-y-2 text-[13px]">
              <div className="flex justify-between items-center text-slate-600">
                <span>Sample Cart Total:</span>
                <strong className="text-slate-900">₹{sampleOrderTotal.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between items-center text-purple-700 font-bold pt-2 border-t border-slate-100">
                <span>Advance Due Online:</span>
                <span className="text-base text-purple-600">₹{sampleAdvance.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-slate-600">
                <span>Balance on Dispatch:</span>
                <strong className="text-slate-800">₹{sampleRemaining.toLocaleString()}</strong>
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Effective Advance %:</span>
                <span className="font-bold font-mono">
                  {sampleOrderTotal > 0 ? Math.round((sampleAdvance / sampleOrderTotal) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-100/60 rounded-xl border border-blue-200 text-[11px] text-blue-900 leading-relaxed font-medium">
              💡 <strong>Storefront Guarantee:</strong> When an order is placed, an immutable snapshot of this policy is recorded. Any future changes to this product will not alter existing customer installment schedules.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
