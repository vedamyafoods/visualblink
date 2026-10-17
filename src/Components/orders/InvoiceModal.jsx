import React, { useState } from 'react';
import { FiDownload, FiX } from 'react-icons/fi';
import html2canvas from 'html2canvas';

/**
 * Extracts and normalizes all selected addons, specifications, and options for an order item
 */
function getItemSpecifications(item) {
  const specs = [];

  // 1. Direct specification attributes
  if (item.paper) {
    specs.push({ label: 'Paper Stock / Material', val: item.paper });
  }
  if (item.finish) {
    specs.push({ label: 'Lamination & Finish', val: item.finish });
  }
  if (item.sides) {
    specs.push({ label: 'Printing Sides', val: item.sides });
  }
  if (item.corners) {
    specs.push({ label: 'Corner Style', val: item.corners });
  }
  if (item.customWidth && item.customHeight) {
    specs.push({ label: 'Custom Dimensions', val: `${item.customWidth} x ${item.customHeight} cm` });
  } else if (item.size) {
    specs.push({ label: 'Size / Dimensions', val: item.size });
  }

  // 2. Scan selectedOptions map for any dynamic or custom form options
  if (item.selectedOptions && typeof item.selectedOptions === 'object') {
    Object.entries(item.selectedOptions).forEach(([rawKey, val]) => {
      if (!val) return;
      const cleanVal = typeof val === 'object' ? JSON.stringify(val) : String(val).trim();
      if (!cleanVal || cleanVal === 'undefined' || cleanVal === 'null') return;

      const normKey = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '');
      const isDuplicate = specs.some(s => {
        const existingNorm = s.label.toLowerCase().replace(/[^a-z0-9]/g, '');
        return existingNorm === normKey || s.val.toLowerCase() === cleanVal.toLowerCase();
      });

      if (!isDuplicate) {
        const formattedLabel = rawKey
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase())
          .trim();
        specs.push({ label: formattedLabel, val: cleanVal });
      }
    });
  }

  if (specs.length === 0 && item.variant) {
    specs.push({ label: 'Configuration', val: item.variant });
  }

  return specs;
}

/**
 * Normalizes item services and addons with individual line-by-line pricing
 */
function getItemServicesWithPrices(item) {
  const qty = Number(item.quantity || item.qty || 1);
  const totalItemAmount = Number(item.totalPrice || (item.unitPrice * qty) || 0);
  const unitPrice = Number(item.unitPrice || (totalItemAmount / qty) || 0);

  // If item already carries an explicit serviceBreakdown:
  if (Array.isArray(item.serviceBreakdown) && item.serviceBreakdown.length > 0) {
    return item.serviceBreakdown.map(s => ({
      label: s.label,
      value: s.value,
      rate: Number(s.rate !== undefined ? s.rate : s.priceModifier || 0),
      amount: Number(s.amount !== undefined ? s.amount : (Number(s.priceModifier || 0) * qty))
    }));
  }

  const rawSpecs = getItemSpecifications(item);
  if (rawSpecs.length === 0) {
    return [
      {
        label: 'Base Printing & Material',
        value: 'Standard Specifications',
        rate: unitPrice,
        amount: totalItemAmount
      }
    ];
  }

  const specList = [];
  let allocatedRate = 0;

  rawSpecs.forEach(spec => {
    let modifier = 0;
    const lowerLabel = spec.label.toLowerCase();
    const lowerVal = spec.val.toLowerCase();

    if (spec.priceModifier !== undefined) {
      modifier = Number(spec.priceModifier);
    } else if (lowerLabel.includes('lamination') || lowerLabel.includes('finish')) {
      modifier = lowerVal.includes('velvet') ? 1.5 : (lowerVal.includes('matte') ? 0.8 : 0.5);
    } else if (lowerLabel.includes('cutting') || lowerLabel.includes('corner')) {
      modifier = lowerVal.includes('round') ? 0.5 : (lowerVal.includes('edge') ? 1.0 : 0.5);
    } else if (lowerLabel.includes('side')) {
      modifier = lowerVal.includes('double') ? 1.5 : 0;
    } else if (lowerLabel.includes('paper') || lowerLabel.includes('size')) {
      modifier = 0.5;
    } else {
      modifier = 0.5;
    }

    specList.push({
      label: spec.label,
      value: spec.val,
      rate: modifier,
      amount: Math.round(modifier * qty * 100) / 100
    });
    allocatedRate += modifier;
  });

  const baseRate = Math.max(0, Math.round((unitPrice - allocatedRate) * 100) / 100);
  const baseAmount = Math.max(0, Math.round((totalItemAmount - (allocatedRate * qty)) * 100) / 100);

  return [
    {
      label: 'Base Printing & Material',
      value: `${qty} pcs`,
      rate: baseRate,
      amount: baseAmount
    },
    ...specList
  ];
}

export function InvoiceModal({ isOpen, onClose, order }) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !order) return null;

  const handleDownloadJpg = async () => {
    const invoiceEl = document.getElementById('printable-tax-invoice');
    if (!invoiceEl) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(invoiceEl, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      const orderNum = order.orderId || order.orderNumber || order.id || 'order';
      link.download = `Invoice-INV-${orderNum}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Invoice JPG generation failed:', err);
      alert('Unable to generate JPG invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const pricing = order.pricing || {};
  const subtotal = Number(order.subtotal || pricing.subtotal || 0);
  const discount = Number(pricing.couponDiscount || order.couponDiscount || 0);
  const shipping = Number(order.shippingFee !== undefined ? order.shippingFee : (pricing.shippingFee || 0));

  // Taxable Value of Goods & Services: strictly net subtotal (goods & services addon)
  const taxableGoods = Number(pricing.taxableGoodsAmount || pricing.taxableAmount || Math.max(0, subtotal - discount) || 0);

  // Total Tax (18% GST)
  let totalGst = Number(pricing.totalGst || order.gstAmount || 0);
  if (!totalGst && taxableGoods > 0) {
    totalGst = Math.round((taxableGoods * 0.18) * 100) / 100;
  }

  // Grand Total: Taxable Goods + GST + Shipping Logistics
  const grandTotal = Number(order.totalAmount || pricing.grandTotal || (taxableGoods + totalGst + shipping) || 0);

  // Payments & Ledger
  const payment = order.payment || {};
  const totalPaid = Number(order.totalPaid !== undefined 
    ? order.totalPaid 
    : (payment.paidAmount !== undefined ? payment.paidAmount : (order.paymentStatus === 'paid' ? grandTotal : 0)));
  const balanceDue = Number(order.outstandingBalance !== undefined 
    ? order.outstandingBalance 
    : Math.max(0, grandTotal - totalPaid));

  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Controls Bar: Download JPG direct button and Close */}
        <div className="bg-[#07152F] text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base">Official Tax Invoice</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[14px] border border-emerald-400/30">
              #{order.orderId || order.orderNumber || order.id}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadJpg}
              className="px-5 py-2.5 rounded-xl bg-[#612af6] hover:bg-[#521fd6] text-white font-extrabold text-[13.5px] uppercase tracking-wider flex items-center gap-2 transition cursor-pointer border-none shadow-lg shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            >
              <FiDownload className="w-4 h-4" />
              {isDownloading ? 'Generating JPG...' : 'Download Bill (JPG)'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer border-none"
              aria-label="Close invoice modal"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Document Canvas Body */}
        <div id="printable-tax-invoice" className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 font-sans text-[13px] leading-normal">

          {/* Top Header & Registered Seller Info */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-8 h-8 rounded-lg bg-[#07152F] text-white font-black flex items-center justify-center text-lg">V</span>
                <span className="text-2xl font-black tracking-tight text-[#07152F]">VISUALBLINK</span>
              </div>
              <p className="font-semibold text-slate-700 text-[13px]">Enterprise Printing & Packaging Studio</p>
              <p className="font-mono text-[13px] text-slate-800 font-bold mt-1">
                GSTIN: <span className="text-black bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono">23AVCPL5031D1Z6</span>
              </p>
              <p className="text-slate-600 text-xs mt-0.5">State: Madhya Pradesh (State Code: 23) • Pan-India Logistics</p>
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-2xl font-black text-[#07152F] uppercase tracking-wider">TAX INVOICE</h2>
              <p className="font-mono text-sm text-slate-800">
                Invoice #: <strong>INV-{order.orderId || order.orderNumber || order.id}</strong>
              </p>
              <p className="font-mono text-xs font-bold text-slate-700">
                Customer ID: {order.customerId || order.customer?.customerId || 'VB-CUST-REGISTERED'}
              </p>
              <p className="text-slate-600 text-xs">Date of Issue: <strong>{invoiceDate}</strong></p>
              <div className="pt-1">
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-900 border border-slate-300">
                  Payment Status: {order.paymentStatus || 'PAID'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Shipping Addresses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Billed To (Customer Details):</span>
              <strong className="text-sm font-bold text-slate-900 block">{order.customer?.name || 'Valued Customer'}</strong>
              {order.customer?.company && (
                <p className="text-slate-800 font-semibold text-xs mt-0.5">{order.customer.company}</p>
              )}
              {order.customer?.gstin ? (
                <p className="font-mono text-xs font-bold text-slate-900 mt-1">Buyer GSTIN: {order.customer.gstin}</p>
              ) : (
                <p className="text-slate-500 text-[11px] mt-0.5">Customer Type: Consumer / Unregistered</p>
              )}
              <p className="text-slate-600 text-xs mt-1">{order.customer?.email}</p>
              <p className="text-slate-600 text-xs">{order.customer?.phone}</p>
            </div>

            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">Shipping & Delivery Destination:</span>
              <p className="text-slate-800 font-medium leading-relaxed text-xs">
                {order.deliveryAddress || order.shippingAddress?.fullAddress || 'Standard Registered Shipping Address'}
              </p>
              <p className="text-slate-500 text-[11px] mt-2">
                Turnaround: <strong>{order.isExpress ? 'Express Dispatch (24-48h)' : 'Standard Express Cargo'}</strong>
              </p>
            </div>
          </div>

          {/* Line Items Table with Addons Ek-Ke-Niche-Ek & Itemized Prices */}
          <div className="space-y-1">
            <table className="w-full text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900 text-[11px] font-bold uppercase text-slate-800">
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-10">#</th>
                  <th className="py-2.5 px-3 border-r border-slate-300">ITEM DESCRIPTION & ENABLED SERVICES / ADDONS</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-20">HSN/SAC</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-center w-16">QTY</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 text-right w-24">UNIT RATE</th>
                  <th className="py-2.5 px-3 text-right w-28">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {items.map((item, idx) => {
                  const services = getItemServicesWithPrices(item);
                  const itemQty = Number(item.quantity || item.qty || 1);
                  const itemUnitPrice = Number(item.unitPrice || 0);
                  const itemTotal = Number(item.totalPrice || (itemUnitPrice * itemQty));

                  return (
                    <tr key={idx} className="align-top">
                      <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      <td className="py-3 px-3 border-r border-slate-200 space-y-2">
                        <strong className="font-bold text-slate-900 block text-[13.5px]">
                          {item.productName || item.name || 'Custom Printed Product'}
                        </strong>

                        {/* Services & Specifications List: Ek ke niche ek with price in opposite column */}
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2">
                          <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider pb-1.5 border-b border-slate-200 flex justify-between items-center">
                            <span>Enabled Services & Specifications</span>
                            <span>Service Charge</span>
                          </div>

                          <div className="space-y-1.5">
                            {services.map((srv, sIdx) => (
                              <div key={sIdx} className="flex justify-between items-start text-[11.5px] py-0.5 border-b border-slate-100 last:border-0">
                                <div className="text-slate-800 pr-3">
                                  <span className="font-bold text-slate-900">• {srv.label}: </span>
                                  <span className="font-semibold text-slate-700">{srv.value}</span>
                                  {srv.rate > 0 && (
                                    <span className="text-[10px] text-slate-500 font-mono ml-1.5">
                                      (@ ₹{srv.rate.toFixed(2)}/pc)
                                    </span>
                                  )}
                                </div>
                                <div className="font-mono font-bold text-slate-900 text-right shrink-0">
                                  ₹{srv.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-slate-200 text-[11.5px] font-bold text-slate-900">
                            <span>Item Net Total:</span>
                            <span className="font-mono">
                              ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                        {item.artworkNotes && (
                          <p className="text-[11px] text-slate-500 italic pt-0.5">
                            Notes: {item.artworkNotes}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-3 border-r border-slate-200 text-center font-mono text-[11px] text-slate-600">
                        9989
                      </td>

                      <td className="py-3 px-3 border-r border-slate-200 text-center font-bold text-slate-900">
                        {itemQty}
                      </td>

                      <td className="py-3 px-3 border-r border-slate-200 text-right font-mono text-slate-800">
                        ₹{itemUnitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">
                        ₹{itemTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation & Unified Tax Table (No CGST / SGST) */}
          <div className="flex justify-end pt-2">
            <div className="w-full sm:w-80 space-y-1.5 text-xs border border-slate-300 rounded-xl p-3 bg-slate-50">
              <div className="flex justify-between text-slate-700">
                <span>Taxable Value of Goods & Services:</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{taxableGoods.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount:</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              )}

              {/* Unified Tax (GST 18%) - Clean, single row */}
              <div className="flex justify-between text-slate-900 font-bold text-[11.5px] pt-1.5 border-t border-dashed border-slate-300">
                <span>Total Tax (GST 18%):</span>
                <span className="font-mono">
                  ₹{totalGst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between text-slate-700 pt-1 border-t border-slate-300">
                <span>Shipping & Delivery Cargo:</span>
                <span className="font-bold text-slate-900 font-mono">
                  {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
              </div>

              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-black text-slate-950">
                <span>Total Invoice Amount:</span>
                <span className="font-mono">
                  ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Payment Receipt / Ledger */}
              <div className="pt-2 border-t border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-700">
                  <span>Amount Received / Paid:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    ₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Outstanding Balance Due:</span>
                  <span className={`font-bold font-mono ${balanceDue > 0 ? 'text-amber-800' : 'text-slate-900'}`}>
                    ₹{balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Compliance & Declaration */}
          <div className="pt-4 border-t border-slate-200 text-center space-y-1 text-slate-500 text-[10px] leading-relaxed">
            <p className="font-semibold text-slate-700">
              Tax is payable under Reverse Charge: <strong>NO</strong> • SAC Code: <strong>9989 (Commercial Printing & Packaging Services)</strong>
            </p>
            <p>
              This is a computer-generated tax invoice issued by VisualBlink Technologies.
            </p>
            <p className="font-medium text-slate-600">
              Thank you for trusting VisualBlink for your custom corporate printing & packaging!
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
