import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiTruck, 
  FiClock, 
  FiCheckCircle, 
  FiArrowRight, 
  FiSearch, 
  FiFileText,
  FiEye,
  FiShoppingBag
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserOrders } from '../services/firebase';

export function OrdersPage({ setCurrentPage }) {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'delivered'

  useEffect(() => {
    if (currentUser) {
      const unsubscribe = subscribeToUserOrders(
        currentUser.uid,
        currentUser.email,
        (userOrdersList) => {
          setOrders(userOrdersList || []);
          setLoading(false);
        }
      );
      return () => unsubscribe && unsubscribe();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-[#FF5A1F] flex items-center justify-center text-2xl font-bold mb-4">
          <FiPackage className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2">Sign in to View Your Orders</h2>
        <p className="text-slate-500 text-[14px] sm:text-sm max-w-md mb-6 font-medium">
          Access real-time print production tracking, view artwork uploads, and download tax invoices.
        </p>
        <button
          onClick={() => setCurrentPage('login')}
          className="px-6 py-3 rounded-2xl bg-[#FF5A1F] text-white font-extrabold text-[14px] uppercase tracking-wider cursor-pointer border-none shadow-lg shadow-[#FF5A1F]/20"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      (o.orderId || o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.items || []).some(i => (i.productName || i.name || '').toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (activeFilter === 'active') return o.status !== 'Delivered';
    if (activeFilter === 'delivered') return o.status === 'Delivered';
    return true;
  });

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633] pb-20">
      
      {/* Page Hero Header */}
      <section className="bg-[#07152F] text-white py-12 sm:py-16 relative overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center gap-2 mb-2 text-[14px] font-semibold text-slate-400">
            <span className="cursor-pointer hover:text-white" onClick={() => setCurrentPage('home')}>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">My Orders</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            My Print Orders & Pipeline Tracking
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Track live production statuses, pre-flight file proofs, and tax invoices for all your orders.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Filters & Search Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-xl text-[14px] font-extrabold transition-all cursor-pointer border-none ${
                activeFilter === 'all' ? 'bg-[#07152F] text-white' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 rounded-xl text-[14px] font-extrabold transition-all cursor-pointer border-none ${
                activeFilter === 'active' ? 'bg-[#07152F] text-white' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              In Production ({orders.filter(o => o.status !== 'Delivered').length})
            </button>
            <button
              onClick={() => setActiveFilter('delivered')}
              className={`px-4 py-2 rounded-xl text-[14px] font-extrabold transition-all cursor-pointer border-none ${
                activeFilter === 'delivered' ? 'bg-[#07152F] text-white' : 'text-slate-600 hover:text-slate-900 bg-transparent'
              }`}
            >
              Delivered ({orders.filter(o => o.status === 'Delivered').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <FiSearch className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID or Product..."
              className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-[14px] font-semibold text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] shadow-xs"
            />
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-4 border-[#FF5A1F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] text-slate-500 font-bold">Loading your print orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center max-w-md mx-auto border border-[#E7EAF0] shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-orange-50 text-[#FF5A1F] flex items-center justify-center mx-auto">
              <FiPackage className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0B1633]">No Orders Found</h3>
            <p className="text-slate-500 text-[14px]">
              {searchQuery ? 'No orders match your search query.' : 'You haven’t placed any orders yet.'}
            </p>
            <button
              onClick={() => setCurrentPage('products')}
              className="bg-[#FF5A1F] text-white font-extrabold text-[14px] px-5 py-3 rounded-2xl inline-flex items-center gap-2 cursor-pointer border-none shadow-md"
            >
              <FiShoppingBag className="w-4 h-4" /> Explore Catalog
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((ord) => {
              const itemsList = ord.items || [];
              const firstItem = itemsList[0] || {};
              const formattedDate = new Date(ord.createdAt || Date.now()).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              });

              return (
                <div
                  key={ord.orderId || ord.id}
                  className="bg-white rounded-3xl p-6 border border-[#E7EAF0] shadow-sm space-y-5 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#07152F] text-white font-black flex items-center justify-center text-sm shadow-sm">
                        <FiPackage className="w-5 h-5 text-[#FF5A1F]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-[#0B1633]">#{ord.orderId || ord.id}</h3>
                          <span className="text-[14px] text-slate-400 font-medium">• Placed on {formattedDate}</span>
                        </div>
                        <p className="text-[14px] text-slate-500 font-medium mt-0.5">
                          {itemsList.length} Item(s) • Total: <strong className="text-[#FF5A1F] font-black">₹{(ord.totalAmount || ord.pricing?.grandTotal || 0).toLocaleString()}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`px-3 py-1 rounded-xl text-[14px] font-extrabold border ${
                        ord.status === 'Delivered' 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        ● {ord.status || 'Payment Confirmed'}
                      </span>

                      <button
                        onClick={() => setCurrentPage('order-details', { orderId: ord.orderId || ord.id })}
                        className="px-4 py-2 rounded-xl bg-[#07152F] hover:bg-slate-800 text-white font-extrabold text-[14px] flex items-center gap-1.5 transition cursor-pointer border-none shadow-sm"
                      >
                        <FiEye className="w-3.5 h-3.5" /> View Order
                      </button>
                    </div>
                  </div>

                  {/* Items Preview Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {itemsList.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-[#FAFBFD] border border-slate-200/80 flex items-center gap-3 text-[14px]">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=200'}
                          alt={item.productName || item.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <strong className="font-extrabold text-slate-900 block truncate">{item.productName || item.name}</strong>
                          <span className="text-[14px] text-slate-500 font-medium">{item.quantity || item.qty} Pcs • ₹{(item.totalPrice || item.unitPrice * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
