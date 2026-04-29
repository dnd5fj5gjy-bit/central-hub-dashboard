import React from 'react';
import { Star, X, ArrowRight, Heart } from 'lucide-react';
import * as storage from '../lib/storage';

export default function QuickAccess({ data, onRefresh, onNavigateToItem }) {
  const favourites = data.favourites || [];

  function resolveItem(fav) {
    const business = data.businesses.find((b) => b.id === fav.businessId);
    if (!business) return null;
    const items = business.items[fav.section] || [];
    const item = items.find((i) => i.id === fav.itemId);
    if (!item) return null;
    return { business, item, section: fav.section };
  }

  function handleRemove(fav) {
    storage.toggleFavourite(fav.businessId, fav.section, fav.itemId);
    onRefresh();
  }

  const resolved = favourites.map(resolveItem).filter(Boolean);

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#F0F0F5]">Favourites</h1>
        <p className="text-[13px] text-[#5A5A6A] mt-1">
          {resolved.length} saved item{resolved.length !== 1 ? 's' : ''} across all businesses
        </p>
      </div>

      {resolved.length === 0 ? (
        <div className="glass-static flex flex-col items-center justify-center py-16 text-center">
          <Heart size={40} className="text-[#5A5A6A] mb-4" />
          <p className="text-[15px] font-medium text-[#8A8A9A] mb-1">No favourites yet</p>
          <p className="text-[13px] text-[#5A5A6A]">
            Star items from any business workspace to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {resolved.map(({ business, item, section }, idx) => {
            const fav = favourites[idx];
            return (
              <div key={`${fav.businessId}-${fav.section}-${fav.itemId}`} className="glass group">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Star size={14} className="text-yellow-400 shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-[#F0F0F5] truncate">
                      {item.title || item.name || 'Untitled'}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-[#5A5A6A]">{business.name}</span>
                      <span className="text-[11px] text-[#5A5A6A]">/</span>
                      <span className="text-[11px] font-medium text-[#8A8A9A] bg-white/[0.05] px-1.5 py-0.5 rounded">
                        {section}
                      </span>
                      {(item.type || item.category) && (
                        <>
                          <span className="text-[11px] text-[#5A5A6A]">/</span>
                          <span className="text-[11px] text-[#5A5A6A]">{item.type || item.category}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateToItem(fav.businessId, fav.section, fav.itemId)}
                    className="p-1.5 rounded-md text-[#5A5A6A] hover:text-[#3B82F6] hover:bg-white/[0.04] transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Go to item"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => handleRemove(fav)}
                    className="p-1.5 rounded-md text-[#5A5A6A] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                    title="Remove from favourites"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
