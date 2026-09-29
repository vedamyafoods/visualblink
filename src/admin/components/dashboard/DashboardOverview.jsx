import React, { useState } from 'react';
import { LiveStatCards } from './LiveStatCards';
import { RevenueCharts } from './RevenueCharts';
import { ExpressQueueStream } from './ExpressQueueStream';
import { ActivityFeed } from './ActivityFeed';
import { Sparkles, Calendar, RefreshCw, Download, Filter } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const DashboardOverview = () => {
  const { setWalkInModalOpen } = useAdmin();
  const [timeRange, setTimeRange] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Operations & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-extrabold border border-blue-100 shadow-3xs shrink-0">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                Print Operations Overview
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-[10px] border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Live Synced
              </span>
            </div>
            <p className="text-[14px] text-slate-500 font-medium">Real-time Backoffice telemetry, express queues & production KPIs</p>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap ml-auto">
          {/* Time Range Selector */}
          <div className="bg-slate-100/80 p-1 rounded-xl border border-slate-200 flex items-center gap-1 select-none">
            {['today', '7d', '30d', 'ytd'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-lg text-[14px] font-bold transition-colors cursor-pointer border-none ${
                  timeRange === range
                    ? 'bg-white text-blue-600 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800 bg-transparent'
                }`}
              >
                {range === 'today' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : 'YTD'}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 cursor-pointer transition-colors"
            title="Refresh Realtime Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          <button
            onClick={() => setWalkInModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] shadow-md shadow-blue-500/20 transition-all border-none cursor-pointer flex items-center gap-1.5"
          >
            + Create Walk-In Order
          </button>
        </div>
      </div>

      <LiveStatCards />
      <ExpressQueueStream />
      <RevenueCharts />
      <ActivityFeed />
    </div>
  );
};
