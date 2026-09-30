import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BRANDING } from '../../config/branding';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { logout, currentUser } = useAuth(); // just to double check if we need to force logout

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Preflight Rate Limit Proxy
            const proxyRes = await fetch('/api/admin-auth-proxy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const proxyData = await proxyRes.json();

            if (!proxyRes.ok) {
                setError(proxyData.error || "Invalid email or password.");
                setLoading(false);
                return;
            }

            // 2. Safe to proceed with Firebase Web SDK Login
            await signInWithEmailAndPassword(auth, email, password);

            // We do not redirect manually here because AppContent/AuthContext will re-evaluate
            // the auth status, and AdminRoute will detect currentUser + isAdmin and render the dashboard!
        } catch (err) {
            console.error(err);
            setError("Invalid email or password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 pb-8">

                <div className="bg-[#07152F] p-8 flex flex-col items-center justify-center">
                    <img src={BRANDING.logoLight} alt="Logo" className="h-10 w-auto mb-2" />
                    <h2 className="text-white text-sm font-medium tracking-widest uppercase opacity-80 mt-2">
                        Admin Portal Checkout
                    </h2>
                </div>

                <div className="p-8 pb-4">
                    <h1 className="text-2xl font-bold text-slate-800 mb-1 text-center">Secure Sign In</h1>
                    <p className="text-slate-500 text-sm text-center mb-8">
                        Access to the administrative dashboard is heavily restricted.
                    </p>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[13px] font-semibold text-center animate-in fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Admin Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50 focus:bg-white"
                                placeholder="Secure Email Address"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full p-3.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-50 transition-all bg-slate-50 focus:bg-white pr-12"
                                    placeholder="••••••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider bg-transparent border-none cursor-pointer"
                                    disabled={loading}
                                >
                                    {showPassword ? 'Hide' : 'Show'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[14px] transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : 'Access Dashboard'}
                        </button>
                    </form>
                </div>

                <div className="px-8 text-center text-[10px] text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                    Unauthorized access attempts are logged <br />and reported by IP identifier.
                </div>
            </div>
        </div>
    );
};
