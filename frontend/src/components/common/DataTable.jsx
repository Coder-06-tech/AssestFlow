import React from 'react';

const DataTable = ({ columns, data, loading, loadingText = 'Loading records...' }) => {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-neutral-500 text-sm font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#374bd5]" />
        <span>{loadingText}</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-neutral-400 font-semibold">
        No matching records found.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-[#e2e8f0] text-left">
      <thead className="bg-[#f8fafc]">
        <tr>
          {columns.map((col, idx) => (
            <th
              key={idx}
              className={`px-6 py-3.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider ${col.headerClassName || ''}`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-[#e2e8f0] bg-white text-sm text-[#1e293b]">
        {data.map((row, rowIdx) => (
          <tr key={row.id || rowIdx} className="hover:bg-slate-50/50 transition-colors">
            {columns.map((col, colIdx) => {
              let content;
              if (col.render) {
                content = col.render(row, rowIdx);
              } else if (typeof col.accessor === 'function') {
                content = col.accessor(row);
              } else {
                content = row[col.accessor];
              }

              return (
                <td
                  key={colIdx}
                  className={`px-6 py-4 ${col.className || ''}`}
                >
                  {content}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
