import React, { useState } from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { AdminSidebar } from './components/layout/AdminSidebar';
import { AdminHeader } from './components/layout/AdminHeader';
import { AdminCommandPalette } from './components/layout/AdminCommandPalette';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { OrderPipelineHub } from './components/orders/OrderPipelineHub';
import { DesignTicketDesk } from './components/design_desk/DesignTicketDesk';
import { ProductCatalogManager } from './components/catalog/ProductCatalogManager';
import { PrintOptionsMatrixManager } from './components/catalog/PrintOptionsMatrixManager';
import { CategoryManager } from './components/catalog/CategoryManager';
import { PricingEngineManager } from './components/pricing/PricingEngineManager';
import { CloudinaryMediaBrowser } from './components/cloudinary/CloudinaryMediaBrowser';
import { CustomerDirectory } from './components/crm/CustomerDirectory';
import { HyperlocalDispatchLog } from './components/logistics/HyperlocalDispatchLog';
import { RolePermissionsMatrix } from './components/rbac/RolePermissionsMatrix';
import { HomepageManager } from './components/homepage/HomepageManager';
import { WalkInOrderModal } from './components/modals/WalkInOrderModal';
import { QuickInvoiceModal } from './components/modals/QuickInvoiceModal';

const AdminContent = ({ onSwitchToWebsite }) => {
  const { activeTab } = useAdmin();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'orders':
        return <OrderPipelineHub />;
      // case 'design_desk':
      //   return <DesignTicketDesk />;
      case 'catalog':
        return <ProductCatalogManager />;
      // case 'print_matrix':
      //   return <PrintOptionsMatrixManager />;
      // case 'category_manager':
      //   return <CategoryManager />;
      case 'homepage_customizer':
        return <HomepageManager />;
      case 'pricing':
        return <PricingEngineManager />;
      case 'cloudinary':
        return <CloudinaryMediaBrowser />;
      case 'crm':
        return <CustomerDirectory />;
      case 'logistics':
        return <HyperlocalDispatchLog />;
      case 'rbac':
        return <RolePermissionsMatrix />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden antialiased selection:bg-blue-600 selection:text-white">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <AdminSidebar
        onSwitchToWebsite={onSwitchToWebsite}
        isMobileOpen={mobileSidebarOpen}
        onCloseMobileSidebar={() => setMobileSidebarOpen(false)}
      />

      {/* Main Backoffice Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <AdminHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        {/* Dynamic Operational View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          {renderActiveModule()}
        </main>
      </div>

      {/* Modals & Command Palette Overlays */}
      <AdminCommandPalette />
      <WalkInOrderModal />
      <QuickInvoiceModal />
    </div>
  );
};

export const AdminApp = ({ onSwitchToWebsite }) => {
  return (
    <AdminProvider>
      <AdminContent onSwitchToWebsite={onSwitchToWebsite} />
    </AdminProvider>
  );
};
