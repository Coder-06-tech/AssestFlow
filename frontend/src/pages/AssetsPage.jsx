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
  ArrowRight,
  UploadCloud,
  Check,
  RotateCcw,
  FileText,
  Trash2,
  Sliders,
  Sparkles,
  Building,
  UserCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

const AssetsPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'register'
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lists for dropdowns (fetched from backend)
  const [dbCategories, setDbCategories] = useState([]);
  const [dbDepartments, setDbDepartments] = useState([]);
  const [dbEmployees, setDbEmployees] = useState([]);

  // Search & Filter states for list view
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Wizard registration states
  const [wizardStep, setWizardStep] = useState(1);
  const [savingDraft, setSavingDraft] = useState(false);
  const [autosavedTime, setAutosavedTime] = useState('Autosaved a few seconds ago...');

  // Registration Form state
  const [formData, setFormData] = useState({
    name: '',
    assetTag: '',
    serialNumber: '',
    description: '',
    purchaseDate: '',
    categoryId: '',
    departmentId: '',
    assignedToId: '',
    location: '',
    condition: 'Good',
    purchaseCost: '',
    warrantyExpiry: '',
    photos: [], // Array of object URLs
    documents: [], // Array of file names
    complianceVerified: true,
    regionalFormat: true,
    isoCompliance: true
  });

  // Fetch initial dropdown and inventory data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsRes, catsRes, deptsRes, empsRes] = await Promise.all([
        assetApi.getAssets(),
        assetApi.getCategories(),
        assetApi.getDepartments(),
        assetApi.getEmployees()
      ]);

      if (assetsRes && assetsRes.success) setAssets(assetsRes.data);
      if (catsRes && catsRes.success) setDbCategories(catsRes.data);
      if (deptsRes && deptsRes.success) setDbDepartments(deptsRes.data);
      if (empsRes && empsRes.success) setDbEmployees(empsRes.data);
    } catch (err) {
      toast.error('Failed to load assets data. Please verify your connection.');
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
    const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    setFormData(prev => ({
      ...prev,
      assetTag: `ASSET-2026-${randomNum}-${letter}`
    }));
    toast.success('Generated new Tag ID');
  };

  // Handle Photo uploading
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.photos.length + files.length > 5) {
      toast.warning('You can upload a maximum of 5 photos.');
      return;
    }

    const newPhotoUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotoUrls]
    }));
  };

  // Remove Photo
  const removePhoto = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Handle Document uploading
  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const fileNames = files.map(f => f.name);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...fileNames]
    }));
    toast.success('Document uploaded');
  };

  // Remove Document
  const removeDoc = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Handle Form Submission (Final Step)
  const handleSubmitRegistration = async () => {
    try {
      setLoading(true);
      
      const payload = {
        name: formData.name,
        assetTag: formData.assetTag,
        categoryId: formData.categoryId,
        departmentId: formData.departmentId || null,
        assignedToId: formData.assignedToId || null,
        location: formData.location || 'Main Office',
        condition: formData.condition,
        status: formData.assignedToId ? 'ALLOCATED' : 'AVAILABLE',
        serialNumber: formData.serialNumber || null,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).toISOString() : null,
        purchaseCost: formData.purchaseCost ? parseFloat(formData.purchaseCost) : null,
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry).toISOString() : null,
        imagePath: formData.photos[0] || null,
        documentPaths: formData.documents.length > 0 ? formData.documents : null
      };

      const response = await assetApi.createAsset(payload);

      if (response.success) {
        toast.success(`Registered Asset "${formData.name}" successfully!`);
        // Reset wizard and form
        setFormData({
          name: '',
          assetTag: '',
          serialNumber: '',
          description: '',
          purchaseDate: '',
          categoryId: '',
          departmentId: '',
          assignedToId: '',
          location: '',
          condition: 'Good',
          purchaseCost: '',
          warrantyExpiry: '',
          photos: [],
          documents: [],
          complianceVerified: true,
          regionalFormat: true,
          isoCompliance: true
        });
        setWizardStep(1);
        setView('list');
        // Refresh items list
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

  // Handle draft saving
  const handleSaveDraft = () => {
    setSavingDraft(true);
    setTimeout(() => {
      setSavingDraft(false);
      setAutosavedTime('Saved draft locally just now');
      toast.success('Asset draft saved successfully.');
    }, 800);
  };

  // Filter assets based on search query and dropdown selections
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.assetTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.location && asset.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

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
      return <Laptop size={14} className="text-slate-400" />; // Fallback icon
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
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-655 text-slate-600 transition-colors">
                <Filter size={15} />
              </button>
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-655 text-slate-600 transition-colors">
                <Download size={15} />
              </button>
              <button className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-655 text-slate-600 transition-colors">
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
      {/* 2. REGISTER NEW ASSET WIZARD (MULTI-STEP) */}
      {/* ========================================================================= */}
      {view === 'register' && (
        <div className="space-y-6">
          {/* HEADER ROW */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { setView('list'); setWizardStep(1); }}
                className="p-2 border border-slate-200 hover:bg-slate-100 rounded-full text-slate-600 hover:text-slate-800 transition-all cursor-pointer shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>
              <h1 className="text-lg font-bold text-slate-850 flex items-center gap-2">
                <Plus size={18} className="text-blue-600" />
                <span>Register New Asset</span>
              </h1>
            </div>

            <div className="flex items-center gap-4 justify-end">
              <div className="relative w-48 md:w-60">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 text-slate-400 h-3.5 w-3.5" />
                <input 
                  type="text" 
                  placeholder="Global search..." 
                  className="w-full pl-8.5 pl-8 pr-3 py-1.5 border border-slate-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                />
              </div>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                <Bell size={16} />
              </button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                <HelpCircle size={16} />
              </button>
            </div>
          </div>

          {/* STEP INDICATOR WIZARD BAR */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute left-12 right-12 top-[17px] h-0.5 bg-slate-100 z-0" />
              
              {/* Step indicator items */}
              {[
                { number: 1, name: 'Details' },
                { number: 2, name: 'Category' },
                { number: 3, name: 'Location' },
                { number: 4, name: 'Documents' },
                { number: 5, name: 'Review' }
              ].map((s) => {
                const isActive = wizardStep === s.number;
                const isCompleted = wizardStep > s.number;
                
                return (
                  <div key={s.number} className="flex items-center gap-3.5 z-10 flex-1 justify-center md:justify-start">
                    <div className={`h-9 w-9 rounded-full font-bold text-xs flex items-center justify-center border transition-all ${
                      isActive 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-4 ring-blue-500/10' 
                        : isCompleted
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                          : 'bg-white border-slate-250 border-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? <Check size={14} className="stroke-[2.5]" /> : s.number}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600 font-extrabold' : 'text-slate-400'}`}>
                        Step {s.number}
                      </span>
                      <span className={`text-xs font-semibold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                        {s.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP CONTENT CONTAINER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT / MAIN COLUMN (SPAN 2) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STEP 1: DETAILS */}
              {wizardStep === 1 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" />
                      <span>General Information</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Asset Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Asset Name *
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. Dell Latitude 7420"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
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
                          placeholder="ASSET-2026-001"
                          value={formData.assetTag}
                          onChange={(e) => setFormData(prev => ({ ...prev, assetTag: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 font-semibold"
                        />
                        <button 
                          onClick={generateRandomTag}
                          className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-xl transition-all cursor-pointer"
                          title="Generate Random Tag ID"
                        >
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Serial Number */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Serial Number
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. SN-8829-XL-001"
                        value={formData.serialNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                      />
                    </div>

                    {/* Purchase Date */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Purchase Date
                      </label>
                      <input 
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 cursor-pointer"
                      />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Asset Description
                      </label>
                      <textarea 
                        rows="4"
                        placeholder="Enter detailed physical description, usage history, and condition..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 2: CATEGORY */}
              {wizardStep === 2 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Sliders size={16} className="text-blue-600" />
                      <span>Category Assignment</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Category Selection */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Category *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {dbCategories.map(cat => {
                          const isSelected = formData.categoryId === cat.id;
                          return (
                            <div 
                              key={cat.id}
                              onClick={() => setFormData(prev => ({ ...prev, categoryId: cat.id }))}
                              className={`p-4 border rounded-2xl cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-3.5 ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50/15 ring-2 ring-blue-500/10' 
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className={`p-2.5 rounded-xl border ${
                                isSelected ? 'bg-blue-100 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                              }`}>
                                {getCategoryIcon(cat.name)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                                <span className="text-[10px] text-slate-400">Classify as {cat.name.toLowerCase()} asset</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Condition Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Condition
                      </label>
                      <select 
                        value={formData.condition}
                        onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                      >
                        <option value="New">New / In Box</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Fair">Fair / Used</option>
                        <option value="Damaged">Damaged</option>
                      </select>
                    </div>

                    {/* Purchase Cost */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Purchase Cost ($)
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        placeholder="e.g. 1499.99"
                        value={formData.purchaseCost}
                        onChange={(e) => setFormData(prev => ({ ...prev, purchaseCost: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 3: LOCATION */}
              {wizardStep === 3 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Building size={16} className="text-blue-600" />
                      <span>Location & Ownership</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Department Allocation */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Allocate Department
                      </label>
                      <select 
                        value={formData.departmentId}
                        onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Global / Unassigned</option>
                        {dbDepartments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Assigned User */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Assign Owner (Custodian)
                      </label>
                      <select 
                        value={formData.assignedToId}
                        onChange={(e) => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-200 bg-white rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer"
                      >
                        <option value="">Unassigned</option>
                        {dbEmployees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                        ))}
                      </select>
                    </div>

                    {/* Location Site */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Location / Site Address
                      </label>
                      <input 
                        type="text" 
                        placeholder="e.g. San Francisco HQ Room 302"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700"
                      />
                    </div>

                    {/* Warranty Expiry */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Warranty Expiry Date
                      </label>
                      <input 
                        type="date"
                        value={formData.warrantyExpiry}
                        onChange={(e) => setFormData(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                        className="w-full px-3 py-2 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 cursor-pointer"
                      />
                    </div>

                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENTS */}
              {wizardStep === 4 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText size={16} className="text-blue-600" />
                      <span>Asset Documentation</span>
                    </h3>
                  </div>

                  {/* Drag and Drop Zone */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-blue-450 hover:border-blue-400 hover:bg-blue-50/5 rounded-2xl p-10 transition-all group relative cursor-pointer">
                    <input 
                      type="file" 
                      multiple 
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleDocUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    />
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="p-3 rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                        <UploadCloud size={24} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">Drag & Drop or Browse Documents</span>
                        <span className="text-[10px] text-slate-400">Support PDF, Word, Excel up to 20MB per file.</span>
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Documents List */}
                  {formData.documents.length > 0 && (
                    <div className="space-y-2.5">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Uploaded Documents ({formData.documents.length})
                      </h4>
                      <div className="space-y-2">
                        {formData.documents.map((doc, idx) => (
                          <div 
                            key={idx}
                            className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50/30 rounded-xl text-xs font-semibold"
                          >
                            <div className="flex items-center gap-2 text-slate-700">
                              <FileText size={14} className="text-blue-500" />
                              <span className="truncate max-w-[200px] md:max-w-md">{doc}</span>
                            </div>
                            <button 
                              onClick={() => removeDoc(idx)}
                              className="p-1.5 border border-slate-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 hover:border-rose-200 rounded-lg transition-all cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: REVIEW */}
              {wizardStep === 5 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles size={16} className="text-blue-600" />
                      <span>Review Details</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    
                    {/* General Summary */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-3 md:col-span-2">
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">General Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Asset Name:</span>
                          <span className="font-bold text-slate-800">{formData.name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Tag ID:</span>
                          <span className="font-bold text-blue-600">{formData.assetTag || 'Generated Auto'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Serial Number:</span>
                          <span className="font-bold text-slate-700">{formData.serialNumber || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Purchase Date:</span>
                          <span className="font-bold text-slate-700">{formData.purchaseDate || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Category & Condition Summary */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-3">
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Category & Finance</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Category:</span>
                          <span className="font-bold text-slate-800">
                            {dbCategories.find(c => c.id === formData.categoryId)?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Condition:</span>
                          <span className="font-bold text-slate-800">{formData.condition}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Purchase Cost:</span>
                          <span className="font-bold text-slate-850 font-bold text-slate-800">
                            {formData.purchaseCost ? `$${parseFloat(formData.purchaseCost).toLocaleString()}` : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Location Summary */}
                    <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/30 space-y-3">
                      <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Location & Ownership</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Department:</span>
                          <span className="font-bold text-slate-800">
                            {dbDepartments.find(d => d.id === formData.departmentId)?.name || 'Global'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Custodian:</span>
                          <span className="font-bold text-slate-800">
                            {dbEmployees.find(e => e.id === formData.assignedToId)?.name || 'Unassigned'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-400">Location:</span>
                          <span className="font-bold text-slate-700">{formData.location || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* AUTOSAVE / BUTTONS ROW */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4.5 p-4 shadow-sm">
                <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{autosavedTime}</span>
                </span>
                
                <div className="flex items-center gap-3.5 justify-end">
                  <button 
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    className="px-4.5 px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm shadow-slate-100 cursor-pointer disabled:opacity-50"
                  >
                    {savingDraft ? 'Saving...' : 'Save Draft'}
                  </button>
                  
                  {wizardStep > 1 && (
                    <button 
                      onClick={() => setWizardStep(prev => prev - 1)}
                      className="px-4.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      Back
                    </button>
                  )}

                  {wizardStep < 5 ? (
                    <button 
                      onClick={() => {
                        if (wizardStep === 1 && !formData.name) {
                          toast.error('Asset Name is required');
                          return;
                        }
                        if (wizardStep === 2 && !formData.categoryId) {
                          toast.error('Select a Category to continue');
                          return;
                        }
                        setWizardStep(prev => prev + 1);
                      }}
                      className="flex items-center gap-1 px-4.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight size={12} />
                    </button>
                  ) : (
                    <button 
                      onClick={handleSubmitRegistration}
                      className="flex items-center gap-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
                    >
                      <span>Confirm & Register</span>
                      <UserCheck size={13} />
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* RIGHT SIDEBAR COLUMN */}
            <div className="space-y-6">
              
              {/* ASSET PHOTOS UPLOAD & PREVIEW */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Camera size={16} className="text-blue-600" />
                    <span>Asset Photos</span>
                  </h3>
                </div>

                {/* Drag/Drop Zone */}
                <div className="flex flex-col items-center justify-center border border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/5 rounded-2xl p-6 transition-all group relative cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  />
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="p-2.5 rounded-full bg-slate-50 border border-slate-100 text-slate-400 group-hover:bg-blue-100 group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                      <UploadCloud size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">Drag & Drop or Browse</span>
                      <span className="text-[9px] text-slate-450 text-slate-400">Support JPEG, PNG, HEIC up to 10MB per file. Max 5 photos.</span>
                    </div>
                  </div>
                </div>

                {/* Previews grids */}
                <div className="grid grid-cols-3 gap-3.5">
                  {formData.photos.map((photo, idx) => (
                    <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-150 border-slate-200 group">
                      <img src={photo} alt={`Asset preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 p-1 bg-neutral-900/60 hover:bg-rose-600 text-white rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100 z-30"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                  
                  {/* Empty skeletons to fill up 3 slots if needed */}
                  {Array.from({ length: Math.max(0, 3 - formData.photos.length) }).map((_, idx) => (
                    <div key={idx} className="h-20 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300">
                      <Camera size={16} />
                    </div>
                  ))}
                </div>
              </div>

              {/* REGIONAL COMPLIANCE CHECK */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Compliance Check
                </h4>
                <div className="space-y-3 text-xs font-semibold">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-650">ISO-2024 Compliance</span>
                    <input 
                      type="checkbox" 
                      checked={formData.isoCompliance}
                      onChange={(e) => setFormData(prev => ({ ...prev, isoCompliance: e.target.checked }))}
                      className="rounded border-slate-300 focus:ring-blue-500/20 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                    <span className="text-slate-650">Regional Tag Format</span>
                    <input 
                      type="checkbox" 
                      checked={formData.regionalFormat}
                      onChange={(e) => setFormData(prev => ({ ...prev, regionalFormat: e.target.checked }))}
                      className="rounded border-slate-300 focus:ring-blue-500/20 text-blue-600 cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-650">Compliance Verified</span>
                    <input 
                      type="checkbox" 
                      checked={formData.complianceVerified}
                      onChange={(e) => setFormData(prev => ({ ...prev, complianceVerified: e.target.checked }))}
                      className="rounded border-slate-300 focus:ring-blue-500/20 text-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-xl p-3 text-[10px] text-slate-500 font-medium">
                  <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span>Verify your regional serial number format against ISO-2024 compliance rules prior to final submission.</span>
                </div>
              </div>

              {/* RECENT ASSETS SIDEBAR LIST */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Recent Assets
                </h4>
                <div className="space-y-3">
                  {assets.slice(0, 3).map((a) => (
                    <div key={a.id} className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex flex-col">
                        <span className="text-slate-800 truncate max-w-[140px]">{a.name}</span>
                        <span className="text-[10px] text-slate-400">{a.assetTag}</span>
                      </div>
                      <span className={`px-2 py-0.5 border rounded-full font-bold text-[9px] uppercase tracking-wide ${getStatusBadge(a.status)}`}>
                        {a.status.toLowerCase().replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                  {assets.length === 0 && (
                    <div className="text-center py-6 text-slate-400 text-xs italic">
                      No assets registered yet.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default AssetsPage;
