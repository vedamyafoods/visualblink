import React, { useState } from 'react';
import { Search, X, Kanban, Package, Users, Palette, Zap, Calculator } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const AdminCommandPalette = () => {
  const { 
    commandPaletteOpen, 
    setCommandPaletteOpen, 
    orders, 
    products, 
    customers, 
    setActiveTab, 
    setSelectedOrder,
    setPreflightModalOpen
  } = useAdmin();

  const [query, setQuery] = useState('');

  if (!commandPaletteOpen) return null;

  const filteredOrders = orders.filter(o => 
    (o.id || '').toLowerCase().includes(query.toLowerCase()) || 
    (o.customer?.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (o.customer?.company || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    (p.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(query.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    (c.name || '').toLowerCase().includes(query.toLowerCase()) ||
    (c.company || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search className="w-5 h-5 text-blue-600" />
          <input
            type="text"
            placeholder="Type to search orders, customers, SKUs, or jump to page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Hub Navigation */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-2 text-[14px] font-semibold text-slate-600">
          <span className="text-[10px] uppercase font-bold text-slate-400 self-center">Quick Jump:</span>
          <button onClick={() => { setActiveTab('orders'); setCommandPaletteOpen(false); }} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
            <Kanban className="w-3.5 h-3.5" /> Pipeline
          </button>
          <button onClick={() => { setActiveTab('catalog'); setCommandPaletteOpen(false); }} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
            <Package className="w-3.5 h-3.5" /> Catalog
          </button>
          <button onClick={() => { setActiveTab('crm'); setCommandPaletteOpen(false); }} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
            <Users className="w-3.5 h-3.5" /> CRM
          </button>
          <button onClick={() => { setActiveTab('pricing'); setCommandPaletteOpen(false); }} className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-blue-500 hover:text-blue-600 flex items-center gap-1.5 transition-colors">
            <Calculator className="w-3.5 h-3.5" /> Pricing
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 text-[14px]">
          
          {/* Orders Section */}
          {filteredOrders.length > 0 && (
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-2 flex items-center gap-1.5">
                <Kanban className="w-3.5 h-3.5 text-blue-500" /> Print Orders ({filteredOrders.length})
              </h4>
              <div className="space-y-1">
                {filteredOrders.slice(0, 4).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrder(order);
                      setActiveTab('orders');
                      setCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{order.id}</span>
                        {order.isExpress && (
                          <span className="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-extrabold text-[9px] flex items-center gap-0.5">
                            <Zap className="w-3 h-3 fill-red-600" /> Express
                          </span>
                        )}
                        <span className="text-slate-400 font-normal text-[14px]">• {order.customer.name} ({order.customer.company})</span>
                      </div>
                      <p className="text-slate-500 text-[14px] truncate mt-0.5">
                        {order.items.map(i => i.productName).join(', ')}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-extrabold text-slate-900">₹{order.totalAmount.toLocaleString()}</div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Section */}
          {filteredProducts.length > 0 && (
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-emerald-500" /> Catalog Products ({filteredProducts.length})
              </h4>
              <div className="space-y-1">
                {filteredProducts.slice(0, 3).map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setActiveTab('catalog');
                      setCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{prod.title}</span>
                      <p className="text-slate-500 text-[14px] truncate">{prod.summary}</p>
                    </div>
                    <span className="font-bold text-emerald-600">Base ₹{prod.basePrice}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Customers Section */}
          {filteredCustomers.length > 0 && (
            <div>
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-500" /> Customers ({filteredCustomers.length})
              </h4>
              <div className="space-y-1">
                {filteredCustomers.slice(0, 3).map((cust) => (
                  <div
                    key={cust.id}
                    onClick={() => {
                      setActiveTab('crm');
                      setCommandPaletteOpen(false);
                    }}
                    className="p-2.5 rounded-xl hover:bg-purple-50/50 border border-transparent hover:border-purple-200 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{cust.name} ({cust.company})</span>
                      <p className="text-slate-500 text-[14px]">{cust.email} • {cust.phone}</p>
                    </div>
                    <span className="font-extrabold text-slate-900">Total ₹{cust.totalSpend.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredOrders.length === 0 && filteredProducts.length === 0 && filteredCustomers.length === 0 && (
            <div className="py-8 text-center text-slate-400">
              No results found matching "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
