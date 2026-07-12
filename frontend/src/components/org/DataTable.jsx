import React from 'react';

const DataTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'No matching records found.',
  rowKey = (row, index) => row?.id ?? index,
  className = ''
}) => {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 text-sm font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
        <span>Loading organizational data...</span>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400 font-semibold">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-[#e2e8f0] text-left">
        <thead className="bg-[#f8fafc]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider ${column.headerClassName || ''}`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e2e8f0] bg-white text-sm text-[#1e293b]">
          {rows.map((row, index) => (
            <tr key={rowKey(row, index)} className="hover:bg-slate-50/50 transition-colors">
              {columns.map((column) => (
                <td key={`${rowKey(row, index)}-${column.key}`} className={`px-6 py-4 ${column.cellClassName || ''}`}>
                  {column.render ? column.render(row, index) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
