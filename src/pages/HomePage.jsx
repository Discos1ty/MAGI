import React from 'react';
import { 
  ArrowRight, 
  Upload, 
  Sliders, 
  Minimize2, 
  Cpu, 
  BarChart2, 
  Eye, 
  Database, 
  Layers, 
  CheckCircle2, 
  Sparkles, 
  Scale, 
  Puzzle, 
  RefreshCw, 
  ArrowDown, 
  ChevronRight,
  ShieldCheck,
  Binary,
  GitBranch,
  Timer,
  LineChart,
  FileSpreadsheet,
  Activity
} from 'lucide-react';

export default function HomePage({ onTryDemo }) {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="max-w-[1140px] mx-auto px-5 sm:px-8 pt-10 md:pt-14 pb-24">
        
        {/* =========================================================================
            1. HERO SECTION — EXACT MATCH WITH REFERENCE SCREENSHOT & DESIGN SPEC
           ========================================================================= */}
        <section className="animate-clinical-fade pt-2 sm:pt-4">
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

            <a
              href="#technical-architecture"
              className="clinical-btn-secondary"
            >
              <span>Read Technology Paper</span>
            </a>
          </div>

          {/* 3 Step Cards matching Screenshot */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 01 */}
            <div className="clinical-card-interactive p-7 sm:p-8 bg-white rounded-[14px]">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#0F766E] mb-3">
                STEP 01
              </div>
              <h3 className="font-serif text-[23px] text-[#14211F] mb-3 font-normal leading-snug">
                Input Clinical Data
              </h3>
              <p className="text-[13.5px] text-[#5B6664] leading-relaxed">
                Continuous clinical biomarkers (WDBC, Parkinson's voice data, or custom CSV) scaled via dynamic ColumnTransformer.
              </p>
            </div>

            {/* Step 02 */}
            <div className="clinical-card-interactive p-7 sm:p-8 bg-white rounded-[14px]">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#0F766E] mb-3">
                STEP 02
              </div>
              <h3 className="font-serif text-[23px] text-[#14211F] mb-3 font-normal leading-snug">
                Hybrid Quantum Analysis
              </h3>
              <p className="text-[13.5px] text-[#5B6664] leading-relaxed">
                Parallel inference via classical XGBoost and a 4-8 qubit PennyLane variational quantum classifier with Optuna CV tuning.
              </p>
            </div>

            {/* Step 03 */}
            <div className="clinical-card-interactive p-7 sm:p-8 bg-white rounded-[14px]">
              <div className="text-[11px] font-semibold tracking-widest uppercase text-[#0F766E] mb-3">
                STEP 03
              </div>
              <h3 className="font-serif text-[23px] text-[#14211F] mb-3 font-normal leading-snug">
                Calibrated Risk Output
              </h3>
              <p className="text-[13.5px] text-[#5B6664] leading-relaxed">
                Soft-voting ensemble fusion achieving optimal ROC-AUC discrimination with transparent SHAP feature explainability.
              </p>
            </div>
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
            3. HOW MAGI WORKS (5–6 STEP HORIZONTAL CARD PIPELINE)
           ========================================================================= */}
        <section id="how-it-works" className="mt-28 pt-12 border-t border-[#E7E5E0]">
          <div className="max-w-2xl mb-10">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#0F766E] mb-2">
              End-to-End Workflow
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#14211F] font-normal leading-tight">
              How MAGI Works
            </h2>
            <p className="mt-3 text-base text-[#5B6664]">
              A progressive 6-stage clinical pipeline directly reflecting the technical approach: preprocessing, feature reduction, classical & quantum training, benchmarking, and explainability.
            </p>
          </div>

          {/* 6-Step Horizontal Pipeline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 relative">
            {/* Step 01 */}
            <div className="clinical-card-interactive p-6 bg-white rounded-[14px] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                    01
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] group-hover:text-[#0F766E] group-hover:border-[#0F766E]/30 transition-colors">
                    <Upload className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#14211F] mb-2">
                  Upload Dataset
                </h3>
                <p className="text-sm text-[#5B6664] leading-relaxed">
                  Upload a biomedical CSV dataset for analysis.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center text-xs text-[#0F766E] font-medium">
                <span>Tabular Clinical Data</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0F766E]" />
              </div>
            </div>

            {/* Step 02 */}
            <div className="clinical-card-interactive p-6 bg-white rounded-[14px] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                    02
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] group-hover:text-[#0F766E] group-hover:border-[#0F766E]/30 transition-colors">
                    <Sliders className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#14211F] mb-2">
                  Preprocessing
                </h3>
                <p className="text-sm text-[#5B6664] leading-relaxed">
                  Clean, scale, select relevant features and prepare the data for modeling.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center text-xs text-[#0F766E] font-medium">
                <span>StandardScaler & Validation</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0F766E]" />
              </div>
            </div>

            {/* Step 03 */}
            <div className="clinical-card-interactive p-6 bg-white rounded-[14px] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                    03
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] group-hover:text-[#0F766E] group-hover:border-[#0F766E]/30 transition-colors">
                    <Minimize2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#14211F] mb-2">
                  Feature Reduction
                </h3>
                <p className="text-sm text-[#5B6664] leading-relaxed">
                  Apply dimensionality reduction such as PCA and map the selected features into a quantum-compatible representation.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center text-xs text-[#0F766E] font-medium">
                <span>PCA & Angle Mapping</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0F766E]" />
              </div>
            </div>

            {/* Step 04 */}
            <div className="clinical-card-interactive p-6 bg-white rounded-[14px] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                    04
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] group-hover:text-[#0F766E] group-hover:border-[#0F766E]/30 transition-colors">
                    <Cpu className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#14211F] mb-2">
                  Model Training
                </h3>
                <p className="text-sm text-[#5B6664] leading-relaxed">
                  Train and evaluate classical and quantum/hybrid models such as Logistic Regression, VQC and Quantum Kernel SVM.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center text-xs text-[#0F766E] font-medium">
                <span>Multi-Paradigm ML</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0F766E]" />
              </div>
            </div>

            {/* Step 05 */}
            <div className="clinical-card-interactive p-6 bg-white rounded-[14px] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                    05
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] group-hover:text-[#0F766E] group-hover:border-[#0F766E]/30 transition-colors">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#14211F] mb-2">
                  Benchmarking
                </h3>
                <p className="text-sm text-[#5B6664] leading-relaxed">
                  Compare model performance using evaluation metrics, execution time and other experiment results.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center text-xs text-[#0F766E] font-medium">
                <span>5-Fold Stratified Metrics</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0F766E]" />
              </div>
            </div>

            {/* Step 06 */}
            <div className="clinical-card-interactive p-6 bg-white rounded-[14px] flex flex-col justify-between relative group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#0F766E]/10 text-[#0F766E]">
                    06
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] group-hover:text-[#0F766E] group-hover:border-[#0F766E]/30 transition-colors">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="font-serif text-xl text-[#14211F] mb-2">
                  Explain & Analyze
                </h3>
                <p className="text-sm text-[#5B6664] leading-relaxed">
                  Explore predictions, model behavior and experiment results through interpretable visualizations.
                </p>
              </div>
              <div className="mt-5 pt-3 border-t border-[#F4F4F0] flex items-center text-xs text-[#0F766E] font-medium">
                <span>SHAP & Confusion Matrix</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#0F766E]" />
              </div>
            </div>
          </div>
        </section>


        {/* =========================================================================
            4. TECHNICAL ARCHITECTURE (LAYERED CARDS)
           ========================================================================= */}
        <section id="technical-architecture" className="mt-28 pt-12 border-t border-[#E7E5E0]">
          <div className="max-w-2xl mb-12">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#0F766E] mb-2">
              System Specification
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#14211F] font-normal leading-tight">
              Technical Architecture
            </h2>
            <p className="mt-3 text-base text-[#5B6664]">
              A multi-tiered, modular framework decoupling raw clinical data ingestion, quantum state preparation, dual-engine intelligence, and explainable evaluation.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* LAYER 1: DATA LAYER */}
            <div className="clinical-card bg-white p-7 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    Layer 1 — Data Layer
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5B6664] bg-[#FAFAF7] px-2.5 py-1 rounded border border-[#E7E5E0]">
                  Biomedical Dataset Ingestion
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#14211F] mb-3">
                Biomedical Dataset
              </h3>

              {/* Data Flow Pipeline */}
              <div className="p-4 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2 text-[#14211F]">
                  <FileSpreadsheet className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-semibold">CSV Ingestion</span>
                </div>
                <ArrowRight className="hidden md:block w-4 h-4 text-[#5B6664]" />
                <ArrowDown className="md:hidden w-4 h-4 text-[#5B6664]" />
                <div className="flex items-center gap-2 text-[#14211F]">
                  <Layers className="w-4 h-4 text-[#0F766E]" />
                  <span>Patient / Clinical Features (Continuous Biopsy Metrics)</span>
                </div>
                <ArrowRight className="hidden md:block w-4 h-4 text-[#5B6664]" />
                <ArrowDown className="md:hidden w-4 h-4 text-[#5B6664]" />
                <div className="flex items-center gap-2 text-[#14211F]">
                  <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-semibold">Target Variable (Diagnosis)</span>
                </div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center -my-2">
              <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] shadow-xs">
                <ArrowDown className="w-3.5 h-3.5 text-[#0F766E]" />
              </div>
            </div>

            {/* LAYER 2: PREPROCESSING LAYER */}
            <div className="clinical-card bg-white p-7 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    Layer 2 — Preprocessing Layer
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5B6664] bg-[#FAFAF7] px-2.5 py-1 rounded border border-[#E7E5E0]">
                  Standardization & Quantum Mapping
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#14211F] mb-4">
                Data Preparation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] font-medium mb-1">01 / VALIDATE</div>
                  <div className="text-sm font-medium text-[#14211F]">Data validation</div>
                  <p className="text-xs text-[#5B6664] mt-1">Null invariant checks & schema audit</p>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] font-medium mb-1">02 / SCALE</div>
                  <div className="text-sm font-medium text-[#14211F]">Scaling</div>
                  <p className="text-xs text-[#5B6664] mt-1">StandardScaler Z-score normalization</p>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] font-medium mb-1">03 / FILTER</div>
                  <div className="text-sm font-medium text-[#14211F]">Feature selection</div>
                  <p className="text-xs text-[#5B6664] mt-1">VarianceThreshold low-signal pruning</p>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] font-medium mb-1">04 / REDUCE</div>
                  <div className="text-sm font-medium text-[#14211F]">PCA / Dimensionality</div>
                  <p className="text-xs text-[#5B6664] mt-1">4 principal components (79.3% variance)</p>
                </div>
                <div className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] font-medium mb-1">05 / ENCODE</div>
                  <div className="text-sm font-medium text-[#14211F]">Quantum feature mapping</div>
                  <p className="text-xs text-[#5B6664] mt-1">Affine angle scaling θ ∈ [-π, π]</p>
                </div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center -my-2">
              <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] shadow-xs">
                <ArrowDown className="w-3.5 h-3.5 text-[#0F766E]" />
              </div>
            </div>

            {/* LAYER 3: INTELLIGENCE LAYER (THREE CARDS SIDE-BY-SIDE) */}
            <div className="clinical-card bg-white p-7 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    Layer 3 — Intelligence Layer
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5B6664] bg-[#FAFAF7] px-2.5 py-1 rounded border border-[#E7E5E0]">
                  Multi-Paradigm Inference Engines
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Classical ML Card */}
                <div className="p-6 bg-[#FAFAF7] rounded-[12px] border border-[#E7E5E0] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono uppercase font-semibold text-[#5B6664]">
                        Classical ML
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-[#E7E5E0] text-[#5B6664]">
                        CPU Baseline
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl text-[#14211F] mb-2">
                      Logistic Regression
                    </h4>
                    <p className="text-xs text-[#5B6664] mb-4">
                      Classical baseline model providing high-speed linear margin discrimination and benchmarking reference.
                    </p>
                  </div>
                  <ul className="space-y-2 pt-3 border-t border-[#E7E5E0] text-xs text-[#5B6664]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Logistic Regression</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Classical baseline evaluation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Microsecond execution latency</span>
                    </li>
                  </ul>
                </div>

                {/* Quantum ML Card */}
                <div className="p-6 bg-[#FAFAF7] rounded-[12px] border border-[#E7E5E0] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono uppercase font-semibold text-[#0F766E]">
                        Quantum ML
                      </span>
                      <span className="text-[10px] font-mono bg-[#0F766E]/10 px-2 py-0.5 rounded border border-[#0F766E]/20 text-[#0F766E]">
                        PennyLane QML
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl text-[#14211F] mb-2">
                      Variational Quantum Classifier
                    </h4>
                    <p className="text-xs text-[#5B6664] mb-4">
                      Parameterized 4-qubit variational circuit with circular CNOT entanglement executing on quantum statevectors.
                    </p>
                  </div>
                  <ul className="space-y-2 pt-3 border-t border-[#E7E5E0] text-xs text-[#5B6664]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Variational Quantum Classifier (VQC)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Quantum feature processing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Pauli-Z expectation measurements</span>
                    </li>
                  </ul>
                </div>

                {/* Hybrid ML Card */}
                <div className="p-6 bg-[#FFFFFF] rounded-[12px] border-2 border-[#0F766E] shadow-[0_2px_12px_rgba(15,118,110,0.08)] flex flex-col justify-between relative">
                  <div className="absolute -top-3 right-4 bg-[#0F766E] text-white text-[10px] font-medium tracking-wide uppercase px-2.5 py-0.5 rounded-full">
                    Hybrid Combiner
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[11px] font-mono uppercase font-semibold text-[#0F766E]">
                        Hybrid ML
                      </span>
                      <span className="text-[10px] font-mono bg-[#0F766E]/10 px-2 py-0.5 rounded border border-[#0F766E]/20 text-[#0F766E]">
                        Quantum-Classical
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl text-[#14211F] mb-2">
                      Quantum Kernel SVM
                    </h4>
                    <p className="text-xs text-[#5B6664] mb-4">
                      Integrated classical–quantum workflow coupling quantum kernel evaluations with soft-voting ensemble fusion.
                    </p>
                  </div>
                  <ul className="space-y-2 pt-3 border-t border-[#E7E5E0] text-xs text-[#5B6664]">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Quantum Kernel SVM</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Classical–quantum workflow</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />
                      <span>Calibrated ensemble decision boundaries</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center -my-2">
              <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] shadow-xs">
                <ArrowDown className="w-3.5 h-3.5 text-[#0F766E]" />
              </div>
            </div>

            {/* LAYER 4: EVALUATION LAYER */}
            <div className="clinical-card bg-white p-7 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    Layer 4 — Evaluation Layer
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5B6664] bg-[#FAFAF7] px-2.5 py-1 rounded border border-[#E7E5E0]">
                  Statistical Benchmarking
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#14211F] mb-4">
                Benchmarking
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { name: 'Accuracy', desc: 'Overall classification correctness' },
                  { name: 'Precision', desc: 'Positive predictive value' },
                  { name: 'Recall', desc: 'Sensitivity on positive cases' },
                  { name: 'F1-score', desc: 'Harmonic mean of precision & recall' },
                  { name: 'ROC-AUC', desc: 'Area under discriminative curve' },
                  { name: 'Execution time', desc: 'Training & inference latency' },
                ].map((metric) => (
                  <div key={metric.name} className="p-3.5 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                    <div className="font-semibold text-sm text-[#14211F]">{metric.name}</div>
                    <div className="text-[11px] text-[#5B6664] mt-1 leading-snug">{metric.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Connecting Arrow */}
            <div className="flex justify-center -my-2">
              <div className="w-6 h-6 rounded-full bg-[#FFFFFF] border border-[#E7E5E0] flex items-center justify-center text-[#5B6664] shadow-xs">
                <ArrowDown className="w-3.5 h-3.5 text-[#0F766E]" />
              </div>
            </div>

            {/* LAYER 5: INSIGHT LAYER */}
            <div className="clinical-card bg-white p-7 rounded-[16px] border border-[#E7E5E0]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    Layer 5 — Insight Layer
                  </span>
                </div>
                <span className="text-xs font-mono text-[#5B6664] bg-[#FAFAF7] px-2.5 py-1 rounded border border-[#E7E5E0]">
                  Explainability & Clinical Visualizations
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#14211F] mb-4">
                Explainability & Visualization
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] uppercase font-semibold mb-1">
                    Output 01
                  </div>
                  <div className="text-sm font-semibold text-[#14211F] mb-1">Predictions</div>
                  <p className="text-xs text-[#5B6664] leading-relaxed">
                    Probabilistic patient risk scores with confidence intervals.
                  </p>
                </div>

                <div className="p-4 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] uppercase font-semibold mb-1">
                    Output 02
                  </div>
                  <div className="text-sm font-semibold text-[#14211F] mb-1">Model comparison</div>
                  <p className="text-xs text-[#5B6664] leading-relaxed">
                    Side-by-side ROC curves and confusion matrix breakdowns.
                  </p>
                </div>

                <div className="p-4 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] uppercase font-semibold mb-1">
                    Output 03
                  </div>
                  <div className="text-sm font-semibold text-[#14211F] mb-1">Feature insights</div>
                  <p className="text-xs text-[#5B6664] leading-relaxed">
                    SHAP waterfalls detailing biochemical biomarker attributions.
                  </p>
                </div>

                <div className="p-4 bg-[#FAFAF7] rounded-[10px] border border-[#E7E5E0]">
                  <div className="text-[11px] font-mono text-[#0F766E] uppercase font-semibold mb-1">
                    Output 04
                  </div>
                  <div className="text-sm font-semibold text-[#14211F] mb-1">Experiment results</div>
                  <p className="text-xs text-[#5B6664] leading-relaxed">
                    Traceable database audit logs of parameters and cross-validation splits.
                  </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="clinical-card-interactive p-7 bg-white rounded-[16px]">
              <div className="w-12 h-12 rounded-[10px] bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-2xl mb-5">
                🔬
              </div>
              <h3 className="font-serif text-2xl text-[#14211F] mb-2.5">
                Hybrid Intelligence
              </h3>
              <p className="text-[15px] text-[#5B6664] leading-relaxed">
                Combines classical machine learning with quantum-enhanced approaches within a unified workflow.
              </p>
            </div>

            {/* Card 2 */}
            <div className="clinical-card-interactive p-7 bg-white rounded-[16px]">
              <div className="w-12 h-12 rounded-[10px] bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-2xl mb-5">
                ⚖️
              </div>
              <h3 className="font-serif text-2xl text-[#14211F] mb-2.5">
                Model Benchmarking
              </h3>
              <p className="text-[15px] text-[#5B6664] leading-relaxed">
                Provides reproducible comparison between classical and quantum/hybrid models.
              </p>
            </div>

            {/* Card 3 */}
            <div className="clinical-card-interactive p-7 bg-white rounded-[16px]">
              <div className="w-12 h-12 rounded-[10px] bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-2xl mb-5">
                🧩
              </div>
              <h3 className="font-serif text-2xl text-[#14211F] mb-2.5">
                Explainable Results
              </h3>
              <p className="text-[15px] text-[#5B6664] leading-relaxed">
                Transforms model outputs into interpretable insights rather than only producing predictions.
              </p>
            </div>

            {/* Card 4 */}
            <div className="clinical-card-interactive p-7 bg-white rounded-[16px]">
              <div className="w-12 h-12 rounded-[10px] bg-[#0F766E]/10 border border-[#0F766E]/20 flex items-center justify-center text-2xl mb-5">
                🔄
              </div>
              <h3 className="font-serif text-2xl text-[#14211F] mb-2.5">
                Reproducible Experiments
              </h3>
              <p className="text-[15px] text-[#5B6664] leading-relaxed">
                Tracks preprocessing, model configuration and evaluation results for repeatable experimentation.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
