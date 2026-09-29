import React from 'react';
import { FiPrinter, FiX, FiDownload, FiCheckCircle } from 'react-icons/fi';

export function InvoiceModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const subtotal = order.subtotal || order.pricing?.subtotal || 0;
  const shipping = order.shippingFee !== undefined ? order.shippingFee : (order.pricing?.shippingFee || 0);
  const gstAmount = order.gstAmount !== undefined ? order.gstAmount : (order.pricing?.gstAmount || 0);
  const totalAmount = order.totalAmount || order.pricing?.grandTotal || 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Controls Bar (Hidden during print) */}
        <div className="bg-[#07152F] text-white p-4 sm:p-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base">Tax Invoice</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[14px] border border-emerald-400/30">
              #{order.orderId || order.id}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] flex items-center gap-1.5 transition cursor-pointer border-none shadow-md"
            >
              <FiPrinter className="w-4 h-4" /> Print / Download PDF
            </button>

            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer border-none">
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Canvas Body */}
        <div id="printable-invoice" className="p-8 sm:p-10 space-y-8 bg-white text-slate-900 font-sans text-[14px]">
          
          {/* Top Header & Logo */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-8 h-8 rounded-xl bg-[#FF5A1F] text-white font-black flex items-center justify-center text-base">P</span>
                <span className="text-xl font-black tracking-tight text-[#07152F]">PRINTIGLY</span>
              </div>
              <p className="text-slate-500 text-[14px]">Enterprise Printing & Packaging Studio</p>
              <p className="text-slate-500 text-[14px]">GSTIN: 29ABCDE1234F1Z5 • Pan-India Logistics Hub</p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-black text-[#07152F] uppercase tracking-wider">TAX INVOICE</h2>
              <p className="font-mono text-[14px] text-slate-700">Invoice #: <strong>INV-{order.orderId || order.id}</strong></p>
              <p className="text-slate-500">Date: {invoiceDate}</p>
              <p className="text-slate-500">Payment Status: <strong className="uppercase text-emerald-700">{order.paymentStatus || 'PAID'}</strong></p>
            </div>
          </div>

          {/* Customer & Shipping Addresses */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Billed To:</span>
              <strong className="text-sm font-extrabold text-slate-900 block">{order.customer?.name || 'Valued Customer'}</strong>
              {order.customer?.company && <p className="text-slate-700 font-semibold">{order.customer.company}</p>}
              {order.customer?.gstin && <p className="font-mono text-[14px] text-slate-600">GSTIN: {order.customer.gstin}</p>}
              <p className="text-slate-600 mt-1">{order.customer?.email}</p>
              <p className="text-slate-600">{order.customer?.phone}</p>
            </div>

            <div>
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">Shipping Address:</span>
              <p className="text-slate-800 font-medium leading-relaxed">
                {order.deliveryAddress || order.shippingAddress?.fullAddress || 'Standard Shipping Address'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 text-[10.5px] font-black uppercase text-slate-500">
                  <th className="py-2">Item Description & Specifications</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(order.items || []).map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-3">
                      <strong className="font-bold text-slate-900 block text-[14px]">{item.productName || item.name}</strong>
                      <span className="text-[14px] text-slate-500 font-medium block">{item.variant}</span>
                    </td>
                    <td className="py-3 text-center font-extrabold">{item.quantity || item.qty}</td>
                    <td className="py-3 text-right">₹{(item.unitPrice || 0).toLocaleString()}</td>
                    <td className="py-3 text-right font-extrabold text-slate-900">
                      ₹{(item.totalPrice || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tax Breakdown & Grand Total */}
          <div className="flex justify-end pt-4 border-t border-slate-200">
            <div className="w-64 space-y-2 text-[14px] font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-extrabold text-slate-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping & Delivery:</span>
                <span className="font-extrabold text-slate-900">{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {gstAmount > 0 ? (
                <div className="flex justify-between">
                  <span>GST Tax:</span>
                  <span className="font-extrabold text-slate-900">₹{gstAmount.toLocaleString()}</span>
                </div>
              ) : (
                <div className="flex justify-between text-slate-500">
                  <span>Taxes:</span>
                  <span className="font-bold">GST Inclusive</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-[#FF5A1F]">
                <span>Grand Total:</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="pt-8 border-t border-slate-200 text-center text-slate-400 text-[10px] font-medium">
            <p>This is a computer-generated tax invoice issued by Printigly Technologies.</p>
            <p>Thank you for choosing Printigly for your business print production!</p>
          </div>

        </div>

      </div>
    </div>
  );
}
