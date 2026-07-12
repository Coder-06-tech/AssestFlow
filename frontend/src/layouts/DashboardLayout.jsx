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
  Building
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    {
      title: null,
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'BOOK_ASSETS' },
        { name: 'Assets', href: '/assets', icon: Package, permission: 'BOOK_ASSETS' },
        { name: 'Allocations', href: '/allocations', icon: ClipboardCheck, permission: 'BOOK_ASSETS' },
        { name: 'Resource Booking', href: '/bookings', icon: Calendar, permission: 'BOOK_ASSETS' },
        { name: 'Maintenance', href: '/maintenance', icon: Wrench, permission: 'BOOK_ASSETS' }
      ]
    },
    {
      title: 'REPORTS & DATA',
      items: [
        { name: 'Audits', href: '/audits', icon: ClipboardList, permission: 'BOOK_ASSETS' },
        { name: 'Reports', href: '/reports', icon: BarChart3, permission: 'VIEW_ANALYTICS' }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Organization', href: '/org-setup', icon: Building, permission: 'VIEW_ORG_SETUP' },
        { name: 'Settings', href: '/settings', icon: Settings, permission: 'BOOK_ASSETS' }
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const activeClass = (path) => {
    return location.pathname === path
      ? 'bg-[#eff6ff] text-[#2563eb] font-semibold border-r-4 border-[#2563eb]'
      : 'text-[#475569] hover:bg-slate-50 hover:text-[#1e293b]';
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-rose-50 text-rose-600 border border-rose-200';
      case 'ASSET_MANAGER': return 'bg-amber-50 text-amber-600 border border-amber-200';
      case 'DEPARTMENT_HEAD': return 'bg-indigo-50 text-indigo-600 border border-indigo-200';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200';
    }
  };

  const renderNavItems = (isMobile = false) => {
    return sections.map((section, sIdx) => {
      const filteredItems = section.items.filter(item => hasPermission(user?.role, item.permission));
      if (filteredItems.length === 0) return null;

      return (
        <div key={sIdx} className="space-y-1">
          {section.title && (
            <h5 className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {section.title}
            </h5>
          )}
          {filteredItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => isMobile && setMobileMenuOpen(false)}
              className={`flex items-center px-3 py-2 rounded-lg text-sm transition-all duration-150 group ${activeClass(item.href)}`}
            >
              <item.icon className="mr-3 h-4.5 w-4.5 shrink-0 stroke-[1.8]" />
              {item.name}
            </Link>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] flex flex-col md:flex-row font-sans">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-[#e2e8f0] shrink-0">
        
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-[#e2e8f0] gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white shadow-sm">
            <Layers className="h-5 w-5 stroke-[2]" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-[#1e1b4b]">AssetFlow</span>
            <span className="text-[9px] font-bold tracking-wider text-neutral-400 uppercase">Enterprise Management</span>
          </div>
        </div>

        {/* User profile Summary */}
        <div className="p-4 border-b border-[#e2e8f0] bg-slate-50/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold text-[#1e293b] truncate leading-tight">{user?.name}</h4>
              <p className="text-xs text-neutral-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getRoleBadgeColor(user?.role)}`}>
              {user?.role?.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-3 overflow-y-auto">
          {renderNavItems()}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#e2e8f0]">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm text-[#ef4444] hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <LogOut className="mr-3 h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between h-16 bg-white border-b border-[#e2e8f0] px-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-[#4f46e5] flex items-center justify-center text-white">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-bold text-[#1e1b4b]">AssetFlow</span>
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
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1e293b]">{user?.name}</h4>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
              </div>
              <div className="mt-2.5">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getRoleBadgeColor(user?.role)}`}>
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
              {renderNavItems(true)}
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
