import React, { useState, useEffect } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { subscribeToOrderById } from '../services/firebase';

export function TrackOrderPage() {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const initialOrderId = getSearchParams().get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [activeOrderId, setActiveOrderId] = useState(initialOrderId);
  const [liveOrder, setLiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const STAGES = [
    'Payment Confirmed',
    'Artwork Verification',
    'In Production',
    'Quality Check',
    'Packed & Ready',
    'Dispatched',
    'Delivered'
  ];

  useEffect(() => {
    if (activeOrderId) {
      setLoading(true);
      setNotFound(false);
      const unsubscribe = subscribeToOrderById(activeOrderId, (doc) => {
        setLoading(false);
        if (doc) {
          setLiveOrder(doc);
          setNotFound(false);
        } else {
          setLiveOrder(null);
          setNotFound(true);
        }
      });
      return () => unsubscribe && unsubscribe();
    }
  }, [activeOrderId]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    const cleanId = orderIdInput.trim().toUpperCase();
    setActiveOrderId(cleanId);

    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'track');
      url.searchParams.set('orderId', cleanId);
      window.history.pushState(null, '', url.toString());
    } catch (err) {}
  };

  const currentStatus = liveOrder?.status || liveOrder?.production?.status || 'Payment Confirmed';
  const currentStageIndex = STAGES.findIndex(s => s === currentStatus);

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-20">
      
      {/* Page Hero Header */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start text-[14px] font-semibold text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Track Order</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Real-Time Order Tracking
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Track your printing press production status, quality inspection stage, and courier dispatch timeline.
          </p>
        </div>
      </section>

      {/* Main Track Form & Status */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Track Card Form */}
        <div className="bg-white rounded-3xl p-8 border border-[#E7EAF0] shadow-sm mb-10">
          <h2 className="text-xl font-extrabold text-[#0B1633] mb-4">Enter Your Order ID</h2>

          <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-9">
              <input
                type="text"
                required
                value={orderIdInput}
                onChange={(e) => setOrderIdInput(e.target.value)}
                placeholder="Enter Order ID (e.g. PRT-10293)"
                className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-xl py-3.5 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-bold uppercase"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] py-3.5 rounded-xl transition border-none cursor-pointer shadow-md shadow-[#FF5A1F]/20 flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <FiSearch className="w-4 h-4" /> Track Order
              </button>
            </div>
          </form>
        </div>

        {/* Tracking Results */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] text-slate-500 font-bold">Querying live press pipeline...</p>
          </div>
        )}

        {notFound && !loading && (
          <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-sm text-center space-y-3">
            <FiAlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <h3 className="text-lg font-extrabold text-slate-900">Order #{activeOrderId} Not Found</h3>
            <p className="text-[14px] text-slate-500 max-w-sm mx-auto">
              Please double-check the Order ID from your confirmation email or order invoice.
            </p>
          </div>
        )}

        {liveOrder && !loading && (
          <div className="bg-white rounded-3xl p-8 border border-[#E7EAF0] shadow-md space-y-8 animate-in fade-in">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#E7EAF0]">
              <div>
                <span className="text-[14px] text-slate-400 font-bold uppercase">Order Reference</span>
                <h3 className="text-2xl font-black text-[#0B1633]">{liveOrder.orderId || liveOrder.id}</h3>
                <p className="text-[14px] text-slate-500 mt-0.5">
                  Customer: <strong>{liveOrder.customer?.name}</strong> • Items: {liveOrder.items?.length || 1}
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 text-[#FF5A1F] font-black text-[14px] px-4 py-2 rounded-xl">
                Status: {currentStatus}
              </div>
            </div>

            {/* Stage Stepper list */}
            <div className="space-y-4">
              <h4 className="font-extrabold text-sm text-[#0B1633]">Live Production Pipeline Stages:</h4>

              <div className="space-y-3">
                {STAGES.map((stageName, idx) => {
                  const isCompleted = currentStageIndex > idx;
                  const isCurrent = currentStageIndex === idx || (currentStageIndex === -1 && idx === 0);

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-all text-[14px] ${
                        isCurrent
                          ? 'border-[#FF5A1F] bg-orange-50/60 ring-2 ring-[#FF5A1F]/20'
                          : isCompleted
                          ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                          : 'border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[14px] shrink-0 ${
                          isCurrent
                            ? 'bg-[#FF5A1F] text-white'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isCompleted ? <FiCheckCircle className="w-4 h-4" /> : idx + 1}
                        </div>

                        <div>
                          <strong className={`font-extrabold text-[14px] block ${isCurrent ? 'text-[#FF5A1F]' : isCompleted ? 'text-emerald-950' : 'text-slate-700'}`}>
                            {stageName}
                          </strong>
                          <span className="text-[14px] text-slate-500 font-medium">
                            {isCompleted ? 'Completed' : isCurrent ? 'Active Stage in Progress' : 'Pending Stage'}
                          </span>
                        </div>
                      </div>

                      {isCurrent && (
                        <span className="px-3 py-1 bg-[#FF5A1F] text-white text-[10px] font-black rounded-full uppercase animate-pulse">
                          Active
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
