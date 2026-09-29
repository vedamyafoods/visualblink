import React, { useEffect, useState } from 'react';
import { 
  FiCheckCircle, 
  FiPackage, 
  FiTruck, 
  FiArrowRight, 
  FiShoppingBag, 
  FiClock,
  FiFileText,
  FiShield,
  FiMail
} from 'react-icons/fi';
import { subscribeToOrderById } from '../services/firebase';

export function OrderSuccessPage({ setCurrentPage }) {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const orderId = getSearchParams().get('orderId') || 'PRT-100000';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      const unsubscribe = subscribeToOrderById(orderId, (fetchedOrder) => {
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        }
        setLoading(false);
      });
      return () => unsubscribe && unsubscribe();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  // Estimated delivery calculation (3-5 business days or express)
  const isExpress = order?.isExpress;
  const deliveryDays = isExpress ? '24-48 Hours Express' : '3-5 Business Days';
  const expectedDate = new Date(Date.now() + (isExpress ? 2 : 4) * 24 * 3600 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">
      
      {/* Top Banner Header */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 border-2 border-white/30">
            <FiCheckCircle className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Order Confirmed 🎉
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Your print order <strong className="text-emerald-400 font-mono">#{orderId}</strong> has been created and transmitted directly into our live production pipeline!
          </p>
        </div>
      </section>

      {/* Confirmation Details Container */}
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        
        {/* Order Details Summary Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7EAF0] shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-[14px] text-slate-400 font-bold uppercase tracking-wider block">Order Reference</span>
              <h3 className="text-2xl font-black text-[#0B1633]">{orderId}</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-[14px] border border-emerald-200">
                ● {order?.status || 'Payment Confirmed'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-[14px] border border-blue-200">
                Payment: {order?.payment?.method === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
              </span>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px] font-semibold text-slate-700">
            <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Amount</span>
              <strong className="text-xl font-black text-[#FF5A1F]">₹{(order?.totalAmount || order?.pricing?.grandTotal || 0).toLocaleString()}</strong>
            </div>

            <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Est. Delivery Date</span>
              <strong className="text-sm font-extrabold text-slate-900 block">{expectedDate}</strong>
              <span className="text-[10px] text-emerald-700 font-bold">{deliveryDays}</span>
            </div>

            <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Artwork Received</span>
              <strong className="text-sm font-extrabold text-slate-900 block">
                {order?.artwork ? order.artwork.length : (order?.items ? order.items.length : 1)} File(s)
              </strong>
              <span className="text-[10px] text-blue-700 font-bold">300 DPI Pre-Flight Proofing</span>
            </div>
          </div>

          {/* Itemized Snapshot */}
          {order?.items && order.items.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-sm text-[#0B1633]">Purchased Items:</h4>
              <div className="divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-[14px]">
                    <div>
                      <span className="font-extrabold text-slate-900 block">{item.productName}</span>
                      <span className="text-slate-400 text-[14px] font-medium">Quantity: {item.quantity} units</span>
                    </div>
                    <span className="font-bold text-[#FF5A1F]">₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          {order?.deliveryAddress && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-[14px] text-blue-900 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-blue-600 block">Shipping Destination:</span>
              <p className="font-semibold text-slate-800 leading-relaxed">{order.deliveryAddress}</p>
            </div>
          )}

          {/* Email Delivery Status Indicator */}
          {order && (
            <div className={`p-4 rounded-2xl border text-[14px] font-semibold flex items-center gap-3 ${
              order.emailStatus?.customer === 'sent' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <FiMail className="w-5 h-5 shrink-0" />
              <div>
                {order.emailStatus?.customer === 'sent' ? (
                  <span>Confirmation email sent to <strong className="font-extrabold">{order.customer?.email || 'your email'}</strong>.</span>
                ) : (
                  <span>Your order was placed successfully. We were unable to send the confirmation email right now, but your order is being processed.</span>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setCurrentPage('order-details', { orderId })}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] uppercase tracking-wider shadow-lg shadow-[#FF5A1F]/20 flex items-center justify-center gap-2 cursor-pointer transition border-none"
          >
            <FiTruck className="w-4 h-4" /> Track Order in Real-Time
          </button>

          <button
            onClick={() => setCurrentPage('account')}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-[#07152F] hover:bg-slate-800 text-white font-extrabold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition border-none"
          >
            <FiFileText className="w-4 h-4" /> View My Orders
          </button>

          <button
            onClick={() => setCurrentPage('products')}
            className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-extrabold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <FiShoppingBag className="w-4 h-4" /> Continue Shopping
          </button>
        </div>

      </div>

    </div>
  );
}
