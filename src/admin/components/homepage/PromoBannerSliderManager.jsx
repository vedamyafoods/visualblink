import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Eye,
  Sliders,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { uploadToCloudinary } from '../../../services/cloudinary';
import { DEFAULT_PROMO_BANNERS } from '../../../Components/sections/PromoBannerSlider';

export const PromoBannerSliderManager = ({ formData, setFormData, onSave, isSaving }) => {
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [previewSlideIdx, setPreviewSlideIdx] = useState(0);

  const sliderConfig = formData?.promoBannerSlider || {};
  const banners = sliderConfig.banners && sliderConfig.banners.length > 0
    ? sliderConfig.banners
    : DEFAULT_PROMO_BANNERS;
  const autoPlayInterval = sliderConfig.autoPlayInterval || 4500;

  const updateBanners = (newBanners) => {
    setFormData(prev => ({
      ...prev,
      promoBannerSlider: {
        ...(prev.promoBannerSlider || {}),
        enabled: true,
        autoPlayInterval,
        banners: newBanners
      }
    }));
  };

  const updateBannerField = (index, field, value) => {
    const updated = [...banners];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    updateBanners(updated);
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: `promo_${Date.now()}`,
      badge: 'NEW PROMOTION',
      title: 'Custom High-Quality Prints & Packaging',
      subtitle: 'Premium finishes, rapid 24h turnaround, and direct factory pricing.',
      image: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=1600',
      ctaText: 'Explore Collection',
      ctaLink: 'products',
      secondaryCtaText: 'Get Quote',
      secondaryCtaLink: 'quote'
    };
    updateBanners([...banners, newSlide]);
    setPreviewSlideIdx(banners.length);
  };

  const handleDeleteSlide = (index) => {
    if (banners.length <= 1) {
      alert("You need at least 1 banner slide in the mid-page slider.");
      return;
    }
    const filtered = banners.filter((_, i) => i !== index);
    updateBanners(filtered);
    setPreviewSlideIdx(Math.max(0, index - 1));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const reordered = [...banners];
    const temp = reordered[index - 1];
    reordered[index - 1] = reordered[index];
    reordered[index] = temp;
    updateBanners(reordered);
    setPreviewSlideIdx(index - 1);
  };

  const handleMoveDown = (index) => {
    if (index === banners.length - 1) return;
    const reordered = [...banners];
    const temp = reordered[index + 1];
    reordered[index + 1] = reordered[index];
    reordered[index] = temp;
    updateBanners(reordered);
    setPreviewSlideIdx(index + 1);
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIndex(index);
    try {
      const res = await uploadToCloudinary(file, 'promo_banners');
      if (res && (res.secureUrl || res.url)) {
        updateBannerField(index, 'image', res.secureUrl || res.url);
      }
    } catch (err) {
      console.warn("Upload failed:", err);
    } finally {
      setUploadingIndex(null);
      e.target.value = '';
    }
  };

  const handleIntervalChange = (val) => {
    setFormData(prev => ({
      ...prev,
      promoBannerSlider: {
        ...(prev.promoBannerSlider || {}),
        autoPlayInterval: Number(val) || 4500
      }
    }));
  };

  const activePreview = banners[previewSlideIdx] || banners[0] || {};

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
              Replaces "LET'S CREATE TOGETHER" Black Box
            </span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" /> Mid-Page Promo Banner Slider ({banners.length} Slides)
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mt-0.5">
            Auto-playing full-width banner slideshow displayed right on the homepage in place of the old static box.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600">Auto-Slide:</span>
            <select
              value={autoPlayInterval}
              onChange={(e) => handleIntervalChange(e.target.value)}
              className="bg-transparent font-bold text-[12px] text-blue-700 focus:outline-none cursor-pointer border-none"
            >
              <option value="3000">3 Seconds</option>
              <option value="4500">4.5 Seconds (Default)</option>
              <option value="6000">6 Seconds</option>
              <option value="8000">8 Seconds</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddSlide}
            className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[13px] flex items-center gap-1.5 border border-blue-200 cursor-pointer shadow-3xs transition"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        </div>
      </div>

      {/* Live Visual Preview Card */}
      <div className="bg-slate-900 p-4 sm:p-6 rounded-3xl shadow-xl text-white space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
          <span className="flex items-center gap-1.5 text-blue-400">
            <Eye className="w-4 h-4" /> Live Slider Preview (Slide #{previewSlideIdx + 1} of {banners.length})
          </span>
          <div className="flex items-center gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPreviewSlideIdx(i)}
                className={`h-2 rounded-full transition-all cursor-pointer border-none ${i === previewSlideIdx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                  }`}
              />
            ))}
          </div>
        </div>

        {/* Scaled Preview Frame */}
        <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[300px] flex items-center bg-[#0F172A] border border-slate-800">
          <img
            src={activePreview.image || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=1600'}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-transparent sm:via-[#0F172A]/70" />

          <div className="relative z-10 p-6 sm:p-10 max-w-xl space-y-2.5">
            {activePreview.badge && (
              <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                {activePreview.badge}
              </span>
            )}
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
              {activePreview.title || 'Untitled Banner Headline'}
            </h3>
            {activePreview.subtitle && (
              <p className="text-slate-300 text-[13px] line-clamp-2">
                {activePreview.subtitle}
              </p>
            )}
            <div className="flex items-center gap-3 pt-2">
              {activePreview.ctaText && (
                <span className="px-5 py-2 rounded-full bg-gradient-to-r from-[#05defd] to-[#6a32f0] text-white text-[12px] font-bold shadow-md inline-block">
                  {activePreview.ctaText} →
                </span>
              )}
              {activePreview.secondaryCtaText && (
                <span className="px-4 py-2 rounded-full bg-white/10 text-white text-[12px] font-bold border border-white/20 inline-block">
                  {activePreview.secondaryCtaText}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Slide Edit Cards List */}
      <div className="space-y-4">
        {banners.map((banner, idx) => (
          <div
            key={banner.id || idx}
            className={`p-5 rounded-3xl border transition-all space-y-4 ${previewSlideIdx === idx
              ? 'bg-white border-blue-500 shadow-md ring-2 ring-blue-100'
              : 'bg-white border-slate-200 shadow-3xs hover:border-slate-300'
              }`}
          >
            {/* Card Header & Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                  #{idx + 1}
                </span>
                <span className="font-bold text-slate-800 text-[14px]">
                  {banner.title || `Slide ${idx + 1}`}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewSlideIdx(idx)}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md cursor-pointer border-none"
                >
                  Preview Slide
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer"
                  title="Move Up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === banners.length - 1}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed border-none cursor-pointer"
                  title="Move Down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(idx)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 border-none cursor-pointer ml-1"
                  title="Delete Slide"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Slide Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Image Preview & Upload (4 Cols) */}
              <div className="lg:col-span-4 space-y-2">
                <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Banner Image *
                </label>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group">
                  <img
                    src={banner.image || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&q=80&w=1600'}
                    alt="Slide"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-slate-950/70 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-xs font-bold p-2 text-center">
                    <Upload className="w-5 h-5 mb-1" />
                    <span>{uploadingIndex === idx ? 'Uploading...' : 'Upload Cloudinary Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, idx)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="text"
                    value={banner.image || ''}
                    onChange={(e) => updateBannerField(idx, 'image', e.target.value)}
                    placeholder="https://... image URL"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Form Fields (8 Cols) */}
              <div className="lg:col-span-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                      Eyebrow Badge Text
                    </label>
                    <input
                      type="text"
                      value={banner.badge || ''}
                      onChange={(e) => updateBannerField(idx, 'badge', e.target.value)}
                      placeholder="e.g. LET'S CREATE TOGETHER"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                      Primary Headline *
                    </label>
                    <input
                      type="text"
                      value={banner.title || ''}
                      onChange={(e) => updateBannerField(idx, 'title', e.target.value)}
                      placeholder="e.g. Bring Your Ideas to Life with Premium Prints."
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-1">
                    Subtitle Description
                  </label>
                  <textarea
                    rows={2}
                    value={banner.subtitle || ''}
                    onChange={(e) => updateBannerField(idx, 'subtitle', e.target.value)}
                    placeholder="Brief description about this promotion or print offering..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Primary CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={banner.ctaText || ''}
                      onChange={(e) => updateBannerField(idx, 'ctaText', e.target.value)}
                      placeholder="e.g. Get Quote Now"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Primary CTA Target Link
                    </label>
                    <input
                      type="text"
                      value={banner.ctaLink || ''}
                      onChange={(e) => updateBannerField(idx, 'ctaLink', e.target.value)}
                      placeholder="e.g. quote or products?category=Business Cards"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[12px] text-blue-700 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Secondary Button Text (Optional)
                    </label>
                    <input
                      type="text"
                      value={banner.secondaryCtaText || ''}
                      onChange={(e) => updateBannerField(idx, 'secondaryCtaText', e.target.value)}
                      placeholder="e.g. Explore Products"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-[13px] font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                      Secondary Target Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={banner.secondaryCtaLink || ''}
                      onChange={(e) => updateBannerField(idx, 'secondaryCtaLink', e.target.value)}
                      placeholder="e.g. products"
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-[12px] text-slate-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
