import React, { useState } from 'react';
import { FiX, FiLock, FiMail, FiUser, FiPhone, FiBriefcase, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

export function AuthModal() {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, login, signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (authModalTab === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, displayName, phone, company);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#07152F]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[24px] shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-6 bg-[#07152F] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-[#FF5A1F] uppercase">Printigly Auth</span>
            <h3 className="text-xl font-black text-white">
              {authModalTab === 'login' ? 'Sign In to Account' : 'Create Customer Account'}
            </h3>
          </div>
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 bg-slate-50 text-[14px] font-bold">
          <button
            onClick={() => { setAuthModalTab('login'); setError(''); }}
            className={`flex-1 py-3 text-center transition ${authModalTab === 'login' ? 'bg-white text-[#FF5A1F] border-b-2 border-[#FF5A1F]' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setAuthModalTab('signup'); setError(''); }}
            className={`flex-1 py-3 text-center transition ${authModalTab === 'signup' ? 'bg-white text-[#FF5A1F] border-b-2 border-[#FF5A1F]' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-[14px] font-sans">
          
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-start gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authModalTab === 'signup' && (
            <div>
              <label className="block font-bold text-[#0B1633] mb-1">Full Name</label>
              <div className="relative">
                <FiUser className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-bold text-[#0B1633] mb-1">Email Address</label>
            <div className="relative">
              <FiMail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="aarav@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#0B1633] mb-1">Password</label>
            <div className="relative">
              <FiLock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>
          </div>

          {authModalTab === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#0B1633] mb-1">Phone Number</label>
                <div className="relative">
                  <FiPhone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-[#0B1633] mb-1">Company (Optional)</label>
                <div className="relative">
                  <FiBriefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Nexus Labs"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:border-[#FF5A1F]"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] shadow-md transition cursor-pointer"
          >
            {submitting 
              ? 'Connecting to Firebase...' 
              : authModalTab === 'login' ? 'Sign In to Account' : 'Register Account'}
          </button>
        </form>

      </div>
    </div>
  );
}
