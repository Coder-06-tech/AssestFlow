import React, { useState, useEffect } from 'react';
import * as notificationApi from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCheck, 
  Sliders, 
  Laptop, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  Wrench, 
  ChevronDown, 
  LineChart,
  TrendingUp,
  Clock,
  ArrowRight,
  Bell,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';

const NotificationsPage = () => {
  const { user: currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(5);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getNotifications();
      setNotifications(res.data);
    } catch (err) {
      toast.error('Failed to load notifications from database.', { toastId: 'notif-load-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read.');
    } catch (err) {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const handleToggleRead = async (id) => {
    try {
      const res = await notificationApi.toggleNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: res.data.isRead } : n));
    } catch (err) {
      toast.error('Failed to update read status.');
    }
  };

  const handlePreferences = () => {
    toast.info('Notification preferences settings is handled by teammate.');
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  // Helper to format relative time
  const getRelativeTime = (dateStr) => {
    const diffMs = new Date() - new Date(dateStr);
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Map database model to UI requirements
  const mappedNotifications = notifications.map(n => {
    let icon = Bell;
    let iconBg = 'bg-blue-50 text-blue-600 border border-blue-100';
    let title = 'System Update';
    let tags = [n.type];

    if (n.type === 'Bookings') {
      icon = CheckCircle2;
      iconBg = 'bg-blue-50 text-blue-600 border border-blue-100';
      title = 'Resource Booking Confirmation';
      tags = ['Bookings', 'Reserved'];
    } else if (n.type === 'Alerts') {
      icon = AlertTriangle;
      iconBg = 'bg-rose-50 text-rose-600 border border-rose-150';
      title = 'Critical Alert';
      tags = ['Alerts', 'Critical'];
    } else if (n.type === 'Approvals') {
      icon = FileText;
      iconBg = 'bg-amber-50 text-amber-600 border border-amber-150';
      title = 'Maintenance Request Status Update';
      tags = ['Approvals', 'Pending'];
    }

    return {
      id: n.id,
      type: n.type,
      title,
      description: n.message,
      time: getRelativeTime(n.createdAt),
      isRead: n.isRead,
      createdAt: new Date(n.createdAt),
      tags,
      icon,
      iconBg
    };
  });

  // Filter items
  const filteredList = mappedNotifications.filter(n => {
    if (activeFilter === 'All') return true;
    return n.type === activeFilter;
  });

  const slicedList = filteredList.slice(0, visibleCount);

  // Chronological grouping
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayList = slicedList.filter(n => n.createdAt >= today);
  const yesterdayList = slicedList.filter(n => n.createdAt >= yesterday && n.createdAt < today);
  const olderList = slicedList.filter(n => n.createdAt < yesterday);

  // Statistics Calculation
  const alertsCount = notifications.filter(n => n.type === 'Alerts').length;
  const approvalsCount = notifications.filter(n => n.type === 'Approvals' && !n.isRead).length;

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        </div>
        
        <div className="flex items-center gap-3 justify-end">
          <button 
            onClick={handleMarkAllRead}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-250 border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 rounded-xl text-xs font-bold text-slate-650 transition-all shadow-sm cursor-pointer"
          >
            <CheckCheck size={14} className="text-slate-500" />
            <span>Mark all as read</span>
          </button>
          
          <button 
            onClick={handlePreferences}
            className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-250 border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition-all shadow-sm cursor-pointer"
          >
            <Sliders size={14} className="text-slate-500" />
            <span>Preferences</span>
          </button>
        </div>
      </div>

      {/* FILTER PILLS ROW */}
      <div className="flex flex-wrap gap-2">
        {['All', 'Alerts', 'Approvals', 'Bookings'].map(filter => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer ${
              activeFilter === filter 
                ? 'bg-blue-600 text-white border border-blue-600' 
                : 'bg-[#f1f5f9] text-slate-500 hover:bg-slate-200 border border-transparent'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* NOTIFICATIONS LIST GROUPS */}
      <div className="space-y-8">
        
        {/* GROUP 1: TODAY */}
        {todayList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Today</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            
            <div className="space-y-4.5">
              {todayList.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleToggleRead(n.id)}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 border-l-[3.5px] transition-all flex items-start gap-5 relative overflow-hidden cursor-pointer hover:shadow-md ${
                    !n.isRead ? 'border-l-blue-600 bg-blue-50/10' : 'border-l-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.iconBg}`}>
                    <n.icon size={18} />
                  </div>
                  
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-extrabold text-slate-800 leading-snug truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{n.description}</p>
                    
                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2 pt-2.5">
                      {n.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[9px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUP 2: YESTERDAY */}
        {yesterdayList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Yesterday</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4.5">
              {yesterdayList.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleToggleRead(n.id)}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 border-l-[3.5px] transition-all flex items-start gap-5 relative overflow-hidden cursor-pointer hover:shadow-md ${
                    !n.isRead ? 'border-l-blue-600 bg-blue-50/10' : 'border-l-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.iconBg}`}>
                    <n.icon size={18} />
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-extrabold text-slate-800 leading-snug truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{n.description}</p>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2 pt-2.5">
                      {n.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[9px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GROUP 3: OLDER NOTIFICATIONS */}
        {olderList.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Older</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            <div className="space-y-4.5">
              {olderList.map(n => (
                <div 
                  key={n.id}
                  onClick={() => handleToggleRead(n.id)}
                  className={`bg-white border border-slate-200 rounded-2xl p-5 border-l-[3.5px] transition-all flex items-start gap-5 relative overflow-hidden cursor-pointer hover:shadow-md ${
                    !n.isRead ? 'border-l-blue-600 bg-blue-50/10' : 'border-l-transparent'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${n.iconBg}`}>
                    <n.icon size={18} />
                  </div>

                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-sm font-extrabold text-slate-800 leading-snug truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 font-bold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal">{n.description}</p>

                    {/* Tags row */}
                    <div className="flex flex-wrap gap-2 pt-2.5">
                      {n.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[9px] font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EMPTY STATE */}
        {notifications.length === 0 && !loading && (
          <div className="text-center py-20 text-slate-400 italic bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-center">
              <Sparkles size={32} className="text-blue-500 animate-pulse" />
            </div>
            <div>
              <p className="font-extrabold text-slate-800 text-sm">You are all caught up!</p>
              <p className="text-xs text-slate-450 mt-1">No alerts or reservations notifications recorded in the database.</p>
            </div>
          </div>
        )}

      </div>

      {/* ACTIVITY OVERVIEW STATS BOX */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LineChart className="text-blue-600" size={20} />
            <h3 className="font-extrabold text-slate-800 text-base">Activity Overview</h3>
          </div>
          <button className="text-xs font-bold text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-50 cursor-pointer">
            Last 7 Days
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1 */}
          <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-5 pl-7 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Alerts</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-800">{alertsCount}</span>
              <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                <TrendingUp size={10} />
                <span>+12%</span>
              </span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-5 pl-7 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approvals Pending</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-800">0{approvalsCount}</span>
              <span className="text-blue-600 text-[10px] font-bold">Requires Action</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-5 pl-7 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Avg Resolution</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-black text-slate-800">2.4h</span>
              <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                <TrendingUp size={10} className="rotate-180" />
                <span>-0.5h</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOAD OLDER BUTTON */}
      {filteredList.length > visibleCount && (
        <div className="flex justify-center pt-2">
          <button 
            onClick={handleLoadMore}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 rounded-xl text-xs font-bold text-slate-650 transition-all shadow-sm cursor-pointer"
          >
            <span>Load Older Notifications</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        </div>
      )}

    </div>
  );
};

export default NotificationsPage;
