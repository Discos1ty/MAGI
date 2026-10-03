import React from 'react';

export default function Footer() {
  return (
    <footer className="footer-aurora relative z-10 mt-24 border-t border-[#E7E5E0] py-12 text-[#4F5B59]">
      <div className="relative max-w-[1140px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#14211F]/10">
          <div>
            <div className="flex items-center gap-3 font-serif text-lg text-[#14211F]">
              <img src="/magi-logo-light.png" alt="MAGI logo" className="w-9 h-9 object-contain" />
              <span>MAGI — Hybrid Quantum-Classical Platform</span>
            </div>
            <p className="text-xs text-[#4F5B59] mt-1 max-w-lg leading-relaxed">
              SIH26139: An empirical clinical research benchmark comparing Classical XGBoost, 4-Qubit Variational Quantum Classification, and Ensemble Soft-Voting for early disease detection.
            </p>
          </div>
          <div className="text-xs text-[#4F5B59] space-y-1">
            <div>Institutional Research Initiative: <span className="font-medium text-[#14211F]">SIH26139</span></div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4F5B59]">
          <p className="text-[11px] text-[#5B6664]">
            Empirical diagnostic research prototype. Not intended as an independent diagnostic medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
