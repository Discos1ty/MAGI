import Card from './Card.jsx'
import { risk } from '../data.js'

export default function RiskCard({ prediction }) {
  if (!prediction) {
    return (
      <Card title="Diagnostic output & risk stratification" tag={risk.version} dot="var(--ink-faint)">
        <p className="text-[13px] text-[var(--ink-dim)]">
          Upload a single-patient CSV to see the risk score and model output.
        </p>
      </Card>
    )
  }

  const { classical, quantum } = prediction
  const classicalProb = classical.probability_malignant
  const isMalignant =
    classical.prediction === 'malignant' || quantum.prediction === 'malignant'
  const agree = classical.prediction === quantum.prediction

  const score = classicalProb.toFixed(2)
  const label = `Risk score — ${isMalignant ? 'High' : 'Low'}`
  const finding = `Classical: ${classical.prediction} (${(classicalProb * 100).toFixed(1)}%) · Quantum: ${quantum.prediction} (score ${quantum.raw_score})`

  // 0 → far left (benign), 1 → far right (malignant)
  const rotation = -75 + classicalProb * 150
  const dotColor = isMalignant ? 'var(--brick)' : 'var(--sage)'
  const textColor = isMalignant ? '#8A3320' : 'var(--forest)'

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
        <Metric value={`${(classicalProb * 100).toFixed(1)}%`} label="XGBoost malignant prob." />
        <Metric value={quantum.raw_score} label="VQC raw score" />
        <Metric value={agree ? 'Agree' : 'Disagree'} label="Classical vs quantum" />
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