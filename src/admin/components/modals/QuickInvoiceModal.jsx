import React, { useState } from 'react';
import { X, Printer, FileText, Send, Building2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const QuickInvoiceModal = () => {
  const { quickInvoiceModalOpen, setQuickInvoiceModalOpen } = useAdmin();

  const [b2bCompany, setB2bCompany] = useState('Nexus Design Labs');
  const [gstin, setGstin] = useState('29AAFCN8839M1Z5');
  const [amount, setAmount] = useState(25000);

  if (!quickInvoiceModalOpen) return null;

  const gstTax = Math.round(amount * 0.18);
  const total = amount + gstTax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-4 border-b border-slate-200/80 bg-white text-slate-950 flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
            <FileText className="w-4 h-4 text-blue-600" /> B2B GST Tax Invoice Generator
          </h3>
          <button onClick={() => setQuickInvoiceModalOpen(false)} className="text-slate-450 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-[14px]">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Company Name</label>
            <input
              type="text"
              value={b2bCompany}
              onChange={(e) => setB2bCompany(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">GSTIN Registration Number</label>
            <input
              type="text"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-mono font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Net Invoice Subtotal (₹)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Tax Breakdown Preview */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 font-mono text-[14px]">
            <div className="flex justify-between"><span>Base Taxable Amount:</span><span>₹{amount.toLocaleString()}</span></div>
            <div className="flex justify-between text-blue-600"><span>18% GST (CGST 9% + SGST 9%):</span><span>₹{gstTax.toLocaleString()}</span></div>
            <div className="flex justify-between font-extrabold text-slate-900 text-[14px] pt-2 border-t">
              <span>Gross Invoice Total:</span><span>₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setQuickInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-600"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4 text-sky-400" /> Print Formal GST Invoice
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
