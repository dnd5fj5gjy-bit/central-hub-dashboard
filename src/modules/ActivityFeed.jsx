import React from 'react';
import { Clock, Activity } from 'lucide-react';
import * as storage from '../lib/storage';

function formatTimestamp(iso) {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ActivityFeed() {
  const activity = storage.loadActivity().slice(0, 100);

  return (
    <div>
      <div className="mb-6 animate-fade-slide-up">
        <h1 className="text-xl font-semibold" style={{ color: '#F0F0F5' }}>Activity</h1>
        <p className="text-[13px] mt-1" style={{ color: '#6B6B7B' }}>
          Recent actions across all businesses
        </p>
      </div>

      {activity.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center animate-fade-slide-up stagger-1">
          <Activity size={40} className="mb-4" style={{ color: '#6B6B7B' }} />
          <p className="text-[15px] font-medium mb-1" style={{ color: '#A0A0B0' }}>No activity yet</p>
          <p className="text-[13px]" style={{ color: '#6B6B7B' }}>
            Actions will appear here as you add and update items
          </p>
        </div>
      ) : (
        <div className="relative animate-fade-slide-up stagger-1">
          {/* Timeline line */}
          <div
            className="absolute top-0 bottom-0"
            style={{
              left: '19px',
              width: '1px',
              background: 'rgba(255,255,255,0.06)',
            }}
          />

          <div className="space-y-0">
            {activity.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className="relative flex gap-4 py-3 group"
              >
                {/* Timeline dot */}
                <div
                  className="relative z-10 w-[10px] h-[10px] mt-1.5 rounded-full shrink-0"
                  style={{
                    marginLeft: '14px',
                    background: 'rgba(59,130,246,0.3)',
                    border: '2px solid rgba(59,130,246,0.5)',
                  }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-[13px]" style={{ color: '#F0F0F5' }}>
                    {entry.action}
                    {entry.itemTitle && (
                      <span style={{ color: '#A0A0B0' }}> — {entry.itemTitle}</span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.businessName && (
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#A0A0B0' }}
                      >
                        {entry.businessName}
                      </span>
                    )}
                    {entry.sectionName && (
                      <span
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: '#6B6B7B' }}
                      >
                        {entry.sectionName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px]" style={{ color: '#6B6B7B' }}>
                      <Clock size={10} />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
