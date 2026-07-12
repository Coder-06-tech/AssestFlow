import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasPermission } from '../lib/roles';
import { 
  LayoutDashboard, 
  BarChart3, 
  Settings, 
  LogOut, 
  Layers, 
  Menu, 
  X,
  Package,
  ClipboardCheck,
  Calendar,
  Wrench,
  ClipboardList,
  Building,
  Bell
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Grouped sections as depicted in the mockup
  const topItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'BOOK_ASSETS' },
    { name: 'Assets', href: '/assets', icon: Package, permission: 'BOOK_ASSETS' },
    { name: 'Allocations', href: '/allocations', icon: ClipboardCheck, permission: 'BOOK_ASSETS' },
    { name: 'Resource Booking', href: '/bookings', icon: Calendar, permission: 'BOOK_ASSETS' },
    { name: 'Maintenance', href: '/maintenance', icon: Wrench, permission: 'BOOK_ASSETS' },
    { name: 'Audits', href: '/audits', icon: ClipboardList, permission: 'BOOK_ASSETS' },
    { name: 'Reports', href: '/reports', icon: BarChart3, permission: 'VIEW_ANALYTICS' }
  ];

  const bottomItems = [
    { name: 'Notifications', href: '/notifications', icon: Bell, permission: 'BOOK_ASSETS' },
    { name: 'Organization', href: '/org-setup', icon: Building, permission: 'VIEW_ORG_SETUP' },
    { name: 'Settings', href: '/settings', icon: Settings, permission: 'BOOK_ASSETS' }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const activeClass = (path) => {
    return location.pathname === path
      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
      : 'text-[#475569] hover:bg-slate-50 hover:text-[#1e293b]';
  };

  const renderNavList = (items, isMobile = false) => {
    return items.map((item) => (
      <Link
        key={item.name}
        to={item.href}
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`flex items-center px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 group ${activeClass(item.href)}`}
      >
        <item.icon className="mr-3 h-4.5 w-4.5 shrink-0 stroke-[2.2] text-slate-500 group-hover:text-[#1e293b] group-[.bg-\[\#eff6ff\]]:text-[#2563eb]" />
        <span>{item.name}</span>
      </Link>
    ));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e2e8f0] shrink-0 h-screen sticky top-0">
        
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-[#e2e8f0] gap-3">
          <div className="h-8.5 w-8.5 rounded-lg bg-[#2563eb] flex items-center justify-center text-white shadow-sm">
            <Layers className="h-4.5 w-4.5 stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#1e1b4b]">AssetFlow</span>
            <span className="text-[8px] font-bold tracking-wider text-slate-400 uppercase">Enterprise Management</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 py-5 space-y-4 overflow-y-auto scrollbar-thin">
          <div className="space-y-1.5">
            {renderNavList(topItems)}
          </div>
          
          <hr className="border-t border-slate-200/80 mx-2" />
          
          <div className="space-y-1.5">
            {renderNavList(bottomItems)}
          </div>
        </nav>

        {/* User profile Summary at Bottom */}
        <div className="p-4 border-t border-[#e2e8f0]">
          <div className="flex items-center gap-3 bg-[#f1f5f9] rounded-2xl p-3 border border-slate-200/50">
            <div className="h-8.5 w-8.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-blue-200">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="overflow-hidden min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{user?.name || 'Alex Sterling'}</h4>
              <p className="text-[9px] text-slate-500 font-semibold truncate mt-0.5 capitalize">
                {user?.role === 'ADMIN' ? 'System Admin' : user?.role === 'ASSET_MANAGER' ? 'Asset Manager' : 'Ops Lead'}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-auto text-slate-400 hover:text-red-650 hover:bg-slate-200/80 p-1.5 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={13} className="text-slate-500 hover:text-red-600" />
            </button>
          </div>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between h-16 bg-white border-b border-[#e2e8f0] px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#2563eb] flex items-center justify-center text-white">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <span className="text-sm font-bold text-[#1e1b4b]">AssetFlow</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-lg border border-[#e2e8f0] text-neutral-500 hover:text-[#1e293b] hover:bg-slate-50"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 flex flex-col pt-16 animate-fade-in">
          <div className="bg-white flex-grow flex flex-col max-w-[280px] w-full border-r border-[#e2e8f0] shadow-xl">
            <div className="p-4 border-b border-[#e2e8f0] bg-slate-50/40">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-indigo-650 bg-blue-600 flex items-center justify-center font-bold text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1e293b]">{user?.name}</h4>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
            </div>
            
            <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
              <div className="space-y-1.5">
                {renderNavList(topItems, true)}
              </div>
              <hr className="border-t border-slate-200" />
              <div className="space-y-1.5">
                {renderNavList(bottomItems, true)}
              </div>
            </nav>
            
            <div className="p-4 border-t border-[#e2e8f0]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-red-50 rounded-lg"
              >
                <LogOut className="mr-3 h-4.5 w-4.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default DashboardLayout;
