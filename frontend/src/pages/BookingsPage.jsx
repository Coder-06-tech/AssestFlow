import React, { useState, useEffect } from 'react';
import * as bookingApi from '../services/bookingService';
import * as assetApi from '../services/assetService';

import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  MapPin, 
  User, 
  Clock, 
  AlertTriangle,
  X,
  FileText,
  Wrench,
  CalendarDays,
  ShieldAlert,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { toast } from 'react-toastify';

const BookingsPage = () => {
  const { user: currentUser } = useAuth();
  
  // Date states (defaults to July 2026)
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(6); // 6 = July (0-indexed)
  const [selectedDay, setSelectedDay] = useState(12);
  const [activeView, setActiveView] = useState('Month'); // 'Month' | 'Week' | 'Day'
  
  // Data states
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [filterAssetId, setFilterAssetId] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Form states
  const [formAssetId, setFormAssetId] = useState('');
  const [formDate, setFormDate] = useState('2026-07-12');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [formSubmitLoading, setFormSubmitLoading] = useState(false);

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch assets
      const assetRes = await assetApi.getAssets();
      setAssets(assetRes.data);
      if (assetRes.data.length > 0) {
        setFormAssetId(assetRes.data[0].id.toString());
      }
      
      // Fetch bookings
      const bookingRes = await bookingApi.getBookings();
      setBookings(bookingRes.data);
    } catch (err) {
      toast.error('Failed to load data. Ensure database is seeded and server is running.', { toastId: 'bookings-fetch-error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Align to Monday-start
  };

  // Month Navigation
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Week Navigation
  const handlePrevWeek = () => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    d.setDate(d.getDate() - 7);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
  };

  const handleNextWeek = () => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    d.setDate(d.getDate() + 7);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
  };

  // Day Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    d.setDate(d.getDate() - 1);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
  };

  const handleNextDay = () => {
    const d = new Date(selectedYear, selectedMonth, selectedDay);
    d.setDate(d.getDate() + 1);
    setSelectedYear(d.getFullYear());
    setSelectedMonth(d.getMonth());
    setSelectedDay(d.getDate());
  };

  const handlePrev = () => {
    if (activeView === 'Month') handlePrevMonth();
    else if (activeView === 'Week') handlePrevWeek();
    else handlePrevDay();
  };

  const handleNext = () => {
    if (activeView === 'Month') handleNextMonth();
    else if (activeView === 'Week') handleNextWeek();
    else handleNextDay();
  };

  // Filter Bookings by active dropdown resource selection
  const filteredBookings = bookings.filter(b => {
    if (filterAssetId === 'all') return b.status !== 'CANCELLED';
    // Match the selected asset's name with the booking's resourceName
    const selectedAsset = assets.find(a => a.id.toString() === filterAssetId);
    return b.status !== 'CANCELLED' && b.resourceName === selectedAsset?.name;
  });

  // 1. MONTH CELL ARRAY GENERATION
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const firstDayIndex = getFirstDayOfMonth(selectedYear, selectedMonth);
  
  const dayCells = [];
  
  // Padding cells from previous month
  const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
  const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
  const prevDaysCount = getDaysInMonth(prevYear, prevMonth);
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    dayCells.push({ isPadding: true, dayNum: prevDaysCount - i });
  }

  // Actual day cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayBookings = filteredBookings.filter(b => {
      const bDate = new Date(b.date);
      const bDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
      return bDateStr === dateStr;
    });
    dayCells.push({ isPadding: false, dayNum: d, dateStr, bookings: dayBookings });
  }

  // 2. WEEK DAYS ARRAY GENERATION
  const getWeekDaysData = () => {
    const activeDate = new Date(selectedYear, selectedMonth, selectedDay);
    const startOfWeek = new Date(activeDate);
    startOfWeek.setDate(activeDate.getDate() - activeDate.getDay()); // Sunday start
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
      
      const dayBookings = filteredBookings.filter(b => {
        const bDate = new Date(b.date);
        const bDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
        return bDateStr === dateStr;
      });
      
      days.push({
        date: day,
        dateStr,
        dayNum: day.getDate(),
        dayName: day.toLocaleDateString([], { weekday: 'short' }),
        bookings: dayBookings
      });
    }
    return days;
  };

  // 3. DAY SCHEDULE DATA GENERATION
  const getDayScheduleData = () => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    const dayBookings = filteredBookings.filter(b => {
      const bDate = new Date(b.date);
      const bDateStr = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}-${String(bDate.getDate()).padStart(2, '0')}`;
      return bDateStr === dateStr;
    });
    return { dateStr, bookings: dayBookings };
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    try {
      setFormSubmitLoading(true);
      const selectedAsset = assets.find(a => a.id.toString() === formAssetId);
      const resourceName = selectedAsset ? selectedAsset.name : 'Unknown Resource';

      await bookingApi.createBooking(
        resourceName,
        formDate,
        formStartTime,
        formEndTime
      );

      toast.success('Resource booked successfully!');
      setShowBookingModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Time conflict or error booking resource.');
    } finally {
      setFormSubmitLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await bookingApi.updateBookingStatus(bookingId, 'CANCELLED');
      toast.info('Booking has been cancelled');
      setShowDetailsModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UPCOMING': return 'bg-blue-50 text-blue-700 border-blue-150';
      case 'ONGOING': return 'bg-emerald-50 text-emerald-700 border-emerald-150 animate-pulse';
      case 'COMPLETED': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'CANCELLED': return 'bg-rose-50 text-rose-600 border-rose-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getBarColors = (resourceName) => {
    const barColors = [
      'border-l-4 border-blue-500 bg-blue-50 text-blue-700',
      'border-l-4 border-amber-500 bg-amber-50 text-amber-700',
      'border-l-4 border-emerald-500 bg-emerald-50 text-emerald-700',
      'border-l-4 border-purple-500 bg-purple-50 text-purple-700',
    ];
    const colorIndex = resourceName ? resourceName.charCodeAt(0) % barColors.length : 0;
    return barColors[colorIndex];
  };

  const renderHeaderTitle = () => {
    if (activeView === 'Month') {
      return `${monthNames[selectedMonth]} ${selectedYear}`;
    } else if (activeView === 'Week') {
      const activeDate = new Date(selectedYear, selectedMonth, selectedDay);
      const start = new Date(activeDate);
      start.setDate(activeDate.getDate() - activeDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${monthNames[start.getMonth()]} ${start.getDate()} – ${
        end.getMonth() !== start.getMonth() ? monthNames[end.getMonth()] + ' ' : ''
      }${end.getDate()}, ${selectedYear}`;
    } else {
      return new Date(selectedYear, selectedMonth, selectedDay).toLocaleDateString([], {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resource Booking</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and schedule facilities, equipment, and fleet usage.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Active View Switcher */}
          <div className="bg-slate-100 rounded-lg p-0.5 flex shadow-inner">
            {['Day', 'Week', 'Month'].map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeView === view 
                    ? 'bg-white shadow-sm text-slate-800' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              if (assets.length === 0) {
                toast.warning('Please seed mock assets first using the button at the bottom left.');
                return;
              }
              const todayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
              setFormDate(todayStr);
              setShowBookingModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            <span>Book Resource</span>
          </button>
        </div>
      </div>

      {/* FILTER & STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Quick statistics */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
            <CalendarDays size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
            <span className="text-xl font-extrabold text-slate-800">{filteredBookings.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Completed</span>
            <span className="text-xl font-extrabold text-slate-800">
              {filteredBookings.filter(b => b.status === 'COMPLETED').length}
            </span>
          </div>
        </div>

        {/* Resources Dropdown Selector */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm md:col-span-2 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filter by Resource Name</span>
          <select 
            value={filterAssetId}
            onChange={(e) => setFilterAssetId(e.target.value)}
            className="w-full mt-2 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="all">All Resources</option>
            {assets.map(a => (
              <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
            ))}
          </select>
        </div>
      </div>

      {/* MAIN CALENDAR CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation Bar */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/20">
          <h2 className="font-extrabold text-slate-800 text-base tracking-tight">
            {renderHeaderTitle()}
          </h2>
          <div className="flex items-center gap-1.5 border border-slate-200 bg-white rounded-xl p-1 shadow-sm">
            <button 
              onClick={handlePrev}
              className="p-1.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-slate-50 active:bg-slate-100 transition-colors text-slate-600 cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-2 bg-white">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            <span className="text-xs font-semibold">Loading schedule...</span>
          </div>
        ) : activeView === 'Month' ? (
          /* VIEW 1: MONTHLY GRID */
          <>
            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50 text-center py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="py-1">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-l border-t border-slate-100">
              {dayCells.map((cell, idx) => {
                const isSelected = !cell.isPadding && cell.dayNum === selectedDay;
                const isToday = cell.dateStr === '2026-07-12';
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => {
                      if (!cell.isPadding) {
                        setSelectedDay(cell.dayNum);
                        setActiveView('Day');
                      }
                    }}
                    className={`min-h-32 p-2 flex flex-col justify-between hover:bg-slate-50/50 transition-colors group relative cursor-pointer ${
                      cell.isPadding ? 'bg-slate-50/20 cursor-default' : isSelected ? 'bg-blue-50/10' : 'bg-white'
                    }`}
                  >
                    {/* Day Number */}
                    <div className="flex justify-between items-start">
                      <span className={`text-xs font-bold ${
                        cell.isPadding 
                          ? 'text-slate-300' 
                          : isToday
                            ? 'bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full scale-105 shadow-sm'
                            : 'text-slate-700'
                      }`}>
                        {cell.dayNum}
                      </span>
                      {!cell.isPadding && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // prevent zoom view trigger
                            setFormDate(cell.dateStr);
                            setShowBookingModal(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold transition-all shadow-sm cursor-pointer border border-blue-100/50"
                        >
                          + Book
                        </button>
                      )}
                    </div>

                    {/* Bookings Stack */}
                    <div className="flex-1 mt-1.5 space-y-1 overflow-y-auto max-h-24 scrollbar-thin">
                      {!cell.isPadding && cell.bookings.map(b => (
                        <button
                          key={b.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(b);
                            setShowDetailsModal(true);
                          }}
                          className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded font-bold truncate hover:brightness-95 transition-all shadow-sm cursor-pointer ${getBarColors(b.resourceName)}`}
                        >
                          {b.startTime} - {b.endTime} {b.resourceName}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : activeView === 'Week' ? (
          /* VIEW 2: WEEKLY GRID (7 Columns) */
          <div className="grid grid-cols-7 divide-x divide-slate-200 min-h-[420px] bg-slate-50/10">
            {getWeekDaysData().map((wDay, idx) => {
              const isToday = wDay.dateStr === '2026-07-12';
              return (
                <div key={idx} className="flex flex-col min-h-full p-3 space-y-3">
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{wDay.dayName}</span>
                      <span className={`text-base font-extrabold mt-0.5 ${isToday ? 'bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full shadow-sm' : 'text-slate-800'}`}>
                        {wDay.dayNum}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setFormDate(wDay.dateStr);
                        setShowBookingModal(true);
                      }}
                      className="px-1.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded text-[10px] font-bold transition-all shadow-sm cursor-pointer border border-blue-100/50"
                    >
                      + Book
                    </button>
                  </div>

                  {/* Booking Card Stack */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[350px] scrollbar-thin">
                    {wDay.bookings.map(b => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBooking(b);
                          setShowDetailsModal(true);
                        }}
                        className={`border rounded-xl p-3 shadow-sm hover:shadow hover:brightness-95 transition-all space-y-1.5 cursor-pointer bg-white ${getBarColors(b.resourceName)}`}
                      >
                        <h4 className="text-xs font-extrabold truncate">{b.resourceName}</h4>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                          <Clock size={11} />
                          <span>{b.startTime} - {b.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400">
                          <User size={11} />
                          <span>{b.user.name}</span>
                        </div>
                      </div>
                    ))}
                    {wDay.bookings.length === 0 && (
                      <div className="text-center py-16 text-[10px] text-slate-400 italic font-semibold">No bookings</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* VIEW 3: DAY TIMELINE BY RESOURCE */
          <div className="divide-y divide-slate-100 bg-white">
            {assets.map((asset) => {
              const dayData = getDayScheduleData();
              const assetBookings = dayData.bookings.filter(b => b.resourceName === asset.name);
              
              return (
                <div key={asset.id} className="p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/20 transition-all">
                  {/* Asset Details */}
                  <div className="w-full md:w-64 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                        <Wrench size={16} />
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">{asset.name}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{asset.assetTag}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold pl-1">
                      <MapPin size={11} />
                      <span>{asset.location}</span>
                    </div>
                  </div>

                  {/* Bookings / Status Timeline */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2.5">
                      {assetBookings.map(b => (
                        <div
                          key={b.id}
                          onClick={() => {
                            setSelectedBooking(b);
                            setShowDetailsModal(true);
                          }}
                          className={`border rounded-xl px-4 py-2.5 shadow-sm hover:shadow hover:brightness-95 transition-all space-y-1 cursor-pointer flex flex-col justify-center min-w-[140px] bg-white ${getBarColors(b.resourceName)}`}
                        >
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-850">
                            <Clock size={12} className="text-slate-500" />
                            <span>{b.startTime} - {b.endTime}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <User size={11} />
                            <span>{b.user.name}</span>
                          </div>
                        </div>
                      ))}

                      {assetBookings.length === 0 && (
                        <div className="flex items-center justify-between w-full border border-slate-100 bg-[#f8fafc]/60 rounded-xl p-3.5">
                          <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>Available all day</span>
                          </span>
                          <button
                            onClick={() => {
                              setFormAssetId(asset.id.toString());
                              const todayStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
                              setFormDate(todayStr);
                              setShowBookingModal(true);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-750 font-bold border border-blue-200 bg-white rounded-lg px-3 py-1 shadow-sm hover:bg-blue-50 transition-colors cursor-pointer"
                          >
                            + Book Slot
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE BOOKING MODAL */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowBookingModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl border border-blue-100">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Reserve Resource</h3>
                <p className="text-xs text-slate-500">Reserve equipment or room for your projects.</p>
              </div>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Select Resource</label>
                <select
                  value={formAssetId}
                  onChange={(e) => setFormAssetId(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 cursor-pointer"
                  required
                >
                  {assets.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.assetTag})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Date</label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Start Time</label>
                  <input
                    type="time"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">End Time</label>
                  <input
                    type="time"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="bg-amber-50/40 border border-amber-100 rounded-xl p-3 flex gap-2.5 items-start mt-2">
                <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <span className="text-[11px] text-amber-700 leading-normal">
                  <strong>Conflict Validation:</strong> The server automatically rejects reservations that overlap with existing bookings on the same resource.
                </span>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {formSubmitLoading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Confirm Booking</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X size={18} />
            </button>

            <h3 className="font-bold text-slate-800 text-lg mb-4">Reservation Details</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <FileText size={20} className="text-slate-500 mt-0.5" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Resource / Asset</span>
                  <span className="font-semibold text-sm text-slate-800 block mt-0.5">{selectedBooking.resourceName}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <User size={20} className="text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Reserved By</span>
                    <span className="font-semibold text-xs text-slate-800 block mt-0.5">{selectedBooking.user.name}</span>
                    <span className="text-[10px] text-slate-500 block">{selectedBooking.user.role.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <Clock size={20} className="text-slate-500 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Time Slot</span>
                    <span className="font-semibold text-xs text-slate-800 block mt-0.5">
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {new Date(selectedBooking.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-500">Booking Status</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getStatusColor(selectedBooking.status)}`}>
                  {selectedBooking.status}
                </span>
              </div>

              {/* Cancel Booking Action */}
              {(selectedBooking.userId === currentUser?.id || ['ADMIN', 'ASSET_MANAGER'].includes(currentUser?.role)) && (
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Cancel Reservation</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BookingsPage;
