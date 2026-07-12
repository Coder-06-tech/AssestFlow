import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

// Common Dialog Overlay
const ModalWrapper = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans animate-fade-in">
      <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h3 className="text-base font-bold text-[#1e293b]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DEPARTMENT MODAL
// ==========================================
export const DepartmentModal = ({ isOpen, onClose, onSubmit, department, departments, employees }) => {
  const [name, setName] = useState('');
  const [headId, setHeadId] = useState('');
  const [parentId, setParentId] = useState('');
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    if (department) {
      setName(department.name || '');
      setHeadId(department.headId || '');
      setParentId(department.parentId || '');
      setStatus(department.status || 'ACTIVE');
    } else {
      setName('');
      setHeadId('');
      setParentId('');
      setStatus('ACTIVE');
    }
  }, [department, isOpen]);

  // Recursively find all descendants of current department to exclude them
  const getDescendantIds = (deptId, list) => {
    const descendants = new Set();
    const findChildren = (id) => {
      list.forEach(d => {
        if (d.parentId === id) {
          descendants.add(d.id);
          findChildren(d.id);
        }
      });
    };
    findChildren(deptId);
    return descendants;
  };

  const disallowedParentIds = department ? getDescendantIds(department.id, departments) : new Set();
  if (department) {
    disallowedParentIds.add(department.id); // Cannot set itself as parent
  }

  const filteredParentDepartments = departments.filter(d => !disallowedParentIds.has(d.id));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: department?.id,
      name,
      headId: headId || null,
      parentId: parentId || null,
      status
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={department ? 'Edit Department' : 'Create Department'}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Department Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Engineering"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Department Head</label>
          <select
            value={headId}
            onChange={(e) => setHeadId(e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Unassigned</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name} ({emp.email})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Parent Department</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">None (Top Level)</option>
            {filteredParentDepartments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between py-2 border-t border-b border-slate-100">
          <div>
            <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Status</span>
            <span className="text-xs text-neutral-400">Inactive departments cannot be selected in other modules</span>
          </div>
          <button
            type="button"
            onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${status === 'ACTIVE' ? 'bg-[#3b82f6]' : 'bg-slate-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#e2e8f0] text-sm text-[#475569] font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-sm text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            {department ? 'Save Changes' : 'Create Department'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ==========================================
// CATEGORY MODAL
// ==========================================
export const CategoryModal = ({ isOpen, onClose, onSubmit, category }) => {
  const [name, setName] = useState('');
  const [fields, setFields] = useState([]);

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setFields(category.fields || []);
    } else {
      setName('');
      setFields([]);
    }
  }, [category, isOpen]);

  const handleAddField = () => {
    setFields([...fields, { name: '', type: 'TEXT', required: false }]);
  };

  const handleRemoveField = (idx) => {
    setFields(fields.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx, key, value) => {
    const updated = [...fields];
    updated[idx][key] = value;
    setFields(updated);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: category?.id,
      name,
      fields
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title={category ? 'Edit Category' : 'Create Category'}>
      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {/* Name Input */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Category Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Laptops, Office Desks"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Dynamic Fields Sub-form */}
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
            <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Dynamic Category Fields
            </span>
            <button
              type="button"
              onClick={handleAddField}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#4f46e5] hover:text-[#4338ca] transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Field
            </button>
          </div>

          {fields.length === 0 ? (
            <p className="text-xs text-neutral-400 py-3 text-center">
              No custom fields added yet. Assets in this category will use default core fields.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[240px] overflow-y-auto pr-1">
              {fields.map((field, idx) => (
                <div key={idx} className="flex gap-2 items-center bg-slate-50/50 p-2.5 rounded-lg border border-[#e2e8f0]">
                  <input
                    type="text"
                    required
                    placeholder="Field name (e.g. RAM)"
                    value={field.name}
                    onChange={(e) => handleFieldChange(idx, 'name', e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 bg-white"
                  />
                  <select
                    value={field.type}
                    onChange={(e) => handleFieldChange(idx, 'type', e.target.value)}
                    className="w-24 px-1.5 py-1.5 border border-neutral-200 rounded text-xs text-neutral-800 bg-white"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="BOOLEAN">Boolean</option>
                  </select>
                  <label className="flex items-center gap-1.5 select-none text-xs font-semibold text-neutral-500 whitespace-nowrap cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Req
                  </label>
                  <button
                    type="button"
                    onClick={() => handleRemoveField(idx)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-white rounded transition-colors border border-transparent hover:border-[#e2e8f0]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#e2e8f0] text-sm text-[#475569] font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-sm text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};

// ==========================================
// EMPLOYEE DETAILS / ROLE UPDATE MODAL
// ==========================================
export const EmployeeModal = ({ isOpen, onClose, onSubmit, employee }) => {
  const [role, setRole] = useState('EMPLOYEE');
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    if (employee) {
      setRole(employee.role || 'EMPLOYEE');
      setStatus(employee.status || 'ACTIVE');
    }
  }, [employee, isOpen]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      id: employee.id,
      role,
      status
    });
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} title="Manage Employee Roles & Status">
      <form onSubmit={handleFormSubmit} className="space-y-5">
        
        {/* User Card Info */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
            {employee?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-[#1e293b] truncate leading-tight">{employee?.name}</h4>
            <p className="text-xs text-neutral-500 truncate mt-0.5">{employee?.email}</p>
          </div>
        </div>

        {/* Role Picker */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Access Permission Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="block w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="EMPLOYEE">Standard Employee</option>
            <option value="DEPARTMENT_HEAD">Department Head</option>
            <option value="ASSET_MANAGER">Asset Manager</option>
          </select>
          <p className="text-[10px] text-neutral-400 mt-1">Note: Root administrator privileges cannot be assigned from this directory.</p>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between py-2.5 border-t border-b border-slate-100">
          <div>
            <span className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Employee Status</span>
            <span className="text-xs text-neutral-400">Inactive profiles are restricted from accessing system resources</span>
          </div>
          <button
            type="button"
            onClick={() => setStatus(status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${status === 'ACTIVE' ? 'bg-[#3b82f6]' : 'bg-slate-200'}`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${status === 'ACTIVE' ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-[#e2e8f0] text-sm text-[#475569] font-bold rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#4f46e5] hover:bg-[#4338ca] text-sm text-white font-bold rounded-lg transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
};
