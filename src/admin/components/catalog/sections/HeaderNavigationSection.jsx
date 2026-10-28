import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Compass, Check, ChevronDown, Search, AlertCircle, Eye, EyeOff } from 'lucide-react';

const createSlug = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/**
 * Reusable searchable dropdown for navigation items
 */
const SearchableSelect = ({
  label,
  required = false,
  value,
  onChange,
  options = [],
  placeholder = '-- Select --',
  emptyMessage = 'No options available',
  disabled = false,
  warningMessage = null,
  renderOption = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter(opt =>
      (opt.label || opt.name || opt.title || '').toLowerCase().includes(q) ||
      (opt.tag || opt.search || opt.id || '').toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = useMemo(() => {
    return options.find(opt => opt.value === value || opt.id === value);
  }, [options, value]);

  return (
    <div className={`relative space-y-1.5 ${isOpen ? 'z-40' : 'z-10'}`} ref={containerRef}>
      <div className="flex items-center justify-between">
        <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {selectedOption && (
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            ID: {selectedOption.value || selectedOption.id}
          </span>
        )}
      </div>

      {warningMessage && (
        <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Select Trigger Box */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl border font-bold text-[14px] flex items-center justify-between transition-all select-none ${disabled
          ? 'bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed'
          : isOpen
            ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-sm cursor-pointer text-slate-900'
            : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer text-slate-800 shadow-3xs'
          }`}
      >
        <div className="truncate">
          {selectedOption ? (
            <span className="text-slate-900 font-bold">
              {selectedOption.label || selectedOption.name || selectedOption.title}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </div>

      {/* Floating Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Search Box */}
          {options.length > 4 && (
            <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto p-1.5 space-y-1 custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-slate-400 font-medium text-[12px]">
                {emptyMessage}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const optVal = opt.value || opt.id;
                const isSelected = optVal === value;
                return (
                  <div
                    key={optVal}
                    onClick={() => {
                      onChange(optVal, opt);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`px-3 py-2 rounded-xl text-[13px] font-bold cursor-pointer transition-colors flex items-center justify-between ${isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    {renderOption ? renderOption(opt, isSelected) : (
                      <div className="flex items-center gap-2 truncate">
                        <span>{opt.label || opt.name || opt.title}</span>
                        {opt.tag && (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                            }`}>
                            {opt.tag}
                          </span>
                        )}
                      </div>
                    )}
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const HeaderNavigationSection = ({
  formData,
  setFormData,
  navigationMenus = []
}) => {
  // Filter only eligible menus (exclude disabled if any)
  const availableMenus = useMemo(() => {
    return (navigationMenus || [])
      .filter(m => m.disabled !== true && m.status !== 'disabled')
      .map(m => ({
        id: m.id || createSlug(m.title),
        value: m.id || createSlug(m.title),
        label: m.title || m.name,
        title: m.title || m.name,
        items: m.items || [],
        badge: m.badge,
        categoryQuery: m.categoryQuery
      }));
  }, [navigationMenus]);

  // Find currently selected menu
  const selectedMenuId = formData.navigationMenuId || formData.headerMenuId || '';
  const selectedMenu = useMemo(() => {
    return availableMenus.find(m =>
      m.id === selectedMenuId ||
      createSlug(m.id) === createSlug(selectedMenuId) ||
      createSlug(m.title) === createSlug(formData.navigationMenuTitle || formData.headerMenuTitle)
    );
  }, [availableMenus, selectedMenuId, formData.navigationMenuTitle, formData.headerMenuTitle]);

  // Check if saved menu reference is broken/deleted in Homepage Studio
  const isMenuMissing = Boolean(
    selectedMenuId && !selectedMenu && availableMenus.length > 0
  );

  // Available submenus under the selected menu
  const availableSubmenus = useMemo(() => {
    if (!selectedMenu || !Array.isArray(selectedMenu.items)) return [];
    return selectedMenu.items.map((sub, idx) => ({
      id: sub.id || createSlug(sub.name) || `sub_${idx}`,
      value: sub.id || createSlug(sub.name) || `sub_${idx}`,
      label: sub.name,
      name: sub.name,
      tag: sub.tag,
      search: sub.search
    }));
  }, [selectedMenu]);

  // Selected submenu
  const selectedSubmenuId = formData.navigationSubmenuId || formData.headerSubmenuId || '';
  const selectedSubmenu = useMemo(() => {
    return availableSubmenus.find(s =>
      s.id === selectedSubmenuId ||
      createSlug(s.id) === createSlug(selectedSubmenuId) ||
      createSlug(s.name) === createSlug(formData.navigationSubmenuTitle || formData.headerSubmenuTitle)
    );
  }, [availableSubmenus, selectedSubmenuId, formData.navigationSubmenuTitle, formData.headerSubmenuTitle]);

  // Check if saved submenu reference is broken/deleted in Homepage Studio
  const isSubmenuMissing = Boolean(
    selectedSubmenuId && !selectedSubmenu && availableSubmenus.length > 0
  );

  // When Header Menu changes
  const handleMenuChange = (newMenuId, menuObj) => {
    const targetMenu = menuObj || availableMenus.find(m => m.id === newMenuId);
    const targetTitle = targetMenu?.title || targetMenu?.label || '';
    const newItems = targetMenu?.items || [];

    // Check if the current submenu belongs to the new menu
    const isCurrentSubmenuInNewMenu = newItems.some(sub =>
      (sub.id && sub.id === formData.navigationSubmenuId) ||
      createSlug(sub.name) === createSlug(formData.navigationSubmenuId) ||
      createSlug(sub.name) === createSlug(formData.navigationSubmenuTitle)
    );

    setFormData(prev => ({
      ...prev,
      navigationMenuId: newMenuId,
      navigationMenuTitle: targetTitle,
      headerMenuId: newMenuId,
      headerMenuTitle: targetTitle,
      navigationSubmenuId: isCurrentSubmenuInNewMenu ? prev.navigationSubmenuId : '',
      navigationSubmenuTitle: isCurrentSubmenuInNewMenu ? prev.navigationSubmenuTitle : '',
      headerSubmenuId: isCurrentSubmenuInNewMenu ? prev.headerSubmenuId : '',
      headerSubmenuTitle: isCurrentSubmenuInNewMenu ? prev.headerSubmenuTitle : ''
    }));
  };

  // When Header Submenu changes
  const handleSubmenuChange = (newSubId, subObj) => {
    const targetSub = subObj || availableSubmenus.find(s => s.id === newSubId);
    const targetTitle = targetSub?.label || targetSub?.name || '';

    setFormData(prev => ({
      ...prev,
      navigationSubmenuId: newSubId,
      navigationSubmenuTitle: targetTitle,
      headerSubmenuId: newSubId,
      headerSubmenuTitle: targetTitle
    }));
  };

  // Toggle Visibility in Navigation
  const toggleNavigationVisibility = () => {
    const current = formData.showInNavigation !== false;
    setFormData(prev => ({
      ...prev,
      showInNavigation: !current
    }));
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-blue-200/90 shadow-3xs space-y-5 relative z-20">
      {/* Top Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-t-2xl" />

      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h4 className="font-bold text-slate-900 text-[14px] uppercase tracking-wider text-blue-600 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-600" /> HEADER NAVIGATION & PRODUCT PLACEMENT
          </h4>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">
            Assign this product to the public website's header dropdown navigation configured in Homepage Studio.
          </p>
        </div>

        {/* Visibility Pill Badge */}
        <button
          type="button"
          onClick={toggleNavigationVisibility}
          className={`px-3 py-1.5 rounded-xl border text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition ${formData.showInNavigation !== false
            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
            }`}
          title="Toggle whether this product is visible under navigation menus"
        >
          {formData.showInNavigation !== false ? (
            <>
              <Eye className="w-3.5 h-3.5 text-blue-600" />
              <span>Visible in Dropdown</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
              <span>Hidden from Dropdown</span>
            </>
          )}
        </button>
      </div>

      {/* Dropdowns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
        {/* FIELD A: Header Menu */}
        <div>
          <SearchableSelect
            label="Header Menu"
            required={true}
            value={selectedMenuId}
            onChange={handleMenuChange}
            options={availableMenus}
            placeholder="-- Select Header Menu --"
            emptyMessage={availableMenus.length === 0 ? "Loading menus or none found in Homepage Studio..." : "No matching menus"}
            warningMessage={isMenuMissing ? `Previously saved menu "${formData.navigationMenuTitle || selectedMenuId}" is not currently found in Homepage Studio. Please select a valid live menu.` : null}
            renderOption={(opt, isSelected) => (
              <div className="flex items-center justify-between w-full">
                <span className="font-bold">{opt.title || opt.label}</span>
                <div className="flex items-center gap-1.5">
                  {opt.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                      }`}>
                      {opt.badge}
                    </span>
                  )}
                  <span className={`text-[10px] font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                    ({opt.items?.length || 0} submenus)
                  </span>
                </div>
              </div>
            )}
          />
          <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
            Dynamically loaded from Homepage Studio. New menus appear automatically.
          </span>
        </div>

        {/* FIELD B: Header Submenu */}
        <div>
          {selectedMenu && availableSubmenus.length === 0 ? (
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700 uppercase text-[10px] tracking-wider">
                Header Submenu
              </label>
              <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 text-amber-800 text-[13px] font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>This menu has no dropdown submenus configured. Products link directly to the main menu.</span>
              </div>
            </div>
          ) : (
            <SearchableSelect
              label="Header Submenu"
              required={Boolean(selectedMenu && availableSubmenus.length > 0)}
              value={selectedSubmenuId}
              onChange={handleSubmenuChange}
              options={availableSubmenus}
              placeholder={!selectedMenu ? "-- Select Header Menu First --" : "-- Select Header Submenu --"}
              disabled={!selectedMenu}
              emptyMessage={!selectedMenu ? "Please select a main header menu first" : "No submenus available"}
              warningMessage={isSubmenuMissing ? `Previously saved submenu "${formData.navigationSubmenuTitle || selectedSubmenuId}" is not currently in "${selectedMenu?.title}". Please select an active submenu.` : null}
              renderOption={(opt, isSelected) => (
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold">{opt.name || opt.label}</span>
                  {opt.tag && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${isSelected ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {opt.tag}
                    </span>
                  )}
                </div>
              )}
            />
          )}
          <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
            Populated only from submenus belonging to the selected main menu.
          </span>
        </div>
      </div>

      {/* Mapping Confirmation Bar */}
      <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-[12px]">
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-bold uppercase text-[10px]">Active Mapping:</span>
          {selectedMenu ? (
            <span className="font-bold text-slate-800">
              <span className="text-blue-600">{selectedMenu.title}</span>
              {selectedSubmenu && (
                <>
                  <span className="text-slate-400 mx-1.5">›</span>
                  <span className="text-indigo-600">{selectedSubmenu.name}</span>
                </>
              )}
            </span>
          ) : (
            <span className="text-slate-400 italic font-medium">Unassigned (will not appear under any specific header dropdown)</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <span>Synced with Homepage Studio</span>
        </div>
      </div>
    </div>
  );
};
