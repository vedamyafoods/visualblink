import React, { useState } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiShield, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';

export function LoginPage({ setCurrentPage }) {
  const { login, loginWithGoogle } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetMode, setResetMode] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (resetMode) {
      if (!email) {
        setError('Please enter your email address to reset password.');
        return;
      }
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccess('If an account exists for this email, a password reset link has been sent.');
      } catch (err) {
        // Prevent email enumeration
        setSuccess('If an account exists for this email, a password reset link has been sent.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Let App.jsx handle the route redirection when user state updates
      if (setCurrentPage) {
        setCurrentPage('account');
      } else {
        window.location.search = '?page=account';
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please wait or reset your password.');
      } else {
        setError('Unable to connect. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await loginWithGoogle();
      if (setCurrentPage) {
        setCurrentPage('account');
      } else {
        window.location.search = '?page=account';
      }
    } catch (err) {
      console.error(err);
      setError('Google sign-in could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">

        {/* Header & Brand Logo */}
        <div className="text-center">
          <button
            onClick={() => setCurrentPage && setCurrentPage('home')}
            className="inline-flex items-center gap-2 mb-6 border-none bg-transparent cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4v3H4a2 2 0 00-2 2v7a2 2 0 002 2h1v2a1 1 0 001 1h12a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h10v3H7V4zm-3 7h16v5h-1v-1a1 1 0 00-1-1H6a1 1 0 00-1 1v1H4v-5zm3 6v-2h10v2H7z" />
              </svg>
            </div>
            <span className="text-2xl font-black text-[#0B1633] tracking-tight">
              Printigly<span className="text-[#FF5A1F]">.</span>
            </span>
          </button>

          <h2 className="text-3xl font-extrabold text-[#0B1633] tracking-tight">
            {resetMode ? 'Reset Password' : 'Access Your Account'}
          </h2>
          <p className="mt-2 text-[14px] sm:text-sm text-slate-500 font-medium">
            {resetMode ? 'Enter your email to receive a password reset link' : 'Sign in to view orders and manage preferences'}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-[14px] font-bold flex items-start gap-2.5">
              <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-bold flex items-center gap-2.5">
              <FiCheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email
              </label>
              <div className="relative">
                <FiMail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                  disabled={loading}
                />
              </div>
            </div>

            {!resetMode && (
              <div>
                <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                  >
                    {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pb-2">
              {!resetMode && (
                <button
                  type="button"
                  onClick={() => setResetMode(true)}
                  className="text-[13px] font-bold text-slate-500 hover:text-[#FF5A1F] bg-transparent border-none cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
              {resetMode && (
                <button
                  type="button"
                  onClick={() => setResetMode(false)}
                  className="text-[13px] font-bold text-slate-500 hover:text-[#FF5A1F] bg-transparent border-none cursor-pointer"
                >
                  Back to Sign In
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0B1633] hover:bg-[#1a2542] text-white font-extrabold text-[14px] tracking-wider uppercase shadow-lg shadow-[#0B1633]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : (resetMode ? 'Send Reset Link' : 'Sign In')}
            </button>
          </form>

          {!resetMode && (
            <>
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-[14px] flex items-center justify-center gap-3 transition cursor-pointer"
              >
                <FcGoogle className="w-5 h-5 shrink-0" />
                <span>Continue with Google</span>
              </button>
            </>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-[14px] text-slate-500 font-medium">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentPage && setCurrentPage('signup')}
              className="font-extrabold text-[#FF5A1F] hover:underline bg-transparent border-none cursor-pointer"
            >
              Join Now
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[14px] text-slate-400 font-semibold">
          <FiShield className="w-4 h-4 text-emerald-500" />
          <span>Secured by Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}
