import React, { useState } from 'react';
import { X, Plus, Printer, CheckCircle2, User, Phone, DollarSign } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const WalkInOrderModal = () => {
  const { walkInModalOpen, setWalkInModalOpen, addWalkInOrder, products } = useAdmin();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(products[0]?.title || 'Soft-Touch Matte Business Cards');
  const [quantity, setQuantity] = useState(500);
  const [unitPrice, setUnitPrice] = useState(4.8);
  const [isExpress, setIsExpress] = useState(false);

  if (!walkInModalOpen) return null;

  const subtotal = quantity * unitPrice;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalAmount = subtotal + gstAmount;

  const handleSubmit = (e) => {
    e.preventDefault();
    addWalkInOrder({
      customer: {
        name: customerName || 'Walk-In Customer',
        phone: phone || '+91 99000 00000',
        company: company || 'Over-the-Counter',
      },
      items: [
        {
          productName: selectedProduct,
          variant: 'Standard Counter Walk-In Spec',
          quantity,
          unitPrice,
          total: subtotal,
        }
      ],
      subtotal,
      gstAmount,
      totalAmount,
      deliveryMethod: 'Over-the-Counter Pickup',
      isExpress,
    });
    setWalkInModalOpen(false);
    alert('Walk-in order created successfully & queued in pipeline!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        <div className="p-4 border-b border-slate-200/80 bg-white text-slate-950 flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2 text-slate-900">
            <Plus className="w-4 h-4 text-blue-600" /> Create Walk-In Counter Print Order
          </h3>
          <button onClick={() => setWalkInModalOpen(false)} className="text-slate-450 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-50 transition-colors border-none bg-transparent cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-[14px]">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Customer Full Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Anish Kumar"
              className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mobile Phone</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98450 00000"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company (Optional)</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company Ltd"
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Print SKU</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
            >
              {products.map(p => (
                <option key={p.id} value={p.title}>{p.title} (Base ₹{p.basePrice})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Unit Price (₹)</label>
              <input
                type="number"
                step="0.1"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1 font-bold text-red-600">
            <input
              type="checkbox"
              checked={isExpress}
              onChange={(e) => setIsExpress(e.target.checked)}
              className="accent-red-600 rounded"
            />
            <span>Mark as Same-Day Express Rush Dispatch</span>
          </label>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 font-mono text-[14px]">
            <div className="flex justify-between"><span>Subtotal:</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>18% GST:</span><span>₹{gstAmount.toLocaleString()}</span></div>
            <div className="flex justify-between font-extrabold text-slate-900 text-[14px] pt-1 border-t">
              <span>Total Payable:</span><span>₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setWalkInModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md"
            >
              Submit Walk-in Order
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
