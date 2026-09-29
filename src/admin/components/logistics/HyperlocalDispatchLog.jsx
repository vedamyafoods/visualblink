import React from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Printer,
  PackageCheck
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const HyperlocalDispatchLog = () => {
  const { logisticsLogs, orders } = useAdmin();

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-600" />
            Hyperlocal Express Dispatch & Pan-India Logistics Hub
          </h2>
          <p className="text-[14px] text-slate-500">
            Real-time Bangalore local bookings (Dunzo/Porter) & BlueDart/Delhivery AWB sync
          </p>
        </div>
      </div>

      {/* Logistics Active Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {logisticsLogs.map((log) => (
          <div key={log.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3 relative hover:border-sky-300 transition-all">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="font-extrabold text-sm text-slate-900">{log.id}</span>
              <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 font-bold text-[10px] border border-sky-200">
                {log.type}
              </span>
            </div>

            <div className="space-y-1.5 text-[14px]">
              <div className="font-bold text-slate-900 flex items-center justify-between">
                <span>Order Ref: {log.orderId}</span>
                <span className="text-emerald-600 font-bold">{log.status}</span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-sky-500" /> {log.provider}
                </div>
                {log.driverName && (
                  <p className="text-[14px]">Rider: {log.driverName} ({log.driverPhone})</p>
                )}
                {log.awbNumber && (
                  <p className="text-[14px] font-mono">AWB: {log.awbNumber}</p>
                )}
              </div>

              <div className="flex items-center justify-between text-[14px] text-slate-500 pt-1">
                <span>ETA: {log.estimatedDelivery}</span>
                <span>Pickup: {log.pickupTime}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[14px]">
              <a
                href={log.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1"
              >
                Track Live GPS <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => window.print()}
                className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-semibold text-[14px] flex items-center gap-1"
              >
                <Printer className="w-3 h-3" /> Print Slip
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
