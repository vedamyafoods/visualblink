import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Truck, 
  Package, 
  FileText, 
  Clock, 
  DollarSign, 
  Send, 
  Layers
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminOrderDetailModal = ({ isOpen, onClose, order }) => {
  const { updateOrderStatus } = useAdmin();
  if (!isOpen || !order) return null;

  const currentStatus = order.status || order.production?.status || 'Payment Confirmed';

  // Consolidate artwork files from order object
  let artworkFiles = [];
  if (order.artwork && Array.isArray(order.artwork) && order.artwork.length > 0) {
    artworkFiles = order.artwork;
  } else if (order.artworkFiles && Array.isArray(order.artworkFiles) && order.artworkFiles.length > 0) {
    artworkFiles = order.artworkFiles;
  } else if (order.artworkFile) {
    artworkFiles = [order.artworkFile];
  }

  // Also check individual items for attached artwork files
  if (order.items && Array.isArray(order.items)) {
    order.items.forEach(item => {
      if (item.artworkFiles && Array.isArray(item.artworkFiles)) {
        item.artworkFiles.forEach(f => {
          if (!artworkFiles.some(existing => existing.secureUrl === f.secureUrl || existing.fileName === f.fileName)) {
            artworkFiles.push(f);
          }
        });
      }
    });
  }

  const handleStatusChange = async (newStatus) => {
    await updateOrderStatus(order.id || order.orderId, newStatus);
  };

  const sendWhatsAppProof = () => {
    const phoneNum = (order.customer?.phone || '').replace(/[^0-9]/g, '');
    const message = `Hello ${order.customer?.name || 'Client'}, your order #${order.orderId || order.id} status is updated to: ${currentStatus}. Thank you for printing with Printigly!`;
    window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight text-white">
                  Order Details: #{order.orderId || order.id}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-[14px] border border-blue-400/30">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                </span>
              </div>
              <p className="text-[14px] text-slate-400">Placed on {formattedDate}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors border-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[14px] text-slate-900 bg-slate-50/50">
          
          {/* Top Operational Status Changer Banner */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">Current Order Status</span>
              <strong className="text-sm font-extrabold text-blue-700">{currentStatus}</strong>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="font-bold text-slate-700 whitespace-nowrap">Update Status:</label>
              <select
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-[14px] font-bold text-blue-900 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="Payment Confirmed">Payment Confirmed</option>
                <option value="Artwork Verification">Artwork Verification</option>
                <option value="In Production">In Production</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Packed & Ready">Packed & Ready</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          {/* Customer & Address Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 text-[14px] uppercase tracking-wider text-slate-400">
                Customer Info
              </h4>
              <div className="space-y-1.5 font-medium text-slate-700">
                <strong className="text-sm font-extrabold text-slate-900 block">{order.customer?.name || 'Customer'}</strong>
                <p className="flex items-center gap-1.5 text-slate-600"><Mail className="w-3.5 h-3.5 text-slate-400" /> {order.customer?.email}</p>
                <p className="flex items-center gap-1.5 text-slate-600"><Phone className="w-3.5 h-3.5 text-slate-400" /> {order.customer?.phone}</p>
                {order.customer?.company && (
                  <p className="flex items-center gap-1.5 text-slate-600"><Building2 className="w-3.5 h-3.5 text-slate-400" /> {order.customer.company} {order.customer.gstin ? `(GSTIN: ${order.customer.gstin})` : ''}</p>
                )}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <h4 className="font-extrabold text-slate-900 border-b border-slate-100 pb-2 text-[14px] uppercase tracking-wider text-slate-400">
                Shipping Destination
              </h4>
              <p className="text-slate-700 font-medium leading-relaxed">
                {order.deliveryAddress || order.shippingAddress?.fullAddress || 'Address not specified'}
              </p>
              {order.deliveryMethod && (
                <div className="pt-2 flex items-center gap-1.5 text-blue-600 font-bold">
                  <Truck className="w-4 h-4" /> {order.deliveryMethod}
                </div>
              )}
            </div>
          </div>

          {/* Client Uploaded Documents & Artwork Files Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" /> Client Uploaded Artwork Files ({artworkFiles.length})
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold">Cloudinary Preserved Original Files</span>
            </div>

            {artworkFiles.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-slate-500 text-center font-semibold">
                No uploaded artwork files attached to this order.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artworkFiles.map((art, idx) => {
                  const url = art.secureUrl || art.url || art.previewUrl;
                  const ext = (art.format || art.fileType || art.fileName || 'file').split('.').pop().toLowerCase();
                  const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

                  return (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {isImage && url ? (
                          <img src={url} alt="Artwork" className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-900 text-white font-extrabold text-[14px] flex items-center justify-center uppercase shrink-0">
                            {ext}
                          </div>
                        )}

                        <div className="min-w-0">
                          <strong className="font-extrabold text-slate-900 truncate block text-[14px]">
                            {art.fileName || art.originalFileName || `Artwork File #${idx + 1}`}
                          </strong>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {art.fileSize ? `${(art.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'Original Resolution'}
                          </span>
                        </div>
                      </div>

                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] flex items-center gap-1 shrink-0 transition-colors shadow-2xs text-decoration-none"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order Items Table & Pricing Summary */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
              Order Items & Pricing Snapshot
            </h4>

            <div className="divide-y divide-slate-100">
              {(order.items || []).map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <strong className="font-extrabold text-slate-900 block">{item.productName || item.name}</strong>
                    <span className="text-slate-500 text-[14px] font-medium">{item.variant || 'Standard Spec'} • Qty: {item.quantity || item.qty} Pcs</span>
                  </div>
                  <span className="font-extrabold text-slate-900 text-sm">
                    ₹{(item.totalPrice || (item.unitPrice * (item.quantity || item.qty)) || 0).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-[14px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-extrabold text-slate-900">₹{(order.subtotal || order.pricing?.subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee:</span>
                  <span className="font-extrabold text-slate-900">₹{(order.shippingFee || order.pricing?.shippingFee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (Inclusive):</span>
                  <span className="font-extrabold text-slate-900">Incl. in Total</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-blue-600">
                  <span>Total Amount:</span>
                  <span>₹{(order.totalAmount || order.pricing?.grandTotal || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={sendWhatsAppProof}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] flex items-center gap-1.5 transition-colors cursor-pointer border-none"
          >
            <Send className="w-3.5 h-3.5" /> WhatsApp Status Update
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-[14px] cursor-pointer border-none transition-colors"
          >
            Close Window
          </button>
        </div>

      </div>
    </div>
  );
};
