import React from 'react';
import { LayoutGrid, Star, Search, Clock } from 'lucide-react';

const navItems = [
  { id: 'overview', label: 'Home', icon: LayoutGrid },
  { id: 'favourites', label: 'Favourites', icon: Star },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'activity', label: 'Activity', icon: Clock },
];

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col border-r border-white/[0.08] bg-[#07070B] z-50">
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center">
            <span className="text-white font-bold text-sm">CH</span>
          </div>
          <span className="text-[#F0F0F5] font-semibold text-[15px] tracking-tight">Central Hub</span>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[rgba(59,130,246,0.15)] text-[#3B82F6]'
                    : 'text-[#8A8A9A] hover:text-[#F0F0F5] hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-5 pb-5">
        <p className="text-[11px] text-[#5A5A6A]">Built by Ted</p>
      </div>
    </div>
  );
}
