import React, { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpDown, Building2, Layers } from 'lucide-react';
import Modal from '../components/Modal';
import * as storage from '../lib/storage';

const statusColors = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'on-hold': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  complete: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  archived: { bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
};

const sectors = [
  'Health & Wellness',
  'Fitness',
  'Food & Beverage',
  'Media & Content',
  'Adventure & Travel',
  'E-commerce',
  'Technology',
  'Other',
];

export default function BusinessOverview({ data, onRefresh, onSelectBusiness }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('status');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', sector: sectors[0], description: '', status: 'active' });

  const filtered = useMemo(() => {
    let list = data.businesses || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) => b.name.toLowerCase().includes(q) || b.sector.toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'status') {
        const order = { active: 0, 'on-hold': 1, complete: 2, archived: 3 };
        return (order[a.status] ?? 4) - (order[b.status] ?? 4);
      }
      if (sortBy === 'date') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      return 0;
    });
    return list;
  }, [data.businesses, search, sortBy]);

  function handleAdd(e) {
    e.preventDefault();
    if (!formData.name.trim()) return;
    storage.addBusiness(formData);
    setFormData({ name: '', sector: sectors[0], description: '', status: 'active' });
    setShowAddModal(false);
    onRefresh();
  }

  const inputClasses =
    'w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-[#F0F0F5] placeholder-[#5A5A6A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors';

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#F0F0F5]">Businesses</h1>
          <p className="text-[13px] text-[#5A5A6A] mt-1">
            {data.businesses.length} business{data.businesses.length !== 1 ? 'es' : ''} in portfolio
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-medium px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={16} />
          Add Business
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A6A]" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={inputClasses + ' pl-9'}
          />
        </div>
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A5A6A]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={inputClasses + ' pl-9 pr-8 cursor-pointer w-[150px]'}
          >
            <option value="status" className="bg-[#0A0A0F]">By Status</option>
            <option value="date" className="bg-[#0A0A0F]">By Date</option>
            <option value="alpha" className="bg-[#0A0A0F]">A-Z</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-static flex flex-col items-center justify-center py-16 text-center">
          <Building2 size={40} className="text-[#5A5A6A] mb-4" />
          <p className="text-[15px] font-medium text-[#8A8A9A] mb-1">
            {search ? 'No businesses match your search' : 'No businesses yet'}
          </p>
          <p className="text-[13px] text-[#5A5A6A]">
            {search ? 'Try a different search term' : 'Add your first business to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((business) => {
            const sc = statusColors[business.status] || statusColors.archived;
            const count = storage.getItemCount(business);
            return (
              <div
                key={business.id}
                onClick={() => onSelectBusiness(business.id)}
                className="glass p-5 cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-[15px] font-semibold text-[#F0F0F5] group-hover:text-[#3B82F6] transition-colors">
                    {business.name}
                  </h3>
                  <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {business.status}
                  </span>
                </div>
                <span className="inline-block text-[11px] font-medium text-[#8A8A9A] bg-white/[0.05] px-2 py-0.5 rounded-md mb-3">
                  {business.sector}
                </span>
                {business.description && (
                  <p className="text-[13px] text-[#5A5A6A] mb-3 line-clamp-2">
                    {business.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-[11px] text-[#5A5A6A] pt-3 border-t border-white/[0.06]">
                  <span className="flex items-center gap-1">
                    <Layers size={12} />
                    {count} item{count !== 1 ? 's' : ''}
                  </span>
                  <span>{new Date(business.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Business">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">
              Business Name <span className="text-[#3B82F6]">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ted's Health"
              required
              className={inputClasses}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">
              Sector
            </label>
            <select
              value={formData.sector}
              onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))}
              className={inputClasses + ' cursor-pointer'}
            >
              {sectors.map((s) => (
                <option key={s} value={s} className="bg-[#0A0A0F]">{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description..."
              rows={3}
              className={inputClasses + ' resize-y'}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              className={inputClasses + ' cursor-pointer'}
            >
              <option value="active" className="bg-[#0A0A0F]">Active</option>
              <option value="on-hold" className="bg-[#0A0A0F]">On Hold</option>
              <option value="complete" className="bg-[#0A0A0F]">Complete</option>
              <option value="archived" className="bg-[#0A0A0F]">Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Add Business
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-[#8A8A9A] text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
