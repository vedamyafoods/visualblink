import React, { useState } from 'react';
import { 
  Grid, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Tag, 
  Sparkles, 
  Search, 
  FolderPlus, 
  Layers, 
  Box, 
  CreditCard, 
  Mail, 
  Printer, 
  Briefcase, 
  Package
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const CategoryManager = () => {
  const { megamenuCategories, updateMegamenuCategories } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Add Main Category Modal State
  const [showAddCatModal, setShowAddCatModal] = useState(false);
  const [newCatTitle, setNewCatTitle] = useState('');
  const [newCatBadge, setNewCatBadge] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('FiBox');
  const [newCatQuery, setNewCatQuery] = useState('');

  // Add Subcategory State per Category
  const [activeSubcatInput, setActiveSubcatInput] = useState(null); // catId
  const [newSubcatName, setNewSubcatName] = useState('');
  const [newSubcatSearch, setNewSubcatSearch] = useState('');
  const [newSubcatTag, setNewSubcatTag] = useState('');

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const availableIcons = [
    { name: 'FiCreditCard', label: 'Credit Card', icon: CreditCard },
    { name: 'FiMail', label: 'Mail & Invites', icon: Mail },
    { name: 'FiPrinter', label: 'Printer', icon: Printer },
    { name: 'FiPackage', label: 'Package & Box', icon: Package },
    { name: 'FiBriefcase', label: 'Briefcase', icon: Briefcase },
    { name: 'FiBox', label: 'Box', icon: Box },
    { name: 'FiTag', label: 'Tag', icon: Tag },
    { name: 'FiLayers', label: 'Layers', icon: Layers }
  ];

  const categories = megamenuCategories || [];

  // Add New Main Category
  const handleAddMainCategory = async () => {
    if (!newCatTitle.trim()) return;
    const catId = newCatTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, '-');
    const queryKey = newCatQuery.trim() || newCatTitle.trim();

    const newCategoryObj = {
      id: catId,
      title: newCatTitle.trim(),
      badge: newCatBadge.trim() ? newCatBadge.trim().toUpperCase() : null,
      categoryQuery: queryKey,
      iconName: newCatIcon,
      items: []
    };

    const updated = [...categories, newCategoryObj];
    await updateMegamenuCategories(updated);
    setNewCatTitle('');
    setNewCatBadge('');
    setNewCatQuery('');
    setShowAddCatModal(false);
    triggerToast(`Added new category "${newCategoryObj.title}" & synced with Firebase!`);
  };

  // Add Subcategory to specific Main Category
  const handleAddSubcategory = async (catId) => {
    if (!newSubcatName.trim()) return;
    const subName = newSubcatName.trim();
    const searchVal = newSubcatSearch.trim() || subName;
    const tagVal = newSubcatTag.trim() || 'Custom Spec';

    const updatedCategories = categories.map(cat => {
      if (cat.id === catId || cat.title === catId) {
        const currentItems = cat.items || [];
        return {
          ...cat,
          items: [...currentItems, { name: subName, search: searchVal, tag: tagVal }]
        };
      }
      return cat;
    });

    await updateMegamenuCategories(updatedCategories);
    setNewSubcatName('');
    setNewSubcatSearch('');
    setNewSubcatTag('');
    setActiveSubcatInput(null);
    triggerToast(`Added subcategory "${subName}" to Megamenu.`);
  };

  // Delete Main Category
  const handleDeleteMainCategory = async (catId, catTitle) => {
    if (window.confirm(`Are you sure you want to delete Category "${catTitle}"? This will remove it from the Megamenu!`)) {
      const updated = categories.filter(c => c.id !== catId && c.title !== catId);
      await updateMegamenuCategories(updated);
      triggerToast(`Deleted category "${catTitle}".`);
    }
  };

  // Delete Subcategory
  const handleDeleteSubcategory = async (catId, subIdx, subName) => {
    const updated = categories.map(cat => {
      if (cat.id === catId || cat.title === catId) {
        const filteredItems = (cat.items || []).filter((_, idx) => idx !== subIdx);
        return { ...cat, items: filteredItems };
      }
      return cat;
    });
    await updateMegamenuCategories(updated);
    triggerToast(`Deleted subcategory "${subName}".`);
  };

  // Filter Categories by search
  const filteredCategories = categories.filter(cat => {
    const matchesTitle = (cat.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubs = (cat.items || []).some(sub => (sub.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTitle || matchesSubs;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Notification */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#07152F] text-white px-5 py-3 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-in slide-in-from-bottom duration-200 text-[14px] font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#07152F] via-[#0b1d3f] to-slate-900 p-6 sm:p-7 rounded-3xl text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF5A1F]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-[10px] font-black border border-[#FF5A1F]/30 uppercase tracking-widest">
              Live Megamenu & Catalog Taxonomy
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Grid className="w-6 h-6 text-[#FF5A1F]" />
            Category & Subcategory Master Control
          </h2>
          <p className="text-[14px] text-slate-300 max-w-2xl mt-1.5 font-medium leading-relaxed">
            Manage header megamenu categories, subcategories, search keywords, and storefront filters. Changes immediately sync with Firebase Firestore and reflect live in the header dropdown.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => setShowAddCatModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] flex items-center gap-2 shadow-lg shadow-[#FF5A1F]/30 transition cursor-pointer border-none"
          >
            <Plus className="w-4 h-4" /> Add New Main Category
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search categories or subcategories..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[14px] font-semibold focus:outline-none focus:border-[#FF5A1F] text-slate-800"
          />
        </div>

        <div className="text-[14px] text-slate-500 font-bold hidden sm:block">
          Total Categories: <strong className="text-[#0B1633] font-black">{categories.length}</strong> | Total Subcategories: <strong className="text-[#FF5A1F] font-black">{categories.reduce((acc, c) => acc + (c.items?.length || 0), 0)}</strong>
        </div>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => {
          const subitems = category.items || [];
          return (
            <div key={category.id || category.title} className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden">
              
              {/* Category Card Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#FF5A1F] font-black shrink-0 shadow-2xs">
                    <Grid className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900 truncate">{category.title}</h3>
                      {category.badge && (
                        <span className="px-1.5 py-0.2 text-[9px] font-black text-white bg-[#FF5A1F] rounded-full uppercase tracking-wider shrink-0">
                          {category.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">Query: "{category.categoryQuery || category.title}"</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteMainCategory(category.id || category.title, category.title)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition border-none bg-transparent cursor-pointer"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Subcategories List */}
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-extrabold text-slate-500 uppercase tracking-wider">Subcategories ({subitems.length})</span>
                  <button
                    type="button"
                    onClick={() => setActiveSubcatInput(activeSubcatInput === category.id ? null : category.id)}
                    className="text-[14px] font-extrabold text-[#FF5A1F] hover:text-[#d44512] flex items-center gap-1 cursor-pointer border-none bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" /> Quick Add Subcategory
                  </button>
                </div>

                {/* Inline Add Subcategory Drawer */}
                {activeSubcatInput === category.id && (
                  <div className="p-3 bg-orange-50/60 border border-orange-200 rounded-xl space-y-2 mb-3 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={newSubcatName}
                      onChange={(e) => setNewSubcatName(e.target.value)}
                      placeholder="Subcategory Name (e.g. Spot UV Cards)"
                      className="w-full p-2 rounded-lg border border-orange-300 bg-white text-[14px] font-bold focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubcatSearch}
                        onChange={(e) => setNewSubcatSearch(e.target.value)}
                        placeholder="Search keyword (optional)"
                        className="flex-1 p-2 rounded-lg border border-orange-200 bg-white text-[14px] font-medium focus:outline-none"
                      />
                      <input
                        type="text"
                        value={newSubcatTag}
                        onChange={(e) => setNewSubcatTag(e.target.value)}
                        placeholder="Short Tag (e.g. 3D Accent)"
                        className="flex-1 p-2 rounded-lg border border-orange-200 bg-white text-[14px] font-medium focus:outline-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setActiveSubcatInput(null)}
                        className="px-3 py-1 text-[14px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddSubcategory(category.id)}
                        className="px-3 py-1 text-[14px] font-extrabold text-white bg-[#FF5A1F] hover:bg-[#e44d15] rounded-lg cursor-pointer border-none shadow-xs"
                      >
                        Save Subcategory
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                  {subitems.length === 0 ? (
                    <div className="p-3 text-center text-[14px] text-slate-400 font-medium italic bg-slate-50 rounded-xl">
                      No subcategories added yet.
                    </div>
                  ) : (
                    subitems.map((sub, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/60 transition group/sub">
                        <div>
                          <span className="text-[14px] font-bold text-slate-800 block">{sub.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{sub.tag || 'Standard'}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteSubcategory(category.id, idx, sub.name)}
                          className="p-1 text-slate-400 hover:text-red-600 border-none bg-transparent cursor-pointer opacity-80 group-hover/sub:opacity-100 transition"
                          title="Delete Subcategory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add New Main Category Modal */}
      {showAddCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-extrabold text-sm">
                <FolderPlus className="w-5 h-5 text-[#FF5A1F]" />
                <span>Add New Main Category</span>
              </div>
              <button
                onClick={() => setShowAddCatModal(false)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-[14px]">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Category Title *</label>
                <input
                  type="text"
                  value={newCatTitle}
                  onChange={(e) => setNewCatTitle(e.target.value)}
                  placeholder="e.g. Stickers & Labels"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Category Badge Tag (Optional)</label>
                <input
                  type="text"
                  value={newCatBadge}
                  onChange={(e) => setNewCatBadge(e.target.value)}
                  placeholder="e.g. HOT, POPULAR, NEW"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">Category Query Key</label>
                <input
                  type="text"
                  value={newCatQuery}
                  onChange={(e) => setNewCatQuery(e.target.value)}
                  placeholder="e.g. Stickers & Labels"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCatModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-extrabold text-[14px] cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMainCategory}
                className="px-5 py-2 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] cursor-pointer border-none shadow-md shadow-[#FF5A1F]/20"
              >
                Save & Upload Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
