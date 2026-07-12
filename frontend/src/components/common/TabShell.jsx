import React from 'react';
import { Download, MoreHorizontal, Plus } from 'lucide-react';

const TabShell = ({
  tabs,
  activeTab,
  onTabChange,
  onAddClick,
  addButtonLabel = 'Add',
  helperNote,
  filters,
  footer,
  children
}) => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden font-sans">
      
      {/* Tab pill navigation row */}
      <div className="px-6 border-b border-[#e2e8f0] bg-slate-50/20 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${
                activeTab === tab.id
                  ? 'border-[#2563eb] text-[#2563eb]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab row actions: contextual add, export */}
        <div className="flex items-center gap-2 py-3">
          {onAddClick && (
            <button
              onClick={onAddClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#374bd5] hover:bg-[#2c3dbf] text-xs font-bold text-white rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> {addButtonLabel}
            </button>
          )}
          <button
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
      {filters && (
        <div className="p-5 border-b border-[#f1f5f9] flex flex-col sm:flex-row gap-3 bg-slate-50/10">
          {filters}
        </div>
      )}

      {/* Main Content Area */}
      <div className="overflow-x-auto animate-fade-in">
        {children}
      </div>

      {/* Footer Area with Helper note and Pagination */}
      <div className="px-6 py-4 border-t border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/10">
        <div className="text-xs font-semibold text-neutral-450 text-neutral-400 italic">
          {helperNote}
        </div>
        {footer}
      </div>

    </div>
  );
};

export default TabShell;
