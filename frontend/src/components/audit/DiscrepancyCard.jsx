import React from 'react';
import { AlertCircle, Lock } from 'lucide-react';

function DiscrepancyCard({ discrepancyCount, onCloseAudit, isClosing }) {
  return (
    <div className="space-y-4">
      {discrepancyCount > 0 ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex justify-between items-center shadow-sm">
          <div className="flex gap-3 items-center">
            <AlertCircle className="text-rose-600 shrink-0" size={20} />
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                {discrepancyCount} Assets Flagged with Discrepancies
              </h2>
              <p className="text-xs text-rose-700 font-semibold mt-0.5">
                Discrepancy report highlights missing or damaged hardware items.
              </p>
            </div>
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 border border-rose-250 bg-white hover:bg-rose-50/50 text-rose-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
          >
            Print Report
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50 border border-emerald-250 rounded-2xl p-5 flex justify-between items-center shadow-sm">
          <div className="flex gap-3 items-center">
            <AlertCircle className="text-emerald-600 shrink-0" size={20} />
            <div>
              <h2 className="font-bold text-slate-800 text-sm">
                No Discrepancies Registered
              </h2>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                All physical hardware matches expectation in location and condition.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button 
          onClick={onCloseAudit}
          disabled={isClosing}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/10 cursor-pointer disabled:opacity-55"
        >
          <Lock size={13} />
          <span>{isClosing ? 'Closing Cycle...' : 'Close Audit Cycle'}</span>
        </button>
      </div>
    </div>
  );
}

export default DiscrepancyCard;