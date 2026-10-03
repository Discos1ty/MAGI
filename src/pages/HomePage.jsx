import React from 'react';
import {
  ArrowRight,
  Layers,
  CheckCircle2,
  Scale,
  Puzzle,
  RefreshCw,
  ArrowDown,
  FileSpreadsheet,
  Activity,
  Microscope,
  Network
} from 'lucide-react';

// Chevron arrow with a V-shaped tail notch; stretched to each step's box
const STEP_ARROW_PATH = 'M0 0 L250 0 L300 50 L250 100 L0 100 L50 50 Z';

const STEPS = [
  {
    step: 'STEP 01',
    title: 'Input Clinical Data',
    body: "Continuous clinical biomarkers (WDBC, Parkinson's voice data, or custom CSV) scaled via dynamic ColumnTransformer.",
  },
  {
    step: 'STEP 02',
    title: 'Hybrid Quantum Analysis',
    body: 'Parallel inference via classical XGBoost and a 4-8 qubit PennyLane variational quantum classifier with Optuna CV tuning.',
  },
  {
    step: 'STEP 03',
    title: 'Calibrated Risk Output',
    body: 'Soft-voting ensemble fusion achieving optimal ROC-AUC discrimination with transparent SHAP feature explainability.',
  },
];

const WHY_MAGI = [
  {
    icon: Microscope,
    title: 'Hybrid Intelligence',
    body: 'Combines classical machine learning with quantum-enhanced approaches within a unified workflow.',
    tone: 'filled',
  },
  {
    icon: Scale,
    title: 'Model Benchmarking',
    body: 'Provides reproducible comparison between classical and quantum/hybrid models.',
    tone: 'unfilled',
  },
  {
    icon: Network,
    title: 'Scalable',
    body: 'A disease-agnostic pipeline designed to extend beyond breast cancer to other early-detection tasks.',
    tone: 'unfilled',
  },
  {
    icon: Puzzle,
    title: 'Explainable Results',
    body: 'Transforms model outputs into interpretable insights rather than only producing predictions.',
    tone: 'unfilled',
  },
  {
    icon: RefreshCw,
    title: 'Reproducible Experiments',
    body: 'Tracks preprocessing, model configuration and evaluation results for repeatable experimentation.',
    tone: 'filled',
  },
];

export default function HomePage({ onTryDemo }) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 pt-10 md:pt-14 pb-24">
        
        {/* =========================================================================
            1. HERO SECTION — EXACT MATCH WITH REFERENCE SCREENSHOT & DESIGN SPEC
           ========================================================================= */}
        <section className="animate-clinical-fade pt-2 sm:pt-4">
          <div className="flex flex-col-reverse md:flex-row md:items-start md:justify-between gap-8 md:gap-12">
            <div>
              {/* Main Title matching Screenshot */}
              <h1 className="font-serif text-[2.75rem] sm:text-[3.5rem] md:text-[3.85rem] text-[#14211F] font-normal tracking-[-0.015em] leading-[1.12] max-w-3xl">
                Hybrid Quantum-Classical<br />
                Model for Early Disease<br />
                Detection
              </h1>

              {/* Subtitle matching Screenshot */}
              <p className="mt-6 text-base sm:text-[17.5px] text-[#5B6664] leading-[1.65] max-w-2xl font-normal">
                An empirically evaluated clinical architecture combining high-dimensional biopsy biomarker encoding with 4-qubit quantum statevector classification and soft-voting fusion.
              </p>

              {/* CTAs matching Screenshot */}
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <button
                  type="button"
                  onClick={onTryDemo}
                  className="clinical-btn-primary group cursor-pointer"
                >
                  <span>Try the demo</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* App icon, Play Store style */}
            <img
              src="/magi-logo-light.png"
              alt="MAGI logo"
              className="w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 md:mt-1 shrink-0 object-contain"
            />
          </div>

          {/* 3 Steps as interlocking arrows — each point nests into the next one's V-shaped notch */}
          <div className="step-flow mt-14">
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="step-arrow">
                <svg className="step-arrow-rim" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
                  <path d={STEP_ARROW_PATH} vectorEffect="non-scaling-stroke" />
                </svg>
                <div className="step-arrow-content">
                  <div className="text-[11px] font-semibold tracking-widest uppercase text-[#0F766E] mb-3">
                    {step}
                  </div>
                  <h3 className="font-serif text-[23px] text-[#14211F] mb-3 font-normal leading-snug">
                    {title}
                  </h3>
                  <p className="text-[13.5px] text-[#5B6664] leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* =========================================================================
            2. WELCOME TO MAGI
           ========================================================================= */}
        <section id="welcome-overview" className="mt-28 pt-12 border-t border-[#E7E5E0]">
          <div className="clinical-card bg-white p-8 sm:p-10 rounded-[16px] border border-[#E7E5E0]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Welcome to MAGI</span>
                </div>
                <h2 className="font-serif text-3xl sm:text-[34px] text-[#14211F] font-normal leading-tight mb-4">
                  A Unified Machine Learning Environment for Early Disease Detection
                </h2>
                <p className="text-base sm:text-[17px] text-[#5B6664] leading-[1.75]">
                  MAGI is a hybrid Quantum–Classical Machine Learning platform for early disease detection. It processes biomedical datasets, applies standardized preprocessing and feature reduction, and evaluates classical and quantum-enhanced models to generate interpretable, reproducible predictions.
                </p>
              </div>

              {/* Quick Pillars */}
              <div className="lg:w-72 shrink-0 p-5 bg-[#FAFAF7] rounded-[12px] border border-[#E7E5E0] space-y-3.5">
                <div className="text-[11px] font-semibold text-[#14211F] uppercase tracking-wider">
                  Platform Core Highlights
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#5B6664]">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>Standardized data pipelines</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#5B6664]">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>Rigorous quantum state encoding</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-[#5B6664]">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E] shrink-0" />
                  <span>Interpretable SHAP diagnostics</span>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            5. WHY MAGI? (4 CARDS)
           ========================================================================= */}
        <section id="why-magi" className="mt-28 pt-12 border-t border-[#E7E5E0]">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#0F766E] mb-2">
              Value & Innovation
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#14211F] font-normal leading-tight">
              Why MAGI?
            </h2>
            <p className="mt-3 text-base text-[#5B6664]">
              Understanding why this platform is useful, not just how it works — built to bring empirical honesty, hybrid synergy, and interpretability to medical AI.
            </p>
          </div>

          {/* Honeycomb — three cells on top, two nested in the gaps below */}
          <div className="hex-grid">
            {WHY_MAGI.map(({ icon: Icon, title, body, tone }) => (
              <div key={title} className={`hex-cell ${tone ? `hex-cell-${tone}` : ''}`}>
                <div className="hex-cell-inner">
                  <div className="hex-icon">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl lg:text-2xl mb-2">
                    {title}
                  </h3>
                  <p className="hex-body text-[13.5px] lg:text-[14.5px] leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
