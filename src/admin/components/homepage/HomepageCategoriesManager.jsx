import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Layers, Upload, Grid } from 'lucide-react';
import { uploadToCloudinary } from '../../../services/cloudinary';
import {
    subscribeToHomepageCategories,
    saveHomepageCategory,
    deleteHomepageCategory,
} from '../../../services/firebase';

export const HomepageCategoriesManager = () => {
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploadingObj, setUploadingObj] = useState(null);

    useEffect(() => {
        const unsub = subscribeToHomepageCategories((data) => {
            if (data && data.length > 0) {
                setCategories(data);
            } else {
                setCategories([
                    { id: 'cat_1', title: 'Business Cards', sub: 'Premium quality cards with foil & matte finishes', img: 'https://images.unsplash.com/photo-1612831819695-7e71f5ccf16c?auto=format&fit=crop&q=80&w=600', icon: 'FiCreditCard', query: 'business-cards' },
                    { id: 'cat_2', title: 'Brochures & Flyers', sub: 'Professional marketing & tri-fold materials', img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', icon: 'FiBookOpen', query: 'brochures' },
                    { id: 'cat_3', title: 'Posters & Banners', sub: 'Large format outdoor & event displays', img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=600', icon: 'FiTv', query: 'posters' },
                    { id: 'cat_4', title: 'Invitations & Cards', sub: 'Special occasions & luxury embossed cards', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600', icon: 'FiGift', query: 'invitations' },
                    { id: 'cat_5', title: 'Stickers & Labels', sub: 'Custom die-cut vinyl & roll labels', img: 'https://images.unsplash.com/photo-1591981730169-05e8e57a7c04?auto=format&fit=crop&q=80&w=600', icon: 'FiTag', query: 'labels' },
                    { id: 'cat_6', title: 'Custom Packaging', sub: 'Custom mailer boxes, pouches & packaging', img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600', icon: 'FiBox', query: 'packaging' },
                    { id: 'cat_7', title: 'Stationery', sub: 'Branded letterheads, envelopes & notebooks', img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600', icon: 'FiFileText', query: 'stationery' },
                    { id: 'cat_8', title: 'Photo Printing', sub: 'High quality prints & canvas frames', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600', icon: 'FiImage', query: 'displays' }
                ]);
            }
        });
        return () => unsub();
    }, []);

    const handleUpdate = (index, field, value) => {
        const newData = [...categories];
        newData[index][field] = value;

        // Auto-generate slug/query if title is updated and query is empty or being auto-generated
        if (field === 'title') {
            const slug = value.toLowerCase().replace(/[^a-z0-9]/g, '-');
            newData[index].query = slug;
        }

        setCategories(newData);
    };

    const handleManualQueryUpdate = (index, value) => {
        const newData = [...categories];
        newData[index].query = value;
        setCategories(newData);
    };

    const handleAdd = () => {
        const id = `cat_${Date.now()}`;
        setCategories([...categories, {
            id,
            title: 'New Category',
            query: 'new-category',
            sub: '',
            img: '',
            icon: 'FiBox'
        }]);
    };

    const handleDelete = async (index, id) => {
        if (id && !id.startsWith('cat_')) {
            await deleteHomepageCategory(id);
        } else if (id) {
            await deleteHomepageCategory(id);
        }
        setCategories(categories.filter((_, i) => i !== index));
        // It's safer to just reload or let subscription handle it, but for new local state:
    };

    const handleSaveAll = async () => {
        setSaving(true);
        for (const item of categories) {
            // If it's a completely new local item lacking a proper ID, ensure we pass it properly
            await saveHomepageCategory(item);
        }
        setSaving(false);
    };

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadingObj(index);
        const res = await uploadToCloudinary(file, 'homepage_categories');
        if (res.success) {
            const newData = [...categories];
            newData[index].img = res.url;
            setCategories(newData);
        }
        setUploadingObj(null);
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 mt-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Category Grid Display Cards ({categories.length})
                </h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-[14px] flex items-center gap-1.5 border border-blue-200 cursor-pointer shadow-3xs"
                    >
                        <Plus className="w-4 h-4" /> Add New Category Card
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-[14px] flex items-center gap-2"
                    >
                        {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Cards</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                Card #{idx + 1}
                            </span>
                            <button
                                type="button"
                                onClick={() => handleDelete(idx, cat.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border-none bg-transparent cursor-pointer transition"
                                title="Delete Category Card"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden bg-slate-200 shrink-0 relative group">
                                {cat.img ? (
                                    <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex justify-center items-center text-slate-400"><Grid className="w-6 h-6" /></div>
                                )}
                                <label className="absolute inset-0 bg-slate-950/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-[9px] font-bold p-1 text-center">
                                    <Upload className="w-4 h-4 mb-0.5" />
                                    {uploadingObj === idx ? 'Uploading...' : 'Change Image'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, idx)}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <div className="flex-1 space-y-2 text-[14px]">
                                <div>
                                    <label className="block font-bold text-slate-600 text-[10px] uppercase">Category Name</label>
                                    <input
                                        type="text"
                                        value={cat.title || ''}
                                        onChange={(e) => handleUpdate(idx, 'title', e.target.value)}
                                        className="w-full p-2 rounded-lg border border-slate-200 font-extrabold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-600 text-[10px] uppercase">Subtitle Text</label>
                                    <input
                                        type="text"
                                        value={cat.sub || ''}
                                        onChange={(e) => handleUpdate(idx, 'sub', e.target.value)}
                                        className="w-full p-2 rounded-lg border border-slate-200 font-medium text-slate-700 bg-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">Image Cloudinary URL</label>
                                <input
                                    type="text"
                                    value={cat.img || ''}
                                    onChange={(e) => handleUpdate(idx, 'img', e.target.value)}
                                    className="w-full p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 bg-white focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1 flex items-center gap-1 justify-between">
                                    Query Parameter (Slug)
                                </label>
                                <input
                                    type="text"
                                    value={cat.query || ''}
                                    onChange={(e) => handleManualQueryUpdate(idx, e.target.value)}
                                    className="w-full p-2 rounded-lg border border-blue-300 font-mono text-[10px] font-bold text-blue-700 bg-blue-50/50 focus:outline-none focus:border-blue-600"
                                    placeholder="e.g. business-cards"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-slate-600 text-[10px] uppercase mb-1">React Icon Name (e.g. FiBox)</label>
                            <input
                                type="text"
                                value={cat.icon || 'FiBox'}
                                onChange={(e) => handleUpdate(idx, 'icon', e.target.value)}
                                className="w-full p-2 rounded-lg border border-slate-200 font-mono text-[10px] text-slate-600 bg-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
