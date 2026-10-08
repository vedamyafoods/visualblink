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
  const { orders, expressOrdersCount, pendingArtworkCount, products, categories } = useAdmin();

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || o.pricing?.grandTotal || 0), 0);
  const inProductionCount = orders.filter(o => o.status === 'In Production').length;

  // Calculate dynamic stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  let todayRev = 0;
  let yesterdayRev = 0;
  let todayOrders = 0;

  orders.forEach(o => {
    if (!o.createdAt) return;
    const d = new Date(o.createdAt);
    const amt = o.totalAmount || o.pricing?.grandTotal || 0;
    if (d >= today) {
      todayRev += amt;
      todayOrders += 1;
    } else if (d >= yesterday && d < today) {
      yesterdayRev += amt;
    }
  });

  const revGrowth = yesterdayRev > 0 ? Math.round(((todayRev - yesterdayRev) / yesterdayRev) * 100) : 0;
  const revChangeStr = yesterdayRev === 0 && todayRev > 0
    ? "+100% vs yesterday"
    : `${revGrowth >= 0 ? '+' : ''}${revGrowth}% vs yesterday`;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: `₹${todayRev.toLocaleString()} today (${revChangeStr})`,
      isPositive: true,
      icon: IndianRupee,
      gradient: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Print Orders",
      value: orders.length,
      change: `+${todayOrders} orders today`,
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
      gradient: "from-amber-500 to-blue-500",
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
    {
      title: "Active Products",
      value: products.length || 0,
      change: "Live storefront catalog",
      isPositive: true,
      icon: Printer,
      gradient: "from-fuchsia-600 to-pink-600",
      accentBg: "bg-fuchsia-50 text-fuchsia-600",
    },
    {
      title: "Total Categories",
      value: categories.length || 0,
      change: "Dynamic megamenu nodes",
      isPositive: true,
      icon: FileCheck,
      gradient: "from-teal-500 to-emerald-500",
      accentBg: "bg-teal-50 text-teal-600",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
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
