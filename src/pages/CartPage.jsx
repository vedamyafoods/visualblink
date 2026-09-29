import React, { useState } from 'react';
import { 
  FiTrash2, 
  FiShoppingBag, 
  FiArrowRight, 
  FiCheckCircle, 
  FiShield, 
  FiTag, 
  FiX, 
  FiZap, 
  FiEdit3, 
  FiFileText, 
  FiPaperclip,
  FiEye,
  FiRotateCcw,
  FiInfo
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';
import { EditCartItemModal } from '../Components/cart/EditCartItemModal';

export function CartPage({ setCurrentPage }) {
  const { cartItems, updateCartItem, removeFromCart, clearCart } = useAuth();

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Express delivery state
  const [isExpress, setIsExpress] = useState(false);

  // Modal State for Editing Item
  const [editingItem, setEditingItem] = useState(null);
  const [viewingArtworkModal, setViewingArtworkModal] = useState(null);

  // Calculations
  const subtotal = cartItems.reduce((acc, item) => acc + (item.totalPrice || (item.qty * item.unitPrice)), 0);

  // Apply Coupon Logic
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    const cleanCode = couponCode.trim().toUpperCase();
    const match = APP_CONFIG.AVAILABLE_COUPONS[cleanCode];

    if (!match) {
      setCouponError('Invalid coupon code. Try WELCOME10 or PRINT20');
      return;
    }

    if (subtotal < match.minOrder) {
      setCouponError(`Coupon "${cleanCode}" requires a minimum order of ₹${match.minOrder}`);
      return;
    }

    setAppliedCoupon({ code: cleanCode, ...match });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  // Pricing breakdown calculations
  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      couponDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      couponDiscount = appliedCoupon.discountAmount;
    }
  }

  const expressFee = isExpress ? APP_CONFIG.EXPRESS_SHIPPING_FEE : 0;
  const shipping = subtotal > APP_CONFIG.FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : APP_CONFIG.STANDARD_SHIPPING_FEE;
  const grandTotal = Math.max(0, Math.round(subtotal - couponDiscount + expressFee + shipping));


  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-20">
      
      {/* Page Hero Header */}
      <section className="bg-[#07152F] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start text-[14px] font-semibold text-slate-400">
            <span className="cursor-pointer hover:text-white" onClick={() => setCurrentPage('home')}>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Shopping Cart</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
            Your Cart & Order Review
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Review your custom print specifications, uploaded artwork files, and apply coupons prior to checkout.
          </p>
        </div>
      </section>

      {/* Cart Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-[#E7EAF0] shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5A1F] flex items-center justify-center mx-auto">
              <FiShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#0B1633]">Your Cart is Empty</h3>
            <p className="text-slate-500 text-[14px] leading-relaxed">
              Explore our wide range of premium print products, upload your artwork, and order with instant prepress verification.
            </p>
            <button
              onClick={() => setCurrentPage('products')}
              className="bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] px-6 py-3.5 rounded-2xl inline-flex items-center gap-2 cursor-pointer border-none shadow-lg shadow-[#FF5A1F]/20 transition"
            >
              Start Shopping Catalog <FiArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* CART ITEMS LIST (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <h3 className="font-extrabold text-lg text-[#0B1633] flex items-center gap-2">
                  <span>Cart Items</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#07152F] text-white text-[14px] font-black">
                    {cartItems.length}
                  </span>
                </h3>
                <button
                  onClick={() => clearCart()}
                  className="text-[14px] font-extrabold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none"
                >
                  <FiTrash2 className="w-3.5 h-3.5" /> Clear Cart
                </button>
              </div>

              {cartItems.map((item) => {
                const artworkCount = item.artworkFiles ? item.artworkFiles.length : (item.uploadedFile ? 1 : 0);
                return (
                  <div
                    key={item.cartItemId || item.id}
                    className="bg-white rounded-3xl p-5 border border-[#E7EAF0] shadow-sm space-y-4 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      
                      {/* Product Thumbnail & Details */}
                      <div className="flex gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-2xl border border-slate-100 bg-slate-50 shrink-0"
                        />
                        <div className="space-y-1">
                          <h4 className="text-base sm:text-lg font-extrabold text-[#0B1633] leading-snug">
                            {item.name}
                          </h4>
                          
                          <div className="flex flex-wrap items-center gap-2 text-[14px] font-semibold text-slate-600">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 font-extrabold">
                              {item.qty || item.quantity} Units
                            </span>
                            {item.paper && <span className="text-slate-500">• Paper: {item.paper}</span>}
                            {item.finish && <span className="text-slate-500">• Finish: {item.finish}</span>}
                            {item.sides && <span className="text-slate-500">• Sides: {item.sides}</span>}
                          </div>

                          {/* Custom Area Dimensions Pill if present */}
                          {item.calculatedArea && (
                            <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200/80 px-2.5 py-1 rounded-xl text-[14px] font-extrabold mt-1">
                              <span>📐 {item.customHeight}cm × {item.customWidth}cm ({item.calculatedArea} sq cm)</span>
                              {item.areaTier && <span className="text-blue-700 font-bold">• {item.areaTier}</span>}
                            </div>
                          )}

                          {/* Artwork Badge */}
                          <div className="pt-1.5 flex flex-wrap items-center gap-2">
                            {artworkCount > 0 ? (
                              <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-xl text-[14px] font-extrabold">
                                <FiCheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                <span>{artworkCount} Artwork File(s) Uploaded</span>
                                <button
                                  onClick={() => setViewingArtworkModal(item)}
                                  className="ml-1 text-emerald-700 hover:underline font-extrabold cursor-pointer border-none bg-transparent"
                                >
                                  [ View Files ]
                                </button>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-[14px] font-bold">
                                <FiPaperclip className="w-3.5 h-3.5 text-amber-600" /> Artwork Pending (Will be requested post-checkout)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Item Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0 gap-3">
                        <div className="text-left sm:text-right">
                          <span className="text-[14px] text-slate-400 font-bold block">Total Price</span>
                          <span className="text-xl font-black text-[#FF5A1F]">
                            ₹{(item.totalPrice || (item.qty * item.unitPrice)).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-[14px] flex items-center gap-1 transition cursor-pointer border-none"
                            title="Edit quantity or options"
                          >
                            <FiEdit3 className="w-3.5 h-3.5 text-[#FF5A1F]" /> Edit
                          </button>

                          <button
                            onClick={() => removeFromCart(item.cartItemId || item.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-[14px] flex items-center gap-1 transition cursor-pointer border border-rose-200"
                            title="Remove item"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

              {/* Express Delivery Banner Option */}
              <div className="p-5 rounded-3xl bg-[#07152F] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FF5A1F] text-white flex items-center justify-center font-black">
                    <FiZap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-white">24-Hour Express Priority Press Turnaround</h4>
                    <p className="text-[14px] text-slate-300">
                      Need your order fast? Enable Express for priority plate generation & 24h doorstep dispatch (+₹{APP_CONFIG.EXPRESS_SHIPPING_FEE}).
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isExpress}
                    onChange={(e) => setIsExpress(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5A1F]"></div>
                </label>
              </div>

            </div>

            {/* SUMMARY & CHECKOUT SIDEBAR (4 cols) */}
            <div className="lg:col-span-4 space-y-5">
              
              {/* Pricing Card */}
              <div className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-5">
                <h3 className="text-xl font-extrabold text-[#0B1633]">Order Total Summary</h3>

                {/* Coupon Code Input */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="text-[14px] font-extrabold text-[#0B1633] flex items-center gap-1.5">
                    <FiTag className="w-4 h-4 text-[#FF5A1F]" /> Have a Promo Coupon?
                  </label>

                  {appliedCoupon ? (
                    <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[14px] font-extrabold text-emerald-900">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Code "{appliedCoupon.code}" Applied ({appliedCoupon.label})</span>
                      </div>
                      <button onClick={handleRemoveCoupon} className="text-emerald-700 hover:text-emerald-950 font-black cursor-pointer bg-transparent border-none">
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="e.g. WELCOME10"
                        className="flex-1 bg-[#F7F8FA] border border-slate-200 rounded-xl px-3.5 py-2 text-[14px] font-bold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] uppercase"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-[#07152F] hover:bg-slate-800 text-white font-extrabold text-[14px] rounded-xl transition cursor-pointer border-none"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {couponError && <p className="text-[14px] font-bold text-rose-600">{couponError}</p>}
                </div>

                {/* Breakdown List */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[14px] font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-extrabold text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Coupon Discount</span>
                      <span className="font-extrabold">-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {isExpress && (
                    <div className="flex justify-between text-amber-700">
                      <span>Express Priority Turnaround</span>
                      <span className="font-extrabold">+₹{APP_CONFIG.EXPRESS_SHIPPING_FEE}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Estimated Pan-India Shipping</span>
                    <span className="font-extrabold text-slate-900">
                      {shipping === 0 ? <strong className="text-emerald-600 uppercase font-black">FREE</strong> : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-4 border-t border-slate-200 flex justify-between items-baseline">
                  <div>
                    <span className="text-[14px] font-bold text-slate-500 block">Grand Total</span>
                    <span className="text-[10px] text-slate-400 font-medium">Incl. all taxes & delivery</span>
                  </div>
                  <span className="text-3xl font-black text-[#FF5A1F]">₹{grandTotal.toLocaleString()}</span>
                </div>

                {/* Checkout Trigger Button */}
                <button
                  onClick={() => setCurrentPage('checkout', { express: isExpress ? '1' : '0', coupon: appliedCoupon?.code || '' })}
                  className="w-full py-4 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF5A1F]/25 flex items-center justify-center gap-2 cursor-pointer transition border-none hover:scale-[1.02]"
                >
                  Proceed to Checkout <FiArrowRight className="w-4 h-4" />
                </button>

                <div className="text-center pt-1 text-[14px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
                  <FiShield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL Encrypted & Prepress Proof Verified</span>
                </div>
              </div>

            </div>

          </div>
        )}
      </div>

      {/* Edit Item Modal */}
      {editingItem && (
        <EditCartItemModal
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          item={editingItem}
          onSaveItem={updateCartItem}
        />
      )}

      {/* View Artwork Files Modal */}
      {viewingArtworkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden p-6 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-base text-[#0B1633]">Uploaded Artwork Files</h4>
              <button onClick={() => setViewingArtworkModal(null)} className="p-1 rounded-xl hover:bg-slate-100 cursor-pointer border-none text-slate-500">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(viewingArtworkModal.artworkFiles || []).map((f, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[14px]">
                  <div>
                    <span className="font-extrabold block text-slate-900 truncate max-w-[240px]">{f.fileName || f.originalFileName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Format: {f.format || 'doc'}</span>
                  </div>
                  {f.secureUrl && (
                    <a
                      href={f.secureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-[#07152F] text-white text-[14px] font-bold rounded-xl hover:bg-slate-800 transition text-decoration-none"
                    >
                      View / Download
                    </a>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setViewingArtworkModal(null)}
              className="w-full py-2.5 bg-slate-200 text-slate-800 font-extrabold text-[14px] rounded-xl cursor-pointer border-none"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
