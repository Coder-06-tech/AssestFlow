import React, { useState, useEffect } from 'react';
import DashboardLayout from "../layouts/DashboardLayout";
import AuditHeader from "../components/audit/AuditHeader";
import AuditInfoCard from "../components/audit/AuditInfoCard";
import AuditTable from "../components/audit/AuditTable";
import DiscrepancyCard from "../components/audit/DiscrepancyCard";
import api from '../lib/api';
import { toast } from 'react-toastify';
import { ClipboardList } from 'lucide-react';

function Audit() {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);

  // Fetch active audit cycle
  const fetchActiveAudit = async () => {
    try {
      setLoading(true);
      const response = await api.get('/audit/active');
      if (response.data.success) {
        setAudit(response.data.data);
      }
    } catch (err) {
      console.error('Failed to load active audit:', err);
      toast.error('Failed to load active audit cycle.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveAudit();
  }, []);

  // Verify asset status callback
  const handleVerifyAsset = async (auditAssetId, status, notes = '') => {
    try {
      const response = await api.post('/audit/verify', {
        auditAssetId,
        status,
        notes
      });
      if (response.data.success) {
        toast.success(`Asset verification saved: ${status}`);
        
        // Update local state cleanly
        setAudit(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            AuditAsset: prev.AuditAsset.map(aa => 
              aa.id === auditAssetId ? { ...aa, status, notes, verifiedAt: new Date() } : aa
            )
          };
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit verification.');
    }
  };

  // Close audit cycle callback
  const handleCloseAudit = async () => {
    if (!audit) return;
    try {
      setClosing(true);
      const response = await api.post('/audit/close', { auditId: audit.id });
      if (response.data.success) {
        toast.success('Audit cycle closed successfully!');
        setAudit(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close audit cycle.');
    } finally {
      setClosing(false);
    }
  };

  // Calculate discrepancy count (Unverified, Missing, or Damaged)
  const discrepancyCount = audit 
    ? audit.AuditAsset.filter(aa => aa.status === 'MISSING' || aa.status === 'DAMAGED').length 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AuditHeader />

        {loading ? (
          <div className="h-[300px] flex flex-col items-center justify-center text-slate-450 gap-2">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-xs font-semibold text-slate-500">Loading active audit cycle...</span>
          </div>
        ) : audit ? (
          <>
            <AuditInfoCard 
              title={audit.title}
              createdAt={audit.createdAt}
              status={audit.status}
            />

            <AuditTable 
              auditAssets={audit.AuditAsset}
              onVerify={handleVerifyAsset}
            />

            <DiscrepancyCard 
              discrepancyCount={discrepancyCount}
              onCloseAudit={handleCloseAudit}
              isClosing={closing}
            />
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm max-w-2xl mx-auto">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <ClipboardList size={22} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">No Active Audit Cycle</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  There are currently no pending physical audit cycles scheduled. Register new assets to automatically initialize a mock active cycle for testing purposes.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Audit;