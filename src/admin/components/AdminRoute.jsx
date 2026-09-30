import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminLogin } from '../pages/AdminLogin';

export const AdminRoute = ({ children }) => {
    const { currentUser, isAdmin, loading, logout } = useAuth();
    const [denied, setDenied] = useState(false);

    useEffect(() => {
        // If auth state finishes loading, they're logged in, BUT they aren't admin => BOOT THEM
        if (!loading && currentUser && !isAdmin) {
            setDenied(true);
            logout(); // Instantly destroy their session token access on frontend
        }
    }, [loading, currentUser, isAdmin, logout]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center">
                <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Restoring Session...</p>
            </div>
        );
    }

    // Not logged in (or we just booted them for not being admin)
    if (!currentUser || denied) {
        return (
            <div className="relative">
                {denied && (
                    <div className="absolute top-0 left-0 right-0 max-w-md mx-auto mt-6 z-50 p-4 bg-red-600 text-white font-bold text-[13px] text-center rounded-xl shadow-lg border border-red-700 animate-in slide-in-from-top-4">
                        ACCESS DENIED. THIS ACCOUNT DOES NOT HAVE ADMINISTRATIVE PRIVILEGES.
                    </div>
                )}
                <AdminLogin />
            </div>
        );
    }

    // They are fully logged in and verified to hold the custom 'admin: true' Firebase Claim.
    return <>{children}</>;
};
