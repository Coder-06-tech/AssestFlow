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
  Bell,
  Settings,
  Info
} from 'lucide-react';
import { DepartmentModal, CategoryModal, EmployeeModal } from '../components/org/orgModals';
import DataTable from '../components/common/DataTable';
import TabShell from '../components/common/TabShell';

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
        const matchesDept = selectedDeptFilter === 'ALL' || e.departmentId === parseInt(selectedDeptFilter, 10);
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getColumns = () => {
    if (activeTab === 'DEPARTMENTS') {
      return [
        {
          header: 'Department',
          accessor: 'name',
          className: 'font-semibold text-[#1e293b]'
        },
        {
          header: 'Head',
          accessor: (row) => row.head ? row.head.name : 'Unassigned',
          className: 'text-neutral-500'
        },
        {
          header: 'Parent Dept',
          accessor: (row) => row.parent ? row.parent.name : '-',
          className: 'text-neutral-500'
        },
        {
          header: 'Status',
          render: (row) => (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
              row.status === 'ACTIVE' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : 'bg-slate-50 text-slate-500 border border-slate-200'
            }`}>
              {row.status.toLowerCase()}
            </span>
          )
        },
        {
          header: 'Actions',
          headerClassName: 'text-right',
          className: 'text-right',
          render: (row) => (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSelectedDept(row); setIsDeptModalOpen(true); }}
                className="p-1 text-neutral-400 hover:text-[#374bd5] hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              {row.status === 'ACTIVE' && (
                <button
                  onClick={() => handleDeactivateDepartment(row.id)}
                  className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <UserX className="h-4 w-4" />
                </button>
              )}
            </div>
          )
        }
      ];
    }

    if (activeTab === 'CATEGORIES') {
      return [
        {
          header: 'Category Name',
          accessor: 'name',
          className: 'font-semibold text-[#1e293b]'
        },
        {
          header: 'Custom Fields',
          accessor: (row) => `${(row.fields || []).length} dynamic properties`,
          className: 'text-neutral-500 font-medium'
        },
        {
          header: 'Created Date',
          accessor: (row) => new Date(row.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }),
          className: 'text-neutral-400 font-medium'
        },
        {
          header: 'Actions',
          headerClassName: 'text-right',
          className: 'text-right',
          render: (row) => (
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSelectedCat(row); setIsCatModalOpen(true); }}
                className="p-1 text-neutral-400 hover:text-[#374bd5] hover:bg-slate-100 rounded transition-colors cursor-pointer"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteCategory(row.id)}
                className="p-1 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                <UserX className="h-4 w-4" />
              </button>
            </div>
          )
        }
      ];
    }

    if (activeTab === 'EMPLOYEES') {
      return [
        {
          header: (
            <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
          ),
          headerClassName: 'w-12',
          render: () => (
            <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
          )
        },
        {
          header: 'Name & Email',
          render: (row) => (
            <div className="flex items-center gap-3">
              {row.profilePhoto ? (
                <img 
                  src={row.profilePhoto} 
                  alt={row.name} 
                  className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-200" 
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[#eff6ff] text-[#2563eb] border border-blue-100 flex items-center justify-center font-bold text-xs shadow-inner uppercase shrink-0">
                  {row.name.split(' ').map(n => n[0]).join('')}
                </div>
              )}
              <div>
                <span className="block font-bold text-slate-800 leading-tight">{row.name}</span>
                <span className="block text-[11px] text-slate-400 mt-0.5 font-semibold">{row.email}</span>
              </div>
            </div>
          )
        },
        {
          header: 'Department',
          accessor: (row) => row.department ? row.department.name : 'Global / Unassigned',
          className: 'text-slate-600 font-semibold'
        },
        {
          header: 'Role',
          render: (row) => {
            const displayRole = row.designation || row.role;
            return (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#f1f5f9] text-[#475569] border border-slate-200 uppercase tracking-wide">
                {displayRole.replace('_', ' ')}
              </span>
            );
          }
        },
        {
          header: 'Status',
          render: (row) => {
            const isActive = row.status === 'ACTIVE';
            return (
              <span className={`inline-flex items-center gap-1.5 font-bold text-xs ${isActive ? 'text-emerald-600' : 'text-amber-600'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {isActive ? 'Active' : 'On Leave'}
              </span>
            );
          }
        },
        {
          header: 'Actions',
          headerClassName: 'text-right',
          className: 'text-right',
          render: (row) => (
            <button
              onClick={() => { setSelectedEmp(row); setIsEmpModalOpen(true); }}
              className="p-1.5 border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 rounded-lg transition-colors inline-flex items-center cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </button>
          )
        }
      ];
    }

    return [];
  };

  const getAddButtonLabel = () => {
    if (activeTab === 'DEPARTMENTS') return 'Add Department';
    if (activeTab === 'CATEGORIES') return 'Add Category';
    return 'Add Member';
  };

  const getHelperNote = () => {
    if (activeTab === 'DEPARTMENTS') {
      return '💡 Editing a department here also drives the picklist in Screen 4 & 5';
    }
    if (activeTab === 'CATEGORIES') {
      return '💡 Categories defined here establish the properties recorded during asset onboarding.';
    }
    if (activeTab === 'EMPLOYEES') {
      return '💡 Promoting employees here adjusts their execution privilege levels across the application.';
    }
    return '';
  };

  const renderFilters = () => {
    return (
      <>
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'DEPARTMENTS'
                ? 'Filter by department name...'
                : activeTab === 'CATEGORIES'
                ? 'Filter by category name...'
                : 'Filter by employee name...'
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-450 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#374bd5] focus:border-[#374bd5] bg-white"
          />
        </div>

        {activeTab === 'EMPLOYEES' && (
          <>
            <select
              value={selectedDeptFilter}
              onChange={(e) => {
                setSelectedDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#374bd5]"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => {
                setSelectedStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#374bd5]"
            >
              <option value="ALL">Status: All</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="INACTIVE">Status: Inactive</option>
            </select>
          </>
        )}
      </>
    );
  };

  const renderPagination = () => {
    return (
      <div className="flex items-center gap-4 self-end md:self-auto text-xs font-semibold text-neutral-500">
        <div className="flex items-center gap-2">
          <span>Items per page:</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
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
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-1 border border-neutral-200 rounded bg-white text-neutral-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2.5 py-1 rounded font-bold transition-all ${
                currentPage === page
                  ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/15'
                  : 'border border-transparent text-neutral-600 hover:bg-slate-50 cursor-pointer'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="p-1 border border-neutral-200 rounded bg-white text-neutral-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans animate-fade-in">
      
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
              className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg text-neutral-805 text-neutral-800 placeholder-neutral-450 placeholder-neutral-400 bg-white focus:outline-none focus:ring-1 focus:ring-[#374bd5] focus:border-[#374bd5]"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#374bd5] hover:bg-[#2c3dbf] text-xs font-bold text-white rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[2.2]" /> 
            {getAddButtonLabel()}
          </button>
          
          <div className="flex items-center gap-1.5 border-l border-[#e2e8f0] pl-3">
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <Bell className="h-4.5 w-4.5" />
            </button>
            <button className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
              <BadgeHelp className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        
        {/* Total Employees */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-md">
            <Users className="h-5.5 w-5.5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Employees</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{stats.totalEmployees.toLocaleString()}</span>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shadow-md">
            <Building className="h-5.5 w-5.5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Departments</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{stats.departmentsCount}</span>
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="h-12 w-12 rounded-xl bg-[#ea580c] text-white flex items-center justify-center shadow-md">
            <ShieldAlert className="h-5.5 w-5.5 stroke-[2.2]" />
          </div>
          <div>
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Admin Users</span>
            <span className="text-2xl font-black text-slate-800 mt-0.5 block">{stats.adminUsers}</span>
          </div>
        </div>
      </div>

      {/* Reusable TabShell wrapping the reusable DataTable */}
      <TabShell
        tabs={[
          { id: 'DEPARTMENTS', label: 'Departments' },
          { id: 'CATEGORIES', label: 'Categories' },
          { id: 'EMPLOYEES', label: 'Employees' }
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onAddClick={null} // Hidden in tab row to match mockup precisely (uses header toolbar button)
        addButtonLabel={getAddButtonLabel()}
        helperNote={getHelperNote()}
        filters={renderFilters()}
        footer={renderPagination()}
      >
        <DataTable
          columns={getColumns()}
          data={currentItems}
          loading={loading}
          loadingText={`Loading ${activeTab.toLowerCase()} data...`}
        />
      </TabShell>

      {/* Organizational Hierarchy info alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3 text-left shadow-sm">
        <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
        <div className="flex flex-col gap-1">
          <span className="font-bold text-blue-900 text-xs">Organizational Hierarchy</span>
          <span className="text-[11px] text-blue-800 font-semibold leading-relaxed">
            Changes to organization structures may take up to 10 minutes to propagate across all system modules. Roles defined here determine default access levels for asset assignments and maintenance schedules.
          </span>
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
