import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  UserCheck, 
  CheckCircle2, 
  XCircle,
  Database,
  Sparkles
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export const RolePermissionsMatrix = () => {
  const { userRole, setUserRole } = useAdmin();

  const permissionsList = [
    { module: "Dashboard KPI Analytics", superAdmin: true, productionMgr: true, designer: true },
    { module: "Order Pipeline (Stage Status Update)", superAdmin: true, productionMgr: true, designer: false },
    { module: "Pre-Flight Artwork Inspector & Bleed Overlay", superAdmin: true, productionMgr: true, designer: true },
    { module: "Custom Design Ticket Assignment & Proof Upload", superAdmin: true, productionMgr: false, designer: true },
    { module: "Product Catalog SKU CRUD & Variant Matrix", superAdmin: true, productionMgr: true, designer: false },
    { module: "Dynamic Pricing Engine & GST Tax Rules", superAdmin: true, productionMgr: false, designer: false },
    { module: "Cloudinary Asset Library & Media CDN", superAdmin: true, productionMgr: true, designer: true },
    { module: "CRM Customer Directory & B2B NET-15 Privilege", superAdmin: true, productionMgr: false, designer: false },
    { module: "Logistics AWB & Hyperlocal Porter Booking", superAdmin: true, productionMgr: true, designer: false },
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-50/50 via-white to-slate-50 rounded-2xl p-6 text-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-[14px] font-bold uppercase tracking-wider text-blue-600 mb-1">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Firebase Auth Custom Claims & RBAC
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
            Role-Based Access Control (RBAC) Security Matrix
          </h2>
          <p className="text-[14px] text-slate-500 mt-1 max-w-xl">
            Enforce granular operational permissions for Super Admin, Production Managers, and In-House Designers.
          </p>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-3 shadow-3xs">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Simulate Active Role:</div>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[14px] text-blue-600 font-extrabold focus:outline-none cursor-pointer"
            >
              <option value="Super Admin">Super Admin</option>
              <option value="Production Manager">Production Manager</option>
              <option value="In-House Designer">In-House Designer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[14px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-5">Functional Module / Feature Access</th>
                <th className="py-3 px-4 text-center">Super Admin</th>
                <th className="py-3 px-4 text-center">Production Manager</th>
                <th className="py-3 px-4 text-center">In-House Designer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[14px]">
              {permissionsList.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    {item.module}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {item.productionMgr ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                        <XCircle className="w-4 h-4" />
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    {item.designer ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-400">
                        <XCircle className="w-4 h-4" />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
