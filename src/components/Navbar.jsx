import React, { useState, useEffect } from 'react';
import { Activity, Upload } from 'lucide-react';

export default function Navbar({ activePage = 'home', onNavigate, hasResults = false }) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 bg-[#FAFAF7]/90 backdrop-blur-md ${
        isScrolled ? 'border-b border-[#E7E5E0] shadow-[0_1px_6px_rgba(20,33,31,0.03)]' : 'border-b border-transparent'
      }`}
    >
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand & Project Identity */}
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="flex items-center gap-3.5 text-left cursor-pointer border-none bg-transparent p-0"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0F766E]/10 border border-[#0F766E]/25 flex items-center justify-center text-[#0F766E]">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl tracking-tight text-[#14211F] leading-tight">
              QuantumDx
            </span>
            <span className="text-[10px] tracking-wider uppercase font-medium text-[#5B6664]">
              SIH26139 · Clinical Research
            </span>
          </div>
        </button>

        {/* Navigation Links — Home and Upload Dataset */}
        <nav className="flex items-center gap-2">
          {/* Home */}
          <button
            onClick={() => onNavigate && onNavigate('home')}
            className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer border-none bg-transparent ${
              activePage === 'home' ? 'text-[#14211F]' : 'text-[#5B6664] hover:text-[#14211F]'
            }`}
          >
            <span>Home</span>
            {activePage === 'home' && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#0F766E] rounded-full" />
            )}
          </button>

          {/* Upload Dataset */}
          <button
            onClick={() => onNavigate && onNavigate('upload')}
            className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer border-none bg-transparent flex items-center gap-1.5 ${
              activePage === 'upload' ? 'text-[#14211F]' : 'text-[#5B6664] hover:text-[#14211F]'
            }`}
          >
            <span>Upload Dataset</span>
            {activePage === 'upload' && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#0F766E] rounded-full" />
            )}
          </button>

          {/* Pipeline */}
          <button
            onClick={() => onNavigate && onNavigate('pipeline')}
            className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer border-none bg-transparent flex items-center gap-1.5 ${
              activePage === 'pipeline' ? 'text-[#14211F]' : 'text-[#5B6664] hover:text-[#14211F]'
            }`}
          >
            <span>Pipeline</span>
            {activePage === 'pipeline' && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#0F766E] rounded-full" />
            )}
          </button>

          {/* Results */}
          <button
            onClick={() => onNavigate && onNavigate('results')}
            className={`relative px-3.5 py-1.5 text-sm font-medium transition-colors rounded-md cursor-pointer border-none bg-transparent flex items-center gap-1.5 ${
              activePage === 'results' ? 'text-[#14211F]' : 'text-[#5B6664] hover:text-[#14211F]'
            }`}
          >
            <span>Results</span>
            {hasResults && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
            {activePage === 'results' && (
              <span className="absolute bottom-0 left-3.5 right-3.5 h-[2px] bg-[#0F766E] rounded-full" />
            )}
          </button>
        </nav>

        {/* Right Status Badge */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFFFFF] border border-[#E7E5E0] text-[#5B6664]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse" />
            <span>Hybrid Architecture Active</span>
          </div>
        </div>
      </div>
    </header>
  );
}
