import React, { useState } from 'react';
import { X, ArrowLeft, Mail, User } from 'lucide-react';

const GoogleMockModal = ({ isOpen, onClose, onSelectAccount }) => {
  const [customMode, setCustomMode] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const mockAccounts = [
    { name: 'System Admin', email: 'admin@assetflow.com', role: 'ADMIN', color: 'bg-indigo-600' },
    { name: 'Jane Doe', email: 'jane.doe@assetflow.com', role: 'DEPARTMENT_HEAD', color: 'bg-rose-500' },
    { name: 'Sarah Ross', email: 's.ross@assetflow.com', role: 'ASSET_MANAGER', color: 'bg-blue-500' },
    { name: 'Marcus Chen', email: 'm.chen@assetflow.com', role: 'EMPLOYEE', color: 'bg-emerald-500' }
  ];

  const handleSelect = (account) => {
    // Generate a mock token payload format
    const mockToken = `mock_google_token::${account.email}::${account.name}`;
    onSelectAccount(mockToken);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    const finalName = name || email.split('@')[0];
    const mockToken = `mock_google_token::${email}::${finalName}`;
    onSelectAccount(mockToken);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden transform transition-all duration-300 scale-100 animate-scale-in">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="pt-8 pb-6 px-8 flex flex-col items-center border-b border-neutral-100">
          {/* Animated Colored Google G Logo */}
          <div className="h-10 w-10 mb-4 flex items-center justify-center bg-white border border-neutral-100 shadow-sm rounded-full animate-bounce-subtle">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.2-5.136 4.2A5.6 5.6 0 0 1 8.35 13a5.6 5.6 0 0 1 5.641-5.6c1.478 0 2.822.548 3.847 1.448l3.12-3.12A9.97 9.97 0 0 0 13.99 2 9.99 9.99 0 0 0 4 12a9.99 9.99 0 0 0 9.99 10c5.518 0 9.99-4.482 9.99-10 0-.585-.053-1.157-.153-1.715z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-neutral-800">
            Sign in with Google
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            to continue to <span className="font-semibold text-indigo-600">AssetFlow</span>
          </p>

          <div className="mt-3 px-3 py-1 bg-yellow-50 text-yellow-800 rounded-full text-[10px] font-bold tracking-wider uppercase border border-yellow-100">
            Sandbox Environment
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {!customMode ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Select an account
              </p>
              
              {/* Mock Accounts List */}
              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1.5">
                {mockAccounts.map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(account)}
                    className="w-full flex items-center justify-between p-3 border border-neutral-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/20 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      {/* Round Avatar */}
                      <div className={`h-8 w-8 rounded-full ${account.color} text-white font-bold flex items-center justify-center text-xs shadow-sm shadow-indigo-600/10`}>
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-800 group-hover:text-indigo-900 transition-colors">
                          {account.name}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {account.email}
                        </p>
                      </div>
                    </div>
                    {/* Badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">
                      {account.role.replace('_', ' ')}
                    </span>
                  </button>
                ))}
              </div>

              {/* Toggle to custom creator */}
              <button
                onClick={() => setCustomMode(true)}
                className="w-full mt-4 flex justify-center items-center gap-1.5 py-2.5 border border-dashed border-neutral-200 hover:border-indigo-300 rounded-xl text-xs font-bold text-neutral-600 hover:text-indigo-600 bg-neutral-50/50 hover:bg-indigo-50/10 transition-colors"
              >
                Use another account
              </button>
            </div>
          ) : (
            /* Custom mock user form */
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="p-1 hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 rounded-full transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Create Google profile
                </span>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wide">
                  Google Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    placeholder="e.g. alex.j@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-neutral-200 rounded-lg text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-shadow"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomMode(false)}
                  className="flex-1 py-2.5 px-4 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10 transition-colors"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-neutral-50/80 border-t border-neutral-100 py-4 px-6 flex justify-between items-center text-[10px] text-neutral-400">
          <span>Secure Google login simulation</span>
          <a href="#" className="hover:underline hover:text-neutral-500">Learn more</a>
        </div>
      </div>

      {/* Embedded Animations CSS */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-bounce-subtle {
          animation: bounceSubtle 3s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default GoogleMockModal;
