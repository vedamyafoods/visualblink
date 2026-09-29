import React, { useState, useEffect } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiBriefcase, 
  FiMapPin, 
  FiPlus, 
  FiEdit3, 
  FiTrash2, 
  FiCheckCircle, 
  FiPackage, 
  FiLogOut, 
  FiArrowRight, 
  FiTruck, 
  FiClock, 
  FiShield,
  FiFileText,
  FiEye
} from 'react-icons/fi';

import { FiCheck, FiX, FiSliders } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders } from '../services/firebase';

export function AccountPage({ setCurrentPage }) {
  const { 
    currentUser, 
    userProfile, 
    updateUserProfile, 
    saveAddress, 
    deleteAddress, 
    setDefaultAddress, 
    logout 
  } = useAuth();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'addresses', 'profile'
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: currentUser?.displayName || userProfile?.displayName || '',
    phone: userProfile?.phone || '',
    company: userProfile?.company || '',
    gstin: userProfile?.gstin || ''
  });
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    name: currentUser?.displayName || '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    landmark: '',
    type: 'Home', // 'Home' or 'Office'
    isDefault: false
  });
  const [saveAddressSuccess, setSaveAddressSuccess] = useState(false);

  // Sync profile form state when currentUser or userProfile changes
  useEffect(() => {
    if (currentUser || userProfile) {
      setProfileForm({
        displayName: currentUser?.displayName || userProfile?.displayName || '',
        phone: userProfile?.phone || '',
        company: userProfile?.company || '',
        gstin: userProfile?.gstin || ''
      });
    }
  }, [currentUser, userProfile]);

  // Subscribe to logged-in user's real-time orders in Firestore
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserOrders(
        currentUser.uid, 
        currentUser.email, 
        (ordersList) => {
          setUserOrders(ordersList || []);
          setLoadingOrders(false);
        }
      );
      return () => unsubscribe();
    } else {
      setLoadingOrders(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-50 text-[#FF5A1F] flex items-center justify-center text-2xl font-bold mb-4 shadow-sm border border-blue-100">
          <FiUser className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2">Access Your Account</h2>
        <p className="text-slate-500 text-[14px] sm:text-sm max-w-md mb-6 font-medium">
          Sign in to view your real-time print orders, edit saved shipping addresses, and manage custom preferences.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentPage && setCurrentPage('login')}
            className="px-6 py-3 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] uppercase tracking-wider shadow-lg shadow-[#FF5A1F]/20 transition border-none cursor-pointer"
          >
            Sign In Now
          </button>
          <button
            onClick={() => setCurrentPage && setCurrentPage('signup')}
            className="px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-800 font-extrabold text-[14px] hover:bg-slate-50 transition cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    await updateUserProfile(profileForm);
    setSaveProfileSuccess(true);
    setTimeout(() => {
      setSaveProfileSuccess(false);
      setIsEditingProfile(false);
    }, 1500);
  };

  const openAddressModal = (addr = null) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddressForm({
        name: addr.name || currentUser?.displayName || '',
        phone: addr.phone || '',
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '',
        city: addr.city || 'Bengaluru',
        state: addr.state || 'Karnataka',
        pincode: addr.pincode || '',
        landmark: addr.landmark || '',
        type: addr.type || 'Home',
        isDefault: addr.isDefault || false
      });
    } else {
      setEditingAddressId(null);
      setAddressForm({
        name: currentUser?.displayName || '',
        phone: userProfile?.phone || '',
        addressLine1: '',
        addressLine2: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        landmark: '',
        type: 'Home',
        isDefault: (userProfile?.addresses?.length || 0) === 0
      });
    }
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    // Validate phone - 10 digits
    const cleanPhone = (addressForm.phone || '').replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      alert('Please enter a valid 10-digit mobile number (starting with 6-9).');
      return;
    }
    // Validate pincode - 6 digits
    const cleanPin = (addressForm.pincode || '').replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      alert('Please enter a valid 6-digit Pincode.');
      return;
    }
    await saveAddress({ ...addressForm, id: editingAddressId });
    setSaveAddressSuccess(true);
    setTimeout(() => {
      setSaveAddressSuccess(false);
      setIsAddressModalOpen(false);
    }, 1500);
  };

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-16">
      
      {/* Top Banner Header — Deep Navy #07152F */}
      <section className="bg-[#07152F] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#FF5A1F] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-[#FF5A1F]/30 border border-white/20">
                {(currentUser.displayName || userProfile?.displayName || currentUser.email || 'U').substring(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold border border-emerald-400/30 uppercase tracking-wider">
                    Verified Customer Profile
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {currentUser.displayName || userProfile?.displayName || 'My Account'}
                </h1>
                <p className="text-[14px] text-slate-300 font-mono mt-0.5">{currentUser.email}</p>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-red-600/20 hover:border-red-500/40 text-slate-200 hover:text-red-300 font-extrabold text-[14px] flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <FiLogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      </section>

      {/* Main Account Dashboard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar Navigation Tabs */}
          <div className="lg:col-span-3 space-y-2">
            <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-xs space-y-1">
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full p-3 rounded-xl text-left text-[14px] font-bold transition flex items-center justify-between cursor-pointer border-none ${
                  activeTab === 'orders'
                    ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
                    : 'bg-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FiPackage className="w-4 h-4" /> My Print Orders
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'orders' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {userOrders.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full p-3 rounded-xl text-left text-[14px] font-bold transition flex items-center justify-between cursor-pointer border-none ${
                  activeTab === 'addresses'
                    ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
                    : 'bg-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <FiMapPin className="w-4 h-4" /> Saved Address Book
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'addresses' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {userProfile?.addresses?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full p-3 rounded-xl text-left text-[14px] font-bold transition flex items-center gap-2.5 cursor-pointer border-none ${
                  activeTab === 'profile'
                    ? 'bg-[#FF5A1F] text-white shadow-md shadow-[#FF5A1F]/20'
                    : 'bg-transparent text-slate-700 hover:bg-slate-100'
                }`}
              >
                <FiUser className="w-4 h-4" /> Profile & GST Details
              </button>
            </div>

            {/* Quick Support Card */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white space-y-2 border border-slate-800 shadow-xs">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Need Custom Assistance?</span>
              <h4 className="font-extrabold text-[14px]">Printigly Dedicated Support</h4>
              <p className="text-[14px] text-slate-300">
                Call our press team directly for express 24h dispatch or custom packaging specs.
              </p>
              <div className="pt-2">
                <a
                  href="tel:+919800000000"
                  className="inline-flex items-center gap-1.5 text-[14px] font-bold text-sky-400 hover:text-white transition"
                >
                  <FiPhone className="w-3.5 h-3.5" /> +91 98000 00000
                </a>
              </div>
            </div>
          </div>

          {/* Right Main Content Panel */}
          <div className="lg:col-span-9 space-y-6">

            {/* TAB 1: MY ORDERS */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-[#0B1633] flex items-center gap-2">
                    <FiPackage className="w-5 h-5 text-[#FF5A1F]" /> Print Orders History ({userOrders.length})
                  </h3>
                  <span className="text-[14px] text-slate-500 font-medium">Real-time sync with Firebase Firestore</span>
                </div>

                {loadingOrders ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 text-[14px] font-bold">
                    Loading your orders from Firebase...
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#FF5A1F] flex items-center justify-center mx-auto text-xl font-bold">
                      <FiPackage className="w-7 h-7" />
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm">No Orders Placed Yet</h4>
                    <p className="text-[14px] text-slate-500 max-w-sm mx-auto">
                      Explore our products catalog, select custom options, and place your first print order!
                    </p>
                    <button
                      onClick={() => setCurrentPage && setCurrentPage('products')}
                      className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] text-white font-extrabold text-[14px] hover:bg-[#e44d15] cursor-pointer border-none shadow-md shadow-[#FF5A1F]/20"
                    >
                      Browse Products Catalog
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((ord) => (
                      <div key={ord.id} className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 hover:border-blue-200 transition">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="font-extrabold text-sm text-[#0B1633] font-mono">{ord.id}</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                              ● {ord.status || 'Payment Confirmed'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage && setCurrentPage('order-details', { orderId: ord.orderId || ord.id })}
                              className="px-3 py-1.5 rounded-xl bg-[#07152F] text-white font-extrabold text-[14px] flex items-center gap-1 cursor-pointer border-none shadow-xs"
                            >
                              <FiEye className="w-3.5 h-3.5" /> Order Details
                            </button>
                            <button
                              onClick={() => setCurrentPage && setCurrentPage('track', { orderId: ord.orderId || ord.id })}
                              className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5A1F] font-extrabold text-[14px] flex items-center gap-1 border border-orange-200 cursor-pointer"
                            >
                              <FiTruck className="w-3.5 h-3.5" /> Track Status
                            </button>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="space-y-2">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[14px] py-1">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200'}
                                  alt={item.name || item.productName}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                                />
                                <div>
                                  <span className="font-extrabold text-slate-900 block">{item.productName || item.name}</span>
                                  <span className="text-[14px] text-slate-500 font-medium">{item.variant || `${item.paper || ''} ${item.finish || ''}`} • Qty: {item.quantity || item.qty} pcs</span>
                                </div>
                              </div>
                              <span className="font-extrabold text-slate-900">₹{(item.totalPrice || (item.unitPrice * (item.quantity || item.qty)) || 0).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[14px]">
                          <span className="text-slate-500 font-medium">Shipping Address: <strong className="text-slate-800">{ord.deliveryAddress || ord.customer?.city || 'India'}</strong></span>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Total Order Amount</span>
                            <span className="font-black text-base text-[#FF5A1F]">₹{(ord.totalAmount || ord.pricing?.grandTotal || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESS BOOK */}
            {activeTab === 'addresses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0B1633] flex items-center gap-2">
                      <FiMapPin className="w-5 h-5 text-[#FF5A1F]" /> Saved Shipping Address Book
                    </h3>
                    <p className="text-[14px] text-slate-500 font-medium">Select or add shipping addresses for instant 1-click checkout</p>
                  </div>
                  <button
                    onClick={() => openAddressModal()}
                    className="px-4 py-2.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] flex items-center gap-2 shadow-md shadow-[#FF5A1F]/20 cursor-pointer border-none"
                  >
                    <FiPlus className="w-4 h-4" /> Add New Address
                  </button>
                </div>

                {(!userProfile?.addresses || userProfile.addresses.length === 0) ? (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                    <FiMapPin className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="font-extrabold text-slate-900 text-sm">No Shipping Addresses Saved Yet</h4>
                    <p className="text-[14px] text-slate-500 max-w-sm mx-auto">
                      Save your home, office, or client delivery addresses for faster checkout and automatic pre-fills.
                    </p>
                    <button
                      onClick={() => openAddressModal()}
                      className="px-5 py-2 rounded-xl bg-blue-600 text-white font-extrabold text-[14px] hover:bg-blue-700 cursor-pointer border-none"
                    >
                      + Add First Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`bg-white p-5 rounded-3xl border transition relative flex flex-col justify-between ${
                          addr.isDefault ? 'border-[#FF5A1F] shadow-sm ring-1 ring-[#FF5A1F]/20' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-extrabold border border-slate-200 uppercase tracking-wider">
                              {addr.type || 'Home'}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                                Default Shipping
                              </span>
                            )}
                          </div>

                          <h4 className="font-extrabold text-sm text-slate-900">{addr.name}</h4>
                          <p className="text-[14px] text-slate-600 mt-1 leading-relaxed">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}<br />
                            {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                          </p>
                          <p className="text-[14px] text-slate-500 font-semibold mt-2">
                            📞 Phone: {addr.phone || userProfile?.phone || 'Not provided'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                          {!addr.isDefault ? (
                            <button
                              onClick={() => setDefaultAddress(addr.id)}
                              className="text-[14px] font-extrabold text-blue-600 hover:text-blue-800 border-none bg-transparent cursor-pointer"
                            >
                              Set as Default
                            </button>
                          ) : (
                            <span className="text-[14px] font-bold text-emerald-600">✓ Active Default</span>
                          )}

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openAddressModal(addr)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 border-none bg-transparent cursor-pointer"
                              title="Edit Address"
                            >
                              <FiEdit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAddress(addr.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 border-none bg-transparent cursor-pointer"
                              title="Delete Address"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: USER PROFILE & GST DETAILS */}
            {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0B1633] flex items-center gap-2">
                      <FiUser className="w-5 h-5 text-[#FF5A1F]" /> Personal Profile & Business GSTIN
                    </h3>
                    <p className="text-[14px] text-slate-500 font-medium">Manage your personal contact info and B2B GST details for tax invoices</p>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[14px] flex items-center gap-1.5 border-none cursor-pointer"
                  >
                    <FiEdit3 className="w-3.5 h-3.5" /> {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                </div>

                {saveProfileSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-bold flex items-center gap-2">
                    <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>User profile updated successfully in Firebase Firestore!</span>
                  </div>
                )}

                {isEditingProfile ? (
                  <form onSubmit={handleProfileSubmit} className="space-y-4 text-[14px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                          className="w-full p-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Email Address (Read-only)</label>
                        <input
                          type="email"
                          disabled
                          value={currentUser.email}
                          className="w-full p-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          placeholder="+91 98765 43210"
                          className="w-full p-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">Company Name</label>
                        <input
                          type="text"
                          value={profileForm.company}
                          onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                          placeholder="e.g. Acme Innovations Pvt Ltd"
                          className="w-full p-3 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block font-bold text-slate-700 mb-1.5 uppercase text-[10px] tracking-wider">GSTIN Number (for B2B Tax Invoices)</label>
                        <input
                          type="text"
                          value={profileForm.gstin}
                          onChange={(e) => setProfileForm({ ...profileForm, gstin: e.target.value })}
                          placeholder="29AAAAA0000A1Z5"
                          className="w-full p-3 rounded-xl border border-slate-200 font-mono font-bold uppercase focus:outline-none focus:border-[#FF5A1F]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] shadow-md shadow-[#FF5A1F]/20 cursor-pointer border-none"
                      >
                        Save Profile to Firebase
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-[14px] hover:bg-slate-200 cursor-pointer border-none"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[14px]">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Full Name</span>
                      <p className="font-extrabold text-sm text-slate-900">{userProfile?.displayName || currentUser.displayName || 'Not specified'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Email Address</span>
                      <p className="font-extrabold text-sm text-slate-900 font-mono">{currentUser.email}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Phone Number</span>
                      <p className="font-extrabold text-sm text-slate-900">{userProfile?.phone || 'Not provided'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Company Name</span>
                      <p className="font-extrabold text-sm text-slate-900">{userProfile?.company || 'Direct Customer'}</p>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1 md:col-span-2">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">GSTIN Number</span>
                      <p className="font-extrabold text-sm text-slate-900 font-mono">{userProfile?.gstin || 'No GSTIN provided (Consumer Invoice)'}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>

      {/* EDIT / ADD ADDRESS MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddressSubmit}
            className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in duration-200 text-[14px]"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <FiMapPin className="w-4 h-4 text-[#FF5A1F]" />
                {editingAddressId ? 'Edit Shipping Address' : 'Add New Shipping Address'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 font-bold border-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {saveAddressSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ✓ Address saved to your Firebase profile!
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addressForm.name}
                  onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number * <span className="text-[10px] text-slate-400 font-normal">(10 digits)</span></label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  placeholder="9876543210"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                  placeholder="Building No, Flat No, Street Name"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                  placeholder="Area, Sector, Locality"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Pincode * <span className="text-[10px] text-slate-400 font-normal">(6 digits)</span></label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  placeholder="560038"
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Type</label>
                <select
                  value={addressForm.type}
                  onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:border-[#FF5A1F] bg-white"
                >
                  <option value="Home">Home</option>
                  <option value="Office">Office / Work</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="isDefaultChk"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#FF5A1F] rounded"
                />
                <label htmlFor="isDefaultChk" className="font-bold text-slate-700">Set as Default Address</label>
              </div>
            </div>

            <div className="pt-3 flex items-center gap-2 justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 cursor-pointer border-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-[#FF5A1F] text-white font-extrabold shadow-md shadow-[#FF5A1F]/20 cursor-pointer border-none"
              >
                Save Address
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
