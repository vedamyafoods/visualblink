import React, { useEffect, useState } from 'react';
import {
  FiCheckCircle,
  FiPackage,
  FiTruck,
  FiArrowRight,
  FiShoppingBag,
  FiClock,
  FiFileText,
  FiShield,
  FiMail,
  FiPrinter,
  FiCreditCard,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { subscribeToOrderById } from '../services/firebase';
import { InvoiceModal } from '../Components/orders/InvoiceModal';

export function OrderSuccessPage({ setCurrentPage }) {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const orderId = getSearchParams().get('orderId') || 'PRT-100000';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

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

  // Delivery details
  const isExpress = order?.isExpress;
  const deliveryDays = isExpress ? '24-48 Hours Express' : '3-5 Business Days';
  const expectedDate = new Date(Date.now() + (isExpress ? 2 : 4) * 24 * 3600 * 1000).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Extract financial data safely from order document
  const pricing = order?.pricing || {};
  const grandTotal = order?.totalAmount || pricing.grandTotal || 0;
  const subtotal = order?.subtotal || pricing.subtotal || 0;
  const discount = pricing.couponDiscount || 0;
  const shippingFee = order?.shippingFee ?? pricing.shippingFee ?? 0;
  const expressFee = isExpress ? (pricing.expressFee || 299) : 0;
  const taxableAmount = pricing.taxableAmount || subtotal;
  const totalGst = pricing.totalGst || 0;
  const cgst = pricing.cgst || 0;
  const sgst = pricing.sgst || 0;
  const igst = pricing.igst || 0;
  const isIntraState = pricing.isCustomerIntraState ?? true;
  const gstRate = pricing.gstRate || 18;

  // Payments & Ledger
  const payment = order?.payment || {};
  const totalPaid = payment.paidAmount || (order?.paymentStatus === 'paid' ? grandTotal : 0);
  const remainingBalance = payment.remainingBalance !== undefined ? payment.remainingBalance : Math.max(0, grandTotal - totalPaid);

  // Latest payment transaction details
  const paymentsLedger = order?.paymentsLedger || [];
  const latestPayment = paymentsLedger.length > 0 ? paymentsLedger[paymentsLedger.length - 1] : null;
  const currentTransactionId = latestPayment?.cfPaymentId || payment.cfPaymentId || order?.cfPaymentId || 'VERIFIED-ONLINE';
  const amountReceivedNow = latestPayment?.amount || totalPaid || 0;
  const paymentTimestamp = latestPayment?.paidAt || payment.paidAt || order?.createdAt || new Date().toISOString();

  const formattedPaymentDate = new Date(paymentTimestamp).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Installment schedule
  const installments = order?.installments || [
    {
      sequence: 1,
      name: 'Initial Advance Payment',
      amount: totalPaid || grandTotal,
      status: 'Paid',
      dueDate: 'At checkout',
      paidAt: paymentTimestamp
    },
    ...(remainingBalance > 0 ? [{
      sequence: 2,
      name: 'Dispatch Balance Payment',
      amount: remainingBalance,
      status: 'Due',
      dueDate: 'Before shipment handoff'
    }] : [])
  ];

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">

      {/* Top Banner Header */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30 border-2 border-white/30 animate-in zoom-in-75">
            <FiCheckCircle className="w-9 h-9" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Payment & Order Confirmed 🎉
          </h1>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Your payment was successfully received and verified via Cashfree. Order <strong className="text-emerald-400 font-mono">#{orderId}</strong> has been transmitted directly to our live production pipeline!
          </p>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">

        {/* TRANSACTION & PAYMENT VERIFICATION CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-md shadow-emerald-500/5 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest block flex items-center gap-1.5">
                <FiShield className="w-3.5 h-3.5" /> Cashfree Verified Transaction
              </span>
              <h3 className="text-2xl font-bold text-[#0B1633] mt-0.5">Payment Summary</h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                ● Status: {order?.paymentStatus === 'paid' ? 'Fully Paid' : 'Advance Paid (Installment 1 Active)'}
              </span>
              <span className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-200">
                Cashfree PG
              </span>
            </div>
          </div>

          {/* Key Transaction Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[13.5px]">
            <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1">
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">Received in this Payment</span>
              <strong className="text-2xl font-extrabold text-emerald-600 block">₹{amountReceivedNow.toLocaleString()}</strong>
              <span className="text-[11px] text-emerald-700/80 font-medium">Instant Online Settlement</span>
            </div>

            <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cashfree Reference ID</span>
              <strong className="text-xs font-bold text-slate-800 block font-mono truncate" title={currentTransactionId}>
                {currentTransactionId}
              </strong>
              <span className="text-[10px] text-slate-500 font-medium">{formattedPaymentDate}</span>
            </div>

            <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-slate-200/80 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Order Value</span>
              <strong className="text-xl font-bold text-[#0B1633] block">₹{grandTotal.toLocaleString()}</strong>
              <span className="text-[10px] text-slate-500 font-medium">Total Payable Amount</span>
            </div>

            <div className={`p-4 rounded-2xl border space-y-1 ${remainingBalance > 0 ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-emerald-50/50 border-emerald-100 text-emerald-900'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">Remaining Balance</span>
              <strong className={`text-xl font-bold block ${remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {remainingBalance > 0 ? `₹${remainingBalance.toLocaleString()}` : '₹0 (Settled)'}
              </strong>
              <span className="text-[10px] font-medium opacity-80">
                {remainingBalance > 0 ? 'Due upon press completion' : 'Zero balance remaining'}
              </span>
            </div>
          </div>

          {/* INSTALLMENT SCHEDULE TIMELINE */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-purple-600" /> Installment Breakdown & Schedule:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {installments.map((inst, idx) => {
                const isPaid = inst.status?.toLowerCase() === 'paid';
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-center justify-between text-sm ${isPaid
                      ? 'bg-emerald-50/40 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isPaid ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                          }`}>
                          {isPaid ? <FiCheck className="w-3 h-3" /> : inst.sequence}
                        </span>
                        <strong className="font-bold text-slate-900 text-[13.5px]">{inst.name || `Installment ${inst.sequence}`}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7 font-medium">
                        Due: {inst.dueDate || 'Upon completion'}
                        {inst.paidAt && ` • Paid on ${new Date(inst.paidAt).toLocaleDateString('en-IN')}`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-extrabold text-[#0B1633] block">₹{(inst.amount || 0).toLocaleString()}</span>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                        {inst.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* GST BREAKDOWN & ORDER ITEMS CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E7EAF0] shadow-sm space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2">
              <FiPackage className="w-4 h-4 text-[#025afc]" /> Order Items & Tax Details
            </h3>
            <span className="text-xs font-mono text-slate-400">Order ID: #{orderId}</span>
          </div>

          {/* Purchased Items */}
          {order?.items && order.items.length > 0 && (
            <div className="divide-y divide-slate-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img src={item.image} alt={item.productName || item.name} className="w-12 h-12 rounded-xl object-cover border border-slate-100 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-slate-900 block">{item.productName || item.name}</span>
                      <span className="text-slate-400 text-xs font-medium">Quantity: {item.quantity || item.qty} units</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#0B1633]">₹{(item.totalPrice || (item.unitPrice * (item.quantity || item.qty))).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}

          {/* GST Breakdown Table */}
          <div className="bg-[#FAFBFD] p-4 rounded-2xl border border-slate-200/80 space-y-2 text-[13px] text-slate-600">
            <div className="flex justify-between">
              <span>Taxable Value of Goods & Logistics</span>
              <span className="font-semibold text-slate-800">₹{taxableAmount.toLocaleString()}</span>
            </div>

            {isIntraState ? (
              <>
                <div className="flex justify-between">
                  <span>CGST ({gstRate / 2}%)</span>
                  <span className="font-semibold text-slate-800">₹{cgst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST ({gstRate / 2}%)</span>
                  <span className="font-semibold text-slate-800">₹{sgst.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST ({gstRate}%)</span>
                <span className="font-semibold text-slate-800">₹{igst.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-200">
              <span>Total GST Snapshot ({gstRate}%)</span>
              <span>₹{totalGst.toLocaleString()}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {order?.deliveryAddress && (
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-[13.5px] text-blue-900 space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-blue-600 block">Shipping Destination:</span>
              <p className="font-semibold text-slate-800 leading-relaxed">{order.deliveryAddress}</p>
            </div>
          )}

          {/* Email Notification Status */}
          {order && (
            <div className={`p-4 rounded-2xl border text-[13.5px] font-semibold flex items-center gap-3 ${order.emailStatus?.customer === 'sent'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}>
              <FiMail className="w-5 h-5 shrink-0" />
              <div>
                {order.emailStatus?.customer === 'sent' ? (
                  <span>Confirmation email & payment receipt sent to <strong className="font-bold">{order.customer?.email || 'your email'}</strong>.</span>
                ) : (
                  <span>Your order was recorded and paid. Production has started immediately.</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 flex-wrap">
          <button
            onClick={() => setIsInvoiceOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[13.5px] uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition border-none"
          >
            <FiPrinter className="w-4 h-4" /> Download Official Tax Invoice
          </button>

          <button
            onClick={() => setCurrentPage('order-details', { orderId })}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#025afc] hover:bg-[#6a32f0] text-white font-bold text-[13.5px] uppercase tracking-wider shadow-md shadow-[#025afc]/20 flex items-center justify-center gap-2 cursor-pointer transition border-none"
          >
            <FiTruck className="w-4 h-4" /> Track Order in Real-Time
          </button>

          <button
            onClick={() => setCurrentPage('account')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#07152F] hover:bg-slate-800 text-white font-bold text-[13.5px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition border-none"
          >
            <FiFileText className="w-4 h-4" /> View My Orders
          </button>

          <button
            onClick={() => setCurrentPage('products')}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-[13.5px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <FiShoppingBag className="w-4 h-4" /> Continue Shopping
          </button>
        </div>

      </div>

      {/* Printable Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
        order={order}
      />

    </div>
  );
}
