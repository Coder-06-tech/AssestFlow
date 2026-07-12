import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BookResourceModal from '../components/BookResourceModal';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal,
  Layout, 
  Wrench, 
  Car,
  DoorOpen
} from 'lucide-react';

const BookingPage = () => {
  const { user } = useAuth();
  
  // Date states - Initializing to July 2026 to match screenshot
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 12)); // July 12, 2026
  const [view, setView] = useState('Month'); // Day, Week, Month
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All Resources');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [bookings, setBookings] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, resourcesRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/bookings/resources')
      ]);

      if (bookingsRes.data.success) {
        setBookings(bookingsRes.data.data);
      }
      if (resourcesRes.data.success) {
        setResources(resourcesRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resource booking information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingCreated = (newBooking) => {
    setBookings(prev => [...prev, newBooking]);
  };

  // Generate monthly calendar grid helper
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    // Day of the week of first day (0 = Sun, 1 = Mon, ..., 6 = Sat)
    // Convert to Mon-first index: Mon = 0, ..., Sun = 6
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx === -1) startDayIdx = 6; // Sunday

    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const prevDaysInMonth = new Date(year, month, 0).getDate();

    const calendarGrid = [];

    // Add days from previous month
    for (let i = startDayIdx - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevDaysInMonth - i);
      calendarGrid.push({ date: d, isCurrentMonth: false });
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      calendarGrid.push({ date: d, isCurrentMonth: true });
    }

    // Add days of next month to complete the grid (usually 42 cells for 6 rows)
    const totalCells = 42;
    const nextMonthDaysToAdd = totalCells - calendarGrid.length;
    for (let i = 1; i <= nextMonthDaysToAdd; i++) {
      const d = new Date(year, month + 1, i);
      calendarGrid.push({ date: d, isCurrentMonth: false });
    }

    return calendarGrid;
  };

  // Filtering bookings
  const filteredBookings = bookings.filter(booking => {
    if (selectedCategoryFilter === 'All Resources') return true;
    
    const catName = booking.asset?.category?.name || booking.asset?.categoryName || '';
    if (selectedCategoryFilter === 'Facilities') {
      return catName.includes('Facilities') || catName.includes('Rooms');
    }
    if (selectedCategoryFilter === 'Equipment') {
      return catName === 'Equipment';
    }
    if (selectedCategoryFilter === 'Fleet') {
      return catName === 'Fleet';
    }
    return true;
  });

  // Calculate KPIs (Facilities Active, Equipment In Use, Fleet Booked)
  const getKpis = () => {
    let facilities = 12; // Static base from mockup
    let equipment = 48; // Static base
    let fleet = 6;      // Static base

    // Dynamically adjust based on actual database entries for real-time feel
    bookings.forEach(b => {
      if (b.status === 'UPCOMING' || b.status === 'ONGOING') {
        const catName = b.asset?.category?.name || b.asset?.categoryName || '';
        if (catName.includes('Facilities') || catName.includes('Rooms')) {
          facilities += 1;
        } else if (catName === 'Equipment') {
          equipment += 1;
        } else if (catName === 'Fleet') {
          fleet += 1;
        }
      }
    });

    return { facilities, equipment, fleet };
  };

  const kpis = getKpis();

  // Helper styling for event block colours based on category
  const getEventStyle = (booking) => {
    const catName = booking.asset?.category?.name || booking.asset?.categoryName || '';
    if (catName.includes('Facilities') || catName.includes('Rooms')) {
      // Primary blue palette
      return 'bg-blue-50 text-[#2563eb] border-l-4 border-[#2563eb] font-medium';
    }
    if (catName === 'Equipment') {
      // Tertiary orange/rust palette
      return 'bg-orange-50 text-[#bc4800] border-l-4 border-[#bc4800] font-medium';
    }
    // Neutral slate palette for fleet/other
    return 'bg-slate-50 text-[#475569] border-l-4 border-[#64748b] font-medium';
  };

  const daysGrid = getDaysInMonth(currentDate);

  // Formatting date titles
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const yearName = currentDate.getFullYear();

  // Navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1e293b] tracking-tight">Resource Booking</h1>
          <p className="text-sm text-[#64748b] mt-0.5">Manage and schedule facilities, equipment, and fleet usage.</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Day/Week/Month Toggles */}
          <div className="inline-flex rounded-lg border border-[#e2e8f0] bg-slate-50/50 p-1">
            {['Day', 'Week', 'Month'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === v
                    ? 'bg-white text-[#1e293b] shadow-sm'
                    : 'text-[#64748b] hover:text-[#1e293b]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="h-4.5 w-4.5 stroke-[2.5]" />
            Book Resource
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* KPI: Facilities */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
            <DoorOpen className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Facilities</span>
            <span className="text-lg font-bold text-[#1e293b] mt-0.5">{kpis.facilities} Active</span>
          </div>
        </div>

        {/* KPI: Equipment */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-orange-50 text-[#bc4800] flex items-center justify-center">
            <Wrench className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Equipment</span>
            <span className="text-lg font-bold text-[#1e293b] mt-0.5">{kpis.equipment} In Use</span>
          </div>
        </div>

        {/* KPI: Fleet */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-slate-50 text-[#64748b] flex items-center justify-center">
            <Car className="h-5 w-5 stroke-[2]" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Fleet</span>
            <span className="text-lg font-bold text-[#1e293b] mt-0.5">{kpis.fleet} Booked</span>
          </div>
        </div>

        {/* Filter Resource Card */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-neutral-50 text-neutral-500 flex items-center justify-center border border-neutral-100">
              <SlidersHorizontal className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">Filter Resource</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-sm font-semibold text-[#2563eb] bg-transparent border-none p-0 focus:ring-0 focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="All Resources">All Resources</option>
                <option value="Facilities">Facilities</option>
                <option value="Equipment">Equipment</option>
                <option value="Fleet">Fleet</option>
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-sm overflow-hidden">
        
        {/* Month Navigation Title */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1e293b] flex items-center gap-2">
            <span>{monthName} {yearName}</span>
          </h2>
          <div className="flex items-center gap-1.5">
            <button 
              onClick={prevMonth}
              className="p-1.5 rounded-lg border border-[#e2e8f0] text-neutral-500 hover:text-[#1e293b] hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date(2026, 6, 12))}
              className="px-3 py-1.5 text-xs font-semibold border border-[#e2e8f0] rounded-lg hover:bg-slate-50 transition-colors text-neutral-600 hover:text-neutral-900"
            >
              Today
            </button>
            <button 
              onClick={nextMonth}
              className="p-1.5 rounded-lg border border-[#e2e8f0] text-neutral-500 hover:text-[#1e293b] hover:bg-slate-50 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Headers */}
        <div className="grid grid-cols-7 border-b border-[#e2e8f0] bg-slate-50/50 text-center text-xs font-semibold text-[#64748b] py-2">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Grid Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#e2e8f0] border-l border-t border-transparent">
          {daysGrid.map((cell, idx) => {
            const cellDateStr = cell.date.toDateString();
            
            // Get bookings for this day
            const cellBookings = filteredBookings.filter(b => {
              const bDate = new Date(b.startTime);
              return bDate.toDateString() === cellDateStr && b.status !== 'CANCELLED';
            });

            const isToday = cellDateStr === new Date().toDateString();

            return (
              <div 
                key={idx} 
                className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth ? 'bg-white' : 'bg-slate-50/30'
                } hover:bg-slate-50/40`}
              >
                {/* Date Label */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs font-semibold ${
                    isToday 
                      ? 'h-6 w-6 rounded-full bg-[#2563eb] text-white flex items-center justify-center'
                      : cell.isCurrentMonth ? 'text-[#1e293b]' : 'text-neutral-300'
                  }`}>
                    {cell.date.getDate().toString().padStart(2, '0')}
                  </span>
                </div>

                {/* Event Tags List */}
                <div className="space-y-1 mt-2 flex-grow overflow-y-auto max-h-[85px] scrollbar-thin">
                  {cellBookings.map(booking => (
                    <div
                      key={booking.id}
                      className={`text-[10px] px-2 py-1.5 rounded border border-transparent truncate cursor-pointer transition-all hover:shadow-xs ${getEventStyle(booking)}`}
                      title={`${booking.asset?.name || 'Asset'} - Booked by ${booking.user?.name || 'User'}`}
                    >
                      {booking.asset?.name || 'Asset'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Book New Resource Modal */}
      <BookResourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        resources={resources}
        user={user}
        onBookingCreated={handleBookingCreated}
      />

    </div>
  );
};

export default BookingPage;
