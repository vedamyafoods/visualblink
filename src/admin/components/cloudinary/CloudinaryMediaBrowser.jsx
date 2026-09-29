import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Upload, 
  Copy, 
  Check, 
  Search, 
  Tag, 
  ExternalLink, 
  Sparkles,
  Folder
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { uploadToCloudinary, getCloudinaryTransformedUrl } from '../../../services/cloudinary';

export const CloudinaryMediaBrowser = () => {
  const { cloudinaryMedia, setCloudinaryMedia } = useAdmin();
  const [copiedId, setCopiedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const res = await uploadToCloudinary(file, 'mockups');
    if (res.success) {
      const newMedia = {
        publicId: res.publicId,
        url: res.url,
        transformedUrl: getCloudinaryTransformedUrl(res.url, 'c_fill,w_800,q_auto,f_auto'),
        title: file.name,
        folder: "uploads",
        format: res.format || 'png',
        size: `${Math.round(res.bytes / 1024)} KB`,
        dimensions: `${res.width || 1200} x ${res.height || 1800}`,
        createdAt: new Date().toISOString().split('T')[0],
        tags: ["upload", "custom"]
      };
      setCloudinaryMedia(prev => [newMedia, ...prev]);
    }
    setUploading(false);
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = cloudinaryMedia.filter(m => 
    m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Upload Dropzone */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider text-blue-600 mb-1">
              <Sparkles className="w-4 h-4 text-blue-600" /> Embedded Cloudinary Asset Manager & CDN
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Cloudinary Asset Library & Media Hub
            </h2>
            <p className="text-[14px] text-slate-500 mt-1 max-w-2xl">
              Upload images directly to Cloudinary CDN, manage asset tags, and copy auto-optimized transformed URLs (`/c_fill,w_800,q_auto,f_auto/`).
            </p>
          </div>

          <label className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[14px] flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 transition-all border-none">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading to Cloudinary...' : 'Upload New Media Asset'}</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Drag and Drop Zone Header */}
        <label className="block border-2 border-dashed border-blue-200 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50 rounded-2xl p-6 text-center cursor-pointer transition-colors">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-[14px] block">
                {uploading ? 'Processing & Optimizing Image...' : 'Click or Drag & Drop File to Upload to Cloudinary'}
              </span>
              <span className="text-[14px] text-slate-500 font-medium">Supports PNG, JPG, WEBP, SVG • Auto-generated WebP thumbnails</span>
            </div>
          </div>
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search Cloudinary assets by title or tags (e.g., mockup, banner, card)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-[14px] font-medium text-slate-900 focus:outline-none focus:border-sky-500 shadow-2xs"
        />
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((media) => (
          <div key={media.publicId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
            <div>
              <div className="h-44 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                <img 
                  src={media.url} 
                  alt={media.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-mono">
                  {media.format.toUpperCase()}
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Folder className="w-3 h-3 text-sky-500" />
                  <span>{media.folder}</span>
                </div>
                <h4 className="font-bold text-[14px] text-slate-900 truncate">{media.title}</h4>
                
                <div className="flex flex-wrap gap-1">
                  {media.tags.map((t, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium flex items-center gap-0.5">
                      <Tag className="w-2.5 h-2.5 text-slate-400" /> {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Copy URL */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[14px]">
              <span className="text-[10px] font-mono text-slate-400">{media.dimensions}</span>

              <button
                onClick={() => copyUrl(getCloudinaryTransformedUrl(media.url, 'c_fill,w_800,q_auto,f_auto'), media.publicId)}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-[14px] flex items-center gap-1 transition-colors shadow-2xs"
              >
                {copiedId === media.publicId ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-300" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy CDN URL
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
