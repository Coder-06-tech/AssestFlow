import React from 'react';

function StatusBadge({ status }) {
  let color = "bg-slate-100 text-slate-700 border-slate-200";

  const upperStatus = (status || '').toUpperCase();

  switch (upperStatus) {
    case "VERIFIED":
      color = "bg-emerald-50 text-emerald-700 border-emerald-250 border-emerald-250";
      break;
    case "MISSING":
      color = "bg-rose-50 text-rose-700 border-rose-250 border-rose-250";
      break;
    case "DAMAGED":
      color = "bg-amber-50 text-amber-700 border-amber-250 border-amber-250";
      break;
    case "PENDING":
    default:
      color = "bg-slate-50 text-slate-600 border-slate-200";
  }

  return (
    <span className={`px-2.5 py-0.5 border rounded-full font-bold text-[10px] uppercase tracking-wide ${color}`}>
      {status ? status.toLowerCase() : 'Pending'}
    </span>
  );
}

export default StatusBadge;