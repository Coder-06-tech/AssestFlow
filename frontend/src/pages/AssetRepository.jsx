import { useEffect, useState } from 'react';
import {
  Filter,
  Grid3X3,
  List,
  PackagePlus,
  Plus,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../lib/api';

const STATUS_META = {
  AVAILABLE: { label: 'Available', color: '#166534', bg: '#dcfce7' },
  ASSIGNED: { label: 'Assigned', color: '#1d4ed8', bg: '#dbeafe' },
  MAINTENANCE: { label: 'Maintenance', color: '#b45309', bg: '#fef3c7' },
  DISPOSED: { label: 'Disposed', color: '#374151', bg: '#f3f4f6' },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.AVAILABLE;
  return (
    <span
      style={{ color: meta.color, background: meta.bg }}
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
    >
      <span style={{ background: meta.color }} className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full" />
      {meta.label}
    </span>
  );
}

export default function AssetRepository() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let active = true;

    const loadAssets = async () => {
      try {
        const res = await api.get('/assets');
        if (active) {
          setAssets(res.data?.assets || res.data || []);
        }
      } catch (error) {
        if (active) {
          toast.error(error?.response?.data?.error || 'Could not load assets');
          setAssets([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAssets();

    return () => {
      active = false;
    };
  }, []);

  const filteredAssets = assets.filter((asset) => {
    const haystack = `${asset.name || ''} ${asset.serialNumber || ''} ${asset.category?.name || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] p-6 text-white shadow-lg">
          <div
            className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #818cf8 0%, transparent 60%)' }}
          />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-indigo-200">
                <PackagePlus size={11} /> Asset Flow Registry
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Asset Repository</h1>
              <p className="mt-1 text-sm text-indigo-200">
                Track availability, ownership and maintenance health across the portfolio.
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20">
              <Plus size={15} /> Register Asset
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, serial or category"
              className="w-full bg-transparent outline-none"
            />
          </label>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
              <Filter size={15} /> Filter
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
              <SlidersHorizontal size={15} /> View
            </button>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Loading assets...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            No assets match your current search.
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                      <PackagePlus size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-semibold text-slate-800">{asset.name || 'Unnamed asset'}</h2>
                        <StatusBadge status={asset.status || 'AVAILABLE'} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {asset.serialNumber || 'No serial number'} • {asset.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="rounded-full bg-slate-100 px-3 py-1">{asset.location || 'Unassigned'}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">{asset.department?.name || 'No department'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

