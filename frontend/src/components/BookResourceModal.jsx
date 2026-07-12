import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';

const BookResourceModal = ({ isOpen, onClose, onBookingCreated, resources, user }) => {
  const [resourceType, setResourceType] = useState('Facilities (Rooms)');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter assets based on selected type
  const filteredAssets = resources.filter(res => {
    if (resourceType === 'Facilities (Rooms)') {
      return res.categoryName === 'Facilities (Rooms)' || res.categoryName === 'Facilities';
    }
    if (resourceType === 'Equipment') {
      return res.categoryName === 'Equipment';
    }
    if (resourceType === 'Fleet') {
      return res.categoryName === 'Fleet';
    }
    return false;
  });

  // Set default asset when resource type changes
  useEffect(() => {
    if (filteredAssets.length > 0) {
      setSelectedAssetId(filteredAssets[0].id.toString());
    } else {
      setSelectedAssetId('');
    }
  }, [resourceType, resources]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssetId) {
      toast.error('Please select an asset to book.');
      return;
    }
    if (!startDate || !endDate) {
      toast.error('Please select start and end date/times.');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      toast.error('Start time must be before end time.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post('/bookings', {
        assetId: parseInt(selectedAssetId),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        purpose
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Booking created successfully!');
        onBookingCreated(response.data.data);
        onClose();
        // Clear inputs
        setStartDate('');
        setEndDate('');
        setPurpose('');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <Calendar className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#1e293b]">Book New Resource</h3>
              <p className="text-xs text-[#64748b]">Check availability and secure assets.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-50 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">
                  Resource Type
                </label>
                <select
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                >
                  <option value="Facilities (Rooms)">Facility (Rooms)</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Fleet">Fleet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">
                  Asset Name
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                >
                  {filteredAssets.map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.assetTag})
                    </option>
                  ))}
                  {filteredAssets.length === 0 && (
                    <option disabled value="">No assets available</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-[#1e293b] focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748b] uppercase tracking-wide mb-1.5">
                Booking Purpose
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe why you are booking this asset..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full text-sm border border-[#e2e8f0] rounded-lg px-3 py-2 bg-white text-[#1e293b] placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#2563eb] focus:border-[#2563eb]"
              />
            </div>

            <div className="bg-[#f0f9ff] border border-[#e0f2fe] rounded-lg p-3 flex items-start gap-2">
              <span className="text-blue-500 text-xs font-semibold">ⓘ</span>
              <p className="text-xs text-[#0369a1] leading-relaxed">
                Automatic approval enabled for this asset category for {user?.name || 'Alex Chen'}.
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#e2e8f0] bg-slate-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#e2e8f0] rounded-lg text-sm font-medium text-[#64748b] hover:bg-white hover:text-[#1e293b] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-[#2563eb] hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default BookResourceModal;
