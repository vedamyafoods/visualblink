import React, { useState, useEffect } from 'react';
import {
  FiClock,
  FiAlertTriangle,
  FiRefreshCw,
  FiArrowRight,
  FiPhone,
  FiMail,
  FiShoppingBag,
  FiCheckCircle,
  FiFileText,
  FiHelpCircle
} from 'react-icons/fi';
import { subscribeToOrderById } from '../services/firebase';

/**
 * Payment Pending Verification Page
 */
export function PaymentPendingPage({ setCurrentPage }) {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const orderId = getSearchParams().get('orderId') || '';

  const [order, setOrder] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');

  useEffect(() => {
    if (orderId) {
      const unsub = subscribeToOrderById(orderId, (data) => {
        if (data) {
          setOrder(data);
          // If webhook or backend has confirmed payment in the background, redirect to success!
          if (data.paymentStatus === 'paid' || data.paymentStatus === 'Advance Paid' || data.status === 'Payment Confirmed') {
            setCurrentPage('order-success', { orderId });
          }
        }
      });
      return () => unsub && unsub();
    }
  }, [orderId, setCurrentPage]);

  const handleManualRecheck = async () => {
    if (!orderId) return;
    setIsVerifying(true);
    setVerificationMessage('');

    try {
      const res = await fetch('/api/verify-cashfree-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderId })
      });
      const data = await res.json();

      if (data.status === 'SUCCESS') {
        setCurrentPage('order-success', { orderId, cfPaymentId: data.transactionId });
      } else if (data.status === 'PENDING') {
        setVerificationMessage('Your transaction is still being processed by the bank. We will notify you once confirmed.');
      } else {
        setVerificationMessage(data.message || 'Payment has not been confirmed yet. Please check back shortly.');
      }
    } catch (err) {
      setVerificationMessage('Network check note: ' + err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">
      {/* Top Banner */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/10 blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/20 border-2 border-white/20">
            <FiClock className="w-8 h-8 animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Payment Verification in Progress
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            Order <strong className="text-amber-400 font-mono">#{orderId || 'PENDING'}</strong>: We are confirming the transaction with Cashfree and your bank.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm leading-relaxed space-y-2">
            <strong className="block font-bold">What happens next?</strong>
            <p className="text-xs text-amber-800 font-medium">
              1. If money was debited from your bank account or UPI app, it may take 1-5 minutes for Cashfree's server webhook to verify the confirmation.
            </p>
            <p className="text-xs text-amber-800 font-medium">
              2. Do not pay again right away. Your order reference is saved, and we will automatically transition your order to Production once verified.
            </p>
          </div>

          {verificationMessage && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold">
              {verificationMessage}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleManualRecheck}
              disabled={isVerifying}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#025afc] hover:bg-[#6a32f0] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition border-none"
            >
              <FiRefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              {isVerifying ? 'Verifying with Bank...' : 'Re-Check Payment Status Now'}
            </button>

            <button
              onClick={() => setCurrentPage('order-details', { orderId })}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition border-none"
            >
              <FiFileText className="w-4 h-4" /> View Order Status
            </button>
          </div>
        </div>

        {/* Support Help Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0">
              <FiHelpCircle className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-slate-900 block font-bold">Need assistance with this payment?</strong>
              <span className="text-[11px] text-slate-400">Our support desk is available to assist you.</span>
            </div>
          </div>
          <a
            href="https://wa.me/919669155225?text=Hello%20VisualBlink%20Support,%20my%20payment%20is%20pending%20for%20order%20"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shrink-0 text-decoration-none hover:bg-emerald-700"
          >
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Payment Failed Page (Safe Retry without Duplicating Order)
 */
export function PaymentFailedPage({ setCurrentPage }) {
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const orderId = getSearchParams().get('orderId') || '';
  const reason = getSearchParams().get('reason') || 'Transaction was declined by bank or cancelled by user.';

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">
      {/* Top Banner */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-500/10 blur-[120px] pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 relative z-10 space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-red-600/30 border-2 border-white/20">
            <FiAlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Online Payment Incomplete
          </h1>
          <p className="text-slate-300 text-sm max-w-lg mx-auto">
            We could not complete your online advance payment for Order <strong className="text-red-400 font-mono">#{orderId || 'PENDING'}</strong>.
          </p>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-semibold leading-relaxed">
            <strong>Payment Gateway Notice:</strong> {reason}
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Your cart and order details are safely preserved. No amount has been deducted. You can safely retry checkout using UPI, NetBanking, Debit/Credit Card, or contact our support team to pay via direct bank transfer.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setCurrentPage('checkout')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#025afc] hover:bg-[#6a32f0] text-white font-bold text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer transition border-none"
            >
              <FiRefreshCw className="w-4 h-4" /> Retry Payment Safely
            </button>

            <button
              onClick={() => setCurrentPage('cart')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition border-none"
            >
              <FiShoppingBag className="w-4 h-4" /> Return to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
