import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPrinter,
  FiMapPin,
  FiUser,
  FiShield,
  FiFileText,
  FiExternalLink,
  FiCreditCard,
  FiCheck,
  FiAlertTriangle,
  FiCopy,
  FiDollarSign
} from 'react-icons/fi';
import { subscribeToOrderById } from '../services/firebase';
import { InvoiceModal } from '../Components/orders/InvoiceModal';

export function OrderDetailsPage({ setCurrentPage }) {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const orderId = getSearchParams().get('orderId') || '';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [payingInstallmentId, setPayingInstallmentId] = useState(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Production Stages list matching Admin Kanban exactly
  const PRODUCTION_STAGES = [
    { name: 'Payment Confirmed', desc: 'Order received & payment authorized' },
    { name: 'Artwork Verification', desc: 'Pre-flight file resolution & CMYK check' },
    { name: 'In Production', desc: 'Plates generated & offset press active' },
    { name: 'Quality Check', desc: 'Inspection of lamination & die-cut' },
    { name: 'Packed & Ready', desc: 'Protective packaging & shrink wrap' },
    { name: 'Dispatched', desc: 'Handoff to express courier' },
    { name: 'Delivered', desc: 'Successfully delivered to customer' }
  ];

  // Subscribe to real-time Firestore updates for this specific order ID
  useEffect(() => {
    if (orderId) {
      const unsubscribe = subscribeToOrderById(orderId, (fetchedOrder) => {
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        }
        setLoading(false);
      });
      return () => unsubscribe && unsubscribe();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] flex items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-[#025afc] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[14px] text-slate-500 font-bold">Fetching order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold text-[#0B1633] mb-2">Order Not Found</h2>
        <p className="text-slate-500 text-[14px] mb-6">Could not locate details for Order #{orderId}.</p>
        <button
          onClick={() => setCurrentPage('account')}
          className="px-6 py-3 rounded-2xl bg-[#025afc] text-white font-bold text-[14px] uppercase cursor-pointer border-none"
        >
          Return to My Account
        </button>
      </div>
    );
  }

  const currentStatus = order.status || order.production?.status || 'Payment Confirmed';
  const currentStageIndex = PRODUCTION_STAGES.findIndex(s => s.name === currentStatus);

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const artworkList = order.artwork || (order.artworkFile ? [order.artworkFile] : []);

  // Pricing calculations
  const pricing = order.pricing || {};
  const grandTotal = order.totalAmount || pricing.grandTotal || 0;
  const subtotal = order.subtotal || pricing.subtotal || 0;
  const discount = pricing.couponDiscount || 0;
  const shippingFee = order.shippingFee ?? pricing.shippingFee ?? 0;
  const expressFee = order.isExpress ? (pricing.expressFee || 299) : 0;
  const taxableAmount = pricing.taxableAmount || subtotal;
  const totalGst = pricing.totalGst || 0;
  const cgst = pricing.cgst || 0;
  const sgst = pricing.sgst || 0;
  const igst = pricing.igst || 0;
  const isIntraState = pricing.isCustomerIntraState ?? true;
  const gstRate = pricing.gstRate || 18;

  // Payments & Ledger
  const payment = order.payment || {};
  const totalCollected = Number(order.totalCollected ?? payment.paidAmount ?? (order.paymentStatus === 'paid' ? grandTotal : 0));
  const outstandingBalance = Number(order.outstandingBalance ?? payment.remainingBalance ?? Math.max(0, grandTotal - totalCollected));
  const isFullySettled = outstandingBalance <= 0 || order.paymentStatus === 'paid';

  // Installments list fallback
  const installments = order.installments || [
    {
      sequence: 1,
      installmentId: 'inst_1',
      name: 'Initial Advance Payment',
      amount: totalCollected || grandTotal,
      status: 'Paid',
      dueDate: 'At checkout',
      paidAt: payment.paidAt || order.createdAt
    },
    ...(outstandingBalance > 0 ? [{
      sequence: 2,
      installmentId: 'inst_2',
      name: 'Final Dispatch Balance',
      amount: outstandingBalance,
      status: 'Due',
      dueDate: 'Before dispatch'
    }] : [])
  ];

  const paymentsLedger = order.paymentsLedger || [];

  // Pay Now handler for eligible unpaid installments
  const handlePayInstallment = async (inst) => {
    setErrorMessage('');
    setPayingInstallmentId(inst.installmentId || inst.sequence);

    try {
      // If payment link exists, redirect to it
      if (inst.paymentLink?.linkUrl) {
        window.location.href = inst.paymentLink.linkUrl;
        return;
      }

      // Generate payment link on the fly for customer
      const res = await fetch('/api/generate-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.orderId || order.id,
          installmentId: inst.installmentId || `inst_${inst.sequence}`,
          customAmount: inst.amount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate payment session.');
      }

      if (data.linkUrl) {
        window.location.href = data.linkUrl;
      } else {
        throw new Error('Payment gateway did not provide a payment link.');
      }
    } catch (err) {
      setErrorMessage(`Payment error: ${err.message}`);
    } finally {
      setPayingInstallmentId(null);
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setCopySuccess('Link copied to clipboard!');
    setTimeout(() => setCopySuccess(''), 3000);
  };

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">

      {/* Top Banner Header */}
      <section className="bg-[#07152F] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <button
            onClick={() => setCurrentPage('account')}
            className="inline-flex items-center gap-1.5 text-[14px] font-bold text-slate-400 hover:text-white transition cursor-pointer mb-4 bg-transparent border-none"
          >
            <FiArrowLeft className="w-4 h-4 text-[#025afc]" /> Back to My Orders
          </button>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#025afc]/20 text-[#025afc] text-[10px] font-bold uppercase tracking-wider border border-[#025afc]/30">
                  Live Press Status Tracking
                </span>
                <span className="text-slate-400 text-[14px]">• Placed {formattedDate}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Order #{order.orderId || order.id}
              </h1>
            </div>

            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="px-5 py-3 rounded-2xl bg-[#025afc] hover:bg-[#6a32f0] text-white font-bold text-[14px] uppercase tracking-wider shadow-lg shadow-[#025afc]/20 flex items-center gap-2 transition cursor-pointer border-none"
            >
              <FiPrinter className="w-4 h-4" /> Download Tax Invoice
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

        {/* ERROR / SUCCESS ALERTS */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FiAlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              {errorMessage}
            </span>
            <button onClick={() => setErrorMessage('')} className="text-rose-600 hover:text-rose-800 font-bold">Dismiss</button>
          </div>
        )}

        {copySuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
            <FiCheck className="w-4 h-4 text-emerald-600" />
            {copySuccess}
          </div>
        )}

        {/* REAL-TIME PRODUCTION TIMELINE CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7EAF0] shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2">
                <FiTruck className="w-5 h-5 text-[#025afc]" /> Real-Time Production & Dispatch Timeline
              </h3>
              <p className="text-[14px] text-slate-500 mt-0.5">
                Automatically updates live as prepress operators advance your order in the studio.
              </p>
            </div>

            <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#025afc] font-bold text-[14px] border border-blue-200">
              Current Stage: {currentStatus}
            </span>
          </div>

          {/* Stepper Grid Bar */}
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 pt-2">
            {PRODUCTION_STAGES.map((stage, idx) => {
              const isCompleted = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx || (currentStageIndex === -1 && idx === 0);

              return (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border transition-all text-[14px] space-y-1.5 ${isCurrent
                    ? 'border-[#025afc] bg-blue-50/60 ring-2 ring-[#025afc]/20'
                    : isCompleted
                      ? 'border-emerald-300 bg-emerald-50/40 text-emerald-950'
                      : 'border-slate-200 bg-slate-50/50 text-slate-400'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${isCurrent
                      ? 'bg-[#025afc] text-white'
                      : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                      }`}>
                      {isCompleted ? <FiCheckCircle className="w-3.5 h-3.5" /> : idx + 1}
                    </span>

                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#025afc] animate-ping" />
                    )}
                  </div>

                  <strong className={`font-bold block text-[14px] leading-tight ${isCurrent ? 'text-[#025afc]' : isCompleted ? 'text-emerald-900' : 'text-slate-700'
                    }`}>
                    {stage.name}
                  </strong>
                  <p className="text-[10px] text-slate-500 leading-tight font-medium hidden md:block">
                    {stage.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* PHASE 5: CUSTOMER INSTALLMENT MANAGEMENT & LEDGER CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100 shadow-md shadow-purple-500/5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-purple-600 uppercase tracking-widest block flex items-center gap-1.5">
                <FiCreditCard className="w-3.5 h-3.5" /> Advance & Installment Management
              </span>
              <h3 className="text-xl font-bold text-[#0B1633] mt-0.5">Order Payment Schedule</h3>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${isFullySettled
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                ● {isFullySettled ? '100% Fully Settled' : `Partially Paid (${Math.round((totalCollected / (grandTotal || 1)) * 100)}%)`}
              </span>
            </div>
          </div>

          {/* Metrics summary banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#FAFBFD] p-4 rounded-2xl border border-slate-200/80">
              <span className="text-xs text-slate-500 font-semibold block">Total Order Payable</span>
              <strong className="text-2xl font-bold text-[#0B1633] block mt-0.5">₹{grandTotal.toLocaleString()}</strong>
            </div>

            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
              <span className="text-xs text-emerald-800 font-semibold block">Total Amount Paid</span>
              <strong className="text-2xl font-bold text-emerald-600 block mt-0.5">₹{totalCollected.toLocaleString()}</strong>
            </div>

            <div className={`p-4 rounded-2xl border ${outstandingBalance > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-xs text-slate-600 font-semibold block">Outstanding Balance Due</span>
              <strong className={`text-2xl font-bold block mt-0.5 ${outstandingBalance > 0 ? 'text-amber-700' : 'text-slate-500'}`}>
                ₹{outstandingBalance.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* INSTALLMENT SCHEDULE LIST */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-purple-600" /> Installment Milestones
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {installments.map((inst, idx) => {
                const status = (inst.status || 'Upcoming').trim();
                const isPaid = status.toLowerCase() === 'paid';
                const isDue = status.toLowerCase() === 'due';
                const isPendingVerif = status.toLowerCase() === 'pending verification';
                const isFailed = status.toLowerCase() === 'failed';
                const isCancelled = status.toLowerCase() === 'cancelled';

                let badgeColor = 'bg-slate-100 text-slate-700';
                if (isPaid) badgeColor = 'bg-emerald-100 text-emerald-800';
                else if (isDue) badgeColor = 'bg-amber-100 text-amber-800 animate-pulse';
                else if (isPendingVerif) badgeColor = 'bg-blue-100 text-blue-800';
                else if (isFailed) badgeColor = 'bg-rose-100 text-rose-800';
                else if (isCancelled) badgeColor = 'bg-slate-200 text-slate-500';

                return (
                  <div key={idx} className="p-4 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isPaid ? 'bg-emerald-600 text-white' : 'bg-purple-100 text-purple-700'}`}>
                          {isPaid ? <FiCheck className="w-3.5 h-3.5" /> : (inst.sequence || idx + 1)}
                        </span>
                        <strong className="text-sm font-bold text-slate-900">{inst.name || `Installment ${inst.sequence || idx + 1}`}</strong>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
                          {status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 pl-8 space-y-0.5">
                        <p>Due Date: <strong className="text-slate-700">{inst.dueDate || 'Before dispatch'}</strong></p>
                        {inst.paidAt && (
                          <p className="text-emerald-700">Paid on: {new Date(inst.paidAt).toLocaleDateString('en-IN')}</p>
                        )}
                        {inst.transactionRef && (
                          <p className="font-mono text-[11px] text-slate-400">Ref: {inst.transactionRef}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 pl-8 md:pl-0">
                      <div className="text-left md:text-right">
                        <span className="text-xs text-slate-400 block font-medium">Installment Amount</span>
                        <strong className="text-lg font-bold text-[#0B1633]">₹{(inst.amount || 0).toLocaleString()}</strong>
                      </div>

                      {/* Pay Now Action for eligible unpaid installments */}
                      {!isPaid && !isCancelled && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={payingInstallmentId === (inst.installmentId || inst.sequence)}
                            onClick={() => handlePayInstallment(inst)}
                            className="px-4 py-2.5 rounded-xl bg-[#612af6] hover:bg-[#5022cc] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer transition border-none"
                          >
                            {payingInstallmentId === (inst.installmentId || inst.sequence) ? (
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <FiDollarSign className="w-3.5 h-3.5" />
                            )}
                            Pay Online
                          </button>

                          {inst.paymentLink?.linkUrl && (
                            <button
                              type="button"
                              onClick={() => handleCopyLink(inst.paymentLink.linkUrl)}
                              title="Copy Payment Link"
                              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition border-none"
                            >
                              <FiCopy className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* UNIFIED PAYMENT LEDGER (Online Cashfree + Offline Manual Receipts) */}
          {paymentsLedger.length > 0 && (
            <div className="pt-2 space-y-3">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <FiShield className="w-4 h-4 text-emerald-600" /> Verified Payment Receipts ({paymentsLedger.length})
              </h4>

              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAFBFD] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Payment Channel</th>
                      <th className="p-3">Transaction / UTR Reference</th>
                      <th className="p-3">Allocated To</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {paymentsLedger.map((pmt, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="p-3 text-slate-500">
                          {new Date(pmt.paidAt || pmt.createdAt || Date.now()).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${pmt.source === 'manual' ? 'bg-amber-100 text-amber-900' : 'bg-purple-100 text-purple-900'
                            }`}>
                            {pmt.source === 'manual' ? `Manual (${pmt.method || 'Offline'})` : `Cashfree (${pmt.paymentMode || 'Online'})`}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-800 font-bold">
                          {pmt.cfPaymentId || pmt.referenceNumber || pmt.utr || 'VERIFIED'}
                        </td>
                        <td className="p-3 text-slate-600">
                          {pmt.installmentName || `Installment #${pmt.installmentSequence || 1}`}
                        </td>
                        <td className="p-3 text-right font-extrabold text-[#0B1633]">
                          ₹{(pmt.amount || 0).toLocaleString()}
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <FiCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: ITEMS & ARTWORK (8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* Order Items */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0B1633] border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiPackage className="w-4 h-4 text-[#025afc]" /> Print Order Items
              </h3>

              <div className="space-y-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FAFBFD] border border-slate-200/80 flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200'}
                        alt={item.productName || item.name}
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <strong className="text-sm font-bold text-[#0B1633] block">{item.productName || item.name}</strong>
                        <p className="text-[14px] text-slate-500">{item.variant || 'Standard Specification'}</p>
                        <span className="inline-block px-2.5 py-0.5 rounded-lg bg-slate-200/70 text-slate-800 text-[14px] font-bold">
                          {item.quantity || item.qty} Units
                        </span>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <span className="text-[14px] text-slate-400 font-bold block">Item Subtotal</span>
                      <strong className="text-base font-bold text-[#025afc]">
                        ₹{(item.totalPrice || (item.quantity * item.unitPrice) || 0).toLocaleString()}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Artwork References */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0B1633] border-b border-slate-100 pb-3 flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-[#025afc]" /> Submitted Production Artwork Files ({artworkList.length})
              </h3>

              {artworkList.length === 0 ? (
                <p className="text-[14px] text-slate-500 font-medium">No artwork files attached to this order.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {artworkList.map((art, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[14px] gap-3">
                      <div className="min-w-0">
                        <strong className="font-bold text-slate-900 truncate block max-w-[180px]">
                          {art.fileName || art.originalFileName || `Artwork File #${idx + 1}`}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono">Format: {art.format || 'doc'}</span>
                      </div>

                      {art.secureUrl && (
                        <a
                          href={art.secureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-[#07152F] text-white text-[14px] font-bold rounded-xl hover:bg-slate-800 transition flex items-center gap-1 text-decoration-none shrink-0"
                        >
                          <FiExternalLink className="w-3.5 h-3.5" /> View
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: PRICING & DESTINATION (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Pricing Snapshot Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0B1633] border-b border-slate-100 pb-3">
                Financial Breakdown & Tax
              </h3>

              <div className="space-y-2 text-[13.5px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Product Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied</span>
                    <span className="font-bold">-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                {order.isExpress && (
                  <div className="flex justify-between text-amber-700">
                    <span>Express Turnaround</span>
                    <span className="font-bold">+₹{expressFee}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-900">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-500">
                  <div className="flex justify-between">
                    <span>Taxable Base Value</span>
                    <span className="font-medium text-slate-700">₹{taxableAmount.toLocaleString()}</span>
                  </div>

                  {isIntraState ? (
                    <>
                      <div className="flex justify-between">
                        <span>CGST ({gstRate / 2}%)</span>
                        <span className="font-medium text-slate-700">₹{cgst.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>SGST ({gstRate / 2}%)</span>
                        <span className="font-medium text-slate-700">₹{sgst.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between">
                      <span>IGST ({gstRate}%)</span>
                      <span className="font-medium text-slate-700">₹{igst.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-700 font-bold">
                    <span>Total GST ({gstRate}%)</span>
                    <span>₹{totalGst.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-[13px] font-bold text-slate-700 uppercase">Grand Total</span>
                <span className="text-2xl font-bold text-[#0B1633]">₹{grandTotal.toLocaleString()}</span>
              </div>

              <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1 text-xs">
                <div className="flex justify-between text-purple-900 font-bold">
                  <span>Paid to Date:</span>
                  <span>₹{totalCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Balance Outstanding:</span>
                  <span className="font-bold text-amber-800">₹{outstandingBalance.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-3 text-[14px]">
              <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiMapPin className="w-4 h-4 text-[#025afc]" /> Shipping Destination
              </h3>

              <div className="space-y-1 text-slate-700 font-medium leading-relaxed">
                <strong className="font-bold text-slate-900 block text-[14px]">{order.customer?.name}</strong>
                <p>{order.deliveryAddress || order.shippingAddress?.fullAddress}</p>
                <p className="text-slate-500 font-mono pt-1">Phone: {order.customer?.phone}</p>
                {order.customer?.isB2B && order.customer?.gstin && (
                  <p className="text-xs font-mono text-purple-700 pt-1">GSTIN: {order.customer.gstin}</p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />

    </div>
  );
}
