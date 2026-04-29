import React, { useState } from 'react';
import {
  ArrowLeft, Edit3, Trash2, Plus, ChevronDown, ChevronRight,
  Star, ExternalLink, FileText, Briefcase, Megaphone,
  ScrollText, Presentation, Link2, StickyNote, AlertTriangle,
  FolderOpen, File,
} from 'lucide-react';
import Modal from '../components/Modal';
import ItemForm, { sectionFields } from '../components/ItemForm';
import * as storage from '../lib/storage';

const tabs = [
  { key: 'projects', label: 'Projects', icon: Briefcase },
  { key: 'briefs', label: 'Briefs', icon: Megaphone },
  { key: 'proposals', label: 'Proposals', icon: FileText },
  { key: 'scripts', label: 'Scripts', icon: ScrollText },
  { key: 'decks', label: 'Decks', icon: Presentation },
  { key: 'links', label: 'Links', icon: Link2 },
  { key: 'documents', label: 'Documents', icon: File },
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

const statusBadge = {
  Active: 'badge-green',
  'On Hold': 'badge-amber',
  Complete: 'badge-blue',
  Archived: 'badge-grey',
};

export default function BusinessWorkspace({ businessId, data, onRefresh, onBack, initialTab, initialItemId }) {
  const business = data.businesses.find((b) => b.id === businessId);
  const [activeTab, setActiveTab] = useState(initialTab || 'projects');
  const [expandedItems, setExpandedItems] = useState(initialItemId ? new Set([initialItemId]) : new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [businessForm, setBusinessForm] = useState({});

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-slide-up">
        <AlertTriangle size={40} className="mb-4" style={{ color: '#6B6B7B' }} />
        <p className="text-[15px]" style={{ color: '#A0A0B0' }}>Business not found</p>
        <button onClick={onBack} className="mt-4 text-[13px] cursor-pointer hover:underline" style={{ color: '#3B82F6' }}>
          Go back
        </button>
      </div>
    );
  }

  const items = business.sections[activeTab] || [];
  const badgeClass = statusBadge[business.status] || 'badge-grey';

  function toggleExpanded(id) {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddItem(formData) {
    storage.addItem(businessId, activeTab, formData);
    setShowAddModal(false);
    onRefresh();
  }

  function handleEditItem(formData) {
    storage.updateItem(businessId, activeTab, editingItem.id, formData);
    setEditingItem(null);
    onRefresh();
  }

  function handleDeleteItem(itemId) {
    storage.deleteItem(businessId, activeTab, itemId);
    setShowDeleteConfirm(null);
    onRefresh();
  }

  function handleToggleFav(itemId) {
    storage.toggleFavourite(businessId, activeTab, itemId);
    onRefresh();
  }

  function handleEditBusiness(e) {
    e.preventDefault();
    storage.updateBusiness(businessId, businessForm);
    setShowEditBusiness(false);
    onRefresh();
  }

  function handleDeleteBusiness() {
    storage.deleteBusiness(businessId);
    onBack();
    onRefresh();
  }

  function openEditBusiness() {
    setBusinessForm({
      name: business.name,
      sector: business.sector,
      description: business.description,
      status: business.status,
    });
    setShowEditBusiness(true);
  }

  function getItemTitle(item) {
    return item.title || item.name || 'Untitled';
  }

  function getItemBadge(item) {
    return item.type || item.category || item.fileType || null;
  }

  function getItemBody(item) {
    return item.body || item.description || item.summary || item.content || item.note || null;
  }

  // Detect first non-empty tab for smart default
  const firstPopulatedTab = tabs.find((t) => (business.sections[t.key] || []).length > 0);

  // Auto-select first populated tab if current tab has 0 items and user hasn't manually selected
  // Only on initial load when no initialTab specified
  React.useEffect(() => {
    if (!initialTab && firstPopulatedTab && items.length === 0) {
      setActiveTab(firstPopulatedTab.key);
    }
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-fade-slide-up">
        <button
          onClick={onBack}
          className="p-2 rounded-lg cursor-pointer transition-colors"
          style={{ color: '#6B6B7B' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#A0A0B0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6B7B'; }}
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold truncate" style={{ color: '#F0F0F5' }}>{business.name}</h1>
            <span className={`badge ${badgeClass} text-[11px] shrink-0`}>
              {business.status}
            </span>
          </div>
          <p className="text-[13px] mt-0.5" style={{ color: '#6B6B7B' }}>
            {business.sector}
            {business.description && <span> &mdash; {business.description}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={openEditBusiness}
            className="p-2 rounded-lg cursor-pointer transition-colors"
            style={{ color: '#6B6B7B' }}
            title="Edit business"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#A0A0B0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6B7B'; }}
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm('business')}
            className="p-2 rounded-lg cursor-pointer transition-colors"
            style={{ color: '#6B6B7B' }}
            title="Delete business"
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#F87171'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B6B7B'; }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-6 animate-fade-slide-up stagger-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = (business.sections[tab.key] || []).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`tab-item flex items-center gap-2 ${isActive ? 'tab-item-active' : ''}`}
            >
              <Icon size={14} />
              {tab.label}
              {count > 0 && (
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-full"
                  style={{
                    background: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? '#3B82F6' : '#6B6B7B',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-header */}
      <div className="flex justify-between items-center mb-4 animate-fade-slide-up stagger-2">
        <p className="text-[13px]" style={{ color: '#6B6B7B' }}>
          {items.length} {activeTab === 'notes' ? 'note' : activeTab.slice(0, -1)}{items.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-[13px] font-medium cursor-pointer transition-colors"
          style={{ color: '#3B82F6' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#60A5FA'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#3B82F6'; }}
        >
          <Plus size={14} />
          Add {activeTab === 'notes' ? 'note' : activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Items */}
      {items.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-14 text-center animate-fade-slide-up stagger-3">
          <FolderOpen size={36} className="mb-3" style={{ color: '#6B6B7B' }} />
          <p className="text-[14px] mb-1" style={{ color: '#A0A0B0' }}>No {activeTab} yet</p>
          <p className="text-[12px]" style={{ color: '#6B6B7B' }}>
            Add your first {activeTab === 'notes' ? 'note' : activeTab.slice(0, -1)} to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => {
            const isExpanded = expandedItems.has(item.id);
            const isFav = item.favourite;
            const badge = getItemBadge(item);
            const body = getItemBody(item);

            return (
              <div
                key={item.id}
                className="glass-card overflow-hidden animate-fade-slide-up"
                style={{ animationDelay: `${(i + 3) * 0.04}s` }}
              >
                {/* Row header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                  style={{ borderBottom: isExpanded ? '1px solid rgba(255,255,255,0.06)' : 'none' }}
                  onClick={() => toggleExpanded(item.id)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style={{ color: '#6B6B7B' }}>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="flex-1 text-[13px] font-medium truncate" style={{ color: '#F0F0F5' }}>
                    {getItemTitle(item)}
                  </span>
                  {isFav && (
                    <Star size={12} fill="#FBBF24" style={{ color: '#FBBF24' }} className="shrink-0" />
                  )}
                  {badge && (
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                    >
                      {badge}
                    </span>
                  )}
                  {item.status && activeTab === 'projects' && (
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                    >
                      {item.status}
                    </span>
                  )}
                  <span className="text-[11px] shrink-0" style={{ color: '#6B6B7B' }}>
                    {new Date(item.createdAt).toLocaleDateString('en-GB')}
                  </span>
                </div>

                {/* Expanded body */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 animate-fade-in">
                    {body && (
                      <p
                        className="text-[13px] whitespace-pre-wrap mb-3 leading-relaxed"
                        style={{ color: '#A0A0B0' }}
                      >
                        {body}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] mb-3 transition-colors"
                        style={{ color: '#3B82F6' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#60A5FA'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#3B82F6'; }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                        {item.url.length > 60 ? item.url.slice(0, 60) + '...' : item.url}
                      </a>
                    )}
                    {item.link && !item.url && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] mb-3 transition-colors"
                        style={{ color: '#3B82F6' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                        {item.link.length > 60 ? item.link.slice(0, 60) + '...' : item.link}
                      </a>
                    )}
                    {item.startDate && (
                      <p className="text-[12px] mb-3" style={{ color: '#6B6B7B' }}>
                        Start date: {new Date(item.startDate).toLocaleDateString('en-GB')}
                      </p>
                    )}
                    {item.note && item.body && (
                      <p className="text-[12px] mb-3 italic" style={{ color: '#6B6B7B' }}>
                        {item.note}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFav(item.id); }}
                        className="p-1.5 rounded-md cursor-pointer transition-colors"
                        style={{
                          color: isFav ? '#FBBF24' : '#6B6B7B',
                          background: isFav ? 'rgba(251,191,36,0.1)' : 'transparent',
                        }}
                        title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                        onMouseEnter={(e) => {
                          if (!isFav) { e.currentTarget.style.color = '#FBBF24'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }
                        }}
                        onMouseLeave={(e) => {
                          if (!isFav) { e.currentTarget.style.color = '#6B6B7B'; e.currentTarget.style.background = 'transparent'; }
                        }}
                      >
                        <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                        className="p-1.5 rounded-md cursor-pointer transition-colors"
                        style={{ color: '#6B6B7B' }}
                        title="Edit"
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#A0A0B0'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); }}
                        className="p-1.5 rounded-md cursor-pointer transition-colors"
                        style={{ color: '#6B6B7B' }}
                        title="Delete"
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add ${activeTab === 'notes' ? 'note' : activeTab.slice(0, -1)}`}>
        <ItemForm section={activeTab} onSubmit={handleAddItem} onCancel={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title={`Edit ${activeTab === 'notes' ? 'note' : activeTab.slice(0, -1)}`}>
        {editingItem && (
          <ItemForm section={activeTab} initialData={editingItem} onSubmit={handleEditItem} onCancel={() => setEditingItem(null)} />
        )}
      </Modal>

      {/* Edit Business Modal */}
      <Modal isOpen={showEditBusiness} onClose={() => setShowEditBusiness(false)} title="Edit Business">
        <form onSubmit={handleEditBusiness} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>Name</label>
            <input type="text" value={businessForm.name || ''} onChange={(e) => setBusinessForm((p) => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>Sector</label>
            <input type="text" value={businessForm.sector || ''} onChange={(e) => setBusinessForm((p) => ({ ...p, sector: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>Description</label>
            <textarea value={businessForm.description || ''} onChange={(e) => setBusinessForm((p) => ({ ...p, description: e.target.value }))} rows={3} className="input-field" />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#A0A0B0' }}>Status</label>
            <select value={businessForm.status || 'Active'} onChange={(e) => setBusinessForm((p) => ({ ...p, status: e.target.value }))} className="input-field">
              <option value="Active" style={{ background: '#0E0F14' }}>Active</option>
              <option value="On Hold" style={{ background: '#0E0F14' }}>On Hold</option>
              <option value="Complete" style={{ background: '#0E0F14' }}>Complete</option>
              <option value="Archived" style={{ background: '#0E0F14' }}>Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">Save Changes</button>
            <button type="button" onClick={() => setShowEditBusiness(false)} className="btn-secondary flex-1">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <Modal isOpen={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)} title="Confirm Delete">
        <div className="text-center py-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(239,68,68,0.1)' }}
          >
            <AlertTriangle size={24} style={{ color: '#F87171' }} />
          </div>
          <p className="text-[14px] mb-1" style={{ color: '#F0F0F5' }}>
            {showDeleteConfirm === 'business'
              ? `Delete "${business.name}" and all its items?`
              : 'Delete this item?'}
          </p>
          <p className="text-[13px] mb-6" style={{ color: '#6B6B7B' }}>This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (showDeleteConfirm === 'business') handleDeleteBusiness();
                else handleDeleteItem(showDeleteConfirm);
              }}
              className="btn-danger flex-1"
            >
              Delete
            </button>
            <button onClick={() => setShowDeleteConfirm(null)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
