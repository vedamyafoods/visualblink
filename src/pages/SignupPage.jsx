import React, { useState } from 'react';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiShield, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

export function SignupPage({ setCurrentPage }) {
  const { signup, loginWithGoogle } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!displayName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const userResult = await signup(email, password, displayName, "", "");
      setSuccess('Account created successfully!');

      if (userResult) {
        try {
          const idToken = await userResult.getIdToken(false);
          await fetch('/api/send-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ email: userResult.email, uid: userResult.uid })
          });
        } catch (err) { }
      }

      if (setCurrentPage) {
        setCurrentPage('verify-otp');
      } else {
        window.location.search = '?page=verify-otp';
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in.');
      } else if (err.code === 'auth/weak-password') {
        setError('Please choose a stronger password.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const userResult = await loginWithGoogle();
      setSuccess('Signed in with Google!');
      if (userResult) {
        try {
          const idToken = await userResult.getIdToken(false);
          await fetch('/api/send-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            },
            body: JSON.stringify({ email: userResult.email, uid: userResult.uid })
          });
        } catch (err) { }
      }

      if (setCurrentPage) {
        setCurrentPage('verify-otp');
      } else {
        window.location.search = '?page=verify-otp';
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
            <div className="w-10 h-10 rounded-xl bg-[#025afc] flex items-center justify-center shadow-lg shadow-[#025afc]/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4v3H4a2 2 0 00-2 2v7a2 2 0 002 2h1v2a1 1 0 001 1h12a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h10v3H7V4zm-3 7h16v5h-1v-1a1 1 0 00-1-1H6a1 1 0 00-1 1v1H4v-5zm3 6v-2h10v2H7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-[#0B1633] tracking-tight">
              VisualBlink<span className="text-[#025afc]">.</span>
            </span>
          </button>

          <h2 className="text-3xl font-bold text-[#0B1633] tracking-tight">
            Create Your Account
          </h2>
          <p className="mt-2 text-[14px] sm:text-sm text-slate-500 font-medium">
            Join now to track orders and save your preferences
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#025afc] bg-slate-50/50"
                  disabled={loading}
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#025afc] bg-slate-50/50"
                  disabled={loading}
                />
              </div>
            </div>

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
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#025afc] bg-slate-50/50"
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

            <div>
              <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#025afc] bg-slate-50/50"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 rounded-2xl bg-[#0B1633] hover:bg-[#1a2542] text-white font-bold text-[14px] tracking-wider uppercase shadow-lg shadow-[#0B1633]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
            >
              {loading ? 'Processing...' : 'Create Account'}
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignup}
            className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-[14px] flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <FcGoogle className="w-5 h-5 shrink-0" />
            <span>Continue with Google</span>
          </button>

          <div className="pt-4 border-t border-slate-100 text-center text-[14px] text-slate-500 font-medium">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage && setCurrentPage('login')}
              className="font-bold text-[#025afc] hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign In
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
