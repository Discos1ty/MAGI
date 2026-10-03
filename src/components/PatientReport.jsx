import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Calendar,
  ChevronDown,
  Download,
  Printer,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShieldPlus,
  User,
  X,
} from 'lucide-react';
import { getPatientShapPlots } from '../api/client';
import './PatientReport.css';

// A4 at 96 dpi
const PAGE_W = 794;
const PAGE_H = 1123;
const PAGE_GAP = 24;
// Soft-voting risk at or above this is classed as high risk
const HIGH_RISK_CUTOFF = 0.5;

const TEAL = '#2A9187';
const BLUE = '#6A97CC';
// Bar colours of the backend SHAP plot
const PLOT_MALIGNANT = '#E11D48';
const PLOT_BENIGN = '#0F766E';
const RED = '#E0483B';
const NAVY = '#1C2B4A';

const pct = (v) => `${(v * 100).toFixed(1)}%`;
const fmtShap = (v) => {
  const s = Math.abs(v) >= 0.01 || v === 0 ? v.toFixed(2) : v.toFixed(3);
  return v > 0 ? `+${s}` : s;
};

// "PC1 · worst concave points" -> { tag: 'PC1', name: 'worst concave points' }
function splitLabel(label) {
  const m = /^(PC\d+)\s*·\s*(.+)$/.exec(label);
  return m ? { tag: m[1], name: m[2] } : { tag: '', name: label };
}

/**
 * Report data for one uploaded patient, straight from the backend /explain response.
 * The soft-voting risk is mean(XGBoost P(malignant), (VQC score + 1) / 2), so with both
 * KernelExplainers sharing one background, its SHAP value per feature is exactly
 * 0.5 * XGBoost SHAP + 0.25 * VQC SHAP.
 */
export function buildReport(patientTest, patientNumber) {
  const result = patientTest?.results?.find((r) => r.patient === patientNumber);
  if (!result) return null;

  const pc = Math.min(Math.max(result.classical.probability_malignant, 0), 1);
  const score = result.quantum.raw_score;
  const pq = Math.min(Math.max((score + 1) / 2, 0), 1);
  const risk = (pc + pq) / 2;

  const features = result.classical.features
    .map((f, i) => {
      const q = result.quantum.features.find((x) => x.feature === f.feature) || result.quantum.features[i];
      return {
        ...splitLabel(f.feature),
        value: f.value,
        classical: f.shap_value,
        quantum: q.shap_value,
        combined: 0.5 * f.shap_value + 0.25 * q.shap_value,
      };
    })
    .sort((a, b) => Math.abs(b.combined) - Math.abs(a.combined));

  const base = patientTest.base_values || {};
  const baseCombined = Number.isFinite(base.classical) && Number.isFinite(base.quantum)
    ? 0.5 * base.classical + 0.25 * base.quantum + 0.25
    : null;

  const meta = patientTest.meta || {};
  const assessed = meta.assessedAt ? new Date(meta.assessedAt) : new Date();
  const ymd = `${assessed.getFullYear()}${String(assessed.getMonth() + 1).padStart(2, '0')}${String(assessed.getDate()).padStart(2, '0')}`;
  const age = meta.ages?.[patientNumber - 1];

  return {
    caseId: `MAGI-${ymd}-P${String(patientNumber).padStart(3, '0')}`,
    patient: `Uploaded patient #${patientNumber}${meta.fileName ? ` · ${meta.fileName}` : ''}`,
    age: Number.isFinite(age) ? `${Math.round(age)} years` : 'Not recorded',
    date: assessed.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    risk,
    classicalProbability: pc,
    quantumProbability: pq,
    quantumScore: score,
    isHighRisk: risk >= HIGH_RISK_CUTOFF,
    features,
    baseCombined,
  };
}

function describe(feature, rank, maxAbs) {
  const up = feature.combined > 0;
  const ratio = maxAbs ? Math.abs(feature.combined) / maxAbs : 0;
  if (rank === 0 && ratio >= 0.5) {
    return up ? 'largest positive contributor to higher risk.' : 'largest negative contributor, lowering predicted risk.';
  }
  const strength = ratio >= 0.5 ? 'substantial' : ratio >= 0.2 ? 'meaningful' : 'small';
  if (up) {
    return strength === 'small'
      ? 'small positive contribution that slightly raises risk.'
      : `${strength} positive contribution to higher risk.`;
  }
  return strength === 'small'
    ? 'small negative contribution that slightly lowers risk.'
    : `${strength} negative contribution that lowers risk.`;
}

function BreastIllustration() {
  return (
    <svg width="112" height="150" viewBox="0 0 112 150" fill="none" stroke={TEAL} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M44 6 C46 24 44 36 36 48" />
      <path d="M70 8 C70 22 74 30 84 36 C88 38 90 42 86 46 C82 48 80 46 78 46" />
      <path d="M36 48 C28 62 26 80 30 96 C32 104 30 118 24 140" />
      <path d="M78 46 C80 60 90 74 98 88 C108 104 104 124 88 130 C72 136 52 130 40 118" />
      <circle cx="68" cy="104" r="5" />
      <circle cx="68" cy="104" r="15" strokeDasharray="4 4" />
      <circle cx="68" cy="104" r="26" strokeDasharray="4 4" />
    </svg>
  );
}

function Donut({ value }) {
  const r = 84;
  const stroke = 30;
  const c = 2 * Math.PI * r;
  return (
    <svg width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
      <circle cx="110" cy="110" r={r} fill="none" stroke="#DCDDE0" strokeWidth={stroke} />
      <circle
        cx="110" cy="110" r={r} fill="none" stroke={TEAL} strokeWidth={stroke}
        strokeDasharray={`${c * value} ${c}`} transform="rotate(-90 110 110)"
      />
      <text x="110" y="114" textAnchor="middle" fontSize="31" fontWeight="800" fill={NAVY} fontFamily="Inter, sans-serif">
        {pct(value)}
      </text>
      <text x="110" y="140" textAnchor="middle" fontSize="12" fontWeight="700" fill={NAVY} fontFamily="Inter, sans-serif" letterSpacing="0.5">
        PROBABILITY
      </text>
    </svg>
  );
}

// The backend-rendered "Biomarker Diagnostic Impact" plot (quantum SHAP waterfall)
function ImpactPlot({ plot }) {
  if (plot?.data) {
    return <img className="rpt-plot-img" src={plot.data.patient_xai_plot} alt="Biomarker diagnostic impact for this patient" />;
  }
  return (
    <div className="rpt-plot-placeholder">
      {plot?.error ? `SHAP plot unavailable: ${plot.error}` : 'Rendering the SHAP plot on the backend...'}
    </div>
  );
}

// Transparent-background logo, so it sits directly on the white page
function ReportLogo({ size }) {
  return <img className="rpt-logo" src="/magi-logo-light.png" alt="MAGI" width={size} height={Math.round(size * 571 / 547)} />;
}

function Banner() {
  return <div className="rpt-banner">RESEARCH PROTOTYPE • NOT FOR CLINICAL USE</div>;
}

function PageOne({ report }) {
  const rows = [
    [User, 'Case ID', report.caseId],
    [User, 'Patient', report.patient],
    [Calendar, 'Age', report.age],
    [Calendar, 'Assessment date', report.date],
    [Settings, 'Model', 'XGBoost and VQC'],
  ];
  return (
    <div className="rpt-page">
      <header className="rpt-p1-head">
        <div className="rpt-title">
          <div>MAGI</div>
          <div>BREAST CANCER RISK REPORT</div>
        </div>
        <ReportLogo size={78} />
      </header>
      <Banner />
      <div className="rpt-disclaimer">
        <AlertCircle size={36} color={RED} strokeWidth={2} />
        <p>
          <strong>Disclaimer:</strong> This report is generated by an AI model to support clinical decision-making.
          It is not a diagnosis. All findings must be reviewed by a qualified clinician.
        </p>
      </div>

      <section className="rpt-card rpt-summary">
        <div className="rpt-summary-art">
          <BreastIllustration />
          <span>PATIENT SUMMARY</span>
        </div>
        <div className="rpt-summary-rows">
          {rows.map(([Icon, label, value]) => (
            <div key={label} className="rpt-summary-row">
              <Icon size={22} color={TEAL} strokeWidth={1.75} />
              <span className="rpt-summary-label">{label}:</span>
              <span className="rpt-summary-value">{value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rpt-card rpt-prob">
        <div className="rpt-prob-left">
          <h3>PREDICTED PROBABILITY<br />OF MALIGNANCY:</h3>
          <div className="rpt-prob-value">{pct(report.risk)}</div>
          <hr className="rpt-rule-teal" />
          <h4>MODEL VERDICT:</h4>
          <div className={report.isHighRisk ? 'rpt-verdict rpt-verdict-high' : 'rpt-verdict rpt-verdict-low'}>
            {report.isHighRisk
              ? <>HIGH PREDICTED RISK / POSITIVE<br />MODEL CLASSIFICATION</>
              : <>LOW PREDICTED RISK / NEGATIVE<br />MODEL CLASSIFICATION</>}
          </div>
          <hr className={report.isHighRisk ? 'rpt-rule-red' : 'rpt-rule-teal'} />
          <p className="rpt-prob-breakdown">
            Soft-voting mean of XGBoost {pct(report.classicalProbability)} and VQC {pct(report.quantumProbability)}.
          </p>
        </div>
        <div className="rpt-prob-right">
          <Donut value={report.risk} />
          <div className="rpt-legend-v">
            <span><i style={{ background: TEAL }} />Predicted probability</span>
            <span><i style={{ background: '#DCDDE0' }} />Remaining probability</span>
          </div>
        </div>
      </section>

      <section className="rpt-card rpt-review">
        <ShieldCheck size={60} color={TEAL} strokeWidth={1.5} />
        <p>
          This result requires review by a qualified clinician in the context of the patient's full clinical picture.
          It cannot replace imaging interpretation, pathology, or multidisciplinary assessment.
        </p>
      </section>

      <div className="rpt-sign">
        {['Reviewer name', 'Role', 'Date', 'Signature'].map((label) => (
          <div key={label}>{label}</div>
        ))}
      </div>

      <footer className="rpt-foot">
        <span />
        <span className="rpt-page-no">1 / 2</span>
      </footer>
    </div>
  );
}

function PageTwo({ report, plot }) {
  const maxAbs = Math.max(...report.features.map((f) => Math.abs(f.combined)), 0);
  const increasing = report.features.filter((f) => f.combined > 0);
  const decreasing = report.features.filter((f) => f.combined < 0);
  const interpretation = (list, emptyText) =>
    list.length ? (
      <ul>
        {list.map((f, i) => (
          <li key={f.tag + f.name}><strong>{f.name}:</strong> {describe(f, i, maxAbs)}</li>
        ))}
      </ul>
    ) : (
      <p className="rpt-interp-empty">{emptyText}</p>
    );

  return (
    <div className="rpt-page">
      <header className="rpt-p2-head">
        <h2>MODEL EXPLANATION AND SHAP CONTRIBUTIONS</h2>
        <svg width="96" height="34" viewBox="0 0 150 40" fill="none" stroke={TEAL} strokeWidth="2" aria-hidden="true">
          <path d="M0 30 H108 L114 18 L120 38 L127 4 L134 30 H150" strokeLinejoin="round" />
        </svg>
        <ReportLogo size={48} />
      </header>
      <Banner />

      <div className="rpt-card rpt-strip">
        <div><span>Case</span><strong className="rpt-strip-case">{report.caseId}</strong></div>
        <div><span>Predicted probability</span><strong>{pct(report.risk)}</strong></div>
      </div>

      <h3 className="rpt-h3">Biomarker Diagnostic Impact</h3>
      <p className="rpt-plot-caption">
        Quantum model (VQC) SHAP attribution from the MAGI backend · expectation score{' '}
        {report.quantumScore > 0 ? '+' : ''}{report.quantumScore.toFixed(3)} (&gt; 0 malignant)
      </p>
      <ImpactPlot plot={plot} />
      <div className="rpt-legend-h">
        <span><i style={{ background: PLOT_MALIGNANT }} />Pushes towards malignant (raises risk)</span>
        <span><i style={{ background: PLOT_BENIGN }} />Pushes towards benign (lowers risk)</span>
      </div>

      <h3 className="rpt-h3">Per-model attribution</h3>
      <table className="rpt-table">
        <thead>
          <tr>
            <th>Biomarker (qubit input)</th>
            <th>Scaled value</th>
            <th>XGBoost SHAP</th>
            <th>VQC SHAP</th>
            <th>Combined</th>
          </tr>
        </thead>
        <tbody>
          {report.features.map((f) => (
            <tr key={f.tag + f.name}>
              <td>{f.name} <em>{f.tag}</em></td>
              <td>{f.value.toFixed(3)}</td>
              <td>{fmtShap(f.classical)}</td>
              <td>{fmtShap(f.quantum)}</td>
              <td><strong>{fmtShap(f.combined)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="rpt-note">
        Combined = ½ × XGBoost SHAP (P(malignant)) + ¼ × VQC SHAP (expectation score): each feature's share of the
        soft-voting probability.
        {report.baseCombined !== null && ` Base value ${pct(report.baseCombined)} + contributions = ${pct(report.risk)}.`}
      </p>

      <h3 className="rpt-h3">Key interpretation</h3>
      <div className="rpt-card rpt-interp">
        <div>
          <h4 style={{ color: TEAL }}>
            <span className="rpt-interp-icon" style={{ borderColor: TEAL }}><ArrowUp size={16} color={TEAL} strokeWidth={2.25} /></span>
            Factors increasing predicted risk
          </h4>
          {interpretation(increasing, 'No biomarker pushed the predicted risk higher for this patient.')}
        </div>
        <div>
          <h4 style={{ color: BLUE }}>
            <span className="rpt-interp-icon" style={{ borderColor: BLUE }}><ArrowDown size={16} color={BLUE} strokeWidth={2.25} /></span>
            Factors decreasing predicted risk
          </h4>
          {interpretation(decreasing, 'No biomarker pushed the predicted risk lower for this patient.')}
        </div>
      </div>

      <footer className="rpt-foot">
        <span className="rpt-foot-note">
          <ShieldPlus size={22} color={NAVY} strokeWidth={2} />
          Generated by MAGI from uploaded patient measurements · {report.date}
        </span>
        <span className="rpt-page-no">2 / 2</span>
      </footer>
    </div>
  );
}

/**
 * Full-screen preview of the 2-page report with PDF download and print.
 */
export default function PatientReportModal({ patientTest, initialPatient, initialPlots, onClose }) {
  const [patient, setPatient] = useState(initialPatient);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);
  const [scale, setScale] = useState(1);
  const scrollRef = useRef(null);
  const pagesRef = useRef(null);
  const report = useMemo(() => buildReport(patientTest, patient), [patientTest, patient]);
  // Backend SHAP plots per patient number: { data } or { error }
  const [plots, setPlots] = useState(() => (initialPlots ? { [initialPatient]: { data: initialPlots } } : {}));
  const plot = plots[patient];

  useEffect(() => {
    if (plots[patient] || !patientTest?.patients) return undefined;
    let isMounted = true;
    getPatientShapPlots(patientTest.patients, patient)
      .then((data) => { if (isMounted) setPlots((prev) => ({ ...prev, [patient]: { data } })); })
      .catch((err) => {
        if (isMounted) setPlots((prev) => ({ ...prev, [patient]: { error: err.message || 'Failed to render SHAP plot.' } }));
      });
    return () => { isMounted = false; };
  }, [patientTest, patient, plots]);

  // Fit the A4 pages to the available width
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const fit = () => setScale(Math.min(1, (el.clientWidth - 32) / PAGE_W));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleDownload = async () => {
    if (!report || downloading) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);
      await document.fonts?.ready;
      await Promise.all([...pagesRef.current.querySelectorAll('img')].map((img) => img.decode().catch(() => {})));
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pages = pagesRef.current.querySelectorAll('.rpt-page');
      for (let i = 0; i < pages.length; i += 1) {
        const canvas = await html2canvas(pages[i], {
          scale: 2,
          backgroundColor: '#FFFFFF',
          // Capture at full A4 size, not the scaled-down preview
          onclone: (doc) => {
            doc.querySelectorAll('[data-report-scale]').forEach((el) => { el.style.transform = 'none'; });
          },
        });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
      }
      pdf.save(`${report.caseId}-breast-cancer-risk-report.pdf`);
    } catch (err) {
      setDownloadError(err.message || 'Could not create the PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const patientCount = patientTest?.results?.length || 0;

  return createPortal(
    <div className="rpt-portal" role="dialog" aria-modal="true" aria-label="Patient risk report preview">
      <div className="rpt-modal">
        <div className="rpt-toolbar rpt-noprint">
          <div className="rpt-toolbar-title">
            <span>Report preview</span>
            {report && <small>{report.caseId}</small>}
          </div>
          <div className="rpt-toolbar-actions">
            {patientCount > 1 && (
              <div className="relative">
                <select
                  aria-label="Patient"
                  value={patient}
                  onChange={(e) => setPatient(Number(e.target.value))}
                  className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-[#E7E5E0] bg-white text-xs font-mono text-[#14211F] cursor-pointer"
                >
                  {patientTest.results.map((r) => (
                    <option key={r.patient} value={r.patient}>Patient #{r.patient}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#717E7B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-white hover:bg-gray-50 border border-[#E7E5E0] text-[#14211F] cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#5B6664]" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading || !report || !plot}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-[#0F766E] hover:bg-[#0D655E] text-white cursor-pointer disabled:opacity-60 disabled:cursor-wait"
            >
              {downloading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloading ? 'Preparing PDF...' : plot ? 'Download PDF' : 'Loading SHAP plot...'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="p-2 rounded-lg text-[#5B6664] hover:bg-[#F1F0EC] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {downloadError && (
          <div className="rpt-noprint px-4 py-2 text-xs bg-amber-50 text-amber-800 border-b border-amber-200">
            PDF download failed: {downloadError}
          </div>
        )}

        <div ref={scrollRef} className="rpt-scroll">
          {report ? (
            <div
              className="rpt-scale-outer"
              style={{ width: PAGE_W * scale, height: (PAGE_H * 2 + PAGE_GAP) * scale }}
            >
              <div
                ref={pagesRef}
                data-report-scale
                className="rpt-pages"
                style={{ width: PAGE_W, gap: PAGE_GAP, transform: `scale(${scale})` }}
              >
                <PageOne report={report} />
                <PageTwo report={report} plot={plot} />
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-[#5B6664] py-12">No uploaded patient to report on.</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
