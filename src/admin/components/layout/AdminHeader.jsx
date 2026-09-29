import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Zap, 
  ChevronDown, 
  LogOut, 
  Settings,
  Sparkles,
  Menu,
  Printer
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminHeader = ({ onOpenMobileSidebar }) => {
  const { 
    activeTab, 
    expressOrdersCount, 
    setCommandPaletteOpen,
    setWalkInModalOpen,
    setQuickInvoiceModalOpen,
    userRole,
    setActiveTab
  } = useAdmin();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Overview & Analytics';
      case 'orders': return 'Production Pipeline Hub';
      case 'design_desk': return 'Custom Design Request Desk';
      case 'catalog': return 'Product Catalog & Variant Matrix';
      case 'pricing': return 'Dynamic Pricing & GST Engine';
      case 'cloudinary': return 'Cloudinary Asset Library';
      case 'crm': return 'Customer Directory (CRM)';
      case 'logistics': return 'Logistics & Dispatch Log';
      case 'rbac': return 'RBAC & Security Matrix';
      default: return 'Dashboard Overview';
    }
  };

  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs select-none">
      
      {/* Left Area: Mobile Menu Trigger + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Trigger */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200/60"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        {/* Dynamic Title / Breadcrumb */}
        <div className="flex flex-col min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 font-extrabold tracking-wider uppercase">
            <span>Printigly</span>
            <span>/</span>
            <span className="text-blue-600 font-black">{activeTab.replace('_', ' ')}</span>
          </div>
          <h1 className="text-[14px] sm:text-sm font-extrabold text-slate-900 tracking-tight truncate">
            {getBreadcrumbTitle()}
          </h1>
        </div>
      </div>

      {/* Right Header Controls Toolbar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Search Command Palette Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 text-[14px] font-semibold border border-slate-200/80 transition-all cursor-pointer shadow-3xs"
          title="Search (⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="hidden md:inline truncate max-w-[120px] text-left">Search...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-white text-[9px] font-mono text-slate-400 border border-slate-200 shadow-3xs">
            ⌘K
          </kbd>
        </button>

        {/* Express Alert Pill */}
        <button
          onClick={() => setActiveTab('orders')}
          className="relative flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-[14px] font-bold border border-red-100 transition-colors shadow-3xs cursor-pointer"
          title="Express Same-Day Priority Queue"
        >
          <Zap className="w-3.5 h-3.5 text-red-600 fill-red-500 animate-pulse shrink-0" />
          <span className="hidden xl:inline">Express</span>
          <span className="px-1.5 py-0.2 rounded-full bg-red-600 text-white font-black text-[9px]">
            {expressOrdersCount}
          </span>
        </button>

        {/* Quick Action: + Walk-in Order */}
        <button
          onClick={() => setWalkInModalOpen(true)}
          className="flex items-center justify-center p-2 sm:px-3 sm:py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-bold shadow-sm shadow-blue-500/20 transition-all active:scale-95 cursor-pointer border-none"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline ml-1">+ Walk-In</span>
        </button>

        {/* Quick Action: Quick Invoice */}
        <button
          onClick={() => setQuickInvoiceModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-bold shadow-sm transition-all active:scale-95 cursor-pointer border-none"
        >
          <FileText className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Invoice</span>
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-1 pl-1 pr-0.5 py-0.5 rounded-xl hover:bg-slate-50 transition-colors border border-slate-200/50 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 text-white flex items-center justify-center font-extrabold text-[14px] shadow-3xs shrink-0">
              AD
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200/80 py-1.5 text-[14px] text-slate-700 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-extrabold text-slate-900">Admin User</p>
                <p className="text-slate-400 text-[10px] truncate">operations@printigly.com</p>
                <span className="inline-block mt-1 px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-bold text-[9px]">
                  Role: {userRole}
                </span>
              </div>
              <button 
                onClick={() => { setActiveTab('rbac'); setProfileDropdownOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold border-none bg-transparent cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                Security Settings
              </button>
              <button 
                onClick={() => { setActiveTab('cloudinary'); setProfileDropdownOpen(false); }}
                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold border-none bg-transparent cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                Cloudinary Asset API
              </button>
              <div className="border-t border-slate-100 my-1" />
              <button 
                onClick={() => alert("Admin session active.")}
                className="w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold border-none bg-transparent cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
