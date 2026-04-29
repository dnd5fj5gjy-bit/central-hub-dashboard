import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, FileText } from 'lucide-react';

export default function GlobalSearch({ data, onNavigateToItem }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const matches = [];

    (data.businesses || []).forEach((business) => {
      // Search business name/description
      if (business.name.toLowerCase().includes(q) || (business.description || '').toLowerCase().includes(q)) {
        matches.push({
          type: 'business',
          businessId: business.id,
          businessName: business.name,
          title: business.name,
          subtitle: business.sector,
          section: null,
          itemId: null,
        });
      }

      // Search all items
      const sections = Object.keys(business.items || {});
      sections.forEach((section) => {
        (business.items[section] || []).forEach((item) => {
          const title = item.title || item.name || '';
          const body = item.body || item.description || item.summary || item.note || '';
          const url = item.url || item.link || '';

          if (
            title.toLowerCase().includes(q) ||
            body.toLowerCase().includes(q) ||
            url.toLowerCase().includes(q)
          ) {
            matches.push({
              type: section,
              businessId: business.id,
              businessName: business.name,
              title: title || 'Untitled',
              subtitle: `${business.name} / ${section}`,
              section,
              itemId: item.id,
              badge: item.type || item.category || null,
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
    notes: 'Notes',
  };

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#F0F0F5]">Search</h1>
        <p className="text-[13px] text-[#5A5A6A] mt-1">Find anything across all businesses</p>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5A6A]" />
        <input
          type="text"
          placeholder="Search businesses, projects, briefs, notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-3 pl-11 text-[14px] text-[#F0F0F5] placeholder-[#5A5A6A] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]/30 transition-colors"
        />
      </div>

      {query.trim() && results.length === 0 && (
        <div className="glass-static flex flex-col items-center justify-center py-12 text-center">
          <Search size={32} className="text-[#5A5A6A] mb-3" />
          <p className="text-[14px] text-[#8A8A9A] mb-1">No results found</p>
          <p className="text-[12px] text-[#5A5A6A]">Try different keywords</p>
        </div>
      )}

      {!query.trim() && (
        <div className="glass-static flex flex-col items-center justify-center py-12 text-center">
          <FileText size={32} className="text-[#5A5A6A] mb-3" />
          <p className="text-[14px] text-[#8A8A9A] mb-1">Start typing to search</p>
          <p className="text-[12px] text-[#5A5A6A]">Results appear as you type</p>
        </div>
      )}

      {Object.keys(grouped).length > 0 && (
        <div className="space-y-6">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <h3 className="text-[12px] font-semibold text-[#5A5A6A] uppercase tracking-wider mb-2">
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
                    className="glass flex items-center gap-3 px-4 py-3 cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[#F0F0F5] truncate group-hover:text-[#3B82F6] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-[#5A5A6A] mt-0.5">{item.subtitle}</p>
                    </div>
                    {item.badge && (
                      <span className="text-[11px] font-medium text-[#8A8A9A] bg-white/[0.05] px-2 py-0.5 rounded-md shrink-0">
                        {item.badge}
                      </span>
                    )}
                    <ArrowRight size={14} className="text-[#5A5A6A] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
