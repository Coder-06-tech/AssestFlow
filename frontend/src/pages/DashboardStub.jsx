import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  Package, 
  Check, 
  User, 
  Calendar, 
  Search, 
  Bell, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Laptop,
  Smartphone,
  Camera,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { toast } from 'react-toastify';

const DashboardStub = () => {
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    allocated: 0,
    bookings: 0
  });

  const [health, setHealth] = useState({
    operational: 0,
    maintenance: 0,
    decommissioned: 0,
    repair: 0
  });

  const [liveActivities, setLiveActivities] = useState([]);
  const [upcomingReturns, setUpcomingReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [assetRes, bookingRes, allocRes, activityRes] = await Promise.all([
        api.get('/assets'),
        api.get('/bookings'),
        api.get('/allocations'),
        api.get('/allocations/activity')
      ]);
      
      const assets = assetRes.data?.data || [];
      const bookings = bookingRes.data?.data || [];
      const allocations = allocRes.data?.data || [];
      const activities = activityRes.data?.data || [];
      
      // Live Metrics
      const totalAssets = assets.length;
      const availableAssets = assets.filter(a => a.status === 'AVAILABLE').length;
      const allocatedAssets = allocations.filter(a => a.status === 'ACTIVE').length;
      const totalBookings = bookings.length;
      
      setStats({
        total: totalAssets,
        available: availableAssets,
        allocated: allocatedAssets,
        bookings: totalBookings
      });

      // Health Analysis based on real DB status
      const operational = assets.filter(a => a.status === 'AVAILABLE' || a.status === 'ALLOCATED').length;
      const maintenance = assets.filter(a => a.status === 'UNDER_MAINTENANCE' || a.status === 'MAINTENANCE').length;
      const decommissioned = assets.filter(a => a.status === 'DECOMMISSIONED' || a.condition === 'Poor').length;
      const repair = assets.filter(a => a.status === 'UNDER_MAINTENANCE' && a.condition === 'Needs Service').length;

      setHealth({
        operational,
        maintenance,
        decommissioned,
        repair
      });

      // Activities
      setLiveActivities(activities);

      // Filter active allocations with a due date for upcoming returns
      const upcoming = allocations.filter(a => a.status === 'ACTIVE' && a.dueDate);
      setUpcomingReturns(upcoming);

    } catch (err) {
      console.error('Failed to fetch dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Donut chart logic
  const totalHealth = health.operational + health.maintenance + health.decommissioned + health.repair;
  const healthyPercentage = totalHealth > 0 ? Math.round((health.operational / totalHealth) * 100) : 0;

  // Format relative time (for activity logs)
  const getRelativeTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      
      {/* TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input 
            type="text" 
            placeholder="Search assets, users, or tickets..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white hover:bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
          />
        </div>
        
        <div className="flex items-center gap-4.5 justify-end">
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all">
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            <Bell size={18} />
          </button>
          
          <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* DASHBOARD TITLES */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time status of your enterprise resource ecosystem.</p>
      </div>

      {loading ? (
        <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-xs font-semibold">Loading dashboard overview...</span>
        </div>
      ) : (
        <>
          {/* STAT CARDS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            
            {/* CARD: Total Assets */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Package size={20} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
                  <TrendingUp size={12} />
                  <span>+12%</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Assets</span>
                <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{stats.total.toLocaleString()}</h3>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '70%' }} />
              </div>
            </div>

            {/* CARD: Available */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-slate-50 text-slate-600 rounded-xl border border-slate-200">
                  <Check size={20} />
                </div>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200 uppercase tracking-wider">
                  Live View
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Available</span>
                <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{stats.available.toLocaleString()}</h3>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-slate-450 bg-slate-400 h-1.5 rounded-full" style={{ width: '35%' }} />
              </div>
            </div>

            {/* CARD: Allocated */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                  <User size={20} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 uppercase tracking-wide">
                  <TrendingUp size={12} />
                  <span>+4%</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Allocated</span>
                <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{stats.allocated.toLocaleString()}</h3>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }} />
              </div>
            </div>

            {/* CARD: Active Bookings */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <Calendar size={20} />
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 uppercase tracking-wide">
                  <TrendingDown size={12} />
                  <span>-2%</span>
                </span>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Bookings</span>
                <h3 className="text-2xl font-extrabold text-slate-850 mt-1">{stats.bookings.toLocaleString()}</h3>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-1.5 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>

          </div>

          {/* MIDDLE SECTION (GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* ASSET HEALTH ANALYSIS (col-span-2) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Asset Health Analysis</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Serviceability metrics across global inventory.</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 justify-around pt-2">
                {/* Donut Diagram */}
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 transform -rotate-90">
                    {/* Background Ring */}
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="56" 
                      stroke="#f1f5f9" 
                      strokeWidth="11" 
                      fill="transparent" 
                    />
                    {/* Foreground Progress Ring */}
                    <circle 
                      cx="72" 
                      cy="72" 
                      r="56" 
                      stroke="#2563eb" 
                      strokeWidth="11" 
                      fill="transparent" 
                      strokeDasharray={351.8}
                      strokeDashoffset={351.8 * (1 - (healthyPercentage / 100))}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-slate-800">{healthyPercentage}%</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Healthy</span>
                  </div>
                </div>

                {/* Health Stat Indicators */}
                <div className="grid grid-cols-2 gap-3.5 w-full md:max-w-xs">
                  
                  {/* Operational Box */}
                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Operational</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800">{health.operational.toLocaleString()}</h4>
                  </div>

                  {/* Maintenance Box */}
                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Maintenance</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800">{health.maintenance.toLocaleString()}</h4>
                  </div>

                  {/* Decommissioned Box */}
                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-semibold">Decommissioned</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800">{health.decommissioned.toLocaleString()}</h4>
                  </div>

                  {/* Awaiting Repair Box */}
                  <div className="bg-[#f8fafc] rounded-xl p-3 border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-semibold">Awaiting Repair</span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-800">{health.repair.toLocaleString()}</h4>
                  </div>

                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY (col-span-1) */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-base">Recent Activity</h3>
                
                <div className="space-y-3.5">
                  {liveActivities.length > 0 ? (
                    liveActivities.slice(0, 4).map((log) => {
                      const isReturn = log.action === 'ALLOCATION_RETURN';
                      const isCreate = log.action === 'ALLOCATION_CREATE';
                      return (
                        <div key={log.id} className="flex gap-3 text-xs">
                          <div className={`p-2 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border ${
                            isReturn ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            <Zap size={16} />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">
                              {isReturn ? 'Asset Returned' : isCreate ? 'New Allocation' : 'Activity Log'}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-semibold mt-1 block leading-tight truncate">
                              {log.details}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                              {getRelativeTime(log.timestamp)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Fallback activity list if none exists */
                    <div className="text-center text-slate-400 italic py-8">
                      No recent activities found.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* UPCOMING RETURNS SECTION */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Upcoming Returns</h3>
                <p className="text-xs text-slate-400 mt-0.5">Track hardware coming off-lease or assignment today.</p>
              </div>
            </div>

            {/* TABLE CONTAINER */}
            <div className="overflow-x-auto border border-slate-200/60 rounded-xl bg-white shadow-inner">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-5 py-3">Asset Tag</th>
                    <th className="px-5 py-3">Item Name</th>
                    <th className="px-5 py-3">Assignee</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3">Condition</th>
                    <th className="px-5 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {upcomingReturns.length > 0 ? (
                    upcomingReturns.slice(0, 5).map((alloc) => (
                      <tr key={alloc.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 text-blue-600 font-bold hover:underline cursor-pointer">
                          {alloc.asset?.assetTag}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <Laptop size={14} className="text-slate-400" />
                            <span>{alloc.asset?.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center">
                              {alloc.user?.name ? alloc.user.name.split(' ').map(n => n[0]).join('') : 'U'}
                            </div>
                            <span>{alloc.user?.name || 'Unassigned'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold text-[10px]">
                            {new Date(alloc.dueDate).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>{alloc.asset?.condition || 'Excellent'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100">
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-slate-400 italic">
                        No upcoming asset returns scheduled with due dates.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-400 font-semibold">
                Showing {upcomingReturns.length > 5 ? 5 : upcomingReturns.length} of {upcomingReturns.length} upcoming returns
              </span>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default DashboardStub;
