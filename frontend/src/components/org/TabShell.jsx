import React from 'react';
import { Plus, Search, Download, MoreHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';

const TabShell = ({
  tabs,
  activeTab,
  onTabChange,
  onAdd,
  onExport,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterControls,
  children,
  helperNote,
  itemsPerPage,
  setItemsPerPage,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  indexOfFirstItem,
  indexOfLastItem,
  loading,
  rows,
  dataTable,
  addLabel
}) => {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 border-b border-[#e2e8f0] bg-slate-50/20 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`py-4 text-xs font-bold uppercase tracking-wider border-b-2 px-1 transition-all ${activeTab === tab.key ? 'border-[#2563eb] text-[#2563eb]' : 'border-transparent text-neutral-400 hover:text-neutral-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 py-3">
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#374bd5] hover:bg-[#2c3dbf] text-xs font-bold text-white rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 stroke-[2.2]" />
            {addLabel}
          </button>
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#e2e8f0] hover:bg-slate-50 text-xs font-bold text-[#475569] rounded-lg transition-colors"
          >
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="p-1.5 border border-[#e2e8f0] hover:bg-slate-50 text-neutral-500 rounded-lg transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5 border-b border-[#f1f5f9] flex flex-col sm:flex-row gap-3 bg-slate-50/10">
        <div className="relative flex-grow max-w-sm">
          <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-lg text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          />
        </div>
        {filterControls}
      </div>

      {dataTable}

      <div className="px-6 py-4 border-t border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/10">
        <div className="text-xs font-semibold text-neutral-400 italic">{helperNote}</div>
        <div className="flex items-center gap-4 self-end md:self-auto text-xs font-semibold text-neutral-500">
          <div className="flex items-center gap-2">
            <span>Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
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
              className="p-1 border border-neutral-200 rounded bg-white text-neutral-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 rounded font-bold transition-all ${currentPage === page ? 'bg-[#2563eb] text-white shadow-sm shadow-blue-500/15' : 'border border-transparent text-neutral-600 hover:bg-slate-50'}`}
              >
                {page}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="p-1 border border-neutral-200 rounded bg-white text-neutral-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabShell;
