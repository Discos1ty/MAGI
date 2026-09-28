import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-[#E7E5E0] bg-[#FFFFFF] py-12 text-[#5B6664]">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#E7E5E0]">
          <div>
            <div className="font-serif text-lg text-[#14211F]">
              QuantumDx — Hybrid Quantum-Classical Platform
            </div>
            <p className="text-xs text-[#5B6664] mt-1 max-w-lg leading-relaxed">
              SIH26139: An empirical clinical research benchmark comparing Classical XGBoost, 4-Qubit Variational Quantum Classification, and Ensemble Soft-Voting for early disease detection.
            </p>
          </div>
          <div className="text-xs text-[#5B6664] space-y-1">
            <div>Institutional Research Initiative: <span className="font-medium text-[#14211F]">SIH26139</span></div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5B6664]">
          <p>© {new Date().getFullYear()} Team QuantumDx. All research rights reserved.</p>
          <p className="text-[11px] text-[#717E7B]">
            Empirical diagnostic research prototype. Not intended as an independent diagnostic medical device.
          </p>
        </div>
      </div>
    </footer>
  );
}
