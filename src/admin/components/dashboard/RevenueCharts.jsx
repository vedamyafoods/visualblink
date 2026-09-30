import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { TrendingUp, BarChart2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const RevenueCharts = () => {
  const { orders } = useAdmin();

  // Dynamically calculate Monthly Revenue for Year to Date
  const calculateMonthlyRevenue = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();

    const monthlyData = months.map(month => ({ month, revenue: 0, orders: 0, expressCount: 0 }));

    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      if (date.getFullYear() === currentYear) {
        const m = date.getMonth();
        monthlyData[m].revenue += (order.totalAmount || order.pricing?.grandTotal || 0);
        monthlyData[m].orders += 1;
        if (order.isExpress) monthlyData[m].expressCount += 1;
      }
    });

    const currentMonth = new Date().getMonth();
    return monthlyData.slice(0, currentMonth + 1).map((d, i) => i === currentMonth ? { ...d, month: `${d.month} (YTD)` } : d);
  };

  // Dynamically calculate Daily Orders for the current week
  const calculateDailyVolumes = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData = days.map(day => ({ day, count: 0, express: 0 }));

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    orders.forEach(order => {
      if (!order.createdAt) return;
      const date = new Date(order.createdAt);
      if (date >= oneWeekAgo) {
        const dayIdx = date.getDay();
        dayData[dayIdx].count += 1;
        if (order.isExpress) dayData[dayIdx].express += 1;
      }
    });

    // Reorder so Monday is first
    return [...dayData.slice(1), dayData[0]];
  };

  const dynamicRevenueAnalytics = calculateMonthlyRevenue();
  const dynamicDailyVolumes = calculateDailyVolumes();

  const totalRev = dynamicRevenueAnalytics.reduce((sum, m) => sum + m.revenue, 0);
  const prevRev = dynamicRevenueAnalytics.length > 1 ? dynamicRevenueAnalytics[dynamicRevenueAnalytics.length - 2].revenue : 0;
  const currRev = dynamicRevenueAnalytics.length > 0 ? dynamicRevenueAnalytics[dynamicRevenueAnalytics.length - 1].revenue : 0;

  let growthString = "0% YOY Growth";
  if (prevRev > 0) {
    const growth = Math.round(((currRev - prevRev) / prevRev) * 100);
    growthString = `${growth >= 0 ? '+' : ''}${growth}% MOM Growth`;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* Monthly Revenue Trajectory Area Chart */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Monthly Revenue Trajectory (₹)
            </h3>
            <p className="text-[14px] text-slate-500">Real-time revenue growth from online orders & walk-in clients</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[14px] font-bold border border-emerald-200">
            {growthString}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dynamicRevenueAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip
                formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563EB"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Order Volume Breakdown Bar Chart */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-sky-500" />
              Weekly Order Breakdown
            </h3>
            <p className="text-[14px] text-slate-500">Standard vs Express dispatch volume</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicDailyVolumes} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              />
              <Bar dataKey="count" name="Standard Orders" fill="#0284C7" radius={[6, 6, 0, 0]} />
              <Bar dataKey="express" name="Express Same-Day" fill="#DC2626" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
