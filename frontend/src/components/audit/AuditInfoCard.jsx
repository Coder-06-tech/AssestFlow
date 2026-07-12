import React from 'react';

function AuditInfoCard({ title, createdAt, status }) {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">
            Physical inventory verification cycle
          </p>
        </div>
        <span className="px-2.5 py-0.5 border border-amber-200 bg-amber-50 text-amber-700 font-bold text-[9px] rounded-full uppercase tracking-wider">
          {status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-8 border-t border-slate-50 pt-4 text-xs font-semibold">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Initiated Date
          </p>
          <p className="text-slate-700 mt-1">
            {formattedDate}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Auditors / Creator
          </p>
          <p className="text-slate-700 mt-1">
            System Administration
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuditInfoCard;