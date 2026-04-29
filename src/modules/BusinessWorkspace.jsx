import React, { useState } from 'react';
import {
  ArrowLeft, Edit3, Trash2, Plus, ChevronDown, ChevronRight,
  Star, ExternalLink, FileText, Briefcase, Megaphone,
  ScrollText, Presentation, Link2, StickyNote, AlertTriangle,
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
  { key: 'notes', label: 'Notes', icon: StickyNote },
];

const statusColors = {
  active: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  'on-hold': { bg: 'bg-yellow-500/15', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  complete: { bg: 'bg-blue-500/15', text: 'text-blue-400', dot: 'bg-blue-400' },
  archived: { bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-400' },
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
      <div className="animate-in flex flex-col items-center justify-center py-20">
        <AlertTriangle size={40} className="text-[#5A5A6A] mb-4" />
        <p className="text-[15px] text-[#8A8A9A]">Business not found</p>
        <button onClick={onBack} className="mt-4 text-[13px] text-[#3B82F6] hover:underline cursor-pointer">
          Go back
        </button>
      </div>
    );
  }

  const items = business.items[activeTab] || [];
  const sc = statusColors[business.status] || statusColors.archived;

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

  const inputClasses =
    'w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-[#F0F0F5] placeholder-[#5A5A6A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors';

  function getItemTitle(item) {
    return item.title || item.name || 'Untitled';
  }

  function getItemTypeBadge(item) {
    return item.type || item.category || null;
  }

  function getItemBody(item) {
    return item.body || item.description || item.summary || item.note || null;
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-white/[0.06] text-[#5A5A6A] hover:text-[#8A8A9A] transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#F0F0F5] truncate">{business.name}</h1>
            <span className={`flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${sc.bg} ${sc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
              {business.status}
            </span>
          </div>
          <p className="text-[13px] text-[#5A5A6A] mt-0.5">{business.sector}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openEditBusiness}
            className="p-2 rounded-lg hover:bg-white/[0.06] text-[#5A5A6A] hover:text-[#8A8A9A] transition-colors cursor-pointer"
            title="Edit business"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => setShowDeleteConfirm('business')}
            className="p-2 rounded-lg hover:bg-red-500/10 text-[#5A5A6A] hover:text-red-400 transition-colors cursor-pointer"
            title="Delete business"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const count = (business.items[tab.key] || []).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6]'
                  : 'text-[#5A5A6A] hover:text-[#8A8A9A] hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {count > 0 && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-[#3B82F6]/20 text-[#3B82F6]' : 'bg-white/[0.06] text-[#5A5A6A]'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Add button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-[13px] text-[#5A5A6A]">
          {items.length} {activeTab.slice(0, -1)}{items.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 text-[13px] font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors cursor-pointer"
        >
          <Plus size={14} />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="glass-static flex flex-col items-center justify-center py-12 text-center">
          {React.createElement(tabs.find((t) => t.key === activeTab)?.icon || FileText, {
            size: 32,
            className: 'text-[#5A5A6A] mb-3',
          })}
          <p className="text-[14px] text-[#8A8A9A] mb-1">No {activeTab} yet</p>
          <p className="text-[12px] text-[#5A5A6A]">
            Add your first {activeTab.slice(0, -1)} to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isFav = storage.isFavourite(data.favourites, businessId, activeTab, item.id);
            const typeBadge = getItemTypeBadge(item);
            const body = getItemBody(item);

            return (
              <div key={item.id} className="glass-static overflow-hidden">
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <span className="text-[#5A5A6A]">
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                  <span className="flex-1 text-[13px] font-medium text-[#F0F0F5] truncate">
                    {getItemTitle(item)}
                  </span>
                  {typeBadge && (
                    <span className="text-[11px] font-medium text-[#8A8A9A] bg-white/[0.05] px-2 py-0.5 rounded-md shrink-0">
                      {typeBadge}
                    </span>
                  )}
                  {item.status && (
                    <span className="text-[11px] font-medium text-[#8A8A9A] bg-white/[0.05] px-2 py-0.5 rounded-md shrink-0">
                      {item.status}
                    </span>
                  )}
                  <span className="text-[11px] text-[#5A5A6A] shrink-0">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] animate-in">
                    {body && (
                      <p className="text-[13px] text-[#8A8A9A] whitespace-pre-wrap mb-3 leading-relaxed">
                        {body}
                      </p>
                    )}
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] text-[#3B82F6] hover:text-[#60A5FA] mb-3 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                        {item.url}
                      </a>
                    )}
                    {item.link && !item.url && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[13px] text-[#3B82F6] hover:text-[#60A5FA] mb-3 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} />
                        {item.link}
                      </a>
                    )}
                    {item.startDate && (
                      <p className="text-[12px] text-[#5A5A6A] mb-3">
                        Start date: {new Date(item.startDate).toLocaleDateString()}
                      </p>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleToggleFav(item.id); }}
                        className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                          isFav
                            ? 'text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/15'
                            : 'text-[#5A5A6A] hover:text-yellow-400 hover:bg-white/[0.04]'
                        }`}
                        title={isFav ? 'Remove from favourites' : 'Add to favourites'}
                      >
                        <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); }}
                        className="p-1.5 rounded-md text-[#5A5A6A] hover:text-[#8A8A9A] hover:bg-white/[0.04] transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(item.id); }}
                        className="p-1.5 rounded-md text-[#5A5A6A] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete"
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

      {/* Add item modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={`Add ${activeTab.slice(0, -1)}`}
      >
        <ItemForm
          section={activeTab}
          onSubmit={handleAddItem}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* Edit item modal */}
      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Edit ${activeTab.slice(0, -1)}`}
      >
        {editingItem && (
          <ItemForm
            section={activeTab}
            initialData={editingItem}
            onSubmit={handleEditItem}
            onCancel={() => setEditingItem(null)}
          />
        )}
      </Modal>

      {/* Edit business modal */}
      <Modal
        isOpen={showEditBusiness}
        onClose={() => setShowEditBusiness(false)}
        title="Edit Business"
      >
        <form onSubmit={handleEditBusiness} className="space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">Name</label>
            <input
              type="text"
              value={businessForm.name || ''}
              onChange={(e) => setBusinessForm((p) => ({ ...p, name: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">Sector</label>
            <input
              type="text"
              value={businessForm.sector || ''}
              onChange={(e) => setBusinessForm((p) => ({ ...p, sector: e.target.value }))}
              className={inputClasses}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={businessForm.description || ''}
              onChange={(e) => setBusinessForm((p) => ({ ...p, description: e.target.value }))}
              rows={3}
              className={inputClasses + ' resize-y'}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-[#8A8A9A] mb-1.5 uppercase tracking-wider">Status</label>
            <select
              value={businessForm.status || 'active'}
              onChange={(e) => setBusinessForm((p) => ({ ...p, status: e.target.value }))}
              className={inputClasses + ' cursor-pointer'}
            >
              <option value="active" className="bg-[#0A0A0F]">Active</option>
              <option value="on-hold" className="bg-[#0A0A0F]">On Hold</option>
              <option value="complete" className="bg-[#0A0A0F]">Complete</option>
              <option value="archived" className="bg-[#0A0A0F]">Archived</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer">
              Save Changes
            </button>
            <button type="button" onClick={() => setShowEditBusiness(false)} className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-[#8A8A9A] text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer">
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
      >
        <div className="text-center py-2">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <p className="text-[14px] text-[#F0F0F5] mb-1">
            {showDeleteConfirm === 'business'
              ? `Delete "${business.name}" and all its items?`
              : 'Delete this item?'}
          </p>
          <p className="text-[13px] text-[#5A5A6A] mb-6">This action cannot be undone.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (showDeleteConfirm === 'business') handleDeleteBusiness();
                else handleDeleteItem(showDeleteConfirm);
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 bg-white/[0.05] hover:bg-white/[0.08] text-[#8A8A9A] text-[13px] font-medium py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
