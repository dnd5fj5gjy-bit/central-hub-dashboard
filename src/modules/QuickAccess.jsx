import React from 'react';
import { Star, ArrowRight, Heart } from 'lucide-react';
import * as storage from '../lib/storage';

export default function QuickAccess({ data, onRefresh, onNavigateToItem }) {
  const favourites = storage.getAllFavourites();

  function handleRemove(fav) {
    storage.toggleFavourite(fav.businessId, fav.section, fav.id);
    onRefresh();
  }

  return (
    <div>
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="text-xl font-semibold" style={{ color: '#F0F0F5' }}>Favourites</h1>
        <p className="text-[13px] mt-1" style={{ color: '#6B6B7B' }}>
          {favourites.length} saved item{favourites.length !== 1 ? 's' : ''} across all businesses
        </p>
      </div>

      {favourites.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center animate-fade-slide-up stagger-1">
          <Heart size={40} className="mb-4" style={{ color: '#6B6B7B' }} />
          <p className="text-[15px] font-medium mb-1" style={{ color: '#A0A0B0' }}>No favourites yet</p>
          <p className="text-[13px]" style={{ color: '#6B6B7B' }}>
            Star items from any business workspace to see them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {favourites.map((fav, i) => (
            <div
              key={`${fav.businessId}-${fav.section}-${fav.id}`}
              className="glass-card glass-card-hover group animate-fade-slide-up"
              style={{ animationDelay: `${(i + 1) * 0.04}s` }}
            >
              <div className="flex items-center gap-3 px-4 py-3">
                <Star size={14} fill="#FBBF24" style={{ color: '#FBBF24' }} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: '#F0F0F5' }}>
                    {fav.title || 'Untitled'}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px]" style={{ color: '#6B6B7B' }}>{fav.businessName}</span>
                    <span className="text-[11px]" style={{ color: '#6B6B7B' }}>/</span>
                    <span
                      className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                    >
                      {fav.section}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onNavigateToItem(fav.businessId, fav.section, fav.id)}
                  className="p-1.5 rounded-md cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: '#6B6B7B' }}
                  title="Go to item"
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#3B82F6'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; }}
                >
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => handleRemove(fav)}
                  className="p-1.5 rounded-md cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                  style={{ color: '#6B6B7B' }}
                  title="Remove from favourites"
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <Star size={14} fill="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
