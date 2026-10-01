import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiShield, FiAlertTriangle, FiArrowRight } from 'react-icons/fi';
import { auth, sendOtpToEmail, verifyOtpCode } from '../services/firebase';
import { useAuth } from '../context/AuthContext';

export function VerifyOtpPage({ setCurrentPage, destinationPage = 'account' }) {
    const { currentUser, setOtpSessionVerified } = useAuth();
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // If no user is logged in, they can't verify OTP for a session.
    useEffect(() => {
        if (!currentUser) {
            if (setCurrentPage) setCurrentPage('login');
        }
    }, [currentUser, setCurrentPage]);

    // Handle cooldown timer for resend
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    const maskEmail = (email) => {
        if (!email) return '';
        const [name, domain] = email.split('@');
        if (!name || !domain) return email;
        return `${name.charAt(0)}${'*'.repeat(name.length - 1)}@${domain}`;
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError(null);

        const cleanOtp = otp.trim();
        if (cleanOtp.length !== 6) {
            setError('Please enter a valid 6-digit verification code.');
            return;
        }

        setLoading(true);
        try {
            // 1. Get Firebase ID token
            const idToken = await currentUser.getIdToken(false);

            // 2. Call our verify API
            const res = await fetch('/api/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    email: currentUser.email,
                    otp: cleanOtp,
                    challengeId: currentUser.email // simple challenge ID mapping
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Invalid verification code.');
            }

            setSuccess(true);

            // 3. User is securely verified! Force token refresh to pick up Custom Claims
            await currentUser.getIdToken(true);

            // Update Context
            if (setOtpSessionVerified) setOtpSessionVerified(true);

            setTimeout(() => {
                if (setCurrentPage) setCurrentPage(destinationPage);
            }, 1500);

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        setError(null);
        setResending(true);

        try {
            const idToken = await currentUser.getIdToken(false);
            const res = await fetch('/api/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({ email: currentUser.email, uid: currentUser.uid })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to resend code');
            }

            setCooldown(60); // 60 seconds cooldown
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    if (!currentUser) return null;

    return (
        <div className="min-h-screen bg-[#FAFBFD] font-sans flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative overflow-hidden">

                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 to-[#FF5A1F]"></div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-[#FF5A1F] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100 shadow-sm">
                        <FiShield className="w-7 h-7" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2 tracking-tight">
                        Verify Your Email
                    </h2>
                    <p className="text-slate-500 text-[14px]">
                        We've sent a 6-digit verification code to your email account: <br />
                        <strong className="text-slate-800 font-bold">{maskEmail(currentUser.email)}</strong>
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 text-rose-600 text-[13px] font-bold flex gap-3 items-start border border-rose-100">
                        <FiAlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{error}</span>
                    </div>
                )}

                {success ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCheckCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-emerald-700">Verification Successful</h3>
                        <p className="text-emerald-600 text-sm mt-1">Redirecting securely...</p>
                    </div>
                ) : (
                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <input
                                type="text"
                                pattern="[0-9]*"
                                maxLength="6"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="• • • • • •"
                                className="w-full h-14 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-center text-2xl font-bold tracking-[0.5em] text-[#0B1633] placeholder:text-slate-300 focus:outline-none focus:border-[#FF5A1F] focus:ring-4 focus:ring-[#FF5A1F]/10 transition-all font-mono"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full h-14 bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[15px] uppercase tracking-wider rounded-2xl shadow-lg shadow-[#FF5A1F]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Verify OTP <FiArrowRight className="w-4 h-4" /></>
                            )}
                        </button>

                        <div className="text-center pt-2">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={cooldown > 0 || resending}
                                className="text-[13px] font-bold text-slate-500 hover:text-[#0B1633] transition-colors border-none bg-transparent cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {resending ? 'Sending...' : cooldown > 0 ? `Please wait ${cooldown}s before requesting a new OTP` : 'Resend Verification Code'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
