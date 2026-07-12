import React from 'react';

const ChartCard = ({ title, subtitle, children }) => {
  return (
    <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col min-h-[380px] transition-all hover:shadow-md hover:border-slate-300/80 duration-300">
      <div>
        <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      <div className="flex-grow mt-6 flex items-center justify-center min-h-[260px] w-full">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
