import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Layers, Upload, Grid, Search, X, Check, Sparkles, Smile } from 'lucide-react';
import * as FiIcons from 'react-icons/fi';
import { uploadToCloudinary } from '../../../services/cloudinary';
import {
    subscribeToHomepageCategories,
    saveHomepageCategory,
    deleteHomepageCategory,
} from '../../../services/firebase';

export const READYMADE_ICONS = [
    { name: 'FiCreditCard', label: 'Visiting / Business Cards', group: 'Cards' },
    { name: 'FiBookOpen', label: 'Brochures & Booklets', group: 'Print' },
    { name: 'FiTv', label: 'Banners, Posters & Standees', group: 'Marketing' },
    { name: 'FiTag', label: 'Stickers & Product Labels', group: 'Labels' },
    { name: 'FiBox', label: 'Boxes & Custom Packaging', group: 'Packaging' },
    { name: 'FiShoppingBag', label: 'Apparel & Paper Bags', group: 'Packaging' },
    { name: 'FiFileText', label: 'Letterhead & Bill Books', group: 'Office' },
    { name: 'FiGift', label: 'Gift Items & Corporate Kits', group: 'Gifts' },
    { name: 'FiPrinter', label: 'Offset & Digital Printing', group: 'Print' },
    { name: 'FiLayers', label: 'Paper Stock & Finishes', group: 'Print' },
    { name: 'FiImage', label: 'Canvas & Photo Frames', group: 'Marketing' },
    { name: 'FiPackage', label: 'Corrugated Mailers & Cartons', group: 'Packaging' },
    { name: 'FiFolder', label: 'Document Folders & Files', group: 'Office' },
    { name: 'FiBriefcase', label: 'Corporate Stationery Kits', group: 'Office' },
    { name: 'FiAward', label: 'Certificates & Mementos', group: 'Gifts' },
    { name: 'FiCoffee', label: 'Branded Mugs & Cups', group: 'Gifts' },
    { name: 'FiCamera', label: 'Photo Prints & Albums', group: 'Print' },
    { name: 'FiHeart', label: 'Wedding & Event Cards', group: 'Cards' },
    { name: 'FiStar', label: 'Metallic Foil & Luxury Finish', group: 'Marketing' },
    { name: 'FiPercent', label: 'Promotional Pamphlets & Flyers', group: 'Marketing' },
    { name: 'FiZap', label: 'Express Quick Print Service', group: 'Print' },
    { name: 'FiSend', label: 'Envelopes & Direct Mail', group: 'Office' },
    { name: 'FiScissors', label: 'Die-Cut Stickers & Shapes', group: 'Labels' },
    { name: 'FiShield', label: 'Security & Hologram Stickers', group: 'Labels' },
    { name: 'FiSmile', label: 'Personalized Greeting Cards', group: 'Cards' },
    { name: 'FiTruck', label: 'Logistics & Dispatch', group: 'Packaging' },
    { name: 'FiPocket', label: 'Pocket Folders & Sleeves', group: 'Office' },
    { name: 'FiCompass', label: 'Custom Design Studio', group: 'Marketing' },
    { name: 'FiSliders', label: 'Custom Specification Print', group: 'Print' },
    { name: 'FiBookmark', label: 'Bookmarks & Calendars', group: 'Office' },
    { name: 'FiCalendar', label: 'Desk & Wall Calendars', group: 'Office' },
    { name: 'FiPenTool', label: 'Graphic Design Services', group: 'Marketing' },
    { name: 'FiMapPin', label: 'Outdoor Hoardings & Signs', group: 'Marketing' },
    { name: 'FiFilePlus', label: 'Multi-Part NCR Forms', group: 'Office' },
    { name: 'FiCheckCircle', label: 'Quality Assured Print', group: 'Print' },
    { name: 'FiCpu', label: 'Laser Cut & Embossed Cards', group: 'Cards' }
];

export const HomepageCategoriesManager = () => {
    const [categories, setCategories] = useState([]);
    const [saving, setSaving] = useState(false);
    const [uploadingObj, setUploadingObj] = useState(null);
    const [activePickerIndex, setActivePickerIndex] = useState(null);
    const [iconSearch, setIconSearch] = useState('');
    const [iconFilterGroup, setIconFilterGroup] = useState('All');

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
            const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
    };

    const handleSaveAll = async () => {
        setSaving(true);
        for (const item of categories) {
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
                <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider text-blue-600 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Category Grid Display Cards ({categories.length})
                </h3>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={handleAdd}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[14px] flex items-center gap-1.5 border border-blue-200 cursor-pointer shadow-3xs"
                    >
                        <Plus className="w-4 h-4" /> Add New Category Card
                    </button>
                    <button
                        onClick={handleSaveAll}
                        className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-[14px] flex items-center gap-2 cursor-pointer shadow-sm hover:bg-blue-700 transition"
                    >
                        {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Cards</>}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat, idx) => (
                    <div key={cat.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:shadow-md transition space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
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
                                        className="w-full p-2 rounded-lg border border-slate-200 font-bold text-slate-900 bg-white focus:outline-none focus:border-blue-500"
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

                        {/* Visual Readymade Icon Selector */}
                        <div className="pt-1 border-t border-slate-100">
                            <label className="block font-bold text-slate-700 text-[10.5px] uppercase mb-1.5 flex items-center justify-between">
                                <span>Category Icon</span>
                                <span className="font-mono text-[9.5px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-bold">
                                    {cat.icon || 'FiBox'}
                                </span>
                            </label>

                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#025afc] flex items-center justify-center shrink-0 shadow-3xs">
                                    {(() => {
                                        const IconComp = FiIcons[cat.icon] || FiIcons.FiBox;
                                        return <IconComp className="w-5 h-5 text-[#025afc]" />;
                                    })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setActivePickerIndex(idx);
                                            setIconSearch('');
                                            setIconFilterGroup('All');
                                        }}
                                        className="w-full px-3 py-2 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-700 font-bold text-[12.5px] transition flex items-center justify-between cursor-pointer shadow-3xs"
                                    >
                                        <span className="truncate">
                                            {READYMADE_ICONS.find(i => i.name === cat.icon)?.label || cat.icon || 'Select Readymade Icon'}
                                        </span>
                                        <span className="text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-0.5 rounded-lg shrink-0 ml-1.5 shadow-xs font-semibold">
                                            Choose Icon ▾
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal: Readymade Icon Picker */}
            {activePickerIndex !== null && (
                <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/90">
                            <div>
                                <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-blue-600" /> Choose Readymade Category Icon
                                </h4>
                                <p className="text-[12px] text-slate-500 font-medium">
                                    Select an icon for: <span className="font-bold text-slate-800">{categories[activePickerIndex]?.title || `Card #${activePickerIndex + 1}`}</span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setActivePickerIndex(null)}
                                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center border-none cursor-pointer transition"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="p-4 border-b border-slate-100 bg-white space-y-3">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type="text"
                                    value={iconSearch}
                                    onChange={(e) => setIconSearch(e.target.value)}
                                    placeholder="Search icons (e.g. card, box, tag, brochure, gift, print)..."
                                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                                    autoFocus
                                />
                            </div>

                            {/* Group Filters */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                {['All', 'Cards', 'Print', 'Packaging', 'Labels', 'Office', 'Marketing', 'Gifts'].map(grp => (
                                    <button
                                        key={grp}
                                        type="button"
                                        onClick={() => setIconFilterGroup(grp)}
                                        className={`px-3 py-1 rounded-lg text-[11px] font-bold border transition shrink-0 cursor-pointer ${iconFilterGroup === grp
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                            }`}
                                    >
                                        {grp}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Icons Grid */}
                        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                                {READYMADE_ICONS
                                    .filter(item => {
                                        const matchesGroup = iconFilterGroup === 'All' || item.group === iconFilterGroup;
                                        const q = iconSearch.toLowerCase().trim();
                                        const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q) || item.group.toLowerCase().includes(q);
                                        return matchesGroup && matchesSearch;
                                    })
                                    .map(iconItem => {
                                        const IconComp = FiIcons[iconItem.name] || FiIcons.FiBox;
                                        const isSelected = categories[activePickerIndex]?.icon === iconItem.name;
                                        return (
                                            <button
                                                key={iconItem.name}
                                                type="button"
                                                onClick={() => {
                                                    handleUpdate(activePickerIndex, 'icon', iconItem.name);
                                                    setActivePickerIndex(null);
                                                }}
                                                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer group/icon ${isSelected
                                                    ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-200 shadow-xs'
                                                    : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50/30'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isSelected
                                                        ? 'bg-blue-600 text-white shadow-3xs'
                                                        : 'bg-slate-100 text-slate-700 group-hover/icon:bg-blue-100 group-hover/icon:text-blue-600'
                                                        }`}>
                                                        <IconComp className="w-5 h-5" />
                                                    </div>
                                                    {isSelected && (
                                                        <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                                            ✓
                                                        </span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-[12px] font-bold text-slate-800 leading-snug line-clamp-1">
                                                        {iconItem.label}
                                                    </div>
                                                    <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                                                        {iconItem.name}
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[12px]">
                            <span className="text-slate-500 font-medium">
                                💡 Click any icon to immediately select it. No need to memorize react-icon names!
                            </span>
                            <button
                                type="button"
                                onClick={() => setActivePickerIndex(null)}
                                className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer border-none transition"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
