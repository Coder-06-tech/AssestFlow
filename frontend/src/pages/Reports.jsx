import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Download, Calendar, Filter, BarChart3 } from 'lucide-react';
import api from '../lib/api';
import ChartCard from '../components/common/ChartCard';
import ListPanel from '../components/common/ListPanel';
import BookingHeatmap from '../components/common/BookingHeatmap';
import { exportReportToCSV } from '../utils/exportReport';

// Recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const Reports = () => {
  const [categories, setCategories] = useState([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  // Metrics states
  const [utilization, setUtilization] = useState([]);
  const [maintenanceFrequency, setMaintenanceFrequency] = useState([]);
  const [mostUsed, setMostUsed] = useState([]);
  const [idle, setIdle] = useState([]);
  const [maintenanceDue, setMaintenanceDue] = useState([]);
  const [allocationSummary, setAllocationSummary] = useState([]);
  const [bookingHeatmap, setBookingHeatmap] = useState([]);

  // Fetch categories for filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/org/categories');
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch all analytics datasets
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterCategory) params.categoryId = filterCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [
        utilRes,
        freqRes,
        mostUsedRes,
        idleRes,
        dueRes,
        allocSummaryRes,
        heatmapRes
      ] = await Promise.all([
        api.get('/analytics/utilization', { params }),
        api.get('/analytics/maintenance-frequency', { params }),
        api.get('/analytics/most-used', { params }),
        api.get('/analytics/idle', { params }),
        api.get('/analytics/maintenance-due', { params }),
        api.get('/analytics/allocation-summary', { params }),
        api.get('/analytics/booking-heatmap', { params })
      ]);

      if (utilRes.data.success) setUtilization(utilRes.data.data);
      if (freqRes.data.success) setMaintenanceFrequency(freqRes.data.data);
      if (mostUsedRes.data.success) setMostUsed(mostUsedRes.data.data);
      if (idleRes.data.success) setIdle(idleRes.data.data);
      if (dueRes.data.success) setMaintenanceDue(dueRes.data.data);
      if (allocSummaryRes.data.success) setAllocationSummary(allocSummaryRes.data.data);
      if (heatmapRes.data.success) setBookingHeatmap(heatmapRes.data.data);

    } catch (err) {
      toast.error('Failed to load reports. Please try again.');
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filterCategory, startDate, endDate]);

  const handleExport = () => {
    try {
      exportReportToCSV({
        utilization,
        maintenanceFrequency,
        mostUsed,
        idle,
        maintenanceDue,
        allocationSummary
      });
      toast.success('Report exported successfully!');
    } catch (err) {
      toast.error('Failed to export CSV report.');
      console.error('Export error:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-[#374bd5]" />
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Reports & Analytics</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1.5 font-medium">
            Surfacing key operational insights (utilization, maintenance frequency, idle assets, resource booking)
          </p>
        </div>

        {/* Outlined Export Button */}
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 border border-[#374bd5] text-[#374bd5] font-semibold text-xs rounded-xl hover:bg-indigo-50/50 active:bg-indigo-50 transition-colors duration-200 shadow-sm"
        >
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          {/* Category Filter */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-[#374bd5] focus:outline-none w-full sm:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker Start */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-[#374bd5] focus:outline-none w-full sm:w-auto"
              placeholder="Start Date"
            />
          </div>

          <span className="text-slate-400 text-xs font-semibold hidden sm:inline">—</span>

          {/* Date Picker End */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white text-slate-700 font-medium focus:ring-1 focus:ring-[#374bd5] focus:outline-none w-full sm:w-auto"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Clear Filters Link */}
        {(filterCategory || startDate || endDate) && (
          <button
            onClick={() => {
              setFilterCategory('');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-[#374bd5] hover:underline font-semibold"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Top Row: Two Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChartCard
          title="Asset Utilization by Department"
          subtitle="Real-time allocation efficiency tracking"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#374bd5]"></div>
          ) : utilization.length === 0 ? (
            <div className="text-xs font-semibold text-slate-400">No utilization data found</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={utilization} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Bar dataKey="value" fill="#374bd5" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Maintenance Frequency"
          subtitle="Monthly incident ticket trends"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#374bd5]"></div>
          ) : maintenanceFrequency.length === 0 ? (
            <div className="text-xs font-semibold text-slate-400">No incident records found</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={maintenanceFrequency} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px' }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#374bd5"
                  strokeWidth={3}
                  dot={{ fill: '#374bd5', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Middle Row: Three List Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ListPanel title="Most Used Assets" items={mostUsed} loading={loading} />
        <ListPanel title="Idle Assets" items={idle} loading={loading} />
        <ListPanel title="Due Maintenance / Near Retirement" items={maintenanceDue} loading={loading} />
      </div>

      {/* Booking Heatmap */}
      <BookingHeatmap data={bookingHeatmap} loading={loading} />

      {/* Department allocation table summary */}
      <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm flex flex-col">
        <h3 className="text-base font-bold text-slate-800 tracking-tight mb-4">Department-wise Allocation Summary</h3>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#374bd5]"></div>
          </div>
        ) : allocationSummary.length === 0 ? (
          <div className="py-10 text-center text-xs font-semibold text-slate-400">No departments currently allocated</div>
        ) : (
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
              <thead className="bg-[#f8fafc]">
                <tr>
                  <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-center">Currently Allocated Assets</th>
                  <th className="px-6 py-3.5 font-bold text-slate-500 uppercase tracking-wider text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {allocationSummary.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                    <td className="px-6 py-3.5 text-slate-700 font-bold">{item.department}</td>
                    <td className="px-6 py-3.5 text-slate-600 text-center font-bold">{item.allocatedCount}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
