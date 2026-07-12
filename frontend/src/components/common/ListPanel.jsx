import React from 'react';
import { ArrowUpRight, ShieldAlert, Clock, AlertTriangle } from 'lucide-react';

const ListPanel = ({ title, items, loading }) => {
  const getIcon = (metric) => {
    const text = (metric || '').toLowerCase();
    if (text.includes('use') || text.includes('trip')) return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    if (text.includes('service') || text.includes('due') || text.includes('priority')) return <ShieldAlert className="h-4 w-4 text-rose-500" />;
    if (text.includes('unused') || text.includes('idle') || text.includes('days')) return <Clock className="h-4 w-4 text-amber-500" />;
    return <AlertTriangle className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col h-full transition-all hover:shadow-md duration-300">
      <h3 className="text-base font-bold text-slate-800 tracking-tight border-b border-[#f1f5f9] pb-3 mb-4">{title}</h3>
      {loading ? (
        <div className="flex-grow flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#374bd5]"></div>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="flex-grow flex items-center justify-center py-10 text-xs font-semibold text-slate-400">
          No records matching current filters
        </div>
      ) : (
        <div className="flex-grow space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-colors duration-150">
              <div className="flex items-center space-x-3 truncate">
                <div className="p-1.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                  {getIcon(item.metric)}
                </div>
                <span className="text-slate-700 font-medium truncate">{item.label}</span>
              </div>
              <span className="text-[#374bd5] font-bold shrink-0 ml-4 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">
                {item.metric}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListPanel;
