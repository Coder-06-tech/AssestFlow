import React from 'react';

const BookingHeatmap = ({ data, loading }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const hours = [
    '12 AM', '2 AM', '4 AM', '6 AM', '8 AM', '10 AM',
    '12 PM', '2 PM', '4 PM', '6 PM', '8 PM', '10 PM'
  ];

  const getCellColor = (val) => {
    if (!val || val === 0) return 'bg-[#f8fafc]/70 border border-[#e2e8f0]/55 hover:bg-slate-100 transition-colors';
    if (val === 1) return 'bg-indigo-100 border border-indigo-200/50 text-indigo-700 font-semibold';
    if (val === 2) return 'bg-indigo-200 border border-indigo-300/50 text-indigo-800 font-semibold';
    if (val === 3) return 'bg-indigo-350 bg-indigo-300 border border-indigo-400/50 text-indigo-950 font-bold';
    return 'bg-[#374bd5] border border-indigo-600/50 text-white font-bold shadow-sm';
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col w-full transition-all hover:shadow-md duration-300">
      <div className="mb-6 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800 tracking-tight">Resource Booking Heatmap</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Hourly booking density across days of the week (2-hour buckets)</p>
        </div>
        
        {/* Heatmap Legend */}
        <div className="flex items-center space-x-2 text-[10px] font-semibold text-slate-500">
          <span>Less</span>
          <div className="h-3.5 w-3.5 bg-slate-50 border border-slate-100 rounded-sm"></div>
          <div className="h-3.5 w-3.5 bg-indigo-100 border border-indigo-200 rounded-sm"></div>
          <div className="h-3.5 w-3.5 bg-indigo-200 border border-indigo-300 rounded-sm"></div>
          <div className="h-3.5 w-3.5 bg-indigo-300 border border-indigo-450 rounded-sm"></div>
          <div className="h-3.5 w-3.5 bg-[#374bd5] border border-indigo-600 rounded-sm"></div>
          <span>More</span>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#374bd5]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[700px] space-y-2">
            {/* Hour Header labels */}
            <div className="grid grid-cols-[100px_repeat(12,_1fr)] gap-2 text-center text-[10px] font-bold text-slate-400 pb-2">
              <div></div>
              {hours.map((hr, idx) => (
                <div key={idx} className="tracking-tight">{hr}</div>
              ))}
            </div>

            {/* Heatmap grid rows */}
            {days.map((day, dayIdx) => {
              const rowValues = data?.[dayIdx] || Array(12).fill(0);
              return (
                <div key={dayIdx} className="grid grid-cols-[100px_repeat(12,_1fr)] gap-2 items-center">
                  <div className="text-[11px] font-bold text-slate-500 text-left pr-4">
                    {day}
                  </div>
                  {rowValues.map((val, hourIdx) => (
                    <div
                      key={hourIdx}
                      className={`h-9 rounded-lg flex items-center justify-center text-xs cursor-pointer select-none transition-all duration-150 ${getCellColor(val)}`}
                      title={`${day}, ${hours[hourIdx]}: ${val} booking(s)`}
                    >
                      {val > 0 ? val : ''}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHeatmap;
