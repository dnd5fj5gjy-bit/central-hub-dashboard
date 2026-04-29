import React from 'react';
import { LayoutGrid, Star, Search, Clock, LogOut } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'favourites', label: 'Favourites', icon: Star },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'activity', label: 'Activity', icon: Clock },
];

export default function Sidebar({ activeView, onNavigate, onLogout }) {
  return (
    <div
      className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col z-50"
      style={{
        background: '#06060A',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo / Monogram */}
      <div className="px-6 pt-7 pb-10">
        <span
          className="text-[28px] font-bold tracking-tight animate-fade-slide-up"
          style={{ color: '#3B82F6' }}
        >
          OW
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item, i) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`animate-fade-slide-up stagger-${i + 1} w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer`}
                style={{
                  background: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: isActive ? '#3B82F6' : '#6B6B7B',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.color = '#A0A0B0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6B6B7B';
                  }
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer transition-all duration-150"
          style={{ color: '#6B6B7B', background: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#A0A0B0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#6B6B7B';
          }}
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
}
