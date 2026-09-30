import React from 'react';
import {
  CheckCircle,
  FileCheck,
  Palette,
  Truck,
  Zap,
  PlusCircle,
  Receipt,
  Send
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const ActivityFeed = () => {
  const { setWalkInModalOpen, setQuickInvoiceModalOpen, setActiveTab, orders } = useAdmin();

  const generateActivities = () => {
    return orders
      .filter(o => o.createdAt)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((o, idx) => {
        let text = `New Order ${o.id || o.orderId} created (₹${o.totalAmount?.toLocaleString() || o.pricing?.grandTotal?.toLocaleString() || 0})`;
        let icon = CheckCircle;
        let iconBg = 'bg-purple-100 text-purple-600';
        let type = 'order';

        if (o.status === "Dispatched") {
          text = `Order ${o.id || o.orderId} dispatched via ${o.deliveryMethod || 'Courier'}`;
          icon = Truck;
          iconBg = 'bg-sky-100 text-sky-600';
          type = 'dispatch';
        } else if (o.status === "Artwork Verification") {
          text = `Pre-flight verification required for ${o.id || o.orderId}`;
          icon = FileCheck;
          iconBg = 'bg-amber-100 text-amber-600';
          type = 'artwork';
        } else if (o.status === "In Production") {
          text = `Order ${o.id || o.orderId} moved to production queue`;
          icon = Palette;
          iconBg = 'bg-blue-100 text-blue-600';
          type = 'production';
        }

        let timeStr = new Date(o.createdAt).toLocaleDateString();
        const diffHours = Math.floor((new Date() - new Date(o.createdAt)) / 3600000);
        if (diffHours === 0) {
          timeStr = 'Recently updated';
        } else if (diffHours < 24) {
          timeStr = `${diffHours} hours ago`;
        } else if (diffHours < 48) {
          timeStr = 'Yesterday';
        }

        return {
          id: o.id || idx.toString(),
          type,
          text,
          time: timeStr,
          icon,
          iconBg
        };
      });
  };

  const dynamicActivities = generateActivities();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Activity Feed */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-4">
          Live Operational Activity Feed
        </h3>

        <div className="space-y-4">
          {dynamicActivities.length > 0 ? dynamicActivities.map((act) => {
            const Icon = act.icon;
            return (
              <div key={act.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-xl ${act.iconBg} shrink-0 mt-0.5`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                    {act.text}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {act.time}
                  </span>
                </div>
              </div>
            );
          }) : <div className="text-slate-400 text-[14px]">No recent operational activity recorded.</div>}
        </div>
      </div>

      {/* Quick Action Shortcuts Panel */}
      <div className="bg-gradient-to-br from-slate-50 via-white to-blue-50/20 text-slate-800 rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">
            Rapid Dispatch Controls
          </span>
          <h3 className="font-extrabold text-base text-slate-900 mt-1 mb-2">
            Admin Quick Actions
          </h3>
          <p className="text-[14px] text-slate-500 mb-6 leading-relaxed">
            Execute key operational tasks instantly without leaving the dashboard view.
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => setWalkInModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-[14px] transition-all border border-slate-200 shadow-3xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            + New Counter Walk-In Order
          </button>

          <button
            onClick={() => setQuickInvoiceModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-[14px] transition-all border border-slate-200 shadow-3xs cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-600" />
            Generate GST B2B Invoice
          </button>

          <button
            onClick={() => setActiveTab('design_desk')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50/80 text-slate-700 font-semibold text-[14px] transition-all border border-slate-200 shadow-3xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-emerald-600" />
            Send WhatsApp Proof to Customer
          </button>
        </div>
      </div>

    </div>
  );
};
