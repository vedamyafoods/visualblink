import React, { useState, useRef } from 'react';
import { 
  FiUploadCloud, 
  FiX, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiFileText, 
  FiImage, 
  FiTrash2, 
  FiRefreshCw, 
  FiPlus, 
  FiLock,
  FiInfo
} from 'react-icons/fi';
import { uploadToCloudinary } from '../../services/cloudinary';
import { APP_CONFIG } from '../../config/appConfig';

export function ArtworkUploadModal({ isOpen, onClose, onConfirmUpload, productTitle, initialFiles = [], initialNotes = '' }) {
  const [fileList, setFileList] = useState(initialFiles);
  const [artworkNotes, setArtworkNotes] = useState(initialNotes);
  const [errorMessage, setErrorMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateFile = (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!APP_CONFIG.ALLOWED_ARTWORK_EXTENSIONS.includes(ext)) {
      return `Unsupported file format (.${ext}). Allowed formats: JPG, PNG, PDF, AI, PSD, CDR.`;
    }
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > APP_CONFIG.MAX_ARTWORK_FILE_SIZE_MB) {
      return `File "${file.name}" is too large (${fileSizeMB.toFixed(1)} MB). Maximum allowed size is ${APP_CONFIG.MAX_ARTWORK_FILE_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFilesSelected = (files) => {
    setErrorMessage('');
    const newFileEntries = [];

    Array.from(files).forEach((file) => {
      // Check for duplicate
      const isDuplicate = fileList.some(item => item.originalFileName === file.name && item.fileSize === file.size);
      if (isDuplicate) {
        setErrorMessage(`File "${file.name}" has already been selected.`);
        return;
      }

      const error = validateFile(file);
      if (error) {
        setErrorMessage(error);
        return;
      }

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      const ext = file.name.split('.').pop().toLowerCase();
      const isPreviewable = APP_CONFIG.PREVIEWABLE_EXTENSIONS.includes(ext);

      // Create preview object for local display
      let localPreview = null;
      if (isPreviewable && file.type.startsWith('image/')) {
        localPreview = URL.createObjectURL(file);
      }

      const entry = {
        id: fileId,
        rawFile: file,
        fileName: file.name,
        originalFileName: file.name,
        fileType: file.type || ext,
        fileSize: file.size,
        format: ext,
        isPreviewable,
        localPreview,
        status: 'uploading', // 'uploading', 'success', 'failed'
        progress: 0,
        secureUrl: null,
        publicId: null,
        error: null
      };

      newFileEntries.push(entry);
    });

    if (newFileEntries.length > 0) {
      const updatedList = [...fileList, ...newFileEntries];
      setFileList(updatedList);
      
      // Start upload for new entries
      newFileEntries.forEach(entry => uploadSingleFile(entry));
    }
  };

  const uploadSingleFile = async (fileEntry) => {
    setFileList(prev => prev.map(f => f.id === fileEntry.id ? { ...f, status: 'uploading', progress: 5, error: null } : f));

    try {
      const folderPath = `customer_artworks/${Date.now()}`;
      const result = await uploadToCloudinary(fileEntry.rawFile, folderPath, (percent) => {
        setFileList(prev => prev.map(f => f.id === fileEntry.id ? { ...f, progress: percent } : f));
      });

      if (result && result.secureUrl) {
        setFileList(prev => prev.map(f => f.id === fileEntry.id ? {
          ...f,
          status: 'success',
          progress: 100,
          secureUrl: result.secureUrl,
          publicId: result.publicId,
          format: result.format,
          width: result.width,
          height: result.height,
          cloudinaryResourceType: result.cloudinaryResourceType,
          uploadedAt: result.uploadedAt
        } : f));
      } else {
        throw new Error('Upload did not return secure URL');
      }
    } catch (err) {
      console.warn("Artwork upload failed:", err);
      setFileList(prev => prev.map(f => f.id === fileEntry.id ? {
        ...f,
        status: 'failed',
        error: 'Upload failed. Please check network connection and click retry.'
      } : f));
    }
  };

  const handleRemoveFile = (fileId) => {
    setFileList(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const isAnyUploading = fileList.some(f => f.status === 'uploading');
  const hasFailedUploads = fileList.some(f => f.status === 'failed');
  const successfulFiles = fileList.filter(f => f.status === 'success');

  const handleFinalSubmit = () => {
    if (fileList.length === 0) {
      if (!window.confirm('No artwork file attached. Would you like to add to cart and submit artwork later?')) {
        return;
      }
    }

    if (isAnyUploading) {
      setErrorMessage('Please wait for all files to finish uploading.');
      return;
    }

    onConfirmUpload({
      artworkFiles: successfulFiles.map(f => ({
        fileName: f.fileName,
        originalFileName: f.originalFileName,
        fileType: f.fileType,
        fileSize: f.fileSize,
        format: f.format,
        secureUrl: f.secureUrl,
        publicId: f.publicId,
        width: f.width || null,
        height: f.height || null,
        uploadedAt: f.uploadedAt || new Date().toISOString()
      })),
      artworkNotes: artworkNotes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#07152F] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-bold text-[#FF5A1F] uppercase tracking-wider mb-1">
              <FiUploadCloud className="w-4 h-4" /> Prepress Artwork Uploader
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">Upload Your Artwork</h3>
            <p className="text-[14px] text-slate-300 mt-0.5">
              Upload high-resolution print files for <strong className="text-amber-400">{productTitle || 'your item'}</strong>.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer border-none"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[14px] font-semibold flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage('')} className="text-rose-500 hover:text-rose-800 text-[14px] font-bold">Dismiss</button>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
              dragActive 
                ? 'border-[#FF5A1F] bg-orange-50/50 scale-[1.01]' 
                : 'border-slate-300 hover:border-[#FF5A1F] bg-[#F7F8FA] hover:bg-white'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.pdf,.ai,.psd,.cdr"
              className="hidden"
              onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
            />
            <div className="w-14 h-14 rounded-2xl bg-orange-100/70 text-[#FF5A1F] flex items-center justify-center mx-auto mb-3">
              <FiUploadCloud className="w-7 h-7" />
            </div>
            <h4 className="text-sm font-extrabold text-[#0B1633] mb-1">
              Drag & Drop your artwork files here, or <span className="text-[#FF5A1F]">Browse</span>
            </h4>
            <p className="text-[14px] text-slate-500 font-medium max-w-md mx-auto">
              Supports: <strong>JPG, PNG, PDF, AI, PSD, CDR</strong> (Max file size: {APP_CONFIG.MAX_ARTWORK_FILE_SIZE_MB}MB)
            </p>
          </div>

          {/* Uploaded File List */}
          {fileList.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[14px] font-extrabold text-[#0B1633] border-b border-slate-100 pb-2">
                <span>Selected Artwork Files ({fileList.length})</span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  className="text-[#FF5A1F] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Add More Files
                </button>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {fileList.map((file) => (
                  <div
                    key={file.id}
                    className="p-3.5 rounded-2xl bg-[#FAFBFD] border border-slate-200 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Thumbnail or Format Icon */}
                      {file.localPreview ? (
                        <img src={file.localPreview} alt="Preview" className="w-11 h-11 object-cover rounded-xl border border-slate-200 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-[#07152F] text-white flex items-center justify-center font-extrabold text-[14px] shrink-0 uppercase">
                          {file.format || 'DOC'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-extrabold text-[#0B1633] truncate block max-w-[200px] sm:max-w-[300px]">
                            {file.fileName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            ({(file.fileSize / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>

                        {/* Status / Progress Indicator */}
                        {file.status === 'uploading' && (
                          <div className="w-full mt-1.5 space-y-1">
                            <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div className="h-full bg-[#FF5A1F] transition-all duration-300" style={{ width: `${file.progress}%` }} />
                            </div>
                            <span className="text-[10px] text-slate-500 font-bold">Uploading to cloud... {file.progress}%</span>
                          </div>
                        )}

                        {file.status === 'success' && (
                          <div className="flex items-center gap-1 text-[14px] font-bold text-emerald-600 mt-0.5">
                            <FiCheckCircle className="w-3.5 h-3.5" />
                            <span>Artwork uploaded successfully</span>
                          </div>
                        )}

                        {file.status === 'failed' && (
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[14px] font-bold text-rose-600 flex items-center gap-1">
                              <FiAlertCircle className="w-3.5 h-3.5" /> Upload failed
                            </span>
                            <button
                              onClick={() => uploadSingleFile(file)}
                              className="text-[10px] font-extrabold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <FiRefreshCw className="w-3 h-3" /> Retry
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border-none shrink-0"
                      title="Remove file"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artwork Special Instructions Notes */}
          <div className="space-y-1.5">
            <label className="text-[14px] font-extrabold text-[#0B1633] flex items-center justify-between">
              <span>Special Printing Instructions (Optional)</span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. Front & Back layout preference</span>
            </label>
            <textarea
              rows={2}
              value={artworkNotes}
              onChange={(e) => setArtworkNotes(e.target.value)}
              placeholder="Provide any specific notes for prepress operators (e.g. Print front and back separately, maintain CMYK breakdown)..."
              className="w-full bg-[#F7F8FA] border border-slate-200 rounded-2xl p-3.5 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-medium resize-none"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-[14px] text-blue-900">
            <FiInfo className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Original artwork files are preserved in high-resolution format without degradation. Prepress proofing will review resolution & bleed before press production.
            </span>
          </div>

        </div>

        {/* Action Bar Footer */}
        <div className="p-5 bg-[#FAFBFD] border-t border-slate-200 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-extrabold text-[14px] hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleFinalSubmit}
            disabled={isAnyUploading}
            className={`px-7 py-3.5 rounded-xl font-extrabold text-[14px] uppercase tracking-wider shadow-lg flex items-center gap-2 cursor-pointer transition border-none ${
              isAnyUploading 
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                : 'bg-[#FF5A1F] hover:bg-[#e44d15] text-white shadow-[#FF5A1F]/25 hover:scale-[1.02]'
            }`}
          >
            {isAnyUploading ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" /> Uploading Artwork...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-4 h-4" /> Save & Add to Cart
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
