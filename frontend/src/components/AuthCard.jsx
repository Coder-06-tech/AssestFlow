import React from 'react';
import { Box } from 'lucide-react';

const AuthCard = ({ children, title, subtitle, footer }) => {
  return (
    <div className="min-h-screen bg-[#f4f5fa] flex flex-col justify-center items-center p-6 font-sans">
      <div className="max-w-[440px] w-full flex flex-col items-center">
        
        {/* App Icon (Indigo rounded-square icon with drawer/box glyph) */}
        <div className="h-12 w-12 rounded-xl bg-[#4f46e5] flex items-center justify-center text-white shadow-md shadow-indigo-600/10 mb-3">
          <Box className="h-6 w-6 stroke-[2.2]" />
        </div>

        {/* Title & Tagline */}
        <h1 className="text-2xl font-bold tracking-tight text-[#1e1b4b] mb-1 font-sans">
          AssetFlow
        </h1>
        <p className="text-sm text-neutral-500 mb-6 font-medium">
          Enterprise management simplified.
        </p>

        {/* Card base container */}
        <div className="w-full bg-white border border-[#e2e8f0] rounded-2xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Card Body */}
          <div className="p-8">
            {children}
          </div>

          {/* Lower grey strip footer inside card */}
          {footer && (
            <div className="px-8 py-5 bg-[#f8fafc] border-t border-[#f1f5f9] flex justify-between items-center text-sm text-[#475569] font-medium">
              {footer}
            </div>
          )}
        </div>

        {/* Below-card links */}
        <div className="mt-8 flex items-center justify-center gap-3 text-xs font-semibold text-[#64748b]">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <span>·</span>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <span>·</span>
          <a href="#" className="hover:text-indigo-600 transition-colors">System Status</a>
        </div>

      </div>
    </div>
  );
};

export default AuthCard;
