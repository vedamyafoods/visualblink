import React, { useState } from 'react';
import { FiX, FiCheckCircle, FiEdit3, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import { uploadToCloudinary } from '../../services/cloudinary';
import { APP_CONFIG } from '../../config/appConfig';

export function EditCartItemModal({ isOpen, onClose, item, onSaveItem }) {
  const [quantity, setQuantity] = useState(item?.qty || item?.quantity || 100);
  const [artworkFiles, setArtworkFiles] = useState(item?.artworkFiles || []);
  const [artworkNotes, setArtworkNotes] = useState(item?.artworkNotes || '');
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !item) return null;

  const unitPrice = item.unitPrice || 1.5;
  const recalculatedTotal = Math.round(quantity * unitPrice);

  const handleFileUpload = async (files) => {
    setErrorMsg('');
    setUploading(true);

    const newUploaded = [];
    for (let file of Array.from(files)) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!APP_CONFIG.ALLOWED_ARTWORK_EXTENSIONS.includes(ext)) {
        setErrorMsg(`Format .${ext} not allowed.`);
        setUploading(false);
        return;
      }
      try {
        const res = await uploadToCloudinary(file, `cart_edit/${Date.now()}`);
        if (res && res.secureUrl) {
          newUploaded.push({
            fileName: res.fileName || file.name,
            originalFileName: file.name,
            fileType: file.type || ext,
            fileSize: file.size,
            format: ext,
            secureUrl: res.secureUrl,
            publicId: res.publicId,
            uploadedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        setErrorMsg('File upload failed. Please try again.');
      }
    }

    setArtworkFiles(prev => [...prev, ...newUploaded]);
    setUploading(false);
  };

  const handleRemoveFile = (index) => {
    setArtworkFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    onSaveItem(item.cartItemId || item.id, {
      qty: quantity,
      quantity: quantity,
      totalPrice: recalculatedTotal,
      artworkFiles: artworkFiles,
      artworkNotes: artworkNotes,
      uploadedFile: artworkFiles.length > 0 ? artworkFiles[0].fileName : null
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div className="bg-[#07152F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiEdit3 className="w-5 h-5 text-[#FF5A1F]" />
            <h3 className="font-extrabold text-lg">Edit Cart Item</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-white/10 text-slate-300 hover:text-white cursor-pointer border-none">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 text-[14px] text-[#0B1633]">
          <div>
            <span className="text-[10px] font-bold text-[#FF5A1F] block uppercase tracking-wider">Product Name</span>
            <h4 className="text-base font-extrabold text-[#0B1633]">{item.name}</h4>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-1.5">
            <label className="font-extrabold text-[14px] block text-slate-800">Quantity (Units):</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32 bg-[#F7F8FA] border border-slate-200 rounded-xl py-2.5 px-3 text-sm font-extrabold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
              />
              <span className="text-[14px] text-slate-500 font-medium">Unit Price: ₹{unitPrice}</span>
            </div>
          </div>

          {/* Artwork Files Section */}
          <div className="space-y-2">
            <label className="font-extrabold text-[14px] block text-slate-800">Uploaded Artwork Files ({artworkFiles.length}):</label>
            
            {artworkFiles.length > 0 && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {artworkFiles.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#FAFBFD] border border-slate-200 flex items-center justify-between text-[14px]">
                    <span className="font-extrabold truncate max-w-[240px] text-slate-800">{f.fileName || f.originalFileName}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-rose-600 hover:text-rose-800 p-1 font-bold cursor-pointer"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="border-2 border-dashed border-slate-200 hover:border-[#FF5A1F] rounded-2xl p-4 text-center block bg-[#F7F8FA] cursor-pointer transition">
              <FiUploadCloud className="w-6 h-6 text-[#FF5A1F] mx-auto mb-1" />
              <span className="text-[14px] font-bold text-slate-800 block">
                {uploading ? 'Uploading replacement...' : '+ Add / Replace Artwork Files'}
              </span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.ai,.psd,.cdr"
                className="hidden"
                disabled={uploading}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              />
            </label>

            {errorMsg && <p className="text-rose-600 font-bold text-[14px]">{errorMsg}</p>}
          </div>

          {/* Artwork Notes */}
          <div className="space-y-1">
            <label className="font-extrabold text-[14px] block text-slate-800">Special Instructions:</label>
            <textarea
              rows={2}
              value={artworkNotes}
              onChange={(e) => setArtworkNotes(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-2.5 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] resize-none"
            />
          </div>

          {/* Total Recalculation Summary */}
          <div className="p-3.5 rounded-2xl bg-orange-50/60 border border-orange-200/60 flex items-center justify-between">
            <span className="font-bold text-slate-700 text-[14px]">Recalculated Item Total:</span>
            <span className="text-lg font-black text-[#FF5A1F]">₹{recalculatedTotal.toLocaleString()}</span>
          </div>

        </div>

        <div className="p-4 bg-[#FAFBFD] border-t border-slate-200 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-[14px] text-slate-700 hover:bg-slate-100 transition cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] shadow-md transition cursor-pointer flex items-center gap-1.5 border-none">
            <FiCheckCircle className="w-4 h-4" /> Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
