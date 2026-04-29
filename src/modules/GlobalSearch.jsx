import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, FileText } from 'lucide-react';

export default function GlobalSearch({ data, onNavigateToItem }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim() || query.trim().length < 2) return [];
    const q = query.toLowerCase();
    const matches = [];

    (data.businesses || []).forEach((biz) => {
      if (biz.name.toLowerCase().includes(q) || (biz.description || '').toLowerCase().includes(q)) {
        matches.push({
          type: 'business',
          businessId: biz.id,
          businessName: biz.name,
          title: biz.name,
          subtitle: biz.sector,
          section: null,
          itemId: null,
        });
      }

      const sections = Object.keys(biz.sections || {});
      sections.forEach((section) => {
        (biz.sections[section] || []).forEach((item) => {
          const searchable = [item.title, item.name, item.body, item.description, item.summary, item.note, item.content, item.url, item.link]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

          if (searchable.includes(q)) {
            matches.push({
              type: section,
              businessId: biz.id,
              businessName: biz.name,
              title: item.title || item.name || 'Untitled',
              subtitle: `${biz.name} / ${section}`,
              section,
              itemId: item.id,
              badge: item.type || item.category || item.fileType || null,
            });
          }
        });
      });
    });

    return matches.slice(0, 50);
  }, [query, data]);

  const grouped = useMemo(() => {
    const groups = {};
    results.forEach((r) => {
      const key = r.type;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [results]);

  const sectionLabels = {
    business: 'Businesses',
    projects: 'Projects',
    briefs: 'Briefs',
    proposals: 'Proposals',
    scripts: 'Scripts',
    decks: 'Decks',
    links: 'Links',
    documents: 'Documents',
    notes: 'Notes',
  };

  return (
    <div>
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="text-xl font-semibold" style={{ color: '#F0F0F5' }}>Search</h1>
        <p className="text-[13px] mt-1" style={{ color: '#6B6B7B' }}>Find anything across all businesses</p>
      </div>

      <div className="relative mb-6 animate-fade-slide-up stagger-1">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B6B7B' }} />
        <input
          type="text"
          placeholder="Search businesses, projects, briefs, documents, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="input-field pl-11 py-3 text-[14px]"
          style={{ borderRadius: '12px' }}
        />
      </div>

      {query.trim().length >= 2 && results.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center animate-fade-slide-up">
          <Search size={32} className="mb-3" style={{ color: '#6B6B7B' }} />
          <p className="text-[14px] mb-1" style={{ color: '#A0A0B0' }}>No results found</p>
          <p className="text-[12px]" style={{ color: '#6B6B7B' }}>Try different keywords</p>
        </div>
      )}

      {(!query.trim() || query.trim().length < 2) && (
        <div className="glass-card flex flex-col items-center justify-center py-12 text-center animate-fade-slide-up stagger-2">
          <FileText size={32} className="mb-3" style={{ color: '#6B6B7B' }} />
          <p className="text-[14px] mb-1" style={{ color: '#A0A0B0' }}>Start typing to search</p>
          <p className="text-[12px]" style={{ color: '#6B6B7B' }}>Results appear as you type (min 2 characters)</p>
        </div>
      )}

      {Object.keys(grouped).length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type} className="animate-fade-slide-up">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#6B6B7B' }}>
                {sectionLabels[type] || type} ({items.length})
              </h3>
              <div className="space-y-1.5">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      if (item.section && item.itemId) {
                        onNavigateToItem(item.businessId, item.section, item.itemId);
                      } else if (item.type === 'business') {
                        onNavigateToItem(item.businessId, null, null);
                      }
                    }}
                    className="glass-card glass-card-hover flex items-center gap-3 px-4 py-3 cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium truncate transition-colors group-hover:text-[#3B82F6]" style={{ color: '#F0F0F5' }}>
                        {item.title}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: '#6B6B7B' }}>{item.subtitle}</p>
                    </div>
                    {item.badge && (
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight
                      size={14}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#6B6B7B' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
