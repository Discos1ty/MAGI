import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  FileSpreadsheet,
  Flame,
  Info,
  Layers,
  Lock,
  Printer,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  Zap,
  ArrowLeft,
  ArrowDown,
  Check,
  ClipboardCheck,
  Pencil
} from 'lucide-react';
import { getPatientShapPlots, checkBackendHealth } from '../api/client';
import PatientReportModal from '../components/PatientReport.jsx';

const FEEDBACK_QUESTIONS = [
  {
    id: 'xaiDiscrepancies',
    question: 'Are there any discrepancies found in the explainable part of our model?',
  },
  {
    id: 'predictionSufficient',
    question: "Do you consider the model's prediction sufficiently accurate to support the generation of a clinical report based on the provided data?",
  },
  {
    id: 'performanceAdequate',
    question: 'Does the reported model performance appear adequate for further clinical validation?',
  },
];

export default function ResultsPage({
  patientTest,
  onNavigateToUpload,
  onNavigateToPipeline
}) {
  // Uploaded patient currently shown in the patient SHAP section
  const [selectedPatient, setSelectedPatient] = useState(patientTest?.selectedPatient ?? 1);
  useEffect(() => {
    setSelectedPatient(patientTest?.selectedPatient ?? 1);
  }, [patientTest]);
  const patientResult = patientTest?.results?.find(r => r.patient === selectedPatient) || null;
  const [patientPlots, setPatientPlots] = useState(null);
  const [showReport, setShowReport] = useState(false);
  // The report is built from uploaded patient data only
  const noPatientData = !patientTest?.results?.length;

  // Clinician feedback must be submitted before the report can be generated
  const [feedback, setFeedback] = useState({});
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  useEffect(() => {
    setFeedback({});
    setFeedbackSubmitted(false);
  }, [patientTest]);
  const feedbackComplete = FEEDBACK_QUESTIONS.every(({ id }) => feedback[id]);
  const reportLocked = noPatientData || !feedbackSubmitted;
  const reportLockedMessage = noPatientData
    ? 'Please add patient data in the Upload section first. The report will then be ready to preview and download.'
    : 'Please complete and submit the Clinician Feedback form below to generate the report.';
  const [loadingPatientPlots, setLoadingPatientPlots] = useState(false);
  const [patientPlotsError, setPatientPlotsError] = useState(null);

  // Render SHAP plots for the selected uploaded patient
  useEffect(() => {
    if (!patientTest?.patients) return undefined;
    let isMounted = true;
    setLoadingPatientPlots(true);
    setPatientPlotsError(null);
    getPatientShapPlots(patientTest.patients, selectedPatient)
      .then((data) => { if (isMounted) setPatientPlots(data); })
      .catch((err) => { if (isMounted) setPatientPlotsError(err.message || 'Failed to render SHAP plots.'); })
      .finally(() => { if (isMounted) setLoadingPatientPlots(false); });
    return () => { isMounted = false; };
  }, [patientTest, selectedPatient]);

  // Results only ever show uploaded patient data, never the benchmark dataset
  const showPatientShap = Boolean(patientResult);
  const activeShap = showPatientShap
    ? patientPlots && {
        ...patientPlots,
        features: [...patientResult.quantum.features].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)),
      }
    : null;
  const patientShap = activeShap;

  // Real soft-voting risk for the patient explained in section 2
  const fusion = activeShap?.fusion || null;
  const fusionLoading = !fusion && loadingPatientPlots;
  const isHighRisk = fusion ? fusion.risk_probability >= 0.5 : false;
  const fusionSubject = showPatientShap ? `uploaded patient #${patientResult.patient}` : '';
  const formatPct = (value) => `${(value * 100).toFixed(1)}%`;
  // Held-out test-set benchmark (malignant = positive) of the same models that made the prediction
  const benchmark = activeShap?.benchmark || null;
  const summaryStages = [
    ['Patient File Upload', showPatientShap],
    ['PCA Quantum Prep', Boolean(benchmark)],
    ['Classical ML (XGBoost)', Boolean(benchmark)],
    ['Quantum ML (VQC)', Boolean(benchmark)],
    ['SHAP XAI Attribution', Boolean(activeShap?.patient_xai_plot)],
  ];

  return (
    <div className="min-h-screen text-[#14211F] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1240px] mx-auto space-y-10">

        {/* =========================================================================
            TOP NAVIGATIONAL BREADCRUMB & METADATA BAR
           ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E5E0]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono tracking-wider uppercase font-semibold text-[#0F766E] px-2 py-0.5 rounded bg-[#0F766E]/10">
                EXPERIMENT RESULTS & CLINICAL INSIGHT
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14211F] tracking-tight">
              Clinical Diagnostic Report & Evaluation
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative group">
              <button
                type="button"
                aria-disabled={reportLocked}
                aria-describedby={reportLocked ? 'print-report-locked' : undefined}
                onClick={() => { if (!reportLocked) setShowReport(true); }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border shadow-xs ${
                  reportLocked
                    ? 'bg-[#F1F0EC] border-[#E7E5E0] text-[#9AA3A1] cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50 border-[#E7E5E0] text-[#14211F] cursor-pointer'
                }`}
              >
                {reportLocked
                  ? <Lock className="w-3.5 h-3.5" />
                  : <Printer className="w-3.5 h-3.5 text-[#5B6664]" />}
                <span>Print Report</span>
              </button>
              {reportLocked && (
                <div
                  id="print-report-locked"
                  role="tooltip"
                  className="pointer-events-none absolute right-0 top-full mt-2 w-64 z-20 rounded-xl bg-[#14211F] text-white text-[11px] leading-relaxed px-3 py-2 shadow-lg opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
                >
                  {reportLockedMessage}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            1. THE HEADLINE: EARLY DISEASE DETECTION
           ========================================================================= */}
        <section className="clinical-card bg-gradient-to-br from-white via-white to-[#FFF5F5] rounded-[22px] border-2 border-rose-200/80 p-6 sm:p-9 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Section Subhead */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-[#E7E5E0]/70">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-rose-800 font-bold">
                1. EARLY DISEASE DETECTION
              </span>
            </div>
            <div className="text-[11px] font-mono text-[#717E7B] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Label: Model-Predicted Risk Probability (Clinical Validation Required)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
            {/* Condition Information */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-[#717E7B]">Predicted Pathology Condition</span>
                <h2 className="font-serif text-3xl sm:text-4xl text-[#14211F] mt-1 font-normal tracking-tight">
                  Wisconsin Breast Cancer (WDBC)
                </h2>
                <p className="text-xs sm:text-sm text-[#5B6664] mt-2 leading-relaxed">
                  Evaluated on fine-needle aspirate (FNA) biopsy cell nuclei characteristics. The hybrid architecture combines tree-based gradient boosted ensembles with 4-qubit quantum statevector classification.
                </p>
              </div>

              {/* Models Compared */}
              <div className="p-4 rounded-xl bg-white border border-[#E7E5E0] space-y-2.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#14211F]">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0F766E]" />
                    <span>Models Compared</span>
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                  {[
                    ['Classical ML', 'XGBoost', 'classical', 'text-emerald-700'],
                    ['Quantum ML', '4-Qubit VQC', 'quantum', 'text-teal-700'],
                  ].map(([paradigm, name, key, color]) => (
                    <div key={key} className="p-2 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0]">
                      <span className="text-[10px] text-[#717E7B]">{paradigm}</span>
                      <div className="font-semibold text-[#14211F]">{name}</div>
                      <span className={`text-[10px] ${color}`}>
                        {benchmark?.[key]
                          ? `${formatPct(benchmark[key].metrics.accuracy)} Acc · ${formatPct(benchmark[key].metrics.sensitivity)} Recall`
                          : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-[#717E7B]">
                  {benchmark
                    ? 'Held-out test-set results of the pre-trained models used for uploaded patients.'
                    : 'Test-set results appear once a patient file is uploaded.'}
                </p>
              </div>
            </div>

            {/* Dominant Risk Box */}
            <div className="lg:col-span-5 flex justify-center">
              <div className={`w-full max-w-sm rounded-[20px] p-7 text-center border-2 transition-all duration-300 shadow-xl ${
                !fusion
                  ? 'bg-white border-[#E7E5E0] shadow-black/5'
                  : isHighRisk
                  ? 'bg-gradient-to-b from-rose-50 to-white border-rose-300 shadow-rose-500/10'
                  : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-300 shadow-emerald-500/10'
              }`}>
                {fusion && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider mb-3 bg-white border shadow-xs"
                       style={{ color: isHighRisk ? '#E11D48' : '#0F766E', borderColor: isHighRisk ? '#FECDD3' : '#CCFBF1' }}>
                    {isHighRisk ? <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> : <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />}
                    <span>{isHighRisk ? 'HIGH RISK' : 'LOW RISK / BENIGN'}</span>
                  </div>
                )}

                <div className="my-2">
                  <div className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-[#14211F]">
                    {fusion ? formatPct(fusion.risk_probability) : fusionLoading
                      ? <RefreshCw className="w-10 h-10 mx-auto animate-spin text-[#0F766E]" />
                      : '—'}
                  </div>
                  <div className="text-xs font-mono uppercase tracking-wider text-[#5B6664] mt-1 font-semibold">
                    Predicted Risk Probability
                  </div>
                </div>

                <p className="text-[11px] text-[#717E7B] mt-3 border-t border-gray-200/70 pt-3">
                  {fusion
                    ? `Mean of XGBoost P(malignant) ${formatPct(fusion.classical_probability)} and VQC ${formatPct(fusion.quantum_probability)} for ${fusionSubject}.`
                    : fusionLoading
                      ? 'Computing the risk from both models...'
                      : 'Upload a patient file to compute a real risk probability.'}
                </p>

                <div className="mt-4 pt-1">
                  <a
                    href="#explainability"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#0D655E] underline underline-offset-4"
                  >
                    <span>View Prediction Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. WHY THIS PREDICTION? (SHAP / XAI FEATURE CONTRIBUTIONS)
           ========================================================================= */}
        <section id="explainability" className="clinical-card bg-white rounded-[20px] border border-[#E7E5E0] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-[#E7E5E0]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-semibold bg-[#0F766E]/10 px-2 py-0.5 rounded">
                  2. EXPLAINABLE AI (XAI)
                </span>
                <span className="text-xs text-[#717E7B] font-mono">KernelExplainer · 4-Qubit VQC</span>
              </div>
              <h3 className="font-serif text-2xl text-[#14211F] mt-1">
                What Influenced This Prediction?
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {showPatientShap && patientTest.results.length > 1 && (
                <div className="relative">
                  <select
                    aria-label="Uploaded patient"
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(Number(e.target.value))}
                    className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-[#E7E5E0] bg-white text-xs font-mono text-[#14211F] cursor-pointer"
                  >
                    {patientTest.results.map((r) => (
                      <option key={r.patient} value={r.patient}>
                        Patient #{r.patient} · {r.quantum.prediction}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#717E7B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
              <div className="text-xs font-mono text-[#5B6664] bg-[#FAFAF7] px-3 py-1.5 rounded-lg border border-[#E7E5E0]">
                Base Expectation Value: <strong>{patientShap?.base_value ?? '—'}</strong>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-[#5B6664] leading-relaxed max-w-4xl">
            Shapley values for your uploaded patient, from the pre-trained quantum classifier.
            Each of the 4 qubits receives one principal component, labelled with the biomarker that loads most heavily on it. Bars to the right pushed the quantum score towards malignant; bars to the left pushed it towards benign.
          </p>

          {/* Backend-rendered SHAP plots */}
          {!showPatientShap ? (
            <div className="p-6 rounded-xl bg-[#FAFAF7] border border-[#E7E5E0] text-center space-y-3">
              <p className="text-xs sm:text-sm text-[#5B6664]">
                Upload a patient file (measurements without a diagnosis column) to see which biomarkers influenced the prediction.
              </p>
              <button
                type="button"
                onClick={onNavigateToUpload}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-medium cursor-pointer"
              >
                Upload Patient Data
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : loadingPatientPlots ? (
            <div className="py-12 text-center text-xs font-mono text-[#717E7B] flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#0F766E]" />
              <span>Computing Shapley values for the quantum model...</span>
            </div>
          ) : patientPlotsError ? (
            <div className="p-4 rounded-xl bg-amber-50 text-amber-800 text-xs border border-amber-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>SHAP explanation unavailable: {patientPlotsError}</span>
            </div>
          ) : patientShap && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-[#5B6664]">
                <span className="px-2 py-1 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0]">
                  Uploaded patient #{patientResult.patient}
                </span>
                <span className="px-2 py-1 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0]">
                  XGBoost: <strong className="capitalize">{patientResult.classical.prediction}</strong> ({(patientResult.classical.probability_malignant * 100).toFixed(1)}%)
                </span>
                <span className="px-2 py-1 rounded-lg bg-[#FAFAF7] border border-[#E7E5E0]">
                  Quantum score: <strong>{patientShap.quantum_score}</strong>
                </span>
                <span className={`px-2 py-1 rounded-lg border font-semibold ${
                  patientShap.diagnosis === 'Malignant'
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-[#0F766E]/10 border-[#0F766E]/30 text-[#0F766E]'
                }`}>
                  VQC diagnosis: {patientShap.diagnosis}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-[#14211F]">Biomarker Diagnostic Impact</h4>
                  <div className="p-3 rounded-xl bg-white border border-[#E7E5E0]">
                    <img
                      src={patientShap.patient_xai_plot}
                      alt="Local SHAP explanation for the selected patient"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-serif text-lg text-[#14211F]">Global Model Attribution</h4>
                  <div className="p-3 rounded-xl bg-white border border-[#E7E5E0]">
                    <img
                      src={patientShap.global_xai_plot}
                      alt="Global SHAP summary across test patients"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Visual Scale Diagram */}
          <div className="p-4 rounded-xl bg-[#F8FAF9] border border-[#E7E5E0] text-center space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-[#717E7B]">
              <span className="inline-flex items-center gap-1 text-[#0F766E] font-semibold"><ArrowLeft className="w-3.5 h-3.5" />Protective (Pushes to Benign)</span>
              <span>Base Value ({patientShap?.base_value ?? '—'})</span>
              <span className="inline-flex items-center gap-1 text-rose-600 font-semibold">Risk Escalation (Pushes to Malignant)<ArrowRight className="w-3.5 h-3.5" /></span>
            </div>
            <div className="w-full h-1.5 bg-gradient-to-r from-[#0F766E] via-gray-300 to-rose-500 rounded-full" />
            {patientShap?.features?.length > 0 && (
              <p className="text-[11px] text-[#5B6664] pt-1">
                <strong>{patientShap.features[0].feature}</strong> had the largest influence on this patient, pushing the quantum score towards{' '}
                <strong>{patientShap.features[0].shap_value > 0 ? 'malignant' : 'benign'}</strong> ({patientShap.features[0].shap_value > 0 ? '+' : ''}{patientShap.features[0].shap_value}).
              </p>
            )}
          </div>
        </section>

        {/* =========================================================================
            3. HYBRID INTELLIGENCE (CLASSICAL VS QUANTUM PREDICTION)
           ========================================================================= */}
        <section className="clinical-card bg-white rounded-[20px] border border-[#E7E5E0] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-[#E7E5E0]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-semibold bg-[#0F766E]/10 px-2 py-0.5 rounded">
              3. MULTI-PARADIGM PREDICTION
            </span>
            <h3 className="font-serif text-2xl text-[#14211F] mt-1">
              Hybrid Intelligence Architecture
            </h3>
            <p className="text-xs text-[#5B6664] mt-0.5">
              {fusion
                ? `Independent classical and quantum predictions for ${fusionSubject}.`
                : 'Independent classical and quantum predictions appear once a patient file is uploaded.'}
            </p>
          </div>

          <div className="p-6 rounded-xl bg-[#FAFAF7] border border-[#E7E5E0]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-center">
              {[
                {
                  key: 'classical',
                  paradigm: 'Classical Paradigm',
                  paradigmClass: 'text-amber-700 bg-amber-100/70',
                  name: 'XGBoost Classifier',
                  prediction: fusion?.classical_prediction,
                  malignant: fusion?.classical_probability,
                  detail: fusion && `P(malignant): ${formatPct(fusion.classical_probability)}`,
                  blurb: '100 gradient boosted trees optimizing cross-entropy.',
                },
                {
                  key: 'quantum',
                  paradigm: 'Quantum Paradigm',
                  paradigmClass: 'text-[#0F766E] bg-[#0F766E]/15',
                  name: 'Variational Quantum Classifier',
                  prediction: fusion?.quantum_prediction,
                  malignant: fusion?.quantum_probability,
                  detail: fusion && `Expectation score: ${fusion.quantum_score > 0 ? '+' : ''}${fusion.quantum_score.toFixed(3)}`,
                  blurb: '4-qubit circuit; expectation > 0 means malignant, < 0 benign.',
                },
              ].map((model) => {
                const isMalignant = model.prediction === 'Malignant';
                return (
                  <div key={model.key} className="p-4 rounded-xl bg-white border border-[#E7E5E0] shadow-xs space-y-3">
                    <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded font-semibold ${model.paradigmClass}`}>
                      {model.paradigm}
                    </span>
                    <h4 className="font-serif text-lg font-bold text-[#14211F]">{model.name}</h4>

                    {model.prediction ? (
                      <>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                          isMalignant
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : 'bg-[#0F766E]/10 border-[#0F766E]/30 text-[#0F766E]'
                        }`}>
                          {isMalignant ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                          <span>{model.prediction}</span>
                        </div>

                        <div className="space-y-1 text-left">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-[#0F766E]">Benign {formatPct(1 - model.malignant)}</span>
                            <span className="text-rose-600">Malignant {formatPct(model.malignant)}</span>
                          </div>
                          <div className="flex h-2 rounded-full overflow-hidden bg-[#F1F0EC]">
                            <div className="bg-[#0F766E]" style={{ width: `${(1 - model.malignant) * 100}%` }} />
                            <div className="bg-rose-500" style={{ width: `${model.malignant * 100}%` }} />
                          </div>
                        </div>

                        <div className="text-xs font-mono text-[#5B6664]">{model.detail}</div>
                      </>
                    ) : (
                      <div className="text-xs font-mono text-[#717E7B] py-3">
                        {fusionLoading ? 'Computing prediction...' : 'No prediction yet'}
                      </div>
                    )}

                    <p className="text-[11px] text-[#717E7B]">{model.blurb}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =========================================================================
            4. CLINICIAN FEEDBACK (REQUIRED BEFORE REPORT GENERATION)
           ========================================================================= */}
        <section id="clinician-feedback" className="clinical-card bg-white rounded-[20px] border border-[#E7E5E0] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="pb-4 border-b border-[#E7E5E0]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#0F766E] font-semibold bg-[#0F766E]/10 px-2 py-0.5 rounded">
              4. CLINICIAN FEEDBACK
            </span>
            <h3 className="font-serif text-2xl text-[#14211F] mt-1">
              Clinician Feedback
            </h3>
            <p className="text-xs text-[#5B6664] mt-0.5">
              {noPatientData
                ? 'Upload patient data to review the prediction and give feedback.'
                : 'Answer all questions and submit your feedback to unlock the PDF report.'}
            </p>
          </div>

          <fieldset disabled={noPatientData || feedbackSubmitted} className="space-y-4 disabled:opacity-60">
            {FEEDBACK_QUESTIONS.map(({ id, question }, index) => (
              <div key={id} className="p-4 rounded-xl bg-[#FAFAF7] border border-[#E7E5E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-sm text-[#14211F] leading-relaxed">
                  <span className="font-mono text-[#717E7B] mr-2">Q{index + 1}.</span>
                  {question}
                </p>
                <div role="radiogroup" aria-label={question} className="flex gap-2 shrink-0">
                  {['Yes', 'No'].map((answer) => {
                    const isSelected = feedback[id] === answer;
                    return (
                      <label
                        key={answer}
                        className={`px-5 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                          noPatientData || feedbackSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'
                        } ${
                          isSelected
                            ? 'bg-[#0F766E] border-[#0F766E] text-white'
                            : 'bg-white border-[#E7E5E0] text-[#5B6664] hover:border-[#0F766E]/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={id}
                          value={answer}
                          checked={isSelected}
                          onChange={() => setFeedback((prev) => ({ ...prev, [id]: answer }))}
                          className="sr-only"
                        />
                        {answer}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </fieldset>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <p className="text-[11px] text-[#717E7B]">
              {feedbackSubmitted
                ? 'Feedback recorded. The PDF report is now available.'
                : feedbackComplete
                  ? 'All questions answered. Submit to unlock the report.'
                  : `${FEEDBACK_QUESTIONS.filter(({ id }) => feedback[id]).length} of ${FEEDBACK_QUESTIONS.length} questions answered.`}
            </p>
            {feedbackSubmitted ? (
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFeedbackSubmitted(false)}
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-[#E7E5E0] text-[#5B6664] text-xs font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Edit Feedback</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReport(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-medium cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Generate PDF Report</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={noPatientData || !feedbackComplete}
                onClick={() => setFeedbackSubmitted(true)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0D655E] text-white text-xs font-medium cursor-pointer flex items-center justify-center gap-2 disabled:bg-[#F1F0EC] disabled:text-[#9AA3A1] disabled:cursor-not-allowed"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            )}
          </div>
        </section>

        {/* =========================================================================
            8. EXPERIMENT SUMMARY & ACTION CENTER
           ========================================================================= */}
        <section className="p-7 sm:p-9 rounded-[22px] bg-gradient-to-br from-white to-[#F8FAF9] border-2 border-[#E7E5E0] shadow-sm space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#0F766E]/10 text-[#0F766E] mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl text-[#14211F]">
              Experiment Summary & Next Actions
            </h3>
            <p className="text-xs text-[#5B6664]">
              {summaryStages.every(([, done]) => done)
                ? 'All stages, quantum circuits, and explainability attribution completed for this report.'
                : 'Stages marked pending complete once a patient file is uploaded and explained.'}
            </p>
          </div>

          <div className="max-w-md mx-auto grid grid-cols-2 gap-3 text-xs font-mono">
            {summaryStages.map(([label, done]) => (
              <div key={label} className="p-3 rounded-lg bg-white border border-[#E7E5E0] flex items-center justify-between">
                <span className="text-[#717E7B]">{label}</span>
                {done ? (
                  <strong className="inline-flex items-center gap-1 text-emerald-700"><Check className="w-3.5 h-3.5" />Done</strong>
                ) : (
                  <strong className="text-[#717E7B]">Pending</strong>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => onNavigateToUpload && onNavigateToUpload()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-[#E7E5E0] text-[#14211F] font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-[#5B6664]" />
              <span>New Experiment / Upload</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateToPipeline && onNavigateToPipeline()}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-[#E7E5E0] text-[#5B6664] font-medium text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Sliders className="w-4 h-4 text-[#5B6664]" />
              <span>Review Benchmarks</span>
            </button>
          </div>
        </section>

      </div>

      {showReport && !reportLocked && (
        <PatientReportModal
          patientTest={patientTest}
          initialPatient={selectedPatient}
          initialPlots={patientPlots?.patient === selectedPatient ? patientPlots : null}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
