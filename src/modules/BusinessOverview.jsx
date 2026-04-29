import React, { useState, useMemo } from 'react';
import { Plus, Search, ArrowUpDown, Building2, Layers } from 'lucide-react';
import Modal from '../components/Modal';
import * as storage from '../lib/storage';

const statusBadge = {
  Active: 'badge-green',
  'On Hold': 'badge-amber',
  Complete: 'badge-blue',
  Archived: 'badge-grey',
};

const sectors = [
  'Health & Wellness',
  'Fitness',
  'Nutrition & Supplements',
  'Food & Beverage',
  'Media & Content',
  'Adventure & Travel',
  'E-commerce',
  'Technology',
  'Functional Mushrooms / Wellness',
  'Social Media Management',
  'Other',
];

export default function BusinessOverview({ data, onRefresh, onSelectBusiness }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('alpha');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', sector: sectors[0], description: '', status: 'Active' });

  const filtered = useMemo(() => {
    let list = data.businesses || [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          (b.sector || '').toLowerCase().includes(q) ||
          (b.description || '').toLowerCase().includes(q)
      );
    }
    list = [...list].sort((a, b) => {
      if (sortBy === 'status') {
        const order = { Active: 0, 'On Hold': 1, Complete: 2, Archived: 3 };
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
    storage.addBusiness(formData.name, formData.sector, formData.status, formData.description);
    setFormData({ name: '', sector: sectors[0], description: '', status: 'Active' });
    setShowAddModal(false);
    onRefresh();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-slide-up">
        <div>
          <h1 className="text-xl font-semibold" style={{ color: '#F0F0F5' }}>Businesses</h1>
          <p className="text-[13px] mt-1" style={{ color: '#6B6B7B' }}>
            {data.businesses.length} business{data.businesses.length !== 1 ? 'es' : ''} in portfolio
          </p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 text-[13px]">
          <Plus size={16} />
          Add Business
        </button>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6 animate-fade-slide-up stagger-1">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6B6B7B' }} />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <ArrowUpDown size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#6B6B7B' }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field pl-10 w-[150px]"
          >
            <option value="alpha" style={{ background: '#0E0F14' }}>A-Z</option>
            <option value="status" style={{ background: '#0E0F14' }}>By Status</option>
            <option value="date" style={{ background: '#0E0F14' }}>By Date</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center animate-fade-slide-up stagger-2">
          <Building2 size={40} className="mb-4" style={{ color: '#6B6B7B' }} />
          <p className="text-[15px] font-medium mb-1" style={{ color: '#A0A0B0' }}>
            {search ? 'No businesses match your search' : 'No businesses yet'}
          </p>
          <p className="text-[13px]" style={{ color: '#6B6B7B' }}>
            {search ? 'Try a different search term' : 'Add your first business to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((biz, i) => {
            const badgeClass = statusBadge[biz.status] || 'badge-grey';
            const count = storage.getItemCount(biz);
            return (
              <div
                key={biz.id}
                onClick={() => onSelectBusiness(biz.id)}
                className={`glass-card glass-card-hover p-5 cursor-pointer group animate-fade-slide-up`}
                style={{ animationDelay: `${(i + 2) * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3
                    className="text-[15px] font-semibold transition-colors"
                    style={{ color: '#F0F0F5' }}
                  >
                    {biz.name}
                  </h3>
                  <span className={`badge ${badgeClass} text-[11px]`}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: biz.status === 'Active' ? '#4ADE80' :
                                    biz.status === 'On Hold' ? '#FBBF24' :
                                    biz.status === 'Complete' ? '#60A5FA' : '#9CA3AF',
                      }}
                    />
                    {biz.status}
                  </span>
                </div>
                <span
                  className="inline-block text-[11px] font-medium px-2 py-0.5 rounded-md mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                >
                  {biz.sector}
                </span>
                {biz.description && (
                  <p className="text-[13px] mb-3 line-clamp-2" style={{ color: '#6B6B7B' }}>
                    {biz.description}
                  </p>
                )}
                <div
                  className="flex items-center justify-between text-[11px] pt-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#6B6B7B' }}
                >
                  <span className="flex items-center gap-1.5">
                    <Layers size={12} />
                    {count} item{count !== 1 ? 's' : ''}
                  </span>
                  <span>{new Date(biz.createdAt).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Business Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Business">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>
              Business Name <span style={{ color: '#3B82F6' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Ted's Health"
              required
              autoFocus
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>
              Sector
            </label>
            <select
              value={formData.sector}
              onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value }))}
              className="input-field"
            >
              {sectors.map((s) => (
                <option key={s} value={s} style={{ background: '#0E0F14' }}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              placeholder="Brief description..."
              rows={3}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value }))}
              className="input-field"
            >
              <option value="Active" style={{ background: '#0E0F14' }}>Active</option>
              <option value="On Hold" style={{ background: '#0E0F14' }}>On Hold</option>
              <option value="Complete" style={{ background: '#0E0F14' }}>Complete</option>
              <option value="Archived" style={{ background: '#0E0F14' }}>Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Add Business</button>
            <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
