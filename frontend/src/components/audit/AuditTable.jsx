import React from 'react';
import StatusBadge from "./StatusBadge";

function AuditTable({ auditAssets, onVerify }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead className="bg-[#f8fafc] border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3.5">Asset Tag</th>
              <th className="px-6 py-3.5">Asset Name</th>
              <th className="px-6 py-3.5">Expected Location</th>
              <th className="px-6 py-3.5">Verification Status</th>
              <th className="px-6 py-3.5 text-right w-44">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {auditAssets.map((aa) => (
              <tr key={aa.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-blue-600 font-bold">
                  {aa.Asset?.assetTag || 'N/A'}
                </td>
                <td className="px-6 py-4 text-slate-800">
                  {aa.Asset?.name || 'Unknown Device'}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {aa.Asset?.location || 'Not Specified'}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={aa.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <select
                    value={aa.status}
                    onChange={(e) => onVerify(aa.id, e.target.value)}
                    className="text-[11px] border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-slate-50"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="MISSING">Missing</option>
                    <option value="DAMAGED">Damaged</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditTable;