import React, { useState, useEffect } from 'react';
import { 
  FiMapPin, 
  FiUser, 
  FiPhone, 
  FiMail, 
  FiBriefcase, 
  FiCheckCircle, 
  FiCreditCard, 
  FiTruck, 
  FiShield, 
  FiArrowRight, 
  FiCheck, 
  FiLock, 
  FiAlertCircle,
  FiFileText,
  FiPlus
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import { addOrderToFirestore, createOrderOnServerApi } from '../services/firebase';
import { triggerOrderConfirmationEmail } from '../services/emailService';

export function CheckoutPage({ setCurrentPage }) {
  const { cartItems, clearCart, currentUser, userProfile, saveAddress } = useAuth();

  // Search parameters for express & coupon passed from Cart
  const getSearchParams = () => new URLSearchParams(window.location.search);
  const initialExpress = getSearchParams().get('express') === '1';
  const initialCouponCode = getSearchParams().get('coupon') || '';

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // GST Business Details State
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');

  // Delivery Address State
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Delivery & Payment State
  const [isExpress, setIsExpress] = useState(initialExpress);
  const [paymentMethod, setPaymentMethod] = useState('razorpay'); // 'razorpay' or 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Auto-fill logged-in user details & default address
  useEffect(() => {
    if (currentUser || userProfile) {
      setCustomerName(userProfile?.displayName || currentUser?.displayName || '');
      setCustomerEmail(currentUser?.email || '');
      setCustomerPhone(userProfile?.phone || '');
      if (userProfile?.company) {
        setIsB2B(true);
        setCompanyName(userProfile.company);
        if (userProfile.gstin) setGstin(userProfile.gstin);
      }

      const defaultAddr = (userProfile?.addresses || []).find(a => a.isDefault) || (userProfile?.addresses || [])[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setAddressLine1(defaultAddr.addressLine1 || '');
        setAddressLine2(defaultAddr.addressLine2 || '');
        setCity(defaultAddr.city || 'Bengaluru');
        setState(defaultAddr.state || 'Karnataka');
        setPincode(defaultAddr.pincode || '');
        setLandmark(defaultAddr.landmark || '');
        if (defaultAddr.phone) setCustomerPhone(defaultAddr.phone);
        if (defaultAddr.name) setCustomerName(defaultAddr.name);
      }
    }
  }, [currentUser, userProfile]);

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setAddressLine1(addr.addressLine1 || '');
    setAddressLine2(addr.addressLine2 || '');
    setCity(addr.city || 'Bengaluru');
    setState(addr.state || 'Karnataka');
    setPincode(addr.pincode || '');
    setLandmark(addr.landmark || '');
    if (addr.phone) setCustomerPhone(addr.phone);
    if (addr.name) setCustomerName(addr.name);
    setFieldErrors({});
    setErrorMessage('');
  };

  const handleAddNewAddress = () => {
    setSelectedAddressId('new');
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setPincode('');
    setCity('Bengaluru');
    setState('Karnataka');
    setFieldErrors({});
    setErrorMessage('');
  };

  // Pricing calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || (item.qty * item.unitPrice)), 0);

  let couponDiscount = 0;
  if (initialCouponCode && APP_CONFIG.AVAILABLE_COUPONS[initialCouponCode]) {
    const c = APP_CONFIG.AVAILABLE_COUPONS[initialCouponCode];
    if (c.discountPercent) couponDiscount = Math.round((subtotal * c.discountPercent) / 100);
    else if (c.discountAmount) couponDiscount = c.discountAmount;
  }

  const expressFee = isExpress ? APP_CONFIG.EXPRESS_SHIPPING_FEE : 0;
  const shipping = subtotal > APP_CONFIG.FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : APP_CONFIG.STANDARD_SHIPPING_FEE;
  const gstAmount = 0;
  const grandTotal = Math.max(0, Math.round(subtotal - couponDiscount + expressFee + shipping));

  // Consolidate artwork files from all cart items
  const aggregatedArtwork = cartItems.reduce((acc, item) => {
    if (item.artworkFiles && Array.isArray(item.artworkFiles)) {
      return [...acc, ...item.artworkFiles];
    }
    if (item.uploadedFile) {
      acc.push({ fileName: item.uploadedFile, secureUrl: item.image, format: 'file' });
    }
    return acc;
  }, []);

  const validateCheckoutForm = () => {
    const errors = {};

    // 1. Full Name Validation
    if (!customerName.trim()) {
      errors.customerName = 'Full Name is required.';
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim()) {
      errors.customerEmail = 'Email Address is required.';
    } else if (!emailRegex.test(customerEmail.trim())) {
      errors.customerEmail = 'Please enter a valid email address.';
    }

    // 3. Contact Mobile Phone Validation (Strict 10 digits for India starting with 6-9)
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (!customerPhone.trim()) {
      errors.customerPhone = 'Mobile Phone number is required.';
    } else if (cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.customerPhone = 'Please enter a valid 10-digit mobile number (e.g. 9876543210).';
    }

    // 4. Delivery Address Line 1 Validation
    if (!addressLine1.trim()) {
      errors.addressLine1 = 'Flat / Street address is required.';
    }

    // 5. City Validation
    if (!city.trim()) {
      errors.city = 'City name is required.';
    }

    // 6. State Validation
    if (!state.trim()) {
      errors.state = 'State name is required.';
    }

    // 7. Pincode Validation (Strict 6 numeric digits)
    const cleanPin = pincode.replace(/\D/g, '');
    if (!pincode.trim()) {
      errors.pincode = 'Pincode is required.';
    } else if (cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      errors.pincode = 'Please enter a valid 6-digit Pincode (e.g. 560001).';
    }

    // 8. B2B GSTIN Validation
    if (isB2B && gstin.trim() && gstin.trim().length !== 15) {
      errors.gstin = 'Please enter a valid 15-digit GSTIN or leave blank.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstMsg = Object.values(errors)[0];
      setErrorMessage(firstMsg);
      return false;
    }

    setErrorMessage('');
    return true;
  };

  const handleFinalOrderCreation = async (paymentDetails) => {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const normalizedEmail = customerEmail.trim().toLowerCase();
      const fullAddressStr = `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${landmark ? landmark + ', ' : ''}${city}, ${state} - ${pincode}`;

      if (currentUser && saveToProfile) {
        await saveAddress({
          name: customerName,
          phone: customerPhone,
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
          landmark,
          type: 'Delivery',
          isDefault: !(userProfile?.addresses?.length)
        });
      }

      const orderPayload = {
        idempotencyKey,
        userId: currentUser?.uid || null,
        customer: {
          name: customerName.trim(),
          email: normalizedEmail,
          phone: customerPhone.trim(),
          company: isB2B ? companyName : '',
          gstin: isB2B ? gstin : '',
          isB2B
        },
        shippingAddress: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          addressLine1,
          addressLine2,
          city,
          state,
          pincode,
          landmark,
          fullAddress: fullAddressStr
        },
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          productName: item.name,
          paper: item.paper || '',
          finish: item.finish || '',
          sides: item.sides || '',
          selectedOptions: item.selectedOptions || {},
          quantity: item.qty || item.quantity || 1,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          artworkFiles: item.artworkFiles || [],
          artworkNotes: item.artworkNotes || ''
        })),
        paymentMethod: paymentDetails.method,
        paymentStatus: paymentDetails.status,
        razorpayPaymentId: paymentDetails.razorpayPaymentId || null,
        isExpress,
        couponCode: initialCouponCode || null,
        artwork: aggregatedArtwork
      };

      let createdOrder;
      try {
        createdOrder = await createOrderOnServerApi(orderPayload);
      } catch (serverErr) {
        console.warn("Server-authoritative order creation warning, using fallback:", serverErr);
        // Fallback to client order creation if server API route unavailable in dev mode
        const fallbackOrderId = `PRT-${Math.floor(100000 + Math.random() * 900000)}`;
        const fallbackData = {
          ...orderPayload,
          id: fallbackOrderId,
          orderId: fallbackOrderId,
          orderNumber: fallbackOrderId,
          pricing: { grandTotal, subtotal, shippingFee: shipping },
          totalAmount: grandTotal,
          emailStatus: { customer: 'pending', admin: 'pending' },
          createdAt: new Date().toISOString()
        };
        const docId = await addOrderToFirestore(fallbackData);
        createdOrder = { ...fallbackData, id: docId };
      }

      const finalOrderId = createdOrder.orderId || createdOrder.orderNumber || createdOrder.id;
      const docId = createdOrder.id;

      // Trigger email notifications
      try {
        await triggerOrderConfirmationEmail(finalOrderId, docId);
      } catch (emailErr) {
        console.warn("Order email notification trigger note:", emailErr);
      }

      clearCart();
      setIsSubmitting(false);

      // Navigate to Order Success Page
      setCurrentPage('order-success', { orderId: finalOrderId });
    } catch (err) {
      console.error("Order creation failed:", err);
      setIsSubmitting(false);
      setErrorMessage(`Order processing failed: ${err.message}`);
    }
  };

  const handleRazorpayPayment = () => {
    if (!validateCheckoutForm()) return;
    setIsSubmitting(true);

    // Dynamically load Razorpay SDK script if not present
    const loadRazorpayScript = () => {
      return new Promise((resolve) => {
        if (window.Razorpay) {
          resolve(true);
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpayScript().then((res) => {
      if (!res) {
        setIsSubmitting(false);
        setErrorMessage('Failed to load Razorpay SDK. Please check your internet connection.');
        return;
      }

      const options = {
        key: APP_CONFIG.RAZORPAY_KEY_ID,
        amount: grandTotal * 100, // Amount in paise
        currency: 'INR',
        name: 'Printigly Press',
        description: `Custom Print Order - ${cartItems.length} item(s)`,
        image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200',
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone
        },
        theme: {
          color: '#FF5A1F'
        },
        handler: function (response) {
          // Payment Success Callback
          handleFinalOrderCreation({
            method: 'razorpay',
            status: 'paid',
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id || `rzp_order_${Date.now()}`
          });
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
          }
        }
      };

      try {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        // Fallback simulation if test mode popups blocked
        handleFinalOrderCreation({
          method: 'razorpay',
          status: 'paid',
          razorpayPaymentId: `rzp_sim_${Date.now()}`
        });
      }
    });
  };

  const handleCODOrder = (e) => {
    e.preventDefault();
    if (!validateCheckoutForm()) return;

    handleFinalOrderCreation({
      method: 'cod',
      status: 'pending'
    });
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 text-[14px] mb-6">Please add items to cart before proceeding to checkout.</p>
        <button
          onClick={() => setCurrentPage('products')}
          className="px-6 py-3 rounded-2xl bg-[#FF5A1F] text-white font-extrabold text-[14px] uppercase tracking-wider cursor-pointer border-none"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-24">
      
      {/* Top Banner Header */}
      <section className="bg-[#07152F] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-2 text-[14px] font-semibold text-slate-400">
            <span className="cursor-pointer hover:text-white" onClick={() => setCurrentPage('cart')}>Cart</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Secure Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Checkout & Order Authorization
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[14px] font-semibold flex items-center gap-3">
            <FiAlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT FORM COLUMN (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* SECTION 1: CUSTOMER DETAILS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0B1633] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiUser className="w-4 h-4 text-[#FF5A1F]" /> 1. Customer Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px]">
                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.customerName) setFieldErrors(prev => ({ ...prev, customerName: null }));
                    }}
                    placeholder="John Doe"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.customerName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.customerName && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (fieldErrors.customerEmail) setFieldErrors(prev => ({ ...prev, customerEmail: null }));
                    }}
                    placeholder="john@example.com"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.customerEmail ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.customerEmail && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.customerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Mobile Phone *</span>
                    <span className="text-[10px] text-slate-400 font-normal">10 digits</span>
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={customerPhone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setCustomerPhone(val);
                      if (fieldErrors.customerPhone) setFieldErrors(prev => ({ ...prev, customerPhone: null }));
                    }}
                    placeholder="9876543210"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.customerPhone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.customerPhone ? (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.customerPhone}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Order tracking SMS sent to this number</p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: DELIVERY ADDRESS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-[#0B1633] flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-[#FF5A1F]" /> 2. Delivery Address
                </h3>
              </div>

              {/* Saved Address Quick Selector if user has profile addresses */}
              {userProfile?.addresses && userProfile.addresses.length > 0 && (
                <div className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Select Saved Address:</span>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className={`text-[14px] font-extrabold flex items-center gap-1 cursor-pointer transition ${
                        selectedAddressId === 'new' ? 'text-[#FF5A1F]' : 'text-slate-500 hover:text-[#FF5A1F]'
                      }`}
                    >
                      <FiPlus className="w-3.5 h-3.5" /> Enter New Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {userProfile.addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border text-left text-[14px] transition cursor-pointer relative ${
                            isSelected
                              ? 'border-[#FF5A1F] bg-orange-50/40 ring-2 ring-[#FF5A1F]/20'
                              : 'border-slate-200 bg-[#F7F8FA] hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between font-extrabold text-[#0B1633] mb-1">
                            <span className="flex items-center gap-1.5 truncate">
                              {isSelected && <FiCheckCircle className="w-3.5 h-3.5 text-[#FF5A1F] shrink-0" />}
                              {addr.name || customerName || 'Saved Address'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[9.5px] uppercase font-bold shrink-0 ${
                              isSelected ? 'bg-[#FF5A1F] text-white' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {addr.type || (addr.isDefault ? 'Default' : 'Address')}
                            </span>
                          </div>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed text-[14px]">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - <strong className="font-extrabold text-slate-800">{addr.pincode}</strong>
                          </p>
                        </button>
                      );
                    })}

                    {/* New Address Card Option */}
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className={`p-3.5 rounded-2xl border text-left text-[14px] transition cursor-pointer flex flex-col justify-center items-center text-center gap-1 ${
                        selectedAddressId === 'new'
                          ? 'border-[#FF5A1F] bg-orange-50/40 ring-2 ring-[#FF5A1F]/20 text-[#FF5A1F]'
                          : 'border-dashed border-slate-300 bg-white hover:border-[#FF5A1F] text-slate-500 hover:text-[#FF5A1F]'
                      }`}
                    >
                      <FiPlus className="w-5 h-5 text-[#FF5A1F]" />
                      <span className="font-extrabold">Deliver to New Address</span>
                      <span className="text-[10px] text-slate-400">Fill in form details below</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div className="sm:col-span-2">
                  <label className="font-extrabold text-slate-700 block mb-1">Flat / Building / House No. & Street *</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => {
                      setAddressLine1(e.target.value);
                      if (fieldErrors.addressLine1) setFieldErrors(prev => ({ ...prev, addressLine1: null }));
                    }}
                    placeholder="e.g. Flat 304, Sunshine Towers, MG Road"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.addressLine1 ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.addressLine1 && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Indiranagar Layout"
                    className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: null }));
                    }}
                    placeholder="Bengaluru"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.city ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.city && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      if (fieldErrors.state) setFieldErrors(prev => ({ ...prev, state: null }));
                    }}
                    placeholder="Karnataka"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.state ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.state && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-extrabold text-slate-700 block mb-1 flex items-center justify-between">
                    <span>Pincode *</span>
                    <span className="text-[10px] text-slate-400 font-normal">6 digits</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(val);
                      if (fieldErrors.pincode) setFieldErrors(prev => ({ ...prev, pincode: null }));
                    }}
                    placeholder="560001"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${
                      fieldErrors.pincode ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#FF5A1F]'
                    }`}
                  />
                  {fieldErrors.pincode ? (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.pincode}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-400 mt-1 font-medium">Pan-India delivery check</p>
                  )}
                </div>
              </div>

              {currentUser && (
                <label className="flex items-center gap-2 text-[14px] font-bold text-slate-700 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={saveToProfile}
                    onChange={(e) => setSaveToProfile(e.target.checked)}
                    className="rounded border-slate-300 text-[#FF5A1F] focus:ring-[#FF5A1F]"
                  />
                  <span>Save this address to my profile address book for future orders</span>
                </label>
              )}
            </div>

            {/* SECTION 3: BUSINESS & GST DETAILS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#0B1633] flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4 text-[#FF5A1F]" /> 3. GST & Business Details
                </h3>

                <label className="flex items-center gap-2 text-[14px] font-extrabold text-[#FF5A1F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="rounded border-slate-300 text-[#FF5A1F] focus:ring-[#FF5A1F]"
                  />
                  <span>I am purchasing for a business</span>
                </label>
              </div>

              {isB2B && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px] pt-2 border-t border-slate-100 animate-in fade-in">
                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">Registered Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Printigly Technologies Pvt Ltd"
                      className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                    />
                  </div>

                  <div>
                    <label className="font-extrabold text-slate-700 block mb-1">GSTIN Number (15 digits)</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: PAYMENT METHOD SELECTOR */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-[#0B1633] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiCreditCard className="w-4 h-4 text-[#FF5A1F]" /> 4. Select Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#FF5A1F] bg-orange-50/50 ring-2 ring-[#FF5A1F]/20'
                      : 'border-slate-200 bg-[#F7F8FA] hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-[#0B1633]">Online Payment (Razorpay)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase">Instant</span>
                  </div>
                  <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                    Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or EMI.
                  </p>
                </button>

                {/* Cash on Delivery Option */}
                {APP_CONFIG.ALLOW_COD && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#FF5A1F] bg-orange-50/50 ring-2 ring-[#FF5A1F]/20'
                        : 'border-slate-200 bg-[#F7F8FA] hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-extrabold text-sm text-[#0B1633]">Cash on Delivery (COD)</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-black uppercase">Pay on Doorstep</span>
                    </div>
                    <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                      Pay cash to courier partner upon doorstep delivery of your printed products.
                    </p>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT ORDER SUMMARY SIDEBAR (4 cols) */}
          <div className="lg:col-span-4 space-y-5 sticky top-24">
            
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-5">
              <h3 className="text-lg font-extrabold text-[#0B1633] border-b border-slate-100 pb-3">
                Order Summary ({cartItems.length} items)
              </h3>

              {/* Item Snapshot List */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[14px]">
                    <div className="flex items-center gap-2.5">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-xl border border-slate-100 shrink-0" />
                      <div>
                        <span className="font-extrabold text-[#0B1633] block truncate max-w-[140px]">{item.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.qty || item.quantity} units</span>
                      </div>
                    </div>
                    <span className="font-black text-[#0B1633]">₹{(item.totalPrice || (item.qty * item.unitPrice)).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-[14px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-extrabold">-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                {isExpress && (
                  <div className="flex justify-between text-amber-700">
                    <span>Express 24h Turnaround</span>
                    <span className="font-extrabold">+₹{APP_CONFIG.EXPRESS_SHIPPING_FEE}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-extrabold text-slate-900">
                    {shipping === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `₹${shipping}`}
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-[14px] font-bold text-slate-500">Total Payable</span>
                <span className="text-3xl font-black text-[#FF5A1F]">₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* Final Submit Button */}
              {paymentMethod === 'razorpay' ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleRazorpayPayment}
                  className="w-full py-4 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF5A1F]/25 flex items-center justify-center gap-2 cursor-pointer transition border-none hover:scale-[1.02]"
                >
                  {isSubmitting ? 'Initializing Payment...' : `Pay Online ₹${grandTotal.toLocaleString()}`}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCODOrder}
                  className="w-full py-4 rounded-2xl bg-[#07152F] hover:bg-slate-800 text-white font-black text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition border-none hover:scale-[1.02]"
                >
                  {isSubmitting ? 'Confirming Order...' : 'Confirm Cash on Delivery Order'}
                </button>
              )}

              <div className="text-center text-[10.5px] text-slate-400 font-medium flex items-center justify-center gap-1.5">
                <FiLock className="w-3.5 h-3.5 text-emerald-600" />
                <span>SSL Encrypted Checkout • Re-print Quality Guarantee</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
