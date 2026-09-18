// Destination: src/components/RiskCard.jsx (replaces your current file)

import Card from './Card.jsx'
import { risk } from '../data.js'

export default function RiskCard({ prediction }) {
  const classicalProb = prediction?.classical?.probability_malignant
  const isMalignant =
    prediction?.classical?.prediction === 'malignant' ||
    prediction?.quantum?.prediction === 'malignant'

  // Live values when a prediction has come in, otherwise the original
  // static demo data — CI / confidence / uncertainty stay on the demo
  // values either way since the API doesn't currently return them.
  const score = classicalProb != null ? classicalProb.toFixed(2) : risk.score
  const label = prediction ? `Risk score — ${isMalignant ? 'High' : 'Low'}` : risk.label
  const finding = prediction
    ? `Classical: ${prediction.classical.prediction} (${(classicalProb * 100).toFixed(1)}%) · Quantum: ${prediction.quantum.prediction} (score ${prediction.quantum.raw_score})`
    : risk.finding

  // Sweep the needle across the gauge based on malignancy probability
  // (0 → far left/benign, 1 → far right/malignant). Keeps the original
  // fixed rotation when there's no live prediction yet.
  const rotation = classicalProb != null ? -75 + classicalProb * 150 : 15
  const dotColor = !prediction || isMalignant ? 'var(--brick)' : 'var(--sage)'
  const textColor = !prediction || isMalignant ? '#8A3320' : 'var(--forest)'

  return (
    <Card title="Diagnostic output & risk stratification" tag={risk.version} dot={dotColor}>
      <div className="flex items-center gap-2.5 bg-[var(--brick-dim)] border border-[rgba(180,71,44,.3)] rounded-[8px] px-3.5 py-2.5 mb-5">
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor }} />
        <span className="text-[12.5px] font-semibold" style={{ color: textColor }}>
          {finding}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <svg width="188" height="104" viewBox="0 0 200 110">
          <path d="M15 100 A85 85 0 0 1 68 20" fill="none" stroke="var(--sage)" strokeWidth="12" strokeLinecap="round" />
          <path d="M68 20 A85 85 0 0 1 132 20" fill="none" stroke="var(--amber)" strokeWidth="12" strokeLinecap="round" />
          <path d="M132 20 A85 85 0 0 1 185 100" fill="none" stroke="var(--brick)" strokeWidth="12" strokeLinecap="round" />
          <g transform={`rotate(${rotation} 100 100)`}>
            <line x1="100" y1="100" x2="100" y2="30" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
          <circle cx="100" cy="100" r="5" fill="var(--ink)" />
        </svg>
        <div className="font-display text-[34px] font-medium leading-none -mt-6">{score}</div>
        <div className="text-[11px] text-[var(--ink-faint)] mt-1.5">{label}</div>
      </div>

      <div className="flex justify-between mt-5 pt-4 border-t border-[var(--line-soft)]">
        <Metric value={risk.ci} label="Confidence interval" />
        <Metric value={risk.confidence} label="Model confidence" />
        <Metric value={risk.uncertainty} label="Epistemic uncertainty" />
      </div>

      <p className="mt-4 pt-3 border-t border-[var(--line-soft)] text-[11px] text-[var(--ink-faint)] leading-relaxed">
        This score reflects model output only — always confirm with a licensed physician and regular checkups before acting on it.
      </p>
    </Card>
  )
}

function Metric({ value, label }) {
  return (
    <div className="text-center flex-1">
      <div className="font-mono text-[14px] font-semibold">{value}</div>
      <div className="text-[10px] text-[var(--ink-faint)] mt-0.5">{label}</div>
    </div>
  )
}