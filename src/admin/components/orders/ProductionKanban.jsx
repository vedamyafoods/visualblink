import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  Zap, 
  Clock, 
  Truck, 
  CheckCircle, 
  FileCheck, 
  ChevronRight, 
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const ProductionKanban = () => {
  const { 
    orders, 
    updateOrderStatus, 
    setSelectedOrder, 
    setPreflightModalOpen 
  } = useAdmin();

  const stages = [
    { name: 'Payment Confirmed', color: 'border-slate-300 bg-slate-100/50 text-slate-700' },
    { name: 'Artwork Verification', color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { name: 'In Production', color: 'border-blue-300 bg-blue-50 text-blue-800' },
    { name: 'Quality Check', color: 'border-purple-300 bg-purple-50 text-purple-800' },
    { name: 'Packed & Ready', color: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
    { name: 'Dispatched', color: 'border-sky-300 bg-sky-50 text-sky-800' },
    { name: 'Delivered', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  ];

  const [activeStageTab, setActiveStageTab] = useState('Payment Confirmed');

  // Drag and Drop simulation handlers
  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('text/plain', orderId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      updateOrderStatus(orderId, targetStage);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mobile-only Stage Selector Tab Pill Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 pb-2 pt-1 custom-scrollbar shrink-0 select-none">
        {stages.map((stage) => {
          const count = orders.filter(o => o.status === stage.name).length;
          const isActive = activeStageTab === stage.name;
          return (
            <button
              key={stage.name}
              onClick={() => setActiveStageTab(stage.name)}
              className={`px-3 py-1.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-all border shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {stage.name}
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? 'bg-white text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Kanban Stages Grid Column Wrapper */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar min-h-[600px]">
        {stages.map((stage) => {
          const stageOrders = orders.filter(o => o.status === stage.name);
          const isVisibleOnMobile = activeStageTab === stage.name;

          return (
            <div
              key={stage.name}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.name)}
              className={`w-full max-w-md lg:w-80 shrink-0 bg-slate-50/80 rounded-2xl border border-slate-200 p-3 flex flex-col h-full ${
                isVisibleOnMobile ? 'block' : 'hidden lg:flex'
              }`}
            >
              {/* Stage Header */}
              <div className={`p-3 rounded-xl border font-bold text-[14px] flex items-center justify-between mb-3 shadow-3xs ${stage.color}`}>
                <span className="truncate">{stage.name}</span>
                <span className="px-2 py-0.5 rounded-full bg-white text-slate-800 font-extrabold text-[14px] border border-slate-200">
                  {stageOrders.length}
                </span>
              </div>

              {/* Kanban Stage Cards Column */}
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar min-h-[400px]">
                {stageOrders.map((order) => {
                  const targetId = order.id || order.orderId;
                  const firstItem = (order.items && order.items[0]) || {};
                  const artworkRef = (order.artwork && order.artwork[0]) || order.artworkFile;
                  const totalVal = order.totalAmount || order.pricing?.grandTotal || 0;

                  return (
                    <div
                      key={targetId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, targetId)}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-3xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing hover:border-blue-300 space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[14px] text-slate-900">{targetId}</span>
                        {order.isExpress && (
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-extrabold text-[10px] flex items-center gap-0.5">
                            <Zap className="w-3 h-3 fill-red-600 animate-pulse" /> Express
                          </span>
                        )}
                      </div>

                      <div className="text-[14px]">
                        <p className="font-bold text-slate-800 truncate">{order.customer?.name || 'Customer'}</p>
                        <p className="text-slate-500 text-[14px] truncate">{order.customer?.company || 'Retail Order'}</p>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-2 text-[14px] border border-slate-100 space-y-1">
                        <p className="font-semibold text-slate-700 truncate">
                          {firstItem.productName || firstItem.name || 'Custom Print Item'}
                        </p>
                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span>Qty: {firstItem.quantity || firstItem.qty || 1}</span>
                          <span className="font-bold text-slate-900">₹{totalVal.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Artwork File Indicator */}
                      {artworkRef && (
                        <div className="flex items-center justify-between text-[10px] text-slate-500 bg-blue-50/50 px-2 py-1 rounded border border-blue-100">
                          <span className="truncate max-w-[150px] font-mono">{artworkRef.fileName || artworkRef.originalFileName || 'Artwork'}</span>
                          <span className="px-1 bg-blue-100 text-blue-700 rounded uppercase font-bold text-[9px]">
                            {artworkRef.format || artworkRef.fileType || 'file'}
                          </span>
                        </div>
                      )}

                      {/* Stage Action Controls */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setPreflightModalOpen(true);
                          }}
                          className="text-[14px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 border-none bg-transparent cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> View & Download
                        </button>

                        <div className="flex items-center gap-1">
                          {stages.findIndex(s => s.name === stage.name) < stages.length - 1 && (
                            <button
                              onClick={() => {
                                const nextIdx = stages.findIndex(s => s.name === stage.name) + 1;
                                updateOrderStatus(targetId, stages[nextIdx].name);
                              }}
                              className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-600 border-none bg-transparent cursor-pointer"
                              title="Advance to Next Stage"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}

                {stageOrders.length === 0 && (
                  <div className="py-12 text-center text-[14px] text-slate-400 font-medium border-2 border-dashed border-slate-200 rounded-xl">
                    No orders in stage
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
