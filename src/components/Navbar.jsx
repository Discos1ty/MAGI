import React, { useState, useEffect } from 'react';
import { House, Upload, Gauge, ChartNoAxesCombined, FileHeart, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: House },
  { id: 'upload', label: 'Upload Patient Data', icon: Upload },
  { id: 'pipeline', label: 'Benchmarks', icon: Gauge },
  { id: 'results', label: 'Results', icon: FileHeart },
];

export default function Navbar({ activePage = 'home', onNavigate, hasResults = false }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close the mobile drawer whenever the page changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [activePage]);

  const handleNavigate = (page) => {
    onNavigate && onNavigate(page);
    setIsMobileOpen(false);
  };

  const brand = (
    <button
      onClick={() => handleNavigate('home')}
      className="flex items-center gap-3.5 text-left cursor-pointer border-none bg-transparent p-0"
    >
      <img
        src="/magi-logo-light.png"
        alt="MAGI logo"
        className="w-9 h-9 object-contain"
      />
      <span className="font-serif text-xl tracking-tight text-[#14211F] leading-tight">
        MAGI
      </span>
    </button>
  );

  return (
    <>
      {/* Mobile top bar — logo and menu toggle (sidebar is hidden below md) */}
      <header className="md:hidden sticky top-0 z-50 w-full h-16 px-5 flex items-center justify-between bg-[#FAFAF7]/80 backdrop-blur-md border-b border-[#E7E5E0]">
        {brand}
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open navigation"
          className="p-2 -mr-2 rounded-md text-[#14211F] cursor-pointer border-none bg-transparent hover:bg-[#14211F]/5"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-[#14211F]/20 backdrop-blur-[2px]"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar — Home, Upload Patient Data, Benchmarks, Analytics, Results */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col bg-[#FAFAF7]/90 backdrop-blur-md border-r border-[#E7E5E0] transition-transform duration-200 md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-5 flex items-center justify-between border-b border-[#E7E5E0]">
          {brand}
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
            className="md:hidden p-2 -mr-2 rounded-md text-[#5B6664] cursor-pointer border-none bg-transparent hover:bg-[#14211F]/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 flex flex-col gap-1">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activePage === id;
            return (
              <button
                key={id}
                onClick={() => handleNavigate(id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-left rounded-md transition-colors cursor-pointer border-none ${
                  isActive
                    ? 'bg-[#0F766E]/10 text-[#14211F]'
                    : 'bg-transparent text-[#5B6664] hover:text-[#14211F] hover:bg-[#14211F]/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#0F766E] rounded-full" />
                )}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0F766E]' : ''}`} />
                <span className="flex-1">{label}</span>
                {id === 'results' && hasResults && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
