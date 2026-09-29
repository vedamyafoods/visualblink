import React, { useState, useEffect } from 'react';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle, FiShield, FiAlertCircle, FiKey, FiSmartphone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';

export function LoginPage({ setCurrentPage }) {
  const { login, signup, loginWithGoogle, sendOTP, verifyOTP } = useAuth();
  
  // Auth Mode: 'otp' or 'password'
  const [authMode, setAuthMode] = useState('otp');

  // Password State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP Flow Steps: 'enter-email' | 'enter-code' | 'set-password'
  const [otpStep, setOtpStep] = useState('enter-email');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  
  // New Account Setup State (after OTP verified)
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Resend Timer Countdown Effect
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please enter both email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      setSuccess('Successfully authenticated! Redirecting...');
      setTimeout(() => {
        if (setCurrentPage) setCurrentPage('account');
        else window.location.search = '?page=account';
      }, 800);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please check your credentials.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
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
      setSuccess(res.isNewUser 
        ? '✓ Email verified! Please set a password and name for your account.' 
        : '✓ Email verified! Enter your password to complete sign in.'
      );
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

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setLoading(true);
    try {
      try {
        await signup(otpEmail, newPassword, newName || otpEmail.split('@')[0], newPhone, newCompany);
        setSuccess('Account created & authenticated! Redirecting to account...');
      } catch (signupErr) {
        if (signupErr.code === 'auth/email-already-in-use') {
          await login(otpEmail, newPassword);
          setSuccess('Signed in successfully! Redirecting...');
        } else {
          throw signupErr;
        }
      }

      setTimeout(() => {
        if (setCurrentPage) setCurrentPage('account');
        else window.location.search = '?page=account';
      }, 800);
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password for existing account. Please check your password.');
      } else {
        setError(err.message || 'Failed to complete account setup.');
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
      setSuccess('Authenticated via Google! Redirecting...');
      setTimeout(() => {
        if (setCurrentPage) setCurrentPage('account');
        else window.location.search = '?page=account';
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Google sign in failed. Please try again.');
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
            Welcome Back
          </h2>
          <p className="mt-2 text-[14px] sm:text-sm text-slate-500 font-medium">
            Sign in via Email OTP, Password, or Google Account
          </p>
        </div>

        {/* Login Card Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-xl space-y-6">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-[14px] font-bold">
            <button
              type="button"
              onClick={() => { setAuthMode('otp'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                authMode === 'otp' ? 'bg-white text-[#FF5A1F] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiSmartphone className="w-3.5 h-3.5" /> Email OTP
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('password'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2.5 rounded-xl transition cursor-pointer border-none flex items-center justify-center gap-1.5 ${
                authMode === 'password' ? 'bg-white text-[#FF5A1F] shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiLock className="w-3.5 h-3.5" /> Password
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
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-[14px] flex items-center justify-center gap-3 transition cursor-pointer"
          >
            <FcGoogle className="w-5 h-5 shrink-0" />
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">Or Continue With</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* MODE 1: EMAIL OTP FORM */}
          {authMode === 'otp' && (
            <div className="space-y-4">
              {/* STEP 1: ENTER EMAIL */}
              {otpStep === 'enter-email' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Email Address for OTP
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
                    {loading ? 'Sending OTP...' : <>Send 6-Digit Verification Code <FiArrowRight className="w-4 h-4" /></>}
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
                        Change Email ({otpEmail})
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
                    {loading ? 'Verifying Code...' : <>Verify & Continue <FiCheckCircle className="w-4 h-4" /></>}
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

              {/* STEP 3: SET PASSWORD FOR NEW USER / SIGN IN */}
              {otpStep === 'set-password' && (
                <form onSubmit={handleSetPasswordAndCreateAccount} className="space-y-4 pt-1">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-[14px] font-semibold flex items-center justify-between">
                    <span>Email Verified: <strong>{otpEmail}</strong></span>
                    <FiCheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  </div>

                  {isNewUser && (
                    <div>
                      <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      {isNewUser ? 'Set Password for Next Sign In *' : 'Enter Account Password *'}
                    </label>
                    <div className="relative">
                      <FiLock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                    {loading ? 'Creating Account...' : <>{isNewUser ? 'Create Account & Sign In' : 'Sign In Now'} <FiArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* MODE 2: EMAIL PASSWORD FORM */}
          {authMode === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-[14px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@company.com"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
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
                    className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 font-medium text-[14px] text-slate-900 focus:outline-none focus:border-[#FF5A1F] bg-slate-50/50"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] tracking-wider uppercase shadow-lg shadow-[#FF5A1F]/25 transition cursor-pointer border-none flex items-center justify-center gap-2"
              >
                {loading ? 'Signing In...' : <>Sign In to Account <FiArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* Card Footer Links */}
          <div className="pt-4 border-t border-slate-100 text-center text-[14px] text-slate-500 font-medium">
            Don't have an account yet?{' '}
            <button
              onClick={() => setCurrentPage && setCurrentPage('signup')}
              className="font-extrabold text-[#FF5A1F] hover:underline bg-transparent border-none cursor-pointer"
            >
              Create New Account
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
