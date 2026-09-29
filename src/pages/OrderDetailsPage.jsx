import React, { useState, useEffect } from 'react';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiDownload, 
  FiPrinter, 
  FiMapPin, 
  FiUser, 
  FiShield, 
  FiFileText,
  FiExternalLink
} from 'react-icons/fi';
import { subscribeToOrderById } from '../services/firebase';
import { InvoiceModal } from '../Components/orders/InvoiceModal';

export function OrderDetailsPage({ setCurrentPage }) {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const orderId = getSearchParams().get('orderId') || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  // Production Stages list matching Admin Kanban exactly
  const PRODUCTION_STAGES = [
    { name: 'Payment Confirmed', desc: 'Order received & payment authorized' },
    { name: 'Artwork Verification', desc: 'Pre-flight file resolution & CMYK check' },
    { name: 'In Production', desc: 'Plates generated & offset press active' },
    { name: 'Quality Check', desc: 'Inspection of lamination & die-cut' },
    { name: 'Packed & Ready', desc: 'Protective packaging & shrink wrap' },
    { name: 'Dispatched', desc: 'Handoff to express courier' },
    { name: 'Delivered', desc: 'Successfully delivered to customer' }
  ];

  // Subscribe to real-time Firestore updates for this specific order ID
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[14px] text-slate-500 font-bold">Fetching order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2">Order Not Found</h2>
        <p className="text-slate-500 text-[14px] mb-6">Could not locate details for Order #{orderId}.</p>
        <button
          onClick={() => setCurrentPage('account')}
          className="px-6 py-3 rounded-2xl bg-[#FF5A1F] text-white font-extrabold text-[14px] uppercase cursor-pointer border-none"
        >
          Return to My Account
        </button>
      </div>
    );
  }

  const currentStatus = order.status || order.production?.status || 'Payment Confirmed';
  const currentStageIndex = PRODUCTION_STAGES.findIndex(s => s.name === currentStatus);

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const artworkList = order.artwork || (order.artworkFile ? [order.artworkFile] : []);

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">
      
      {/* Top Banner Header */}
      <section className="bg-[#07152F] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => setCurrentPage('account')}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-slate-400 hover:text-white transition cursor-pointer mb-4 bg-transparent border-none"
          >
            <FiArrowLeft className="w-4 h-4 text-[#FF5A1F]" /> Back to My Orders
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-[10px] font-black uppercase tracking-wider border border-[#FF5A1F]/30">
                  Live Press Status Tracking
                </span>
                <span className="text-slate-400 text-[14px]">• Placed {formattedDate}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Order #{order.orderId || order.id}
              </h1>
            </div>

            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] uppercase tracking-wider shadow-lg shadow-[#FF5A1F]/20 flex items-center gap-2 transition cursor-pointer border-none"
            >
              <FiPrinter className="w-4 h-4" /> Download Tax Invoice
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* REAL-TIME PRODUCTION TIMELINE CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7EAF0] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-[#0B1633] flex items-center gap-2">
                <FiTruck className="w-5 h-5 text-[#FF5A1F]" /> Real-Time Production & Dispatch Timeline
              </h3>
              <p className="text-[14px] text-slate-500 mt-0.5">
                Automatically updates live as prepress operators advance your order in the studio.
              </p>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-orange-50 text-[#FF5A1F] font-black text-[14px] border border-orange-200">
              Current Stage: {currentStatus}
            </span>
          </div>

          {/* Stepper Grid Bar */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-2">
            {PRODUCTION_STAGES.map((stage, idx) => {
              const isCompleted = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx || (currentStageIndex === -1 && idx === 0);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all text-[14px] space-y-1.5 ${
                    isCurrent
                      ? 'border-[#FF5A1F] bg-orange-50/60 ring-2 ring-[#FF5A1F]/20'
                      : isCompleted
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                      : 'border-slate-200 bg-slate-50/50 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] ${
                      isCurrent
                        ? 'bg-[#FF5A1F] text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {isCompleted ? <FiCheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                    </span>

                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#FF5A1F] animate-ping" />
                    )}
                  </div>

                  <strong className={`font-black block text-[14px] leading-tight ${
                    isCurrent ? 'text-[#FF5A1F]' : isCompleted ? 'text-emerald-900' : 'text-slate-700'
                  }`}>
                    {stage.name}
                  </strong>
                  <p className="text-[10px] text-slate-500 leading-tight font-medium hidden md:block">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: ITEMS & ARTWORK (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Order Items */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0B1633] border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-[#FF5A1F]" /> Print Order Items
              </h3>

              <div className="space-y-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAFBFD] border border-slate-200/80 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200'}
                        alt={item.productName || item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <strong className="text-sm font-extrabold text-[#0B1633] block">{item.productName || item.name}</strong>
                        <p className="text-[14px] text-slate-500">{item.variant || 'Standard Specification'}</p>
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-200/70 text-slate-800 text-[14px] font-extrabold">
                          {item.quantity || item.qty} Units
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[14px] text-slate-400 font-bold block">Item Subtotal</span>
                      <strong className="text-base font-black text-[#FF5A1F]">
                        ₹{(item.totalPrice || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Artwork References */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0B1633] border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-[#FF5A1F]" /> Submitted Production Artwork Files ({artworkList.length})
              </h3>

              {artworkList.length === 0 ? (
                <p className="text-[14px] text-slate-500 font-medium">No artwork files attached to this order.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {artworkList.map((art, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[14px] gap-3">
                      <div className="min-w-0">
                        <strong className="font-extrabold text-slate-900 truncate block max-w-[180px]">
                          {art.fileName || art.originalFileName || `Artwork File #${idx+1}`}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">Format: {art.format || 'doc'}</span>
                      </div>

                      {art.secureUrl && (
                        <a
                          href={art.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#07152F] text-white text-[14px] font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-1 text-decoration-none shrink-0"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: PRICING & DESTINATION (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Pricing Snapshot Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0B1633] border-b border-slate-100 pb-3">
                Pricing Snapshot
              </h3>

              <div className="space-y-2 text-[14px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-900">₹{(order.subtotal || order.pricing?.subtotal || 0).toLocaleString()}</span>
                </div>

                {order.pricing?.couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-extrabold">-₹{order.pricing.couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                {order.isExpress && (
                  <div className="flex justify-between text-amber-700">
                    <span>Express Turnaround</span>
                    <span className="font-extrabold">+₹{order.pricing?.expressFee || 299}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-extrabold text-slate-900">
                    {(order.shippingFee || order.pricing?.shippingFee) === 0 ? 'FREE' : `₹${order.shippingFee || order.pricing?.shippingFee || 0}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>GST</span>
                  <span className="font-extrabold text-emerald-600">Inclusive</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-[14px] font-bold text-slate-500">Grand Total</span>
                <span className="text-2xl font-black text-[#FF5A1F]">₹{(order.totalAmount || order.pricing?.grandTotal || 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-3 text-[14px]">
              <h3 className="text-base font-extrabold text-[#0B1633] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiMapPin className="w-4 h-4 text-[#FF5A1F]" /> Shipping Destination
              </h3>

              <div className="space-y-1 text-slate-700 font-medium leading-relaxed">
                <strong className="font-extrabold text-slate-900 block text-[14px]">{order.customer?.name}</strong>
                <p>{order.deliveryAddress || order.shippingAddress?.fullAddress}</p>
                <p className="text-slate-500 font-mono pt-1">Phone: {order.customer?.phone}</p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />

    </div>
  );
}
