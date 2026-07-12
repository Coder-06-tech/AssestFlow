import React, { useState, useEffect } from 'react';
import * as allocationApi from '../services/allocationService';
import * as assetApi from '../services/assetService';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  Plus, 
  Filter, 
  Download, 
  Laptop,
  Smartphone,
  Camera,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FileText,
  Trash2,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  ArrowUpFromLine,
  RefreshCcw,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const AllocationsPage = () => {
  const [allocations, setAllocations] = useState([]);
  const [availableAssets, setAvailableAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'resolve'
  const [selectedAssetForConflict, setSelectedAssetForConflict] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    assetId: '',
    userId: '',
    dueDate: '',
    notes: ''
  });

  // Fetch all necessary data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [allocRes, assetsRes, empsRes, logsRes] = await Promise.all([
        allocationApi.getAllocations(),
        assetApi.getAssets(),
        assetApi.getEmployees(),
        allocationApi.getActivityLogs()
      ]);

      if (allocRes && allocRes.success) setAllocations(allocRes.data);
      
      // Filter out assets that are AVAILABLE for new allocations
      if (assetsRes && assetsRes.success) {
        const avail = assetsRes.data.filter(a => a.status === 'AVAILABLE');
        setAvailableAssets(avail);
      }
      
      if (empsRes && empsRes.success) setEmployees(empsRes.data);
      if (logsRes && logsRes.success) setActivityLogs(logsRes.data);
    } catch (err) {
      toast.error('Failed to load allocations data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle Return Asset (mark allocation as returned)
  const handleReturnAsset = async (id) => {
    if (!window.confirm('Are you sure you want to mark this asset as returned?')) return;
    try {
      setLoading(true);
      const res = await allocationApi.returnAllocation(id, {
        conditionOnReturn: 'Good',
        notes: 'Returned from inventory panel'
      });
      if (res.success) {
        toast.success('Asset marked as returned successfully.');
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to return asset.');
    } finally {
      setLoading(false);
    }
  };

  // Handle New Allocation Submission
  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.assetId || !formData.userId) {
      toast.error('Asset and User selection are required.');
      return;
    }

    try {
      setLoading(true);
      const res = await allocationApi.createAllocation(formData);
      if (res.success) {
        toast.success('Asset allocated successfully!');
        setIsModalOpen(false);
        setFormData({ assetId: '', userId: '', dueDate: '', notes: '' });
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to allocate asset.');
    } finally {
      setLoading(false);
    }
  };

  // Group allocations by assetId to detect double allocation conflicts
  const assetAllocationsMap = allocations.reduce((acc, current) => {
    if (current.status === 'ACTIVE') {
      if (!acc[current.assetId]) {
        acc[current.assetId] = [];
      }
      acc[current.assetId].push(current);
    }
    return acc;
  }, {});

  // Compute Conflict count (assets allocated to multiple active users)
  const conflictAssets = Object.keys(assetAllocationsMap).filter(
    assetId => assetAllocationsMap[assetId].length > 1
  );

  // Filter allocations for main display (keeping unique active allocations and marking conflicts)
  const activeAllocations = [];
  const processedAssetIds = new Set();

  allocations.forEach(alloc => {
    if (alloc.status === 'ACTIVE') {
      if (processedAssetIds.has(alloc.assetId)) {
        return; // Don't show duplicates individually; they are grouped in the conflict view
      }
      processedAssetIds.add(alloc.assetId);

      const isConflict = assetAllocationsMap[alloc.assetId]?.length > 1;
      activeAllocations.push({
        ...alloc,
        isConflict,
        conflictDetails: isConflict ? assetAllocationsMap[alloc.assetId] : null
      });
    }
  });

  // Filter based on search query
  const filteredAllocations = activeAllocations.filter(alloc => {
    const query = searchQuery.toLowerCase();
    const assetName = alloc.asset?.name?.toLowerCase() || '';
    const assetTag = alloc.asset?.assetTag?.toLowerCase() || '';
    const userName = alloc.user?.name?.toLowerCase() || '';
    return assetName.includes(query) || assetTag.includes(query) || userName.includes(query);
  });

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('laptop') || name.includes('macbook') || name.includes('thinkpad')) {
      return <Laptop size={18} className="text-slate-500" />;
    } else if (name.includes('phone') || name.includes('tablet') || name.includes('ipad') || name.includes('iphone') || name.includes('mobile')) {
      return <Smartphone size={18} className="text-slate-500" />;
    } else if (name.includes('camera') || name.includes('lens')) {
      return <Camera size={18} className="text-slate-500" />;
    } else {
      return <Laptop size={18} className="text-slate-500" />;
    }
  };

  // Helper to format Date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

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
      
      {/* TOP HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <h1 className="text-lg font-bold text-slate-800">Allocations</h1>
        
        <div className="flex items-center gap-4.5 justify-end">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search allocations, users, or assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-white hover:bg-slate-50/50 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
            />
          </div>

          <button 
            onClick={() => { setModalType('create'); setIsModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
          >
            <Plus size={14} />
            <span>New Allocation</span>
          </button>

          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
            <Bell size={18} />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-all">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>

      {/* METRICS GRID ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Total Allocated */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Allocated</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800">
                {allocations.filter(a => a.status === 'ACTIVE').length.toLocaleString()}
              </span>
              <span className="text-[10px] font-bold text-emerald-500">+12%</span>
            </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: '65%' }} />
          </div>
        </div>

        {/* Card 2: Pending Transfers */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Transfers</span>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-850 font-bold text-slate-800">34</span>
              <ArrowRightLeft size={16} className="text-slate-400" />
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block">12 awaiting approval</span>
        </div>

        {/* Card 3: Returned Today */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Returned Today</span>
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-850 font-bold text-slate-800">156</span>
              <span className="text-[10px] text-slate-450 text-slate-400 font-semibold">Avg. 142/day</span>
            </div>
          </div>
          {/* Simple Mock Sparkline */}
          <div className="flex items-end gap-1 h-5 pt-1">
            <div className="w-1.5 h-3 bg-blue-200 rounded-sm" />
            <div className="w-1.5 h-4 bg-blue-200 rounded-sm" />
            <div className="w-1.5 h-2 bg-blue-200 rounded-sm" />
            <div className="w-1.5 h-5 bg-blue-600 rounded-sm" />
          </div>
        </div>

        {/* Card 4: Conflict Alerts */}
        <div className={`border rounded-2xl p-5 shadow-sm space-y-1.5 transition-all ${
          conflictAssets.length > 0 ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-slate-200'
        }`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conflict Alerts</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold ${conflictAssets.length > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
              {String(conflictAssets.length).padStart(2, '0')}
            </span>
            {conflictAssets.length > 0 && <AlertTriangle size={16} className="text-rose-500" />}
          </div>
          <span className={`text-[10px] font-semibold block ${conflictAssets.length > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
            {conflictAssets.length > 0 ? 'Critical attention required' : 'No conflicts detected'}
          </span>
        </div>

      </div>

      {/* ACTIVE ALLOCATIONS CONTAINER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Allocations</h2>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-655 text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter size={13} />
              <span>Filters</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-655 text-slate-600 hover:bg-slate-50 transition-colors">
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* ALLOCATIONS LIST */}
        <div className="space-y-3.5">
          {filteredAllocations.map((alloc) => {
            return (
              <div 
                key={alloc.id} 
                className={`bg-white border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-all ${
                  alloc.isConflict ? 'border-rose-500 ring-1 ring-rose-500/20' : 'border-slate-200'
                }`}
              >
                {/* Asset Info */}
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl border shrink-0 ${
                    alloc.isConflict ? 'bg-rose-100 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-100'
                  }`}>
                    {getCategoryIcon(alloc.asset?.category?.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{alloc.asset?.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Asset Tag: {alloc.asset?.assetTag}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex flex-col gap-1 min-w-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">User</span>
                  {alloc.isConflict ? (
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {alloc.conflictDetails.map((c, i) => (
                        <div 
                          key={c.id} 
                          title={c.user?.name}
                          className="h-6.5 w-6.5 rounded-full bg-blue-100 border border-white text-blue-700 font-bold text-[8px] flex items-center justify-center shrink-0"
                        >
                          {c.user?.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      ))}
                      <span className="text-[9px] text-slate-450 font-bold pl-2 self-center">
                        Multiple Users
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <div className="h-6.5 w-6.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[8.5px] flex items-center justify-center border border-blue-200 shrink-0">
                        {alloc.user?.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="truncate max-w-[100px]">{alloc.user?.name}</span>
                    </div>
                  )}
                </div>

                {/* Status or Allocated On */}
                <div className="flex flex-col gap-1 min-w-[120px]">
                  {alloc.isConflict ? (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</span>
                      <span className="text-xs font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span>Double Allocation</span>
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allocated On</span>
                      <span className="text-xs font-semibold text-slate-700">{formatDate(alloc.allocatedAt)}</span>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 justify-end min-w-[140px]">
                  {alloc.isConflict ? (
                    <button 
                      onClick={() => {
                        setSelectedAssetForConflict(alloc.asset);
                        setModalType('resolve');
                        setIsModalOpen(true);
                      }}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-rose-500/10"
                    >
                      Resolve Conflict
                    </button>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleReturnAsset(alloc.id)}
                        className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        title="Return Asset"
                      >
                        Return Asset
                      </button>
                      <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer">
                        <MoreHorizontal size={14} />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}

          {filteredAllocations.length === 0 && (
            <div className="max-w-2xl mx-auto space-y-4 py-8">
              {/* Alert 1: No Active Allocations Found */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-left">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-amber-800 text-xs">No Active Allocations Found</span>
                  <span className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                    There are currently no active hardware assignments in the database matching your query. Click the "+ New Allocation" button at the top to assign an available device to a custodian.
                  </span>
                </div>
              </div>
              {/* Alert 2: Real-time Auditing Active */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 text-left">
                <CheckCircle2 className="text-blue-600 shrink-0 mt-0.5" size={18} />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-blue-800 text-xs">Real-time Auditing & Conflict Checks Active</span>
                  <span className="text-[11px] text-blue-700 font-semibold leading-relaxed">
                    The allocation engine is live. Setting assignments automatically notifies employees, records audit logs, and monitors for double-allocations or scheduling conflicts.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RECENT ACTIVITY TIMELINE CARD */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Recent Activity</h3>
          <button className="text-xs font-bold text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5">
            <span>View Full Log</span>
            <ChevronRight size={12} />
          </button>
        </div>

        {/* Timeline body */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          
          {activityLogs.length > 0 ? (
            activityLogs.slice(0, 4).map((log) => {
              const isReturn = log.action === 'ALLOCATION_RETURN';
              const isCreate = log.action === 'ALLOCATION_CREATE';
              
              return (
                <div key={log.id} className="relative text-xs">
                  {/* Timeline dot */}
                  <div className={`absolute -left-6 top-0.5 h-5.5 w-5.5 rounded-full border border-white flex items-center justify-center text-white shrink-0 ${
                    isReturn ? 'bg-blue-600' : isCreate ? 'bg-slate-400' : 'bg-rose-500'
                  }`}>
                    {isReturn ? <ArrowUpFromLine size={10} /> : isCreate ? <Plus size={10} /> : <AlertTriangle size={10} />}
                  </div>
                  
                  <div className="flex justify-between items-baseline gap-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">
                        {isReturn ? 'Asset Returned' : isCreate ? 'New Allocation Created' : 'Activity Triggered'}
                      </span>
                      <span className="text-slate-500 font-semibold mt-0.5">{log.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                      {getRelativeTime(log.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            /* Fallback Mock logs matching the mockup precisely if no DB logs exist */
            <>
              <div className="relative text-xs">
                <div className="absolute -left-6 top-0.5 h-5.5 w-5.5 rounded-full bg-blue-600 border border-white flex items-center justify-center text-white shrink-0">
                  <ArrowUpFromLine size={10} />
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Asset Returned: MacBook Pro M1</span>
                    <span className="text-slate-500 font-semibold mt-0.5">Returned by Sarah Connor to Storage Hub C.</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">2 mins ago</span>
                </div>
              </div>

              <div className="relative text-xs">
                <div className="absolute -left-6 top-0.5 h-5.5 w-5.5 rounded-full bg-blue-500 border border-white flex items-center justify-center text-white shrink-0">
                  <ArrowRightLeft size={10} />
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">Ownership Transfer: Asset ASSET-882</span>
                    <span className="text-slate-500 font-semibold mt-0.5">Transferred from Engineering to QA Dept.</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">45 mins ago</span>
                </div>
              </div>

              <div className="relative text-xs">
                <div className="absolute -left-6 top-0.5 h-5.5 w-5.5 rounded-full bg-rose-500 border border-white flex items-center justify-center text-white shrink-0">
                  <AlertTriangle size={10} />
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">New Conflict Detected</span>
                    <span className="text-slate-500 font-semibold mt-0.5">Asset ASSET-7729 was allocated to multiple users.</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">2 hours ago</span>
                </div>
              </div>

              <div className="relative text-xs">
                <div className="absolute -left-6 top-0.5 h-5.5 w-5.5 rounded-full bg-slate-400 border border-white flex items-center justify-center text-white shrink-0">
                  <Plus size={10} />
                </div>
                <div className="flex justify-between items-baseline gap-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-800">New Allocation Created</span>
                    <span className="text-slate-500 font-semibold mt-0.5">User Marcus Chen assigned to Logitech MX Master 3S.</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">Yesterday, 4:30 PM</span>
                </div>
              </div>
            </>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL OVERLAY: CREATE NEW ALLOCATION or RESOLVE CONFLICT */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          
          {/* Modal Content Card */}
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800">
                {modalType === 'create' ? 'Allocate New Asset' : 'Resolve Allocation Conflict'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Create Form */}
            {modalType === 'create' && (
              <form onSubmit={handleAllocateSubmit} className="p-6 space-y-4">
                
                {/* Asset Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Available Asset
                  </label>
                  <select
                    value={formData.assetId}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700 cursor-pointer"
                    required
                  >
                    <option value="">Choose Asset...</option>
                    {availableAssets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} [{a.assetTag}]</option>
                    ))}
                  </select>
                </div>

                {/* User Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Assign Owner (Custodian)
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700 cursor-pointer"
                    required
                  >
                    <option value="">Choose Employee...</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700 cursor-pointer"
                  />
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Enter allocation reason, condition notes, etc..."
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-slate-700"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-500/10"
                  >
                    <CheckCircle2 size={13} />
                    <span>Allocate Asset</span>
                  </button>
                </div>

              </form>
            )}

            {/* Modal Body: Resolve Conflict */}
            {modalType === 'resolve' && selectedAssetForConflict && (
              <div className="p-6 space-y-5">
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex gap-3 text-xs">
                  <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-rose-800">Conflict: Double Allocation</span>
                    <span className="text-rose-700 font-medium leading-relaxed">
                      The asset <strong>{selectedAssetForConflict.name} ({selectedAssetForConflict.assetTag})</strong> is currently allocated to multiple owners active simultaneously. Select the valid owner below to resolve this conflict. The other allocation will be marked as returned.
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Custodians</h4>
                  
                  <div className="space-y-2">
                    {assetAllocationsMap[selectedAssetForConflict.id]?.map((alloc) => (
                      <div 
                        key={alloc.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-2xl hover:bg-slate-50/50 text-xs font-semibold"
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center border border-blue-200">
                            {alloc.user?.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{alloc.user?.name}</span>
                            <span className="text-[9px] text-slate-400 font-semibold">Allocated: {formatDate(alloc.allocatedAt)}</span>
                          </div>
                        </div>

                        <button 
                          onClick={async () => {
                            // Resolve conflict by marking all other active allocations as returned
                            const others = assetAllocationsMap[selectedAssetForConflict.id].filter(a => a.id !== alloc.id);
                            try {
                              setLoading(true);
                              await Promise.all(
                                others.map(o => allocationApi.returnAllocation(o.id, {
                                  conditionOnReturn: 'Good',
                                  notes: 'Returned automatically to resolve double allocation conflict.'
                                }))
                              );
                              toast.success('Conflict resolved successfully!');
                              setIsModalOpen(false);
                              fetchData();
                            } catch (err) {
                              toast.error('Failed to resolve conflict.');
                            } finally {
                              setLoading(false);
                            }
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Check size={12} className="stroke-[2.5]" />
                          <span>Keep Custodian</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-100 pt-4 mt-2">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default AllocationsPage;
