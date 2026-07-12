import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../lib/api';
import { 
  Building, 
  Users, 
  ShieldAlert, 
  Search, 
  Plus, 
  Download, 
  MoreHorizontal, 
  Edit3, 
  UserX, 
  ChevronLeft, 
  ChevronRight, 
  FolderPlus, 
  ShieldCheck, 
  BadgeHelp, 
  Bell 
} from 'lucide-react';
import { DepartmentModal, CategoryModal, EmployeeModal } from '../components/org/orgModals';

const OrgSetup = () => {
  // Tabs: 'DEPARTMENTS' | 'CATEGORIES' | 'EMPLOYEES'
  const [activeTab, setActiveTab] = useState('DEPARTMENTS');

  // Backend Data
  const [departments, setDepartments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ totalEmployees: 0, departmentsCount: 0, adminUsers: 0 });

  // Loaders
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');

  // Modals state
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  // Active items for editing
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(null);

  // Pagination stubs
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      const [deptRes, catRes, empRes, statsRes] = await Promise.all([
        api.get('/org/departments'),
        api.get('/org/categories'),
        api.get('/org/employees'),
        api.get('/org/stats')
      ]);

      setDepartments(deptRes.data.data);
      setCategories(catRes.data.data);
      setEmployees(empRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      toast.error('Failed to load organizational setup data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter lists based on tab and selections
  const getFilteredData = () => {
    if (activeTab === 'DEPARTMENTS') {
      return departments.filter(d => 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.head?.name && d.head.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    if (activeTab === 'CATEGORIES') {
      return categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (activeTab === 'EMPLOYEES') {
      return employees.filter(e => {
        const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDeptFilter === 'ALL' || e.departmentId === selectedDeptFilter;
        const matchesStatus = selectedStatusFilter === 'ALL' || e.status === selectedStatusFilter;
        return matchesSearch && matchesDept && matchesStatus;
      });
    }
    return [];
  };

  const filteredData = getFilteredData();

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Mutator Actions: Department
  const handleDepartmentSubmit = async (data) => {
    try {
      if (data.id) {
        // Update
        await api.put(`/org/departments/${data.id}`, data);
        toast.success('Department updated successfully.');
      } else {
        // Create
        await api.post('/org/departments', data);
        toast.success('Department created successfully.');
      }
      setIsDeptModalOpen(false);
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to save department.';
      toast.error(errMsg);
    }
  };

  const handleDeactivateDepartment = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) return;
    try {
      await api.delete(`/org/departments/${id}`);
      toast.success('Department deactivated.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to deactivate department.');
    }
  };

  // Mutator Actions: Category
  const handleCategorySubmit = async (data) => {
    try {
      if (data.id) {
        await api.put(`/org/categories/${data.id}`, data);
        toast.success('Category updated successfully.');
      } else {
        await api.post('/org/categories', data);
        toast.success('Category created successfully.');
      }
      setIsCatModalOpen(false);
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to save category.';
      toast.error(errMsg);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/org/categories/${id}`);
      toast.success('Category deleted.');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete category.');
    }
  };

  // Mutator Actions: Employee promotion & status toggle
  const handleEmployeeSubmit = async (data) => {
    try {
      // Role update
      await api.patch(`/org/employees/${data.id}/role`, { role: data.role });
      // Status update
      await api.patch(`/org/employees/${data.id}/status`, { status: data.status });
      toast.success('Employee configurations saved.');
      setIsEmpModalOpen(false);
      loadData();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to update employee configurations.';
      toast.error(errMsg);
    }
  };

  // Header Add Action
  const handleAddClick = () => {
    if (activeTab === 'DEPARTMENTS') {
      setSelectedDept(null);
      setIsDeptModalOpen(true);
    } else if (activeTab === 'CATEGORIES') {
      setSelectedCat(null);
      setIsCatModalOpen(true);
    } else if (activeTab === 'EMPLOYEES') {
      toast.info('Please instruct new employees to register using the registration/signup page. Once registered, they will appear in this directory.');
    }
  };

  const handleExport = () => {
    toast.success(`${activeTab.toLowerCase()} list exported successfully (Stub).`);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Header Row matching mockup */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1e293b] tracking-tight">Organization</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your workforce, departments, and permission roles.</p>
        </div>

        {/* Global Toolbar Panel */}
        <div className="flex items-center gap-3 self-end lg:self-center">
          <div className="relative w-60">
            <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search globally..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#374bd5] hover:bg-[#2c3dbf] text-xs font-bold text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.2]" /> 
            {activeTab === 'DEPARTMENTS' ? 'Add Department' : activeTab === 'CATEGORIES' ? 'Add Category' : 'Add Member'}
          </button>
          
          <div className="flex items-center gap-1.5 border-l border-[#e2e8f0] pl-3">
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="h-4.5 w-4.5" />
            </button>
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-slate-100 rounded-lg transition-colors">
              <BadgeHelp className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Employees */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
            <Users className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Employees</span>
            <span className="text-2xl font-black text-[#1e293b] mt-0.5 block">{stats.totalEmployees.toLocaleString()}</span>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
            <Building className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Departments</span>
            <span className="text-2xl font-black text-[#1e293b] mt-0.5 block">{stats.departmentsCount}</span>
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-[#fff7ed] text-[#ea580c] flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 stroke-[2]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">Admin Users</span>
            <span className="text-2xl font-black text-[#1e293b] mt-0.5 block">{stats.adminUsers}</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters Navigation block */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
        
        {/* Navigation pill row */}
        <div className="px-6 border-b border-[#e2e8f0] bg-slate-50/20 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => { setActiveTab('DEPARTMENTS'); setSearchQuery(''); setCurrentPage(1); }}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${activeTab === 'DEPARTMENTS' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
            >
              Departments
            </button>
            <button
              onClick={() => { setActiveTab('CATEGORIES'); setSearchQuery(''); setCurrentPage(1); }}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${activeTab === 'CATEGORIES' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
            >
              Categories
            </button>
            <button
              onClick={() => { setActiveTab('EMPLOYEES'); setSearchQuery(''); setCurrentPage(1); }}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${activeTab === 'EMPLOYEES' ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
            >
              Employees
            </button>
          </div>

          <div className="flex items-center gap-2 py-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#475569] rounded-lg transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
            <button className="p-1.5 border border-[#e2e8f0] hover:bg-slate-50 text-neutral-500 rounded-lg transition-colors">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Filters Area below tab row */}
        <div className="p-5 border-b border-[#f1f5f9] flex flex-col sm:flex-row gap-3 bg-slate-50/10">
          <div className="relative flex-grow max-w-sm">
            <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder={activeTab === 'DEPARTMENTS' ? 'Filter by department name...' : activeTab === 'CATEGORIES' ? 'Filter by category name...' : 'Filter by employee name...'}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            />
          </div>

          {activeTab === 'EMPLOYEES' && (
            <>
              <select
                value={selectedDeptFilter}
                onChange={(e) => { setSelectedDeptFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => { setSelectedStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ALL">Status: All</option>
                <option value="ACTIVE">Status: Active</option>
                <option value="INACTIVE">Status: Inactive</option>
              </select>
            </>
          )}
        </div>

        {/* Data Table Content */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 text-sm font-medium">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
              <span>Loading organizational data...</span>
            </div>
          ) : currentItems.length === 0 ? (
            <div className="py-20 text-center text-sm text-neutral-400 font-semibold">
              No matching records found.
            </div>
          ) : (
            <table className="min-w-full divide-y divide-[#e2e8f0] text-left">
              <thead className="bg-[#f8fafc]">
                {activeTab === 'DEPARTMENTS' && (
                  <tr>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Head</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Parent Dept</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                )}
                {activeTab === 'CATEGORIES' && (
                  <tr>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Category Name</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Custom Fields</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Created Date</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                )}
                {activeTab === 'EMPLOYEES' && (
                  <tr>
                    <th className="w-12 px-6 py-3.5">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Name & Email</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] bg-white text-sm text-[#1e293b]">
                
                {/* DEPARTMENTS TAB ROWS */}
                {activeTab === 'DEPARTMENTS' && currentItems.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1e293b]">{dept.name}</td>
                    <td className="px-6 py-4 text-neutral-500">{dept.head ? dept.head.name : 'Unassigned'}</td>
                    <td className="px-6 py-4 text-neutral-500">{dept.parent ? dept.parent.name : '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${dept.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-55 text-slate-500 bg-slate-50 border border-slate-200'}`}>
                        {dept.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedDept(dept); setIsDeptModalOpen(true); }}
                          className="p-1 text-neutral-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        {dept.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleDeactivateDepartment(dept.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {/* CATEGORIES TAB ROWS */}
                {activeTab === 'CATEGORIES' && currentItems.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#1e293b]">{cat.name}</td>
                    <td className="px-6 py-4 text-neutral-500 font-medium">{(cat.fields || []).length} dynamic properties</td>
                    <td className="px-6 py-4 text-neutral-400 font-medium">
                      {new Date(cat.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setSelectedCat(cat); setIsCatModalOpen(true); }}
                          className="p-1 text-neutral-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-colors"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        >
                          <UserX className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* EMPLOYEES TAB ROWS */}
                {activeTab === 'EMPLOYEES' && currentItems.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 text-indigo-600 border border-slate-200/80 flex items-center justify-center font-bold text-xs shadow-inner">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <span className="block font-semibold text-[#1e293b]">{emp.name}</span>
                        <span className="block text-xs text-neutral-400 mt-0.5 font-medium">{emp.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-500 font-medium">{emp.department ? emp.department.name : 'Global / Unassigned'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase tracking-wide">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-neutral-600 font-medium">
                        <span className={`h-1.5 w-1.5 rounded-full ${emp.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                        {emp.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => { setSelectedEmp(emp); setIsEmpModalOpen(true); }}
                        className="p-1.5 border border-[#e2e8f0] hover:bg-slate-100 text-neutral-500 rounded-lg transition-colors inline-flex items-center"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          )}
        </div>

        {/* Footer Helper Note and Pagination bar */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/10">
          
          {/* Helper note contextual to active tab */}
          <div className="text-xs font-semibold text-neutral-400 italic">
            {activeTab === 'DEPARTMENTS' && '💡 Editing a department here also drives the picklists in asset registration and booking pages.'}
            {activeTab === 'CATEGORIES' && '💡 Categories defined here establish the properties recorded during asset onboarding.'}
            {activeTab === 'EMPLOYEES' && '💡 Promoting employees here adjusts their execution privilege levels across the application.'}
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-4 self-end md:self-auto text-xs font-semibold text-neutral-500">
            <div className="flex items-center gap-2">
              <span>Items per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 border border-neutral-200 rounded bg-white text-neutral-700 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            
            <span>
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems}
            </span>

            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-1 border border-neutral-200 rounded bg-white text-neutral-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 py-1 rounded font-bold transition-all ${currentPage === page ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/15' : 'border border-transparent text-neutral-600 hover:bg-slate-50'}`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-1 border border-neutral-200 rounded bg-white text-neutral-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Modals Mounting */}
      <DepartmentModal
        isOpen={isDeptModalOpen}
        onClose={() => setIsDeptModalOpen(false)}
        onSubmit={handleDepartmentSubmit}
        department={selectedDept}
        departments={departments}
        employees={employees}
      />

      <CategoryModal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        onSubmit={handleCategorySubmit}
        category={selectedCat}
      />

      <EmployeeModal
        isOpen={isEmpModalOpen}
        onClose={() => setIsEmpModalOpen(false)}
        onSubmit={handleEmployeeSubmit}
        employee={selectedEmp}
      />

    </div>
  );
};

export default OrgSetup;
