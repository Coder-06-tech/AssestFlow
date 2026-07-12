import React, { useState, useEffect } from 'react';
import * as maintenanceApi from '../services/maintenanceServce';
import * as assetApi from '../services/assetService';
import * as userApi from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Filter, 
  ArrowUpDown, 
  Wrench, 
  AlertTriangle,
  Clock, 
  User, 
  CheckCircle2, 
  XCircle,
  X,
  UserPlus,
  Play,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';

const MaintenancePage = () => {
  const { user: currentUser } = useAuth();
  
  // Data states
  const [requests, setRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [availableTechs, setAvailableTechs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  
  // Form states
  const [formAssetId, setFormAssetId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPriority, setFormPriority] = useState('LOW');
  const [formTechId, setFormTechId] = useState('');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch maintenance requests
      const reqRes = await maintenanceApi.getMaintenanceRequests();
      setRequests(reqRes.data);
      
      // Fetch assets
      const assetRes = await assetApi.getAssets();
      setAssets(assetRes.data);
      if (assetRes.data.length > 0) {
        setFormAssetId(assetRes.data[0].id.toString());
      }
      
      // Fetch tech list (filter users from DB who can act as technicians)
      const userRes = await userApi.getUsers();
      // Since standard role is EMPLOYEE, let's treat any EMPLOYEE containing 'Tech' or all employees as assignable techs
      const techs = userRes.data.filter(u => u.name.toLowerCase().includes('tech') || u.name.toLowerCase().includes('technician') || u.role === 'EMPLOYEE');
      setAvailableTechs(techs);
      if (techs.length > 0) {
        setFormTechId(techs[0].id);
      }
    } catch (err) {
      toast.error('Failed to load maintenance data. Please seed testing database.', { toastId: 'maintenance-fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitLoading(true);
      await maintenanceApi.raiseRequest(
        formAssetId,
        formDescription,
        formPriority
      );
      toast.success('Maintenance ticket raised successfully!');
      setShowCreateModal(false);
      setFormDescription('');
      setFormPriority('LOW');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to raise request');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, status, techId = null) => {
    try {
      await maintenanceApi.updateRequestStatus(requestId, status, techId);
      toast.success(`Ticket status updated to ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to update ticket status');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!activeRequest) return;
    try {
      setFormSubmitLoading(true);
      // Assigning tech will set the ticket to "Approved" with the technician logged
      await handleUpdateStatus(activeRequest.id, 'APPROVED', formTechId);
      setShowAssignModal(false);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormSubmitLoading(false);
    }
  };

  // Group requests by Kanban columns
  // 1. Pending: status === 'PENDING'
  // 2. Approved: status === 'APPROVED' && no technicianName assigned
  // 3. Tech Assigned: status === 'APPROVED' && has technicianName
  // 4. In Progress: status === 'IN_PROGRESS'
  // 5. Resolved: status === 'RESOLVED'
  const columns = {
    PENDING: requests.filter(r => r.status === 'PENDING'),
    APPROVED: requests.filter(r => r.status === 'APPROVED' && !r.technicianAssigned),
    TECH_ASSIGNED: requests.filter(r => r.status === 'APPROVED' && r.technicianAssigned),
    IN_PROGRESS: requests.filter(r => r.status === 'IN_PROGRESS'),
    RESOLVED: requests.filter(r => r.status === 'RESOLVED'),
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const isManager = ['ADMIN', 'ASSET_MANAGER'].includes(currentUser?.role);

  return (
    <div className="space-y-6">
      {/* PAGE TITLE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Maintenance Board</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track asset service requests across the organization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm cursor-not-allowed">
            <Filter size={14} />
            <span>Filter</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors shadow-sm cursor-not-allowed">
            <ArrowUpDown size={14} />
            <span>Sort</span>
          </button>
          <button 
            onClick={() => {
              if (assets.length === 0) {
                toast.warning('Please seed mock assets first using the button at the bottom left.');
                return;
              }
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm"
          >
            <Plus size={16} />
            <span>New Ticket</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[500px] flex flex-col items-center justify-center text-slate-400 gap-2">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-xs font-semibold">Loading ticket board...</span>
        </div>
      ) : (
        /* KANBAN BOARD CONTAINER */
        <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none scrollbar-thin">
          {/* COLUMN: PENDING */}
          <div className="bg-slate-100/70 border border-slate-200/50 rounded-2xl w-72 shrink-0 flex flex-col max-h-[75vh]">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/50 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span className="font-bold text-slate-800 text-sm">Pending</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {columns.PENDING.length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {columns.PENDING.map(ticket => (
                <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">#MT-{ticket.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs truncate">{ticket.asset.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <User size={12} className="text-slate-400" />
                      <span>{ticket.user.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  {isManager && (
                    <div className="flex gap-2 pt-1.5">
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'APPROVED')}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-bold transition-all"
                      >
                        <Check size={12} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(ticket.id, 'REJECTED')}
                        className="flex items-center justify-center p-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-[10px] transition-all"
                        title="Reject Ticket"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {columns.PENDING.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">No pending requests</div>
              )}
            </div>
          </div>

          {/* COLUMN: APPROVED */}
          <div className="bg-slate-100/70 border border-slate-200/50 rounded-2xl w-72 shrink-0 flex flex-col max-h-[75vh]">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/50 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="font-bold text-slate-800 text-sm">Approved</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {columns.APPROVED.length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {columns.APPROVED.map(ticket => (
                <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">#MT-{ticket.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs truncate">{ticket.asset.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Wrench size={12} className="text-slate-400" />
                      <span className="text-blue-600 font-semibold uppercase tracking-wider text-[9px] bg-blue-50 px-1.5 rounded">Asset Locked</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  {isManager && (
                    <div className="pt-1.5">
                      <button
                        onClick={() => {
                          setActiveRequest(ticket);
                          setShowAssignModal(true);
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                      >
                        <UserPlus size={12} />
                        Assign Technician
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {columns.APPROVED.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">No approved tickets</div>
              )}
            </div>
          </div>

          {/* COLUMN: TECH ASSIGNED */}
          <div className="bg-slate-100/70 border border-slate-200/50 rounded-2xl w-72 shrink-0 flex flex-col max-h-[75vh]">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/50 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                <span className="font-bold text-slate-800 text-sm">Tech Assigned</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {columns.TECH_ASSIGNED.length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {columns.TECH_ASSIGNED.map(ticket => (
                <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">#MT-{ticket.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs truncate">{ticket.asset.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Assigned Tech</span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-850 font-semibold">
                      <User size={12} className="text-slate-500" />
                      <span>{ticket.technicianAssigned}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500">Awaiting Repair</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'IN_PROGRESS', ticket.technicianAssigned)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-bold transition-all"
                    >
                      <Play size={12} />
                      Start Repair Work
                    </button>
                  </div>
                </div>
              ))}
              {columns.TECH_ASSIGNED.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">No assigned technician tickets</div>
              )}
            </div>
          </div>

          {/* COLUMN: IN PROGRESS */}
          <div className="bg-slate-100/70 border border-slate-200/50 rounded-2xl w-72 shrink-0 flex flex-col max-h-[75vh]">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/50 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold text-slate-800 text-sm">In Progress</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {columns.IN_PROGRESS.length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {columns.IN_PROGRESS.map(ticket => (
                <div key={ticket.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-2 py-0.5 border rounded-full font-bold uppercase tracking-wider ${getPriorityStyle(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">#MT-{ticket.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs truncate">{ticket.asset.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="bg-amber-50/20 border border-amber-100 rounded-lg p-2.5">
                    <span className="text-[9px] text-amber-600 font-bold uppercase tracking-wider block">Technician Onsite</span>
                    <span className="text-xs text-slate-700 font-semibold mt-0.5 block">{ticket.technicianAssigned || 'Assigned Staff'}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-amber-600">Repair Active</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="pt-1.5">
                    <button
                      onClick={() => handleUpdateStatus(ticket.id, 'RESOLVED')}
                      className="w-full flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm"
                    >
                      <CheckCircle2 size={12} />
                      Mark Resolved (Release Asset)
                    </button>
                  </div>
                </div>
              ))}
              {columns.IN_PROGRESS.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">No active repairs in progress</div>
              )}
            </div>
          </div>

          {/* COLUMN: RESOLVED */}
          <div className="bg-slate-100/70 border border-slate-200/50 rounded-2xl w-72 shrink-0 flex flex-col max-h-[75vh]">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-slate-200/50 bg-slate-50/50 rounded-t-2xl">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-800 text-sm">Resolved</span>
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {columns.RESOLVED.length}
                </span>
              </div>
            </div>
            <div className="p-3 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
              {columns.RESOLVED.map(ticket => (
                <div key={ticket.id} className="bg-white/80 border border-slate-200/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 border border-emerald-100 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase tracking-wider">
                      RESOLVED
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">#MT-{ticket.id}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs truncate text-slate-600">{ticket.asset.name}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{ticket.description}</p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <CheckCircle2 size={12} />
                      <span>Completed</span>
                    </div>
                    <span>{ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Done'}</span>
                  </div>
                </div>
              ))}
              {columns.RESOLVED.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">No resolved tickets yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MAINTENANCE REQUEST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
                <Wrench size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Raise Maintenance Ticket</h3>
                <p className="text-xs text-slate-500">Report an issue with an asset to trigger an approval workflow.</p>
              </div>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Damaged Asset</label>
                <select
                  value={formAssetId}
                  onChange={(e) => setFormAssetId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                  required
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.assetTag} - {a.status.replace('_', ' ')})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Issue Description</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe the issue (e.g. key fault, screen flickering, leak, crack)..."
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 h-28 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {['LOW', 'MEDIUM', 'HIGH'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormPriority(p)}
                      className={`py-2 border rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                        formPriority === p 
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-3 flex gap-2.5 items-start mt-2">
                <AlertTriangle size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-blue-700 leading-normal">
                  <strong>Workflow process:</strong> Raised requests enter as <em>Pending</em>. Asset managers review, and once approved, the asset status updates to <em>Under Maintenance</em> automatically.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading || !formDescription}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-1.5"
                >
                  {formSubmitLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Ticket</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN TECHNICIAN MODAL */}
      {showAssignModal && activeRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
                <UserPlus size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Assign Technician</h3>
                <p className="text-xs text-slate-500">Pick a member to carry out the repairs.</p>
              </div>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Technician</label>
                <select
                  value={formTechId}
                  onChange={(e) => setFormTechId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                  required
                >
                  {availableTechs.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.role.replace('_', ' ')})</option>
                  ))}
                  {availableTechs.length === 0 && (
                    <option value="tom-tech-id">Tom Technician</option>
                  )}
                </select>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-1.5"
                >
                  {formSubmitLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm Assignment</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenancePage;
