import React from 'react';
import { motion } from 'framer-motion';
import { 
  IndianRupee, 
  Printer, 
  Clock, 
  FileCheck, 
  Zap, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const LiveStatCards = () => {
  const { orders, expressOrdersCount, pendingArtworkCount } = useAdmin();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.pricing?.grandTotal || 0), 0);
  const inProductionCount = orders.filter(o => o.status === 'In Production').length;

  const stats = [
    {
      title: "Today's Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "+18.4% vs yesterday",
      isPositive: true,
      icon: IndianRupee,
      gradient: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Print Orders",
      value: orders.length,
      change: "+12 orders in pipeline",
      isPositive: true,
      icon: Printer,
      gradient: "from-sky-500 to-blue-500",
      accentBg: "bg-sky-50 text-sky-600",
    },
    {
      title: "Orders in Production",
      value: inProductionCount,
      change: "Active on press machines",
      isPositive: true,
      icon: Clock,
      gradient: "from-purple-600 to-indigo-500",
      accentBg: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Pre-Flight Verification",
      value: pendingArtworkCount,
      change: "Requires CMYK & Bleed check",
      isPositive: false,
      icon: FileCheck,
      gradient: "from-amber-500 to-orange-500",
      accentBg: "bg-amber-50 text-amber-600",
    },
    {
      title: "Express Same-Day Alerts",
      value: expressOrdersCount,
      change: "Dispatch limit before 12:00 PM",
      isPositive: false,
      icon: Zap,
      gradient: "from-red-600 to-rose-600",
      accentBg: "bg-red-50 text-red-600 animate-pulse",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-semibold text-slate-500 tracking-tight">
                {stat.title}
              </span>
              <div className={`p-2 rounded-xl ${stat.accentBg} transition-transform group-hover:scale-110`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {stat.value}
              </div>
            </div>

            <div className="mt-2 flex items-center gap-1 text-[14px] font-medium text-slate-500">
              <TrendingUp className="w-3 h-3 text-emerald-500 shrink-0" />
              <span className="truncate">{stat.change}</span>
            </div>

            {/* Subtle Gradient Accent Line at top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient}`} />
          </motion.div>
        );
      })}
    </div>
  );
};
