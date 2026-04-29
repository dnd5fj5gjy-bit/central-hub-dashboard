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
  const activity = storage.getRecentActivity(100);

  return (
    <div className="animate-in">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-[#F0F0F5]">Activity</h1>
        <p className="text-[13px] text-[#5A5A6A] mt-1">
          Recent actions across all businesses
        </p>
      </div>

      {activity.length === 0 ? (
        <div className="glass-static flex flex-col items-center justify-center py-16 text-center">
          <Activity size={40} className="text-[#5A5A6A] mb-4" />
          <p className="text-[15px] font-medium text-[#8A8A9A] mb-1">No activity yet</p>
          <p className="text-[13px] text-[#5A5A6A]">
            Actions will appear here as you add and update items
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-white/[0.06]" />

          <div className="space-y-0">
            {activity.map((entry, idx) => (
              <div key={entry.id || idx} className="relative flex gap-4 py-3 group">
                {/* Timeline dot */}
                <div className="relative z-10 w-[10px] h-[10px] mt-1.5 rounded-full bg-[#3B82F6]/30 border-2 border-[#3B82F6]/50 shrink-0 ml-[14px]" />

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-[#F0F0F5]">{entry.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.businessName && (
                      <span className="text-[11px] font-medium text-[#8A8A9A] bg-white/[0.05] px-1.5 py-0.5 rounded">
                        {entry.businessName}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-[#5A5A6A]">
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
