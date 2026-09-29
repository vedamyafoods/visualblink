import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_PRICING_RULES,
  INITIAL_CLOUDINARY_MEDIA,
  INITIAL_LOGISTICS_LOGS
} from '../data/mockAdminData';
import {
  subscribeToOrders,
  subscribeToProducts,
  subscribeToDesignRequests,
  updateOrderStatusInFirestore,
  addOrderToFirestore,
  addProductToFirestore,
  updateProductInFirestore,
  deleteProductFromFirestore,
  addDesignRequestToFirestore,
  subscribeToHomepageSettings,
  saveHomepageSettingsToFirestore,
  subscribeToCatalogOptions,
  saveCatalogOptionsToFirestore,
  subscribeToMegamenuCategories,
  saveMegamenuCategoriesToFirestore,
  DEFAULT_HOMEPAGE_SETTINGS,
  DEFAULT_CATALOG_OPTIONS,
  DEFAULT_MEGAMENU_CATEGORIES
} from '../../services/firebase';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const getTabFromUrl = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return searchParams.get('tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  };

  const [activeTab, setActiveTabState] = useState(getTabFromUrl);

  const setActiveTab = (tab, fragment = '') => {
    setActiveTabState(tab);
    try {
      const url = new URL(window.location.href);
      url.pathname = '/admin';
      url.searchParams.set('page', 'admin');
      url.searchParams.set('tab', tab);
      if (fragment) {
        url.hash = fragment.startsWith('#') ? fragment : `#${fragment}`;
      }
      window.history.pushState(null, '', url.toString());
    } catch (e) { }
  };

  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromUrl();
      setActiveTabState(tab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [userRole, setUserRole] = useState('Super Admin');
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [designRequests, setDesignRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [pricingRules, setPricingRules] = useState(INITIAL_PRICING_RULES);
  const [cloudinaryMedia, setCloudinaryMedia] = useState(INITIAL_CLOUDINARY_MEDIA);
  const [logisticsLogs, setLogisticsLogs] = useState(INITIAL_LOGISTICS_LOGS);

  // Dynamic Homepage, Catalog & Megamenu Categories States
  const [homepageSettings, setHomepageSettings] = useState(DEFAULT_HOMEPAGE_SETTINGS);
  const [catalogOptions, setCatalogOptions] = useState(DEFAULT_CATALOG_OPTIONS);
  const [megamenuCategories, setMegamenuCategories] = useState(DEFAULT_MEGAMENU_CATEGORIES);

  // Dynamic Categories Management
  const [categories, setCategories] = useState([
    'Business Stationery',
    'Large Format Display',
    'Custom Packaging',
    'Apparel & Merch',
    'Marketing Collateral',
    'Stickers & Labels',
    'Promotional Merchandise'
  ]);

  // Sync category list with any custom categories attached to fetched products
  useEffect(() => {
    if (products && products.length > 0) {
      setCategories(prev => {
        const set = new Set([...prev]);
        products.forEach(p => {
          if (p.category) set.add(p.category);
        });
        return Array.from(set);
      });
    }
  }, [products]);

  const addCategory = (categoryName) => {
    if (!categoryName || !categoryName.trim()) return;
    const trimmed = categoryName.trim();
    setCategories(prev => {
      if (prev.includes(trimmed)) return prev;
      return [...prev, trimmed];
    });
  };

  const deleteCategory = (categoryName) => {
    setCategories(prev => prev.filter(c => c !== categoryName));
  };

  // Modals & UI States
  const [preflightModalOpen, setPreflightModalOpen] = useState(false);
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [quickInvoiceModalOpen, setQuickInvoiceModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase Real-time Firestore Listeners
  useEffect(() => {
    const unsubscribeOrders = subscribeToOrders((firestoreOrders) => {
      if (firestoreOrders) {
        setOrders(firestoreOrders);
        const extractedCustomers = firestoreOrders.map((o, idx) => ({
          id: `CUST-${100 + idx}`,
          name: o.customer?.name || 'Customer',
          company: o.customer?.company || 'Direct Client',
          email: o.customer?.email || 'client@printigly.com',
          phone: o.customer?.phone || '+91 98000 00000',
          gstin: o.customer?.gstin || null,
          totalSpend: o.totalAmount || 0,
          totalOrders: 1,
          isB2B: o.customer?.isB2B || false,
          creditNet15: o.customer?.creditNet15 || false,
          status: 'Active',
        }));
        setCustomers(extractedCustomers);
      }
    });

    const unsubscribeProducts = subscribeToProducts((firestoreProducts) => {
      if (firestoreProducts && firestoreProducts.length > 0) {
        setProducts(firestoreProducts);
      }
    });

    const unsubscribeDesignReqs = subscribeToDesignRequests((reqs) => {
      if (reqs && reqs.length > 0) {
        setDesignRequests(reqs);
      }
    });

    const unsubscribeHomepage = subscribeToHomepageSettings((data) => {
      if (data) {
        setHomepageSettings(data);
      }
    });

    const unsubscribeCatalogOptions = subscribeToCatalogOptions((data) => {
      if (data) {
        setCatalogOptions(data);
      }
    });

    const unsubscribeMegamenu = subscribeToMegamenuCategories((data) => {
      if (data) {
        setMegamenuCategories(data);
      }
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeDesignReqs();
      unsubscribeHomepage();
      unsubscribeCatalogOptions();
      unsubscribeMegamenu();
    };
  }, []);

  // Update Homepage Settings (Syncs to Firestore)
  const updateHomepageSettings = async (newSettings) => {
    setHomepageSettings(newSettings);
    await saveHomepageSettingsToFirestore(newSettings);
  };

  // Update Catalog Options (Syncs to Firestore)
  const updateCatalogOptions = async (newOptions) => {
    setCatalogOptions(newOptions);
    await saveCatalogOptionsToFirestore(newOptions);
  };

  // Update Megamenu Categories (Syncs to Firestore)
  const updateMegamenuCategories = async (newCategories) => {
    setMegamenuCategories(newCategories);
    await saveMegamenuCategoriesToFirestore(newCategories);
  };

  // Add Custom Catalog Option to a category (e.g. paperStock, finishes, etc.)
  const addCustomCatalogOption = async (groupKey, optionObj) => {
    const currentList = catalogOptions[groupKey] || [];
    const exists = currentList.some(opt => opt.name === optionObj.name);
    if (exists) return;

    const updatedGroup = [...currentList, optionObj];
    const updatedOptions = {
      ...catalogOptions,
      [groupKey]: updatedGroup
    };
    setCatalogOptions(updatedOptions);
    await saveCatalogOptionsToFirestore(updatedOptions);
  };

  // Update Order Status Handler (Syncs to Firestore)
  const updateOrderStatus = async (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => ({ ...prev, status: newStatus }));
    }
    await updateOrderStatusInFirestore(orderId, newStatus);
  };

  // Add Walk-in Order Handler (Saves to Firestore)
  const addWalkInOrder = async (newOrderData) => {
    const newId = `PRT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder = {
      id: newId,
      createdAt: new Date().toISOString(),
      status: "Payment Confirmed",
      items: newOrderData.items || [],
      totalAmount: newOrderData.totalAmount || 0,
      subtotal: newOrderData.subtotal || 0,
      gstAmount: newOrderData.gstAmount || 0,
      customer: newOrderData.customer || {},
      deliveryMethod: newOrderData.deliveryMethod || "Over-the-Counter Pickup",
      deliveryAddress: newOrderData.deliveryAddress || "Walk-In Counter - Indiranagar Hub",
      isExpress: newOrderData.isExpress || false,
      expressDeadline: newOrderData.isExpress ? new Date(Date.now() + 4 * 3600 * 1000).toISOString() : null,
      artworkFile: newOrderData.artworkFile || {
        fileName: "walkin_customer_art.png",
        fileType: "png",
        dimensions: "Standard",
        resolutionDpi: 300,
        cmykVerified: true,
        previewUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop"
      }
    };

    // Save to Firestore real-time collection
    await addOrderToFirestore(newOrder);
    setOrders(prev => [newOrder, ...prev]);
  };

  // Save or Update Product in Catalog (Saves/Updates in Firestore)
  const saveProduct = async (productData) => {
    if (productData.id) {
      await updateProductInFirestore(productData.id, productData);
    } else {
      await addProductToFirestore(productData);
    }
  };

  // Remove Product from Catalog (Deletes from Firestore)
  const removeProduct = async (productId) => {
    await deleteProductFromFirestore(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Toggle B2B NET-15 Privilege
  const toggleB2BCredit = (customerId) => {
    setCustomers(prev =>
      prev.map(c => c.id === customerId ? { ...c, creditNet15: !c.creditNet15 } : c)
    );
  };

  // Assign Graphic Designer to Ticket
  const assignDesignerToTicket = (ticketId, designerName) => {
    setDesignRequests(prev =>
      prev.map(t => t.id === ticketId ? { ...t, assignedDesigner: designerName, status: "In Progress" } : t)
    );
  };

  // Upload Proof for Ticket
  const uploadTicketProof = (ticketId, proofUrl) => {
    setDesignRequests(prev =>
      prev.map(t => t.id === ticketId ? { ...t, proofUrl, status: "Proof Generated" } : t)
    );
  };

  const expressOrdersCount = orders.filter(o => o.isExpress && o.status !== "Delivered").length;
  const pendingArtworkCount = orders.filter(o => o.status === "Artwork Verification").length;

  return (
    <AdminContext.Provider value={{
      activeTab,
      setActiveTab,
      userRole,
      setUserRole,
      orders,
      setOrders,
      selectedOrder,
      setSelectedOrder,
      updateOrderStatus,
      addWalkInOrder,
      products,
      saveProduct,
      removeProduct,
      categories,
      addCategory,
      deleteCategory,
      homepageSettings,
      updateHomepageSettings,
      catalogOptions,
      updateCatalogOptions,
      addCustomCatalogOption,
      megamenuCategories,
      updateMegamenuCategories,
      designRequests,
      assignDesignerToTicket,
      uploadTicketProof,
      customers,
      toggleB2BCredit,
      pricingRules,
      setPricingRules,
      cloudinaryMedia,
      setCloudinaryMedia,
      logisticsLogs,
      setLogisticsLogs,
      preflightModalOpen,
      setPreflightModalOpen,
      walkInModalOpen,
      setWalkInModalOpen,
      quickInvoiceModalOpen,
      setQuickInvoiceModalOpen,
      commandPaletteOpen,
      setCommandPaletteOpen,
      sidebarCollapsed,
      setSidebarCollapsed,
      searchQuery,
      setSearchQuery,
      expressOrdersCount,
      pendingArtworkCount,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

