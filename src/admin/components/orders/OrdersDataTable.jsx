import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Zap, 
  Truck, 
  FileText, 
  Phone, 
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminOrderDetailModal } from '../modals/AdminOrderDetailModal';

export const OrdersDataTable = () => {
  const { orders, setSelectedOrder, updateOrderStatus } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expressOnly, setExpressOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const itemsPerPage = 8;


  // Multi-column filtering
  const filteredOrders = orders.filter((o) => {
    const orderId = o.id || '';
    const custName = o.customer?.name || '';
    const custPhone = o.customer?.phone || '';
    const custCompany = o.customer?.company || '';

    const matchesSearch = 
      orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custPhone.includes(searchTerm) ||
      custCompany.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesExpress = !expressOnly || o.isExpress;

    return matchesSearch && matchesStatus && matchesExpress;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const exportToCSV = () => {
    const headers = ["Order ID", "Customer", "Company", "Phone", "Status", "Delivery", "Total (INR)", "Created At"];
    const rows = filteredOrders.map(o => [
      o.id || '',
      `"${o.customer?.name || ''}"`,
      `"${o.customer?.company || ''}"`,
      o.customer?.phone || '',
      o.status || 'Payment Confirmed',
      `"${o.deliveryMethod || ''}"`,
      o.totalAmount || o.pricing?.grandTotal || 0,
      o.createdAt || ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Printigly_Orders_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
      
      {/* Quick Stage Status Telemetry Pills Bar */}
      <div className="p-3 sm:p-4 bg-slate-50/70 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto select-none">
        {[
          { label: 'All Orders', value: 'ALL', count: orders.length },
          { label: 'Payment Confirmed', value: 'Payment Confirmed', count: orders.filter(o => o.status === 'Payment Confirmed').length },
          { label: 'In Production', value: 'In Production', count: orders.filter(o => o.status === 'In Production').length },
          { label: 'Quality Check', value: 'Quality Check', count: orders.filter(o => o.status === 'Quality Check').length },
          { label: 'Dispatched', value: 'Dispatched', count: orders.filter(o => o.status === 'Dispatched').length },
          { label: 'Delivered', value: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length },
        ].map((pill) => (
          <button
            key={pill.value}
            onClick={() => setStatusFilter(pill.value)}
            className={`px-3 py-1.5 rounded-xl text-[14px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border ${
              statusFilter === pill.value
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <span>{pill.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
              statusFilter === pill.value ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {pill.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filtering Bar */}
      <div className="p-4 border-b border-slate-200/80 bg-white flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Field */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order ID, Phone, Customer or Company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[14px] font-medium text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white shadow-2xs"
          />
        </div>

        {/* Status Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[14px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs cursor-pointer"
          >
            <option value="ALL">All Production Stages</option>
            <option value="Payment Confirmed">Payment Confirmed</option>
            <option value="Artwork Verification">Artwork Verification</option>
            <option value="In Production">In Production</option>
            <option value="Quality Check">Quality Check</option>
            <option value="Packed & Ready">Packed & Ready</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>

        {/* Express Toggle */}
        <button
          onClick={() => setExpressOnly(!expressOnly)}
          className={`px-3 py-2 rounded-xl text-[14px] font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
            expressOnly 
              ? 'bg-red-600 text-white border-red-600 shadow-xs' 
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-3.5 h-3.5 fill-current text-red-500" /> Express Only
        </button>

        {/* CSV Export Button */}
        <button
          onClick={exportToCSV}
          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[14px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-blue-600" /> Export CSV
        </button>

      </div>

      {/* Mobile Stacked Card View */}
      <div className="block md:hidden divide-y divide-slate-100">
        {paginatedOrders.map((order) => (
          <div key={order.id} className="p-4 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>{order.id}</span>
                {order.isExpress && (
                  <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-extrabold text-[9px] flex items-center gap-0.5 animate-pulse">
                    <Zap className="w-2.5 h-2.5 fill-red-600" /> Express
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="text-[14px] space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold">Customer: </span>
                <span className="font-bold text-slate-900">{order.customer?.name || 'Customer'}</span>
                <span className="text-slate-400"> ({order.customer?.company || 'Retail'})</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">Items: </span>
                <span className="font-semibold text-slate-800">{(order.items || []).map(i => i.productName || i.name).join(', ')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700">
                <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-medium text-[14px] truncate">{order.deliveryMethod}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-slate-400 text-[9px] block uppercase font-bold tracking-wider">Total</span>
                <span className="font-black text-slate-900 text-[14px]">₹{order.totalAmount.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                  className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[14px] font-semibold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="Payment Confirmed">Payment Confirmed</option>
                  <option value="Artwork Verification">Artwork Verification</option>
                  <option value="In Production">In Production</option>
                  <option value="Quality Check">Quality Check</option>
                  <option value="Packed & Ready">Packed & Ready</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Delivered">Delivered</option>
                </select>                <button
                  onClick={() => {
                    setSelectedDetailOrder(order);
                    setDetailModalOpen(true);
                  }}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold border-none cursor-pointer"
                  title="Inspect Artwork & Order Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {paginatedOrders.length === 0 && (
          <div className="py-12 text-center text-slate-400 font-medium">
            No real orders found in database. Customer orders will appear here in real-time.
          </div>
        )}
      </div>

      {/* High-density Data Table for Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100/70 border-b border-slate-200 text-[14px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Order ID & Date</th>
              <th className="py-3 px-4">Customer & Company</th>
              <th className="py-3 px-4">Items Summary</th>
              <th className="py-3 px-4">Stage Status</th>
              <th className="py-3 px-4">Delivery Method</th>
              <th className="py-3 px-4 text-right">Total (INR)</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[14px]">
            {paginatedOrders.map((order) => (
              <tr 
                key={order.id || order.orderId}
                className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                onClick={() => {
                  setSelectedDetailOrder(order);
                  setDetailModalOpen(true);
                }}
              >
                <td className="py-3 px-4">
                  <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                    <span>{order.orderId || order.id}</span>
                    {order.isExpress && (
                      <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-extrabold text-[9px] flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-red-600" /> Express
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </td>

                <td className="py-3 px-4">
                  <div className="font-bold text-slate-900">{order.customer?.name || 'Customer'}</div>
                  <div className="text-[14px] text-slate-500 flex items-center gap-2">
                    <span>{order.customer?.company || 'Retail'}</span>
                    <span className="text-slate-300">•</span>
                    <span className="font-mono text-[10px]">{order.customer?.phone}</span>
                  </div>
                </td>

                <td className="py-3 px-4 max-w-[220px]">
                  <p className="font-medium text-slate-800 truncate">
                    {(order.items || []).map(i => i.productName || i.name).join(', ')}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {order.items && order.items[0]?.variant}
                  </p>
                </td>

                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={order.status || 'Payment Confirmed'}
                    onChange={(e) => updateOrderStatus(order.id || order.orderId, e.target.value)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[14px] font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Payment Confirmed">Payment Confirmed</option>
                    <option value="Artwork Verification">Artwork Verification</option>
                    <option value="In Production">In Production</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Packed & Ready">Packed & Ready</option>
                    <option value="Dispatched">Dispatched</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>

                <td className="py-3 px-4">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Truck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate max-w-[140px]">{order.deliveryMethod || 'Standard Delivery'}</span>
                  </div>
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="font-black text-slate-900">₹{(order.totalAmount || order.pricing?.grandTotal || 0).toLocaleString()}</div>
                  <span className="text-[10px] text-emerald-600 font-semibold">GST Inclusive</span>
                </td>

                <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setSelectedDetailOrder(order);
                      setDetailModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-semibold transition-colors inline-flex items-center gap-1 border-none cursor-pointer"
                    title="View Full Order Details & Download Client Artwork"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="hidden xl:inline text-[14px]">View Order</span>
                  </button>
                </td>
              </tr>
            ))}

            {paginatedOrders.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                  No orders found in database matching criteria. Real-time orders will display here automatically.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between text-[14px] text-slate-600">
        <div>
          Showing {paginatedOrders.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of {filteredOrders.length} orders
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-bold text-slate-800">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Order Details & Download Documents Inspector Modal */}
      <AdminOrderDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        order={selectedDetailOrder}
      />
    </div>
  );
};

