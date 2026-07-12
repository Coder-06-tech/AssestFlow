import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, ShieldCheck, Mail, Building, Shield } from 'lucide-react';

const DashboardStub = () => {
  const { user } = useAuth();

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'ASSET_MANAGER': return 'Asset Manager';
      case 'DEPARTMENT_HEAD': return 'Department Head';
      default: return 'Standard Employee';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-neutral-400 mt-1">Welcome back to your AssetFlow enterprise command console.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-2 bg-neutral-9050 bg-opacity-40 border border-neutral-800 rounded-xl p-6 backdrop-blur-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-16 w-16 rounded-full bg-indigo-600 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shadow-indigo-600/20">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{user?.name}</h2>
                <div className="flex items-center gap-1.5 mt-1 text-sm text-neutral-400">
                  <Shield className="h-4 w-4 text-indigo-400" />
                  <span>{getRoleLabel(user?.role)}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 border-t border-neutral-800 pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Email Address</p>
                  <p className="text-sm text-neutral-200 truncate">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-neutral-800 text-neutral-400">
                  <Building className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">Department</p>
                  <p className="text-sm text-neutral-200">
                    {user?.department?.name || 'Unassigned / Global'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
            <span>Authenticated session active with role: <span className="font-bold text-white">{user?.role}</span></span>
          </div>
        </div>

        {/* Teammate modules note */}
        <div className="bg-neutral-900 bg-opacity-30 border border-neutral-800 rounded-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2">Systems Status</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              You are currently viewing the **Systems & Admin** subsystem of AssetFlow. 
              The core models and API endpoints are loaded and running.
            </p>
            <div className="space-y-3 mt-6">
              <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">Security Gateways</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-900">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-neutral-800 pb-2">
                <span className="text-neutral-500">Audit Logs Registry</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-900">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="text-neutral-500">Analytics Aggregator</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-400 border border-indigo-900">DEMO MODE</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs text-neutral-500">
            <Activity className="h-4 w-4 text-indigo-400 animate-pulse shrink-0" />
            <span>Core Admin engine v1.0.0</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStub;
