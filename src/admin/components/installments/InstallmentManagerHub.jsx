import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Link as LinkIcon,
  Copy,
  Share2,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  FileText,
  Send,
  Building2,
  Phone,
  Mail,
  User,
  ExternalLink,
  ChevronRight,
  Check
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const InstallmentManagerHub = ({ initialSelectedOrderId = null }) => {
  const { orders } = useAdmin();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, partial, paid, pending
  const [selectedOrderId, setSelectedOrderId] = useState(initialSelectedOrderId || (orders[0]?.id || orders[0]?.orderId || null));

  // Modal states
  const [isRecordManualModalOpen, setIsRecordManualModalOpen] = useState(false);
  const [isEditScheduleModalOpen, setIsEditScheduleModalOpen] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [generatedLinkResult, setGeneratedLinkResult] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

  // Manual payment form state
  const [manualAmount, setManualAmount] = useState('');
  const [manualMethod, setManualMethod] = useState('Bank Transfer');
  const [manualUtr, setManualUtr] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().slice(0, 16));
  const [manualInstallmentId, setManualInstallmentId] = useState('');
  const [manualNotes, setManualNotes] = useState('');
  const [manualAdminName, setManualAdminName] = useState('Admin Officer');
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // Edit schedule state
  const [scheduleInstallments, setScheduleInstallments] = useState([]);

  // Find active selected order
  const selectedOrder = orders.find(o =>
    (o.id && o.id === selectedOrderId) ||
    (o.orderId && o.orderId === selectedOrderId) ||
    (o.orderNumber && o.orderNumber === selectedOrderId)
  ) || orders[0] || null;

  // Helper to reliably compute order financials across all payment modes
  const getOrderFinancials = (o) => {
    const grandTotal = Number(o.pricing?.grandTotal ?? o.totalAmount ?? 0);
    const paid = Number(
      o.totalCollected ??
      o.totalPaid ??
      o.payment?.paidAmount ??
      (o.paymentStatus === 'paid' ? grandTotal : 0)
    );
    const outstanding = Number(
      o.outstandingBalance ??
      o.payment?.remainingBalance ??
      Math.max(0, grandTotal - paid)
    );
    const isPaid = outstanding <= 0 || o.paymentStatus === 'paid';
    const isPartial = paid > 0 && outstanding > 0;
    const isUnpaid = paid === 0 && !isPaid;

    return { grandTotal, paid, outstanding, isPaid, isPartial, isUnpaid };
  };

  const selectedOrderFinancials = selectedOrder ? getOrderFinancials(selectedOrder) : { grandTotal: 0, paid: 0, outstanding: 0 };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const orderNum = (o.orderNumber || o.orderId || o.id || '').toLowerCase();
    const custName = (o.customer?.name || '').toLowerCase();
    const custPhone = (o.customer?.phone || '').toLowerCase();
    const custId = (o.customerId || o.customer?.customerId || '').toLowerCase();
    const query = searchTerm.toLowerCase();

    const matchesSearch = orderNum.includes(query) || custName.includes(query) || custPhone.includes(query) || custId.includes(query);

    const { paid, outstanding, isPaid, isPartial, isUnpaid } = getOrderFinancials(o);

    if (statusFilter === 'partial') return matchesSearch && isPartial;
    if (statusFilter === 'paid') return matchesSearch && isPaid;
    if (statusFilter === 'pending') return matchesSearch && isUnpaid;

    return matchesSearch;
  });

  // Global Collection Metric Statistics (100% Dynamic from live Firestore orders)
  const totalReceivables = orders.reduce((sum, o) => sum + getOrderFinancials(o).grandTotal, 0);
  const totalCollected = orders.reduce((sum, o) => sum + getOrderFinancials(o).paid, 0);
  const totalOutstanding = orders.reduce((sum, o) => sum + getOrderFinancials(o).outstanding, 0);

  // Action feedback helper
  const showFeedback = (text, type = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage({ text: '', type: '' }), 4000);
  };

  // Generate Cashfree Payment Link Handler
  const handleGeneratePaymentLink = async (inst) => {
    if (!selectedOrder) return;
    setIsGeneratingLink(true);
    setGeneratedLinkResult(null);

    try {
      const response = await fetch('/api/generate-payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id || selectedOrder.orderId,
          installmentId: inst.installmentId,
          customAmount: inst.amount - (inst.paidAmount || 0),
          expiryDays: 3,
          adminEmail: 'admin@visualblink.com'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create payment link.');

      setGeneratedLinkResult({
        linkUrl: data.linkUrl,
        linkId: data.linkId,
        amount: data.linkAmount,
        installmentName: inst.name,
        customerPhone: selectedOrder.customer?.phone
      });

      showFeedback(`Payment link generated for ₹${Number(data.linkAmount).toLocaleString()}!`, 'success');
    } catch (err) {
      console.error(err);
      showFeedback(err.message, 'error');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  // Record Manual Payment Submit Handler
  const handleRecordManualPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!manualAmount || Number(manualAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsSubmittingManual(true);
    try {
      const response = await fetch('/api/record-manual-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id || selectedOrder.orderId,
          installmentId: manualInstallmentId || null,
          amount: Number(manualAmount),
          paymentMethod: manualMethod,
          utrReference: manualUtr,
          paymentDate: manualDate ? new Date(manualDate).toISOString() : new Date().toISOString(),
          notes: manualNotes,
          recordedBy: manualAdminName
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to record manual payment.');

      showFeedback(data.message, 'success');
      setIsRecordManualModalOpen(false);
      setManualAmount('');
      setManualUtr('');
      setManualNotes('');
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // Reconcile with Cashfree Gateway API
  const handleReconcileOrder = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch('/api/verify-cashfree-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: selectedOrder.orderNumber || selectedOrder.orderId,
          internalOrderId: selectedOrder.id
        })
      });
      const data = await response.json();
      if (data.status === 'SUCCESS') {
        showFeedback(`Verified! ₹${data.amountReceived} confirmed via Cashfree Tx #${data.transactionId}`, 'success');
      } else {
        showFeedback(`Reconciliation status: ${data.message || data.status}`, 'info');
      }
    } catch (err) {
      showFeedback('Gateway reconciliation error: ' + err.message, 'error');
    }
  };

  // Copy Link to Clipboard
  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (url, amount, instName) => {
    const rawPhone = (selectedOrder?.customer?.phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
    const msg = `Hello ${selectedOrder?.customer?.name || 'Customer'},\n\nHere is your secure Cashfree payment link for *Order #${selectedOrder?.orderNumber || selectedOrder?.orderId}* (${instName}):\n*Amount Due: ₹${Number(amount).toLocaleString()}*\n\n👉 Pay securely online here: ${url}\n\nThank you for choosing VisualBlink Printing!`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Open Edit Schedule Modal
  const openEditScheduleModal = () => {
    if (!selectedOrder) return;
    const current = selectedOrder.installments || [];
    setScheduleInstallments(JSON.parse(JSON.stringify(current)));
    setIsEditScheduleModalOpen(true);
  };

  // Save Modified Schedule
  const handleSaveSchedule = async () => {
    if (!selectedOrder) return;
    try {
      const response = await fetch('/api/manage-installment-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id || selectedOrder.orderId,
          installments: scheduleInstallments,
          adminEmail: 'superadmin@visualblink.com',
          actionNotes: 'Administrator adjusted installment milestone schedule.'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update schedule.');

      showFeedback('Installment schedule reconfigured and reconciled successfully!', 'success');
      setIsEditScheduleModalOpen(false);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">

      {/* Top Banner & KPI Stat Cards */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider mb-1">
              <CreditCard className="w-4 h-4 text-blue-400" /> Cashfree Financial Ledger & Installment Manager
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Installments & Collections Hub
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl font-medium">
              Manage product advance payment policies, generate unique Cashfree payment links, record manual bank/UPI collections, and monitor order ledgers in real-time.
            </p>
          </div>

          {actionMessage.text && (
            <div className={`px-4 py-2 rounded-xl text-xs font-bold border animate-in fade-in duration-200 ${actionMessage.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : (actionMessage.type === 'error' ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40')
              }`}>
              {actionMessage.text}
            </div>
          )}
        </div>

        {/* Aggregate KPI Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Total Order Book</span>
            <div className="text-2xl font-bold text-white">₹{totalReceivables.toLocaleString()}</div>
            <span className="text-[11px] text-slate-400">{orders.length} Active Orders</span>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-xs uppercase font-bold text-emerald-400 block mb-1">Total Verified Collections</span>
            <div className="text-2xl font-bold text-emerald-300">₹{totalCollected.toLocaleString()}</div>
            <span className="text-[11px] text-emerald-400/80 font-medium">Cashfree PG + Offline Receipts</span>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 backdrop-blur-xs">
            <span className="text-xs uppercase font-bold text-amber-400 block mb-1">Outstanding Receivables</span>
            <div className="text-2xl font-bold text-amber-300">₹{totalOutstanding.toLocaleString()}</div>
            <span className="text-[11px] text-amber-400/80 font-medium">Due Upon Completion / Dispatch</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: SEARCHABLE ORDER SELECTOR (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Collection Orders</h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {filteredOrders.length}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Order #, Customer, Phone..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-medium"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
              {[
                { id: 'all', label: 'All' },
                { id: 'partial', label: 'Partially Paid' },
                { id: 'pending', label: 'Unpaid' },
                { id: 'paid', label: 'Fully Paid' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg border cursor-pointer transition ${statusFilter === f.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Scrollable List */}
          <div className="space-y-2.5 max-h-[650px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
                No orders match your filter criteria.
              </div>
            ) : (
              filteredOrders.map(order => {
                const orderId = order.id || order.orderId;
                const isSelected = selectedOrder && (selectedOrder.id === orderId || selectedOrder.orderId === orderId);
                const { grandTotal, paid: totalPaid, outstanding } = getOrderFinancials(order);
                const customer = order.customer || {};

                return (
                  <div
                    key={orderId}
                    onClick={() => setSelectedOrderId(orderId)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${isSelected
                      ? 'bg-blue-50/90 border-blue-600 shadow-md ring-1 ring-blue-600/30'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <strong className="text-sm font-bold text-slate-900 font-mono">
                        #{order.orderNumber || order.orderId || order.id}
                      </strong>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${outstanding <= 0
                        ? 'bg-emerald-100 text-emerald-800'
                        : (totalPaid > 0 ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800')
                        }`}>
                        {outstanding <= 0 ? 'Fully Paid' : (totalPaid > 0 ? 'Partially Paid' : 'Pending')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-700 font-medium truncate mb-2">
                      {customer.name || 'Client'} {customer.company ? `• ${customer.company}` : ''}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 font-semibold">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block">Total</span>
                        <span className="text-slate-900">₹{grandTotal.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase block">Outstanding</span>
                        <span className={outstanding > 0 ? 'text-amber-700 font-bold' : 'text-emerald-700 font-bold'}>
                          ₹{outstanding.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE ORDER INSTALLMENT MANAGEMENT DETAILS (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedOrder ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-400 font-semibold">
              Select an order from the left pane to manage installment schedules and collection actions.
            </div>
          ) : (
            <>
              {/* Order Overview Header Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Reference</span>
                      <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Cust ID: {selectedOrder.customerId || selectedOrder.customer?.customerId || 'VB-CUST'}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 font-mono">
                      #{selectedOrder.orderNumber || selectedOrder.orderId || selectedOrder.id}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleReconcileOrder}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border-none"
                      title="Verify status directly with Cashfree Payments API"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> Reconcile Cashfree
                    </button>

                    <button
                      onClick={() => setIsRecordManualModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border-none shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" /> Record Offline Payment
                    </button>
                  </div>
                </div>

                {/* Customer & Items Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Customer Information</span>
                    <strong className="text-sm font-bold text-slate-900 block">{selectedOrder.customer?.name}</strong>
                    <p className="flex items-center gap-1.5 text-slate-600"><Mail className="w-3 h-3 text-slate-400" /> {selectedOrder.customer?.email}</p>
                    <p className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3 h-3 text-slate-400" /> {selectedOrder.customer?.phone}</p>
                    {selectedOrder.customer?.company && (
                      <p className="flex items-center gap-1.5 text-slate-600"><Building2 className="w-3 h-3 text-slate-400" /> {selectedOrder.customer.company} {selectedOrder.customer.gstin ? `(GSTIN: ${selectedOrder.customer.gstin})` : ''}</p>
                    )}
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Financial Summary</span>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Order Amount:</span>
                      <strong className="text-slate-900">₹{selectedOrderFinancials.grandTotal.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">GST Breakdown:</span>
                      <span className="font-bold text-slate-700">
                        {selectedOrder.pricing?.gstType === 'CGST_SGST'
                          ? `CGST: ₹${selectedOrder.pricing?.cgst} | SGST: ₹${selectedOrder.pricing?.sgst}`
                          : `IGST (18%): ₹${selectedOrder.pricing?.totalGst || 0}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Total Collected:</span>
                      <span>₹{selectedOrderFinancials.paid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-amber-700 font-bold pt-1 border-t border-slate-200">
                      <span>Outstanding Balance:</span>
                      <span>₹{selectedOrderFinancials.outstanding.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Generated Link Alert Banner */}
                {generatedLinkResult && (
                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 animate-in fade-in duration-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        Cashfree Payment Link Active for {generatedLinkResult.installmentName} (₹{Number(generatedLinkResult.amount).toLocaleString()})
                      </span>
                      <span className="text-[10px] font-mono text-purple-600 bg-white px-2 py-0.5 rounded border border-purple-200">
                        ID: {generatedLinkResult.linkId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={generatedLinkResult.linkUrl}
                        className="flex-1 p-2 rounded-xl border border-purple-300 font-mono text-xs bg-white text-purple-950 focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyLink(generatedLinkResult.linkUrl)}
                        className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer border-none transition"
                      >
                        {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copied' : 'Copy Link'}
                      </button>

                      <button
                        onClick={() => handleShareWhatsApp(generatedLinkResult.linkUrl, generatedLinkResult.amount, generatedLinkResult.installmentName)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer border-none transition"
                      >
                        <Share2 className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Installment Schedule Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600" /> Installment Milestones & Payment Schedule
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">
                      Order installment breakdown. Generate unique Cashfree links or record manual payments per milestone.
                    </p>
                  </div>

                  <button
                    onClick={openEditScheduleModal}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border-none"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-500" /> Customize Schedule
                  </button>
                </div>

                {/* Installments Table */}
                <div className="divide-y divide-slate-100">
                  {(selectedOrder.installments && selectedOrder.installments.length > 0
                    ? selectedOrder.installments
                    : [
                      {
                        installmentId: 'inst_1',
                        seq: 1,
                        name: 'Initial Advance (50%)',
                        amount: Math.ceil((selectedOrder.pricing?.grandTotal || selectedOrder.totalAmount || 0) / 2),
                        percentage: 50,
                        status: selectedOrder.paymentStatus === 'paid' || selectedOrder.paymentStatus === 'Advance Paid' ? 'Paid' : 'Due',
                        paidAmount: selectedOrder.totalPaid || 0,
                        dueDate: selectedOrder.createdAt
                      },
                      {
                        installmentId: 'inst_2',
                        seq: 2,
                        name: 'Final Balance (50%)',
                        amount: Math.floor((selectedOrder.pricing?.grandTotal || selectedOrder.totalAmount || 0) / 2),
                        percentage: 50,
                        status: selectedOrder.paymentStatus === 'paid' ? 'Paid' : 'Upcoming',
                        paidAmount: 0,
                        dueDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString()
                      }
                    ]
                  ).map((inst, idx) => {
                    const isPaid = inst.status === 'Paid';
                    const remainingForInst = Math.max(0, inst.amount - (inst.paidAmount || 0));

                    return (
                      <div key={inst.installmentId || idx} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {inst.seq || idx + 1}
                            </span>
                            <strong className="text-sm font-bold text-slate-900">{inst.name}</strong>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : (inst.status === 'Due' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600')
                              }`}>
                              {inst.status}
                            </span>
                          </div>

                          <p className="text-xs text-slate-500 font-medium pl-8">
                            {inst.description || `Milestone payment due: ${new Date(inst.dueDate || Date.now()).toLocaleDateString('en-IN')}`}
                          </p>

                          {inst.transactionId && (
                            <div className="text-[11px] text-slate-500 pl-8 font-mono">
                              Tx Ref: <strong className="text-blue-700">{inst.transactionId}</strong> ({inst.paymentMethod || 'Online'})
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                          <div className="text-right">
                            <div className="text-base font-bold text-slate-900 font-mono">
                              ₹{Number(inst.amount).toLocaleString()}
                            </div>
                            <span className="text-[10px] text-slate-400 font-semibold block">
                              {isPaid ? `Paid: ₹${(inst.paidAmount || inst.amount).toLocaleString()}` : `Due: ₹${remainingForInst.toLocaleString()}`}
                            </span>
                          </div>

                          {!isPaid && (
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                              <button
                                disabled={isGeneratingLink}
                                onClick={() => handleGeneratePaymentLink(inst)}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border-none shadow-2xs"
                                title="Create Cashfree Hosted Payment Link for customer"
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                                {isGeneratingLink ? 'Creating...' : 'Payment Link'}
                              </button>

                              <button
                                onClick={() => {
                                  setManualInstallmentId(inst.installmentId);
                                  setManualAmount(remainingForInst);
                                  setIsRecordManualModalOpen(true);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border-none shadow-2xs"
                                title="Record an offline payment (Bank Transfer, UPI, Cash, Cheque) against this customer"
                              >
                                <Plus className="w-3.5 h-3.5" /> Record Payment
                              </button>

                              {inst.paymentLink?.linkUrl && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleCopyLink(inst.paymentLink.linkUrl)}
                                    title="Copy Active Cashfree Link"
                                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer border-none transition"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleShareWhatsApp(inst.paymentLink.linkUrl, inst.amount, inst.name)}
                                    title="Share Link on WhatsApp"
                                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 cursor-pointer border-none transition"
                                  >
                                    <Share2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chronological Payment Ledger & Audit Trail */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> Chronological Collections & Payment Ledger
                  </h4>
                  <span className="text-xs text-slate-400 font-semibold">
                    {(selectedOrder.paymentsLedger || []).length} Recorded Transactions
                  </span>
                </div>

                {(!selectedOrder.paymentsLedger || selectedOrder.paymentsLedger.length === 0) ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs font-semibold">
                    No transactions recorded yet on this order ledger.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 text-xs">
                    {selectedOrder.paymentsLedger.map((tx, idx) => (
                      <div key={tx.paymentId || idx} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.source === 'cashfree'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-emerald-100 text-emerald-800'
                              }`}>
                              {tx.source === 'cashfree' ? 'Cashfree Online' : `Manual: ${tx.method}`}
                            </span>
                            <span className="font-mono text-slate-500">Ref: {tx.cfPaymentId || tx.utrReference || tx.paymentId}</span>
                          </div>

                          <div className="text-slate-500 font-medium">
                            Recorded by <strong>{tx.recordedBy || 'System'}</strong> on {new Date(tx.timestamp || Date.now()).toLocaleString('en-IN')}
                          </div>
                          {tx.notes && <p className="text-slate-600 italic">Notes: {tx.notes}</p>}
                        </div>

                        <div className="text-right">
                          <strong className="text-sm font-bold text-emerald-600 font-mono block">
                            +₹{Number(tx.amount).toLocaleString()}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-semibold">{tx.status || 'VERIFIED'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* RECORD MANUAL PAYMENT MODAL */}
      {isRecordManualModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Offline / Manual Payment</h3>
                <p className="text-xs text-emerald-100 font-medium">Order #{selectedOrder.orderNumber || selectedOrder.orderId}</p>
              </div>
              <button
                onClick={() => setIsRecordManualModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRecordManualPaymentSubmit} className="p-6 space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block text-slate-700 mb-1">Amount Received (₹)*:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400 text-sm">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    max={Math.max(0, (selectedOrder.pricing?.grandTotal || selectedOrder.totalAmount || 0) - (selectedOrder.totalPaid || 0))}
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 font-bold text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Outstanding collectible balance: ₹{Math.max(0, (selectedOrder.pricing?.grandTotal || selectedOrder.totalAmount || 0) - (selectedOrder.totalPaid || 0)).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Payment Method*:</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Bank Transfer">Bank Transfer (IMPS/NEFT)</option>
                    <option value="UPI">UPI Direct</option>
                    <option value="Cash">Cash at Counter</option>
                    <option value="Cheque">Cheque Clearing</option>
                    <option value="Other">Other Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Payment Date & Time*:</label>
                  <input
                    type="datetime-local"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">UTR / Bank Transaction Reference*:</label>
                <input
                  type="text"
                  required
                  value={manualUtr}
                  onChange={(e) => setManualUtr(e.target.value)}
                  placeholder="e.g. UTR-98821039821 or CHEQUE-9021"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Checked for duplicate reference numbers automatically</span>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Allocate to Installment (Optional):</label>
                <select
                  value={manualInstallmentId}
                  onChange={(e) => setManualInstallmentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">Auto-allocate sequentially across unpaid milestones</option>
                  {(selectedOrder.installments || []).map(inst => (
                    <option key={inst.installmentId} value={inst.installmentId}>
                      {inst.name} — ₹{Number(inst.amount).toLocaleString()} ({inst.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Internal Accounting Notes:</label>
                <textarea
                  rows="2"
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  placeholder="e.g. Confirmed on HDFC Current Account statement..."
                  className="w-full p-2 rounded-xl border border-slate-300 font-medium text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Recorded By Admin:</label>
                <input
                  type="text"
                  value={manualAdminName}
                  onChange={(e) => setManualAdminName(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer border-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManual}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer border-none flex items-center gap-1.5 shadow-sm"
                >
                  {isSubmittingManual ? 'Recording...' : 'Confirm & Save Receipt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMIZE INSTALLMENT SCHEDULE MODAL */}
      {isEditScheduleModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Reconfigure Installment Milestones</h3>
                <p className="text-xs text-slate-400 font-medium">
                  Total Order Value: ₹{Number(selectedOrder.pricing?.grandTotal || selectedOrder.totalAmount || 0).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setIsEditScheduleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center cursor-pointer border-none"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="space-y-3">
                {scheduleInstallments.map((inst, idx) => {
                  const isPaid = inst.status === 'Paid';
                  return (
                    <div key={inst.installmentId || idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">Milestone #{idx + 1}</span>
                        {isPaid && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Paid (Immutable)</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          disabled={isPaid}
                          value={inst.name || ''}
                          onChange={(e) => {
                            const updated = [...scheduleInstallments];
                            updated[idx].name = e.target.value;
                            setScheduleInstallments(updated);
                          }}
                          placeholder="Milestone Name"
                          className="p-2 rounded-xl border border-slate-300 font-bold bg-white"
                        />

                        <input
                          type="number"
                          disabled={isPaid}
                          value={inst.amount || ''}
                          onChange={(e) => {
                            const updated = [...scheduleInstallments];
                            updated[idx].amount = Number(e.target.value) || 0;
                            setScheduleInstallments(updated);
                          }}
                          placeholder="Amount in ₹"
                          className="p-2 rounded-xl border border-slate-300 font-bold bg-white"
                        />

                        <input
                          type="date"
                          disabled={isPaid}
                          value={inst.dueDate ? inst.dueDate.slice(0, 10) : ''}
                          onChange={(e) => {
                            const updated = [...scheduleInstallments];
                            updated[idx].dueDate = new Date(e.target.value).toISOString();
                            setScheduleInstallments(updated);
                          }}
                          className="p-2 rounded-xl border border-slate-300 font-bold bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const newInst = {
                      installmentId: `inst_${Date.now()}_${scheduleInstallments.length + 1}`,
                      seq: scheduleInstallments.length + 1,
                      name: `Installment #${scheduleInstallments.length + 1}`,
                      description: 'Custom milestone allocation',
                      amount: 0,
                      dueDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
                      status: 'Due',
                      paidAmount: 0
                    };
                    setScheduleInstallments([...scheduleInstallments, newInst]);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs flex items-center gap-1 cursor-pointer border border-blue-200"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Milestone
                </button>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 font-bold">Allocated Total: </span>
                  <strong className="text-xs font-mono">
                    ₹{scheduleInstallments.reduce((sum, i) => sum + Number(i.amount || 0), 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsEditScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white text-slate-700 font-bold text-xs cursor-pointer border border-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer border-none shadow-sm"
              >
                Save & Reconcile Schedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
