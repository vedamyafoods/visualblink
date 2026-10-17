import React, { useState, useEffect, useRef } from 'react';
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
  FiPlus,
  FiX,
  FiChevronDown,
  FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import { addOrderToFirestore, createOrderOnServerApi } from '../services/firebase';
import { triggerOrderConfirmationEmail } from '../services/emailService';

export function CheckoutPage({ setCurrentPage }) {
  const { cartItems, clearCart, currentUser, userProfile, saveAddress, updateUserProfile, deleteAddress } = useAuth();

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
  const [paymentMethod, setPaymentMethod] = useState('cashfree'); // 'cashfree' or 'cod'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [currentPendingOrderId, setCurrentPendingOrderId] = useState(null);
  const [serverSummary, setServerSummary] = useState(null);
  const [isRecalculating, setIsRecalculating] = useState(false);

  // Terms & Conditions Agreement Modal State
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasScrolledTerms, setHasScrolledTerms] = useState(false);
  const [isTermsConfirmed, setIsTermsConfirmed] = useState(false);
  const [pendingPaymentAction, setPendingPaymentAction] = useState('cashfree'); // 'cashfree' or 'cod'
  const termsBoxRef = useRef(null);

  const initiatePaymentWithTerms = (action = 'cashfree') => {
    if (!validateCheckoutForm()) return;
    setPendingPaymentAction(action);
    setHasScrolledTerms(false);
    setIsTermsConfirmed(false);
    setIsTermsModalOpen(true);
  };

  const handleTermsScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 25) {
      setHasScrolledTerms(true);
    }
  };

  useEffect(() => {
    if (isTermsModalOpen && termsBoxRef.current) {
      const { scrollHeight, clientHeight } = termsBoxRef.current;
      if (scrollHeight <= clientHeight + 10) {
        setHasScrolledTerms(true);
      }
    }
  }, [isTermsModalOpen]);

  // Deduplicate saved addresses list by addressLine1, city, and pincode
  const uniqueSavedAddresses = (userProfile?.addresses || []).reduce((acc, addr) => {
    const isDup = acc.some(a => 
      (a.addressLine1 || '').trim().toLowerCase() === (addr.addressLine1 || '').trim().toLowerCase() &&
      (a.city || '').trim().toLowerCase() === (addr.city || '').trim().toLowerCase() &&
      (a.pincode || '').trim() === (addr.pincode || '').trim()
    );
    if (!isDup) acc.push(addr);
    return acc;
  }, []);

  // Silently clean up duplicates in Firestore if any exist
  useEffect(() => {
    if (userProfile?.addresses && userProfile.addresses.length > uniqueSavedAddresses.length && updateUserProfile) {
      updateUserProfile({ addresses: uniqueSavedAddresses }).catch(() => {});
    }
  }, [userProfile?.addresses?.length, uniqueSavedAddresses.length]);

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

      const defaultAddr = uniqueSavedAddresses.find(a => a.isDefault) || uniqueSavedAddresses[0];
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        setAddressLine1(defaultAddr.addressLine1 || '');
        setAddressLine2(defaultAddr.addressLine2 || '');
        setCity(defaultAddr.city || 'Indore');
        setState(defaultAddr.state || 'Madhya Pradesh');
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

  // Effect: Fetch server-authoritative GST calculation and advance policy
  useEffect(() => {
    let isCancelled = false;
    const fetchOrderSummary = async () => {
      if (cartItems.length === 0) return;
      setIsRecalculating(true);
      try {
        const res = await fetch('/api/calculate-order-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: cartItems,
            couponCode: initialCouponCode,
            isExpress,
            shippingAddress: { state }
          })
        });
        const data = await res.json();
        if (!isCancelled && data.success && data.summary) {
          setServerSummary(data.summary);
        }
      } catch (e) {
        console.warn('Server summary note:', e.message);
      } finally {
        if (!isCancelled) setIsRecalculating(false);
      }
    };

    fetchOrderSummary();
    return () => { isCancelled = true; };
  }, [cartItems, initialCouponCode, isExpress, state]);

  // Pricing & Taxation Calculations (Paise-safe & GST aligned)
  const subtotal = serverSummary?.subtotal ?? cartItems.reduce((acc, item) => acc + (item.totalPrice || (item.qty * item.unitPrice)), 0);

  let couponDiscount = serverSummary?.discount ?? 0;
  if (!serverSummary && initialCouponCode && APP_CONFIG.AVAILABLE_COUPONS[initialCouponCode]) {
    const c = APP_CONFIG.AVAILABLE_COUPONS[initialCouponCode];
    if (c.discountPercent) couponDiscount = Math.round((subtotal * c.discountPercent) / 100);
    else if (c.discountAmount) couponDiscount = c.discountAmount;
  }

  const expressFee = isExpress ? (serverSummary?.expressFee ?? APP_CONFIG.EXPRESS_SHIPPING_FEE) : 0;
  const shipping = serverSummary?.shippingFee ?? (subtotal > APP_CONFIG.FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : APP_CONFIG.STANDARD_SHIPPING_FEE);

  // Intra-state vs Inter-state check (Merchant origin state: Karnataka)
  const isIntraState = serverSummary ? serverSummary.isCustomerIntraState : (state || '').trim().toLowerCase() === 'karnataka';
  const gstRate = serverSummary?.gstRate ?? 18;
  const pricesIncludeGst = serverSummary?.pricesIncludeGst ?? false;

  // Taxable Value is strictly the net product subtotal (Goods & Services value)
  const netGoods = Math.max(0, subtotal - couponDiscount);
  const totalLogistics = shipping + expressFee;
  const taxableAmount = serverSummary?.taxableAmount ?? netGoods;

  // GST 18% on Taxable Goods & Services
  const totalGst = serverSummary?.totalGst ?? Math.round((taxableAmount * gstRate) / 100);

  // Grand Total: Taxable Goods + Total GST (18%) + Shipping Logistics
  const grandTotal = serverSummary?.finalPayable ?? Math.round(taxableAmount + totalGst + totalLogistics);

  // Dynamic Advance Policy Resolution
  const advancePercentage = serverSummary?.advancePercentage ?? 50;
  const advancePaymentAmount = serverSummary?.advanceAmountDue ?? Math.round((grandTotal * advancePercentage) / 100);
  const remainingPaymentAmount = serverSummary?.remainingBalance ?? Math.max(0, grandTotal - advancePaymentAmount);

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
      errors.customerPhone = 'Please enter a valid 10-digit mobile number (e.g. 9669155225).';
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
          email: normalizedEmail,
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

      // Generate or retrieve customer ID
      const customerId = userProfile?.customerId || (currentUser?.uid ? `VB-CUST-${currentUser.uid.slice(0, 5).toUpperCase()}` : `VB-CUST-${Math.floor(10000 + Math.random() * 90000)}`);

      if (currentUser && !userProfile?.customerId && updateUserProfile) {
        try {
          await updateUserProfile({ customerId });
        } catch (e) {
          console.warn("Could not save customerId to profile:", e);
        }
      }

      const orderPayload = {
        idempotencyKey,
        userId: currentUser?.uid || null,
        customerId,
        customer: {
          customerId,
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
        paymentProviderOrderId: paymentDetails.providerOrderId || null,
        isExpress,
        couponCode: initialCouponCode || null,
        artwork: aggregatedArtwork,
        pricing: {
          subtotal,
          couponDiscount,
          shippingFee: shipping,
          expressFee,
          grandTotal,
          advancePaymentAmount,
          remainingPaymentAmount
        }
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

  const handleCashfreePayment = async () => {
    if (!validateCheckoutForm()) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const idempotencyKey = currentPendingOrderId || `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      // 1. Call server API to create/retrieve pending order and generate Cashfree session
      const res = await fetch('/api/create-cashfree-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idempotencyKey,
          existingOrderId: currentPendingOrderId,
          items: cartItems,
          customer: {
            customerId: userProfile?.customerId || currentUser?.uid || null,
            name: customerName.trim(),
            email: customerEmail.trim().toLowerCase(),
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
            landmark
          },
          couponCode: initialCouponCode || null,
          isExpress,
          artwork: aggregatedArtwork
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const errorDetail = data.details ? `${data.error} (${data.details})` : (data.error || 'Failed to initialize payment session.');
        throw new Error(errorDetail);
      }

      const { orderNumber, internalOrderId, cfOrderId, paymentSessionId } = data;
      setCurrentPendingOrderId(internalOrderId);

      // Save address to user profile if logged in
      if (currentUser && saveToProfile) {
        try {
          await saveAddress({
            name: customerName,
            email: customerEmail,
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
        } catch (e) {
          console.warn("Address save note:", e);
        }
      }

      // 2. Load Cashfree SDK dynamically
      const loadCashfreeScript = () => {
        return new Promise((resolve) => {
          if (window.Cashfree) {
            resolve(window.Cashfree);
            return;
          }
          const existingScript = document.querySelector('script[src*="cashfree.js"]');
          if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.Cashfree));
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.async = true;
          script.onload = () => resolve(window.Cashfree);
          script.onerror = () => resolve(null);
          document.body.appendChild(script);
        });
      };

      const Cashfree = await loadCashfreeScript();
      if (!Cashfree) {
        setIsSubmitting(false);
        setErrorMessage('Failed to load payment gateway SDK. Please check your network connection.');
        return;
      }

      // 3. Initialize SDK
      const cf = new Cashfree({
        mode: APP_CONFIG.CASHFREE_ENVIRONMENT === 'production' ? 'production' : 'sandbox'
      });

      // 4. Handle checkout popup modal
      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: '_modal' // Opens in hosted popup modal
      };

      cf.checkout(checkoutOptions).then(async (result) => {
        if (result.error) {
          setIsSubmitting(false);
          setErrorMessage(result.error.message || 'Payment cancelled or closed. You can retry safely.');
        } else {
          // Modal completed or closed: verify directly with backend
          setIsSubmitting(true);
          try {
            const verifyRes = await fetch('/api/verify-cashfree-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderNumber,
                cfOrderId,
                internalOrderId
              })
            });

            const verifyData = await verifyRes.json();

            if (verifyData.status === 'SUCCESS') {
              clearCart();
              setIsSubmitting(false);
              setCurrentPage('order-success', {
                orderId: orderNumber,
                cfPaymentId: verifyData.transactionId
              });
            } else if (verifyData.status === 'PENDING') {
              clearCart();
              setIsSubmitting(false);
              setCurrentPage('payment-pending', { orderId: orderNumber });
            } else {
              setIsSubmitting(false);
              setErrorMessage('Payment verification is pending or incomplete. You can safely retry.');
            }
          } catch (vErr) {
            console.error("Verification callback warning:", vErr);
            clearCart();
            setIsSubmitting(false);
            setCurrentPage('payment-pending', { orderId: orderNumber });
          }
        }
      });

    } catch (err) {
      console.error('Cashfree checkout initiation error:', err);
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Unable to initialize online payment.');
    }
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
        <h2 className="text-2xl font-bold text-[#0B1633] mb-2">Your Cart is Empty</h2>
        <p className="text-slate-500 text-[14px] mb-6">Please add items to cart before proceeding to checkout.</p>
        <button
          onClick={() => setCurrentPage('products')}
          className="px-6 py-3 rounded-2xl bg-[#025afc] text-white font-bold text-[14px] uppercase tracking-wider cursor-pointer border-none"
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
            <span className="text-[#025afc] font-bold">Secure Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
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
              <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiUser className="w-4 h-4 text-[#025afc]" /> 1. Customer Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px]">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (fieldErrors.customerName) setFieldErrors(prev => ({ ...prev, customerName: null }));
                    }}
                    placeholder="John Doe"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.customerName ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
                      }`}
                  />
                  {fieldErrors.customerName && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.customerName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => {
                      setCustomerEmail(e.target.value);
                      if (fieldErrors.customerEmail) setFieldErrors(prev => ({ ...prev, customerEmail: null }));
                    }}
                    placeholder="john@example.com"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.customerEmail ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
                      }`}
                  />
                  {fieldErrors.customerEmail && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.customerEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
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
                    placeholder="9669155225"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.customerPhone ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
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
                <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-[#025afc]" /> 2. Delivery Address
                </h3>
              </div>

              {/* Saved Address Quick Selector if user has profile addresses */}
              {uniqueSavedAddresses && uniqueSavedAddresses.length > 0 && (
                <div className="space-y-2 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Select Saved Address:</span>
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className={`text-[14px] font-bold flex items-center gap-1 cursor-pointer transition ${selectedAddressId === 'new' ? 'text-[#025afc]' : 'text-slate-500 hover:text-[#025afc]'
                        }`}
                    >
                      <FiPlus className="w-3.5 h-3.5" /> Enter New Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {uniqueSavedAddresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border text-left text-[14px] transition cursor-pointer relative flex flex-col justify-between ${isSelected
                            ? 'border-[#025afc] bg-blue-50/40 ring-2 ring-[#025afc]/20'
                            : 'border-slate-200 bg-[#F7F8FA] hover:border-slate-300'
                            }`}
                        >
                          <div className="flex items-center justify-between font-bold text-[#0B1633] mb-1">
                            <span className="flex items-center gap-1.5 truncate">
                              {isSelected && <FiCheckCircle className="w-3.5 h-3.5 text-[#025afc] shrink-0" />}
                              {addr.name || customerName || 'Saved Address'}
                            </span>
                            <div className="flex items-center gap-1 shrink-0">
                              <span className={`px-2 py-0.5 rounded-md text-[9.5px] uppercase font-bold ${isSelected ? 'bg-[#025afc] text-white' : 'bg-slate-200 text-slate-700'
                                }`}>
                                {addr.type || (addr.isDefault ? 'Default' : 'Address')}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this saved address?')) {
                                    deleteAddress(addr.id);
                                    if (selectedAddressId === addr.id) {
                                      handleAddNewAddress();
                                    }
                                  }
                                }}
                                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer border-none bg-transparent"
                                title="Delete address"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                          <p className="text-slate-600 line-clamp-2 leading-relaxed text-[14px]">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} - <strong className="font-bold text-slate-800">{addr.pincode}</strong>
                          </p>
                        </div>
                      );
                    })}

                    {/* New Address Card Option */}
                    <button
                      type="button"
                      onClick={handleAddNewAddress}
                      className={`p-3.5 rounded-2xl border text-left text-[14px] transition cursor-pointer flex flex-col justify-center items-center text-center gap-1 ${selectedAddressId === 'new'
                        ? 'border-[#025afc] bg-blue-50/40 ring-2 ring-[#025afc]/20 text-[#025afc]'
                        : 'border-dashed border-slate-300 bg-white hover:border-[#025afc] text-slate-500 hover:text-[#025afc]'
                        }`}
                    >
                      <FiPlus className="w-5 h-5 text-[#025afc]" />
                      <span className="font-bold">Deliver to New Address</span>
                      <span className="text-[10px] text-slate-400">Fill in form details below</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Address Input Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Flat / Building / House No. & Street *</label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => {
                      setAddressLine1(e.target.value);
                      if (fieldErrors.addressLine1) setFieldErrors(prev => ({ ...prev, addressLine1: null }));
                    }}
                    placeholder="e.g. Flat 304, Sunshine Towers, MG Road"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.addressLine1 ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
                      }`}
                  />
                  {fieldErrors.addressLine1 && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.addressLine1}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Area / Locality</label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="e.g. Indiranagar Layout"
                    className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#025afc]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Metro Station"
                    className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#025afc]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      if (fieldErrors.city) setFieldErrors(prev => ({ ...prev, city: null }));
                    }}
                    placeholder="Bengaluru"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.city ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
                      }`}
                  />
                  {fieldErrors.city && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      if (fieldErrors.state) setFieldErrors(prev => ({ ...prev, state: null }));
                    }}
                    placeholder="Karnataka"
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.state ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
                      }`}
                  />
                  {fieldErrors.state && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <FiAlertCircle className="w-3 h-3 shrink-0" /> {fieldErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1 flex items-center justify-between">
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
                    className={`w-full bg-[#F7F8FA] border rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none transition ${fieldErrors.pincode ? 'border-rose-400 focus:border-rose-500 bg-rose-50/20' : 'border-slate-200 focus:border-[#025afc]'
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
                    className="rounded border-slate-300 text-[#025afc] focus:ring-[#025afc]"
                  />
                  <span>Save this address to my profile address book for future orders</span>
                </label>
              )}
            </div>

            {/* SECTION 3: BUSINESS & GST DETAILS */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2">
                  <FiBriefcase className="w-4 h-4 text-[#025afc]" /> 3. GST & Business Details
                </h3>

                <label className="flex items-center gap-2 text-[14px] font-bold text-[#025afc] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isB2B}
                    onChange={(e) => setIsB2B(e.target.checked)}
                    className="rounded border-slate-300 text-[#025afc] focus:ring-[#025afc]"
                  />
                  <span>I am purchasing for a business</span>
                </label>
              </div>

              {isB2B && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px] pt-2 border-t border-slate-100 animate-in fade-in">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Registered Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. VisualBlink Technologies Pvt Ltd"
                      className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#025afc]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GSTIN Number (15 digits)</label>
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 29ABCDE1234F1Z5"
                      className="w-full bg-[#F7F8FA] border border-slate-200 rounded-xl p-3 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#025afc] uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 4: PAYMENT METHOD SELECTOR */}
            <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-4">
              <h3 className="text-base font-bold text-[#0B1633] flex items-center gap-2 border-b border-slate-100 pb-3">
                <FiCreditCard className="w-4 h-4 text-[#025afc]" /> 4. Select Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Cashfree Option */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cashfree')}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${paymentMethod === 'cashfree'
                    ? 'border-[#025afc] bg-blue-50/50 ring-2 ring-[#025afc]/20'
                    : 'border-slate-200 bg-[#F7F8FA] hover:border-slate-300'
                    }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-[#0B1633]">Online Payment (Secure)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">Instant</span>
                  </div>
                  <p className="text-[14px] text-slate-500 font-medium leading-relaxed">
                    Pay securely using UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, or EMI via Cashfree.
                  </p>
                </button>

                {/* Cash on Delivery Option */}
                {APP_CONFIG.ALLOW_COD && (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${paymentMethod === 'cod'
                      ? 'border-[#025afc] bg-blue-50/50 ring-2 ring-[#025afc]/20'
                      : 'border-slate-200 bg-[#F7F8FA] hover:border-slate-300'
                      }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-[#0B1633]">Cash on Delivery (COD)</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold uppercase">Pay on Doorstep</span>
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
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">

            <div className="bg-[#eff6ff] rounded-3xl p-6 border border-blue-100 shadow-sm space-y-5 text-slate-900">
              <h3 className="text-lg font-bold text-slate-900 border-b border-blue-200/60 pb-3">
                Order Summary ({cartItems.length} items)
              </h3>

              {/* Item Snapshot List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item, idx) => {
                  const itemAddons = [];
                  const finishVal = item.finish || item.selectedOptions?.finishes || item.selectedOptions?.finish || item.selectedOptions?.lamination;
                  if (finishVal) itemAddons.push({ label: 'Finish', val: finishVal });

                  const sidesVal = item.sides || item.selectedOptions?.sides;
                  if (sidesVal) itemAddons.push({ label: 'Sides', val: sidesVal });

                  const paperVal = item.paper || item.selectedOptions?.paperStock || item.selectedOptions?.paper;
                  if (paperVal) itemAddons.push({ label: 'Paper', val: paperVal });

                  const cornersVal = item.corners || item.selectedOptions?.corners;
                  if (cornersVal) itemAddons.push({ label: 'Corners', val: cornersVal });

                  if (item.customWidth && item.customHeight) {
                    itemAddons.push({ label: 'Size', val: `${item.customWidth}×${item.customHeight} cm` });
                  }

                  if (item.selectedOptions && typeof item.selectedOptions === 'object') {
                    Object.entries(item.selectedOptions).forEach(([k, v]) => {
                      if (!v || typeof v !== 'string') return;
                      const lk = k.toLowerCase();
                      if (!['paperstock', 'finishes', 'sides', 'corners', 'paper', 'finish', 'lamination'].includes(lk)) {
                        itemAddons.push({ label: k.replace(/([A-Z])/g, ' $1').trim(), val: v });
                      }
                    });
                  }

                  return (
                    <div key={idx} className="p-2.5 rounded-2xl bg-white/70 border border-blue-100/80 space-y-2">
                      <div className="flex items-start justify-between text-[14px] gap-2">
                        <div className="flex items-start gap-2.5">
                          <img src={item.image} alt={item.name} className="w-11 h-11 object-cover rounded-xl border border-slate-100 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#0B1633] block leading-tight">{item.name}</span>
                            <span className="text-[11px] text-slate-500 font-semibold">{item.qty || item.quantity} units</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-[#0B1633] shrink-0">₹{(item.totalPrice || (item.qty * item.unitPrice)).toLocaleString()}</span>
                      </div>

                      {/* Configured Addon Services List */}
                      {itemAddons.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1 border-t border-blue-50">
                          {itemAddons.map((ad, adIdx) => (
                            <span key={adIdx} className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 text-[10.5px] font-bold border border-blue-100">
                              <span className="opacity-70 font-medium mr-1">{ad.label}:</span> {ad.val}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-3 border-t border-blue-200/60 text-[13.5px] font-semibold text-slate-600">
                <div className="flex justify-between">
                  <span>Product Subtotal</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied</span>
                    <span className="font-bold">-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}

                {isExpress && (
                  <div className="flex justify-between text-amber-700">
                    <span>Express 24h Turnaround</span>
                    <span className="font-bold">+₹{APP_CONFIG.EXPRESS_SHIPPING_FEE}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-bold text-slate-900">
                    {shipping === 0 ? <strong className="text-emerald-600 uppercase">FREE</strong> : `₹${shipping}`}
                  </span>
                </div>

                <div className="pt-2 border-t border-blue-200/40 space-y-1.5 text-[12.5px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Taxable Value</span>
                    <span className="font-semibold text-slate-800">₹{taxableAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>Total Tax (GST 18%)</span>
                    <span className="text-slate-900 font-bold">₹{totalGst.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-3 border-t border-blue-200/60 flex justify-between items-baseline">
                <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wider">TOTAL PAYABLE</span>
                <span className="text-2xl font-bold text-[#0B1633]">₹{grandTotal.toLocaleString()}</span>
              </div>

              {/* Advance & Remaining Balance Breakdown */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 border border-blue-200/70 space-y-1.5 text-[12.5px]">
                <div className="flex justify-between items-center text-purple-900 font-bold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                    Advance Payable Now ({advancePercentage}%)
                  </span>
                  <span className="text-[14px] text-purple-700 font-bold">₹{advancePaymentAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 font-medium">
                  <span>Remaining Balance</span>
                  <span className="font-bold text-slate-700">₹{remainingPaymentAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Final Submit Button */}
              {paymentMethod === 'cashfree' ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => initiatePaymentWithTerms('cashfree')}
                    className="w-full py-4 px-3 rounded-xl bg-[#612af6] hover:bg-[#521fd6] text-white font-extrabold text-[13.5px] uppercase tracking-wider shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition border-none hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Securing Payment Session...
                      </span>
                    ) : (
                      `PAY ${advancePercentage}% ADVANCE ONLINE — ₹${advancePaymentAmount.toLocaleString()}`
                    )}
                  </button>
                  <p className="text-[11.5px] text-slate-500 text-center font-medium px-2">
                    {remainingPaymentAmount > 0
                      ? `Remaining ${100 - advancePercentage}% balance (₹${remainingPaymentAmount.toLocaleString()}) to be paid upon dispatch.`
                      : 'Full 100% payment settled online securely.'}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => initiatePaymentWithTerms('cod')}
                  className="w-full py-4 rounded-xl bg-[#07152F] hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer transition border-none hover:scale-[1.01]"
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

      {/* Terms & Conditions Agreement Modal */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden relative">

            {/* Modal Header */}
            <div className="px-5 sm:px-6 py-4.5 bg-gradient-to-r from-[#07152F] to-[#0d224d] text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-extrabold text-[10.5px] uppercase tracking-wider border border-purple-400/30">
                    Mandatory Policy Review
                  </span>
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white m-0">
                  Terms of Service &amp; Printing Agreement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTermsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border-none"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>

            {/* Order Payment Summary Ribbon */}
            <div className="px-5 sm:px-6 py-3 bg-purple-50/80 border-b border-purple-100 flex items-center justify-between text-[13px] shrink-0">
              <div>
                <span className="text-purple-800 font-semibold">Advance Due Now: </span>
                <span className="font-bold text-purple-900 text-[14px]">₹{advancePaymentAmount.toLocaleString()}</span>
                <span className="text-purple-600 text-[11px] ml-1">({advancePercentage}%)</span>
              </div>
              {remainingPaymentAmount > 0 && (
                <div className="text-slate-600 font-medium text-[12px]">
                  <span>Balance on Dispatch: </span>
                  <span className="font-bold text-slate-900">₹{remainingPaymentAmount.toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Scrollable Terms Content */}
            <div
              ref={termsBoxRef}
              onScroll={handleTermsScroll}
              className="p-5 sm:p-6 overflow-y-auto space-y-4 text-slate-600 text-[13px] leading-relaxed select-text"
              style={{ maxHeight: '380px' }}
            >
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[12px] flex items-start gap-2.5">
                <FiAlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Please scroll through the complete manufacturing &amp; payment policies below to unlock the confirmation button.
                </span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[13.5px] mb-1">1. Bespoke Custom Manufacturing Agreement</h4>
                <p>
                  Every order placed with Visual Blink Print Studio is engineered custom-to-spec according to your uploaded artwork, selected paper GSM, finishes, and quantities. Because all custom products are manufactured exclusively for your brand, orders cannot be altered, cancelled, or returned once plate setting and physical printing have commenced.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[13.5px] mb-1">2. Milestone Advance &amp; Final Settlement Policy</h4>
                <p>
                  Your initial advance payment of <strong>₹{advancePaymentAmount.toLocaleString()}</strong> ({advancePercentage}% of grand total) reserves press machine time, allocates stock, and authorizes prepress prep. The remaining balance of <strong>₹{remainingPaymentAmount.toLocaleString()}</strong> must be settled online or via registered payment link prior to packaging dispatch.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[13.5px] mb-1">3. Artwork Proofing &amp; CMYK Tolerances</h4>
                <p>
                  You are responsible for proofreading all typography, spellings, phone numbers, QR codes, and image resolution (300 DPI recommended) in your submitted design files. Digital screen previews (RGB) inherently have slight chromatic variances when translated onto physical offset/digital press inks (CMYK) on organic paper fibers. Standard industry tolerances of ±5-10% apply.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[13.5px] mb-1">4. Re-Print Quality Guarantee</h4>
                <p>
                  We stand by our craftsmanship. If you receive an order with a verified manufacturing defect (e.g. incorrect lamination, cut displacement beyond bleed margins, or transit damage), notify our operations desk within 48 hours of delivery with photographic proof for an immediate expedited re-print at zero additional charge.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[13.5px] mb-1">5. Logistics &amp; Pan-India Dispatch</h4>
                <p>
                  Turnaround estimates commence after artwork preflight approval. Visual Blink partners with tier-1 air logistics (BlueDart, Delhivery, DTDC, Porter) to ensure prompt delivery across India. Tracking credentials are electronically transmitted to your registered mobile and email.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-[13.5px] mb-1">6. Official GST Tax Invoicing</h4>
                <p>
                  All transactions include applicable GST (18% default). A compliant tax invoice featuring your provided GSTIN and total tax (GST 18%) will be generated and issued upon order confirmation.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center font-bold text-slate-700 text-[12px]">
                End of VisualBlink Custom Print Agreement
              </div>
            </div>

            {/* Scroll Indicator Bar */}
            <div className={`px-5 sm:px-6 py-2.5 text-[12px] font-bold flex items-center justify-between border-t transition-colors ${hasScrolledTerms ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
              {hasScrolledTerms ? (
                <span className="flex items-center gap-1.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" /> Terms reviewed completely to the bottom
                </span>
              ) : (
                <span className="flex items-center gap-1.5 animate-pulse text-purple-700">
                  <FiChevronDown className="w-4 h-4 text-purple-600" /> Scroll down to the bottom of the box to unlock confirmation
                </span>
              )}
              <span className="text-[11px] font-mono opacity-70">
                {hasScrolledTerms ? '100% Read' : 'Scroll down'}
              </span>
            </div>

            {/* Footer with I Confirm & Pay Button */}
            <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">

              {/* I Confirm Button */}
              <button
                type="button"
                disabled={!hasScrolledTerms}
                onClick={() => setIsTermsConfirmed(!isTermsConfirmed)}
                className={`w-full py-3 px-4 rounded-xl flex items-center justify-between transition-all border ${!hasScrolledTerms
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                    : isTermsConfirmed
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs cursor-pointer'
                      : 'bg-white border-purple-400 text-purple-950 hover:bg-purple-50/50 cursor-pointer shadow-xs'
                  }`}
              >
                <div className="flex items-center gap-2.5 text-left">
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${isTermsConfirmed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                    }`}>
                    {isTermsConfirmed && <FiCheck className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                  <span className="text-[13px] font-bold">
                    I confirm and accept the terms &amp; printing agreement
                  </span>
                </div>
                <span className={`text-[11px] font-extrabold uppercase px-2 py-0.5 rounded ${isTermsConfirmed ? 'bg-emerald-200 text-emerald-800' : 'bg-purple-100 text-purple-800'
                  }`}>
                  {isTermsConfirmed ? 'Confirmed' : 'Click to Confirm'}
                </span>
              </button>

              {/* Action Buttons: Cancel and Pay */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTermsModalOpen(false)}
                  className="w-1/3 py-3.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-[13px] border border-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={!hasScrolledTerms || !isTermsConfirmed || isSubmitting}
                  onClick={() => {
                    setIsTermsModalOpen(false);
                    if (pendingPaymentAction === 'cashfree') {
                      handleCashfreePayment();
                    } else {
                      handleCODOrder();
                    }
                  }}
                  className={`w-2/3 py-3.5 px-4 rounded-xl font-extrabold text-[13.5px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md border-none ${!hasScrolledTerms || !isTermsConfirmed || isSubmitting
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-[#612af6] hover:bg-[#521fd6] text-white cursor-pointer shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99]'
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Securing Payment...
                    </span>
                  ) : pendingPaymentAction === 'cashfree' ? (
                    `PAY ₹${advancePaymentAmount.toLocaleString()} NOW`
                  ) : (
                    'CONFIRM COD ORDER'
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
