import React, { useState, useEffect } from 'react';
import { FiMail, FiLock, FiUser, FiPhone, FiBriefcase, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiShield, FiAlertCircle, FiKey, FiSmartphone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

export function SignupPage({ setCurrentPage }) {
  const { signup, loginWithGoogle, sendOTP, verifyOTP } = useAuth();
  
  const [authMode, setAuthMode] = useState('otp'); // 'otp' or 'register'

  // Standard Form State
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  
  // OTP Flow Steps: 'enter-email' | 'enter-code' | 'set-password'
  const [otpStep, setOtpStep] = useState('enter-email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [isNewUser, setIsNewUser] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!displayName || !email || !password) {
      setError('Please fill in all required fields (Name, Email, and Password).');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please check again.');
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, displayName, phone, company);
      setSuccess('Account created in Firebase! Redirecting...');
      setTimeout(() => {
        if (setCurrentPage) setCurrentPage('account');
        else window.location.search = '?page=account';
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in or use another email.');
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpEmail || !otpEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await sendOTP(otpEmail);
      setOtpStep('enter-code');
      setResendTimer(30);
      setSuccess(res.message || 'Verification code sent to your email!');
    } catch (err) {
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOTP(otpEmail, otpCode);
      setIsNewUser(!!res.isNewUser);
      setSuccess('✓ Email verified! Please set a password and name for your account.');
      setOtpStep('set-password');
    } catch (err) {
      setError(err.message || 'Verification failed. Please check the OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordAndCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      try {
        await signup(otpEmail, password, displayName || otpEmail.split('@')[0], phone, company);
        setSuccess('Account created & authenticated! Redirecting...');
      } catch (signupErr) {
        if (signupErr.code === 'auth/email-already-in-use') {
          await signup(otpEmail, password, displayName, phone, company);
        } else {
          throw signupErr;
        }
      }

      setTimeout(() => {
        if (setCurrentPage) setCurrentPage('account');
        else window.location.search = '?page=account';
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to complete account registration.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccess('Signed in with Google! Redirecting...');
      setTimeout(() => {
        if (setCurrentPage) setCurrentPage('account');
        else window.location.search = '?page=account';
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans text-[#0B1633] flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        
        {/* Header & Brand Logo */}
        <div className="text-center">
          <button
            onClick={() => setCurrentPage && setCurrentPage('home')}
            className="inline-flex items-center gap-2 mb-6 border-none bg-transparent cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FF5A1F] flex items-center justify-center shadow-lg shadow-[#FF5A1F]/20 group-hover:scale-105 transition-transform duration-200">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 4v3H4a2 2 0 00-2 2v7a2 2 0 002 2h1v2a1 1 0 001 1h12a1 1 0 001-1v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a1 1 0 00-1-1H6a1 1 0 00-1 1zm2 0h10v3H7V4zm-3 7h16v5h-1v-1a1 1 0 00-1-1H6a1 1 0 00-1 1v1H4v-5zm3 6v-2h10v2H7z"/>
              </svg>
            </div>
            <span className="text-2xl font-black text-[#0B1633] tracking-tight">
              Printigly<span className="text-[#FF5A1F]">.</span>
            </span>
          </button>

          <h2 className="text-3xl font-extrabold text-[#0B1633] tracking-tight">
            Create Your Account
          </h2>
          <p className="mt-2 text-[14px] sm:text-sm text-slate-500 font-medium">
            Register via Instant Email OTP, Google, or Password
          </p>
        </div>

        {/* Signup Card Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-[14px] font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                authMode === 'otp' ? 'bg-white text-[#FF5A1F] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiSmartphone className="w-3.5 h-3.5" /> Fast Email OTP
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('register'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                authMode === 'register' ? 'bg-white text-[#FF5A1F] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiUser className="w-3.5 h-3.5" /> Full Registration
            </button>
          </div>

          {/* Alert Notices */}
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

          {/* GOOGLE SIGN IN BUTTON */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleSignup}
            className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-[14px] flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <FcGoogle className="w-5 h-5 shrink-0" />
            <span>Sign Up with Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or Continue With</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* MODE 1: EMAIL OTP SIGNUP */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              {/* STEP 1: ENTER EMAIL */}
              {otpStep === 'enter-email' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    {loading ? 'Sending OTP...' : <>Send Instant OTP <FiArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}

              {/* STEP 2: ENTER OTP CODE */}
              {otpStep === 'enter-code' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider">
                        Enter 6-Digit Code
                      </label>
                      <button
                        type="button"
                        onClick={() => { setOtpStep('enter-email'); setOtpCode(''); }}
                        className="text-[14px] font-bold text-[#FF5A1F] hover:underline bg-transparent border-none cursor-pointer"
                      >
                        Change ({otpEmail})
                      </button>
                    </div>

                    <div className="relative">
                      <FiKey className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-black text-base text-slate-900 tracking-widest focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    {loading ? 'Verifying...' : <>Verify Code & Continue <FiCheckCircle className="w-4 h-4" /></>}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleSendOTP}
                      className={`text-[14px] font-bold border-none bg-transparent cursor-pointer ${
                        resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-[#FF5A1F] hover:underline'
                      }`}
                    >
                      {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Didn\'t receive code? Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: SET PASSWORD & CREATE ACCOUNT */}
              {otpStep === 'set-password' && (
                <form onSubmit={handleSetPasswordAndCreateAccount} className="space-y-4 pt-1">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-[14px] font-semibold flex items-center justify-between">
                    <span>Email Verified: <strong>{otpEmail}</strong></span>
                    <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                  <div>
                    <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <FiUser className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Vikram Sharma"
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Set Password for Next Sign In *
                    </label>
                    <div className="relative">
                      <FiLock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
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
                    <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <FiLock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
                  >
                    {loading ? 'Creating Account...' : <>Complete Account Setup & Sign In <FiArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: FULL REGISTRATION FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <FiUser className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <FiMail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@designstudio.in"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <FiPhone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <div className="relative">
                    <FiBriefcase className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Studio Designs"
                      className="w-full pl-10 pr-3 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password *
                  </label>
                  <div className="relative">
                    <FiLock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <FiLock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-8 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
              >
                {loading ? 'Creating Account...' : <>Complete Registration <FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Card Footer Links */}
          <div className="pt-4 border-t border-slate-100 text-center text-[14px] text-slate-500 font-medium">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentPage && setCurrentPage('login')}
              className="font-extrabold text-[#FF5A1F] hover:underline bg-transparent border-none cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="flex items-center justify-center gap-2 text-[14px] text-slate-400 font-semibold">
          <FiShield className="w-4 h-4 text-emerald-500" />
          <span>Encrypted SSL 256-bit Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
}
