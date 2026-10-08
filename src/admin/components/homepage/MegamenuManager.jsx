import React, { useState, useEffect } from 'react';
import { subscribeToMegamenuCategories, saveMegamenuCategoriesToFirestore, DEFAULT_MEGAMENU_CATEGORIES } from '../../../services/firebase';
import { Plus, Trash2, GripVertical, Settings2, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export const MegamenuManager = () => {
    const [categories, setCategories] = useState([]);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedCat, setExpandedCat] = useState(null);

    useEffect(() => {
        const unsub = subscribeToMegamenuCategories((data) => {
            setCategories(data || DEFAULT_MEGAMENU_CATEGORIES);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleSave = async () => {
        await saveMegamenuCategoriesToFirestore(categories);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const addCategory = () => {
        const newCat = {
            id: `nav_${Date.now()}`,
            title: 'New Menu',
            categoryQuery: 'new-menu',
            badge: '',
            items: []
        };
        setCategories([...categories, newCat]);
        setExpandedCat(newCat.id);
    };

    const removeCategory = (id) => {
        setCategories(categories.filter(c => c.id !== id));
    };

    const updateCategory = (id, field, value) => {
        setCategories(categories.map(c => c.id === id ? { ...c, [field]: value } : c));
    };

    const addDropdownItem = (catId) => {
        setCategories(categories.map(c => {
            if (c.id === catId) {
                return {
                    ...c,
                    items: [...(c.items || []), { name: 'New Item', search: 'new-item', tag: '' }]
                };
            }
            return c;
        }));
    };

    const updateDropdownItem = (catId, itemIdx, field, value) => {
        setCategories(categories.map(c => {
            if (c.id === catId) {
                const newItems = [...c.items];
                newItems[itemIdx] = { ...newItems[itemIdx], [field]: value };
                return { ...c, items: newItems };
            }
            return c;
        }));
    };

    const removeDropdownItem = (catId, itemIdx) => {
        setCategories(categories.map(c => {
            if (c.id === catId) {
                const newItems = [...c.items];
                newItems.splice(itemIdx, 1);
                return { ...c, items: newItems };
            }
            return c;
        }));
    };

    const moveCategory = (index, direction) => {
        const newCats = [...categories];
        const item = newCats[index];
        newCats.splice(index, 1);
        newCats.splice(index + direction, 0, item);
        setCategories(newCats);
    };

    if (loading) {
        return <div className="p-6 text-center text-slate-500">Loading Navigation Settings...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h3 className="font-bold text-[16px] text-slate-900 border-b border-slate-100 pb-2 mb-1 flex items-center gap-2">
                        <Settings2 className="w-5 h-5 text-blue-600" /> Dynamic Navigation Menu Manager
                    </h3>
                    <p className="text-[12px] text-slate-500 font-medium">
                        Customize header menus and their dropdown links. Changes reflect on the storefront instantly.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[13px] flex items-center gap-2 shadow-sm transition"
                >
                    {saveSuccess ? <><CheckCircle2 className="w-4 h-4" /> Published!</> : 'Save Menu to Live'}
                </button>
            </div>

            <div className="space-y-4">
                {categories.map((cat, idx) => (
                    <div key={cat.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 flex items-center gap-4 bg-slate-50 hover:bg-slate-100 transition-colors">
                            <div className="flex flex-col gap-1">
                                <button
                                    disabled={idx === 0}
                                    onClick={() => moveCategory(idx, -1)}
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronUp className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={idx === categories.length - 1}
                                    onClick={() => moveCategory(idx, 1)}
                                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Menu Title</label>
                                    <input
                                        type="text"
                                        value={cat.title || ''}
                                        onChange={(e) => updateCategory(cat.id, 'title', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 text-[14px] font-bold rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Linked Category Filter</label>
                                    <input
                                        type="text"
                                        value={cat.categoryQuery || ''}
                                        onChange={(e) => updateCategory(cat.id, 'categoryQuery', e.target.value)}
                                        className="w-full mt-1 px-3 py-2 text-[14px] font-semibold rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                        placeholder="e.g. Business Cards"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => setExpandedCat(expandedCat === cat.id ? null : cat.id)}
                                className="px-3 py-2 bg-white text-slate-600 rounded-lg border border-slate-200 text-[12px] font-bold shadow-sm"
                            >
                                {expandedCat === cat.id ? 'Hide Dropdown' : `Edit Dropdown (${(cat.items || []).length})`}
                            </button>

                            <button
                                onClick={() => removeCategory(cat.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>

                        {expandedCat === cat.id && (
                            <div className="p-4 bg-white border-t border-slate-100">
                                <div className="space-y-3">
                                    <div className="grid grid-cols-12 gap-3 px-2 text-[10px] font-bold uppercase text-slate-400">
                                        <div className="col-span-5">Sub-Menu Label</div>
                                        <div className="col-span-6">Search Query (Links to catalog search)</div>
                                        <div className="col-span-1 text-right">Delete</div>
                                    </div>

                                    {(cat.items || []).map((item, itemIdx) => (
                                        <div key={itemIdx} className="grid grid-cols-12 gap-3 items-center">
                                            <div className="col-span-1 text-center text-slate-300">
                                                <GripVertical className="w-4 h-4 mx-auto" />
                                            </div>
                                            <div className="col-span-4">
                                                <input
                                                    type="text"
                                                    value={item.name || ''}
                                                    onChange={(e) => updateDropdownItem(cat.id, itemIdx, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 text-[13px] font-semibold rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                                    placeholder="Label (e.g. Standard Cards)"
                                                />
                                            </div>
                                            <div className="col-span-6">
                                                <input
                                                    type="text"
                                                    value={item.search || ''}
                                                    onChange={(e) => updateDropdownItem(cat.id, itemIdx, 'search', e.target.value)}
                                                    className="w-full px-3 py-2 text-[13px] font-medium text-slate-600 rounded-lg border border-slate-200 focus:border-blue-500 outline-none"
                                                    placeholder="Search Filter (e.g. Standard)"
                                                />
                                            </div>
                                            <div className="col-span-1 text-right">
                                                <button
                                                    onClick={() => removeDropdownItem(cat.id, itemIdx)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={() => addDropdownItem(cat.id)}
                                        className="mt-3 px-4 py-2 border border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 rounded-xl text-[12px] font-bold w-full transition flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add Dropdown Link
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={addCategory}
                className="w-full py-4 border-2 border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 rounded-2xl text-[14px] font-bold flex items-center justify-center gap-2 transition"
            >
                <Plus className="w-5 h-5" /> Add New Main Menu Category
            </button>

        </div>
    );
};
