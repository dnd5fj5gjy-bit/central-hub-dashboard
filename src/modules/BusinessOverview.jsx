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
        <div className="flex flex-col gap-3">
          {filtered.map((biz, i) => {
            const badgeClass = statusBadge[biz.status] || 'badge-grey';
            const count = storage.getItemCount(biz);
            const sectionCounts = {};
            const sectionNames = ['projects','briefs','proposals','scripts','decks','links','documents','notes'];
            sectionNames.forEach(s => {
              const c = (biz.sections?.[s] || []).length;
              if (c > 0) sectionCounts[s] = c;
            });
            return (
              <div
                key={biz.id}
                onClick={() => onSelectBusiness(biz.id)}
                className={`glass-card glass-card-hover p-6 cursor-pointer group animate-fade-slide-up`}
                style={{ animationDelay: `${(i + 2) * 0.05}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <h3
                      className="text-lg font-semibold transition-colors"
                      style={{ color: '#F0F0F5' }}
                    >
                      {biz.name}
                    </h3>
                    <span
                      className="inline-block text-[11px] font-medium px-2.5 py-0.5 rounded-md"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                    >
                      {biz.sector}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-[12px]" style={{ color: '#6B6B7B' }}>
                      <Layers size={13} />
                      {count} item{count !== 1 ? 's' : ''}
                    </span>
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
                </div>
                {biz.description && (
                  <p className="text-[13px] mb-3" style={{ color: '#6B6B7B' }}>
                    {biz.description}
                  </p>
                )}
                {Object.keys(sectionCounts).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {Object.entries(sectionCounts).map(([section, c]) => (
                      <span
                        key={section}
                        className="text-[11px] font-medium px-2.5 py-1 rounded-md"
                        style={{ background: 'rgba(59,130,246,0.08)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.15)' }}
                      >
                        {c} {section.charAt(0).toUpperCase() + section.slice(1)}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] mt-3" style={{ color: '#6B6B7B' }}>
                  <span>Added {new Date(biz.createdAt).toLocaleDateString('en-GB')}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#3B82F6' }}>
                    Open workspace →
                  </span>
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
