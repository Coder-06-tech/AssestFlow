import React, { useState, useEffect } from 'react';
import * as assetApi from '../services/assetService';
import { 
  Search, 
  HelpCircle, 
  Bell, 
  Plus, 
  Filter, 
  Download, 
  LayoutGrid, 
  Laptop,
  Smartphone,
  Camera,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  MinusCircle,
  AlertCircle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'react-toastify';

const AssetsPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'register'
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories fetched from backend for dropdown
  const [dbCategories, setDbCategories] = useState([]);

  // Search & Filter states for list view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Simple Form state containing only the 5 requested fields
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    categoryId: '',
    status: 'AVAILABLE',
    location: ''
  });

  // Fetch inventory list and categories dropdown
  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsRes, catsRes] = await Promise.all([
        assetApi.getAssets(),
        assetApi.getCategories()
      ]);

      if (assetsRes && assetsRes.success) setAssets(assetsRes.data);
      if (catsRes && catsRes.success) setDbCategories(catsRes.data);
    } catch (err) {
      toast.error('Failed to load assets data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to generate a random Tag ID
  const generateRandomTag = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData(prev => ({
      ...prev,
      assetTag: `AF-${randomNum}`
    }));
    toast.success('Generated new Tag ID');
  };

  // Submit asset registration
  const handleSubmitRegistration = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Asset Name is required');
      return;
    }
    if (!formData.categoryId) {
      toast.error('Please select an Asset Category');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        assetTag: formData.assetTag || `AF-${Math.floor(1000 + Math.random() * 9000)}`,
        categoryId: formData.categoryId,
        status: formData.status,
        location: formData.location || 'Main HQ',
        condition: 'Good' // Database default required field
      };

      const response = await assetApi.createAsset(payload);

      if (response.success) {
        toast.success(`Registered Asset "${formData.name}" successfully!`);
        setFormData({
          name: '',
          assetTag: '',
          categoryId: '',
          status: 'AVAILABLE',
          location: ''
        });
        setView('list');
        fetchData();
      } else {
        toast.error(response.message || 'Failed to register asset.');
      }
    } catch (err) {
      toast.error(err.message || 'Error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Filter assets based on search query and dropdown selections
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = 
      selectedCategory === 'All' || 
      (asset.category && asset.category.name === selectedCategory);

    const matchesStatus = 
      selectedStatus === 'All' || 
      asset.status === selectedStatus;

    const matchesDepartment = 
      selectedDepartment === 'All' || 
      (asset.department && asset.department.name === selectedDepartment);

    return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
  });

  // Unique lists for filter dropdowns
  const categories = ['All', ...new Set(assets.map(a => a.category?.name).filter(Boolean))];
  const statuses = ['All', ...new Set(assets.map(a => a.status).filter(Boolean))];
  const departments = ['All', ...new Set(assets.map(a => a.department?.name).filter(Boolean))];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'IN_USE':
      case 'ALLOCATED':
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'UNDER_MAINTENANCE':
      case 'MAINTENANCE':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DECOMMISSIONED':
        return 'bg-slate-100 text-slate-650 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getCategoryIcon = (categoryName) => {
    const name = categoryName?.toLowerCase() || '';
    if (name.includes('laptop') || name.includes('macbook') || name.includes('thinkpad')) {
      return <Laptop size={14} className="text-slate-400" />;
    } else if (name.includes('phone') || name.includes('tablet') || name.includes('ipad') || name.includes('iphone') || name.includes('mobile')) {
      return <Smartphone size={14} className="text-slate-400" />;
    } else if (name.includes('camera') || name.includes('lens')) {
      return <Camera size={14} className="text-slate-400" />;
    } else {
      return <Laptop size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. LIST VIEW */}
      {/* ========================================================================= */}
      {view === 'list' && (
        <>
          {/* TOP HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
              <input 
                type="text" 
                placeholder="Search assets by tag, name, or serial number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-white hover:bg-slate-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 placeholder-slate-400"
              />
            </div>
            
            <div className="flex items-center gap-4.5 justify-end">
              <button className="p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all">
                <HelpCircle size={18} />
              </button>
              
              <button className="relative p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all">
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                <Bell size={18} />
              </button>
              
              <div className="h-6 w-px bg-slate-200" />
              
              <button 
                onClick={() => setView('register')}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-semibold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
              >
                <Plus size={16} />
                <span>Register Asset</span>
              </button>
            </div>
          </div>

          {/* FILTER CONTROLS ROW */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500">
              
              {/* Filter: Category */}
              <div className="flex items-center gap-2">
                <span>Category:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-50 shadow-sm"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Filter: Status */}
              <div className="flex items-center gap-2">
                <span>Status:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-50 shadow-sm"
                >
                  {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>

              {/* Filter: Department */}
              <div className="flex items-center gap-2">
                <span>Department:</span>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none cursor-pointer hover:bg-slate-50 shadow-sm"
                >
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

            </div>

            {/* View Grid/Filter Buttons */}
            <div className="flex items-center gap-2">
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                <Filter size={15} />
              </button>
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                <Download size={15} />
              </button>
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors">
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              <span className="text-xs font-semibold">Loading assets inventory...</span>
            </div>
          ) : (
            /* INVENTORY LIST TABLE */
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="px-5 py-3.5 text-center w-12">
                        <input type="checkbox" className="rounded border-slate-300 focus:ring-blue-500/20" />
                      </th>
                      <th className="px-5 py-3.5">Asset Tag</th>
                      <th className="px-5 py-3.5">Name</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Assigned To</th>
                      <th className="px-5 py-3.5">Department</th>
                      <th className="px-5 py-3.5">Location</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-center w-16">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredAssets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-5 py-4 text-center">
                          <input type="checkbox" className="rounded border-slate-300 focus:ring-blue-500/20" />
                        </td>
                        <td className="px-5 py-4 text-blue-600 font-bold hover:underline cursor-pointer">
                          {asset.assetTag}
                        </td>
                        <td className="px-5 py-4 text-slate-800">
                          {asset.name}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {getCategoryIcon(asset.category?.name)}
                            <span>{asset.category?.name || 'Uncategorized'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          {asset.User ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 font-bold text-[9px] flex items-center justify-center border border-blue-200">
                                {asset.User.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span>{asset.User.name}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-slate-400 italic font-medium">
                              <MinusCircle size={14} />
                              <span>Unassigned</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-slate-650">
                          {asset.department?.name || 'Global'}
                        </td>
                        <td className="px-5 py-4 text-slate-500">
                          {asset.location}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-0.5 border rounded-full font-bold text-[10px] uppercase tracking-wide ${getStatusBadge(asset.status)}`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 cursor-pointer">
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredAssets.length === 0 && (
                      <tr>
                        <td colSpan="9" className="text-center py-16 text-slate-400 italic">
                          <div className="flex flex-col items-center gap-1">
                            <AlertCircle size={24} />
                            <span>No assets found matching the search/filter criteria.</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* TABLE PAGINATION FOOTER */}
              <div className="flex items-center justify-between p-4 bg-white border-t border-slate-100">
                <span className="text-[11px] text-slate-400 font-bold">
                  Showing {filteredAssets.length} of {assets.length} assets
                </span>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                    <ChevronLeft size={12} />
                    <span>Previous</span>
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-colors">
                    <span>Next</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. SIMPLIFIED REGISTER NEW ASSET FORM */}
      {/* ========================================================================= */}
      {view === 'register' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* HEADER ROW */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('list')}
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <h1 className="text-lg font-bold text-slate-850 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <span>Register New Asset</span>
              </h1>
            </div>
          </div>

          {/* SIMPLIFIED FORM CARD */}
          <form onSubmit={handleSubmitRegistration} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="grid grid-cols-1 gap-5">
              
              {/* Asset Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Asset Name *
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. MacBook Pro 16"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                  required
                />
              </div>

              {/* Tag ID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tag ID
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. AF-8829-L"
                    value={formData.assetTag}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetTag: e.target.value }))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-semibold"
                  />
                  <button 
                    type="button"
                    onClick={generateRandomTag}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-xl transition-all cursor-pointer"
                    title="Generate Random Tag ID"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Category *
                </label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer text-slate-700"
                  required
                >
                  <option value="">Select Category</option>
                  {dbCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer text-slate-700"
                >
                  <option value="AVAILABLE">AVAILABLE</option>
                  <option value="ALLOCATED">ALLOCATED / IN USE</option>
                  <option value="RESERVED">RESERVED</option>
                  <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                  <option value="LOST">LOST</option>
                  <option value="RETIRED">RETIRED</option>
                  <option value="DISPOSED">DISPOSED</option>
                </select>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Location
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. San Francisco HQ"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>

            </div>

            {/* ACTION BUTTONS ROW */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
              <button 
                type="button"
                onClick={() => setView('list')}
                className="px-4.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:opacity-55"
              >
                <CheckCircle2 size={13} />
                <span>{loading ? 'Registering...' : 'Register Asset'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AssetsPage;
