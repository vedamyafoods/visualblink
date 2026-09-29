import React, { useState, useEffect } from 'react';
import { Zap, Clock, Truck, Eye, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const ExpressQueueStream = () => {
  const { orders, setSelectedOrder, setPreflightModalOpen, setActiveTab, updateOrderStatus } = useAdmin();

  const expressOrders = orders.filter(o => o.isExpress && o.status !== "Delivered");

  // Timer helper calculation
  const calculateTimeLeft = (deadlineStr) => {
    if (!deadlineStr) return "1h 45m";
    const diff = new Date(deadlineStr) - new Date();
    if (diff <= 0) return "EXPIRED";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m remaining`;
  };

  return (
    <div className="bg-gradient-to-br from-red-50/30 via-white to-amber-50/30 text-slate-800 rounded-2xl p-5 border border-red-100/60 shadow-md relative overflow-hidden">
      
      {/* Background Subtle Pulsing Glow */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 border border-red-200">
            <Zap className="w-4 h-4 fill-red-600 animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              Express Same-Day Priority Stream
            </h3>
            <p className="text-[14px] text-slate-500">Orders requiring local dispatch before 12:00 PM cutoff</p>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('orders')}
          className="text-[14px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 border-none bg-transparent cursor-pointer"
        >
          View Pipeline <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {expressOrders.map((order) => (
          <div 
            key={order.id}
            className="bg-white hover:bg-slate-50/40 border border-slate-200/80 rounded-xl p-4 transition-all relative group shadow-3xs"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">{order.id}</span>
              <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-red-600" />
                {calculateTimeLeft(order.expressDeadline)}
              </span>
            </div>

            <div className="text-[14px] space-y-1 mb-3">
              <p className="font-bold text-slate-900">
                {order.customer?.name || 'Express Customer'} {order.customer?.company ? `(${order.customer.company})` : ''}
              </p>
              <p className="text-slate-500 text-[14px] truncate">
                {(order.items || []).map(i => i.productName || i.name || 'Print Item').join(', ') || 'Custom Print Item'}
              </p>
              <div className="flex items-center gap-1 text-blue-600 text-[14px] font-semibold pt-1">
                <Truck className="w-3 h-3 shrink-0" />
                <span>{order.deliveryMethod || 'Hyperlocal Express Courier'}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[14px]">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                {order.status}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setPreflightModalOpen(true);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:text-white hover:bg-blue-600 transition-colors border-none cursor-pointer"
                  title="Inspect Artwork File"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'Packed & Ready')}
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-colors border-none cursor-pointer"
                  title="Mark Packed & Ready for Porter"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
