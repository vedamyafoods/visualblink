import React, { useState } from 'react';
import { Kanban, Table, Plus, RefreshCw } from 'lucide-react';
import { ProductionKanban } from './ProductionKanban';
import { OrdersDataTable } from './OrdersDataTable';
import { PreflightFileInspector } from './PreflightFileInspector';
import { useAdmin } from '../../context/AdminContext';

export const OrderPipelineHub = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
  const { setWalkInModalOpen } = useAdmin();

  return (
    <div className="space-y-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
            Orders Management & Production Hub
          </h2>
          <p className="text-[14px] text-slate-500">
            Real-time table view of all customer orders, client artwork downloads, and stage updates
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-[14px]">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                viewMode === 'table' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" /> Table List View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer border-none ${
                viewMode === 'kanban' 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban Board
            </button>
          </div>

          <button
            onClick={() => setWalkInModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" /> + Walk-in Order
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'kanban' ? <ProductionKanban /> : <OrdersDataTable />}

      {/* Preflight Modal */}
      <PreflightFileInspector />
    </div>
  );
};
