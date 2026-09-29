import React, { useState } from 'react';
import { 
  Palette, 
  UserCheck, 
  Upload, 
  Send, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Phone
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { uploadToCloudinary } from '../../../services/cloudinary';

export const DesignTicketDesk = () => {
  const { 
    designRequests, 
    assignDesignerToTicket, 
    uploadTicketProof 
  } = useAdmin();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, ticketId) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const result = await uploadToCloudinary(file, 'proofs');
    if (result.success) {
      uploadTicketProof(ticketId, result.url);
      alert(`Proof uploaded successfully! Cloudinary URL: ${result.url}`);
    }
    setUploading(false);
  };

  const designers = ["Ananya R.", "Vikram S.", "Rohan M.", "Pooja K."];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-50/60 via-white to-slate-50 rounded-2xl p-6 text-slate-800 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider text-purple-600 mb-1">
            <Sparkles className="w-4 h-4 text-purple-600" /> Dedicated Design Assistance Hub
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Custom Design Request Desk (+₹299 Fee Tier)
          </h2>
          <p className="text-[14px] text-slate-500 mt-1 max-w-xl font-medium">
            In-house graphic design ticketing workflow. Assign requests, upload digital proof previews to Cloudinary, and trigger automated WhatsApp customer approval links.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 text-center">
            <div className="text-lg font-black text-purple-700">{designRequests.length}</div>
            <div className="text-[10px] text-purple-600 uppercase font-extrabold">Total Tickets</div>
          </div>
        </div>
      </div>

      {/* Ticket Desk Queue Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {designRequests.map((ticket) => (
          <div 
            key={ticket.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4 relative hover:border-purple-300 transition-all"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-extrabold text-sm text-slate-900">{ticket.id}</span>
                <span className="text-[14px] text-slate-500 ml-2 font-mono">• Order: {ticket.orderId}</span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[14px] font-bold border ${
                ticket.status === 'Proof Generated' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}>
                {ticket.status}
              </span>
            </div>

            <div className="space-y-1 text-[14px]">
              <div className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>{ticket.customerName}</span>
                <span className="font-mono text-slate-500 text-[14px] flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" /> {ticket.phone}
                </span>
              </div>
              <p className="font-semibold text-blue-600">{ticket.product}</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 mt-2 text-[14px] italic">
                "{ticket.brief}"
              </div>
            </div>

            {/* Assignee Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[14px]">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-slate-700">Assigned Designer:</span>
              </div>
              <select
                value={ticket.assignedDesigner || ''}
                onChange={(e) => assignDesignerToTicket(ticket.id, e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-purple-700 focus:outline-none focus:border-purple-500 cursor-pointer"
              >
                <option value="">-- Unassigned --</option>
                {designers.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Digital Proof Upload & WhatsApp Dispatch System */}
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {ticket.proofUrl ? (
                <div className="flex items-center justify-between bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200 text-[14px]">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img src={ticket.proofUrl} alt="Proof" className="w-10 h-10 object-cover rounded-lg border border-emerald-300" />
                    <span className="font-semibold text-emerald-900 truncate">Digital Proof Uploaded</span>
                  </div>
                  <a
                    href={ticket.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 rounded bg-white text-emerald-700 font-bold text-[14px] border border-emerald-300 flex items-center gap-1"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <label className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/40 hover:bg-purple-50 text-purple-700 font-bold text-[14px] flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload Generated Proof image/pdf'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, ticket.id)}
                    className="hidden"
                  />
                </label>
              )}

              {ticket.proofUrl && (
                <button
                  onClick={() => {
                    const rawPhone = ticket.phone || '';
                    const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
                    const msg = `Hi ${ticket.customerName || 'Client'}, your custom design proof for ${ticket.product || 'your product'} is ready! Preview here: ${ticket.proofUrl}. Reply 'APPROVE' to start printing.`;
                    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[14px] flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer border-none"
                >
                  <Send className="w-3.5 h-3.5" /> Send Approval Link via WhatsApp
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
