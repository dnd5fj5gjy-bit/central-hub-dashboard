import React, { useState } from 'react';
import { LayoutGrid, Star, Search, Clock, LogOut, Menu, X } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Home', icon: LayoutGrid },
  { id: 'favourites', label: 'Favourites', icon: Star },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'activity', label: 'Activity', icon: Clock },
];

export default function Sidebar({ activeView, onNavigate, onLogout, isOpen, onToggle }) {
  return (
    <>
      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        className="fixed top-5 left-5 z-[60] p-2 rounded-lg cursor-pointer transition-all duration-200"
        style={{
          background: isOpen ? 'transparent' : 'rgba(255,255,255,0.06)',
          border: isOpen ? 'none' : '1px solid rgba(255,255,255,0.08)',
          color: '#A0A0B0',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#F0F0F5'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = '#A0A0B0'; }}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay on mobile / when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={onToggle}
        />
      )}

      {/* Sidebar panel */}
      <div
        className="fixed left-0 top-0 bottom-0 w-[220px] flex flex-col z-50 transition-transform duration-300 ease-in-out"
        style={{
          background: '#06060A',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Logo / Monogram */}
        <div className="px-6 pt-7 pb-10 flex items-center justify-between">
          <span
            className="text-[28px] font-bold tracking-tight"
            style={{ color: '#3B82F6' }}
          >
            OW
          </span>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg cursor-pointer transition-colors duration-150"
            style={{ color: '#6B6B7B' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#A0A0B0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B6B7B'; }}
          >
            <X size={18} />
          </button>
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
                  onClick={() => { onNavigate(item.id); if (window.innerWidth < 1024) onToggle(); }}
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
    </>
  );
}
