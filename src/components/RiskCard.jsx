import Card from './Card.jsx'
import { risk } from '../data.js'

export default function RiskCard() {
  return (
    <Card title="Diagnostic output & risk stratification" tag={risk.version} dot="var(--brick)">
      <div className="flex items-center gap-2.5 bg-[var(--brick-dim)] border border-[rgba(180,71,44,.3)] rounded-[8px] px-3.5 py-2.5 mb-5">
        <span className="w-2 h-2 rounded-full bg-[var(--brick)] flex-shrink-0" />
        <span className="text-[12.5px] font-semibold text-[#8A3320]">{risk.finding}</span>
      </div>

      <div className="flex flex-col items-center">
<svg width="188" height="104" viewBox="0 0 200 110">
  <path d="M15 100 A85 85 0 0 1 68 20" fill="none" stroke="var(--sage)" strokeWidth="12" strokeLinecap="round" />
  <path d="M68 20 A85 85 0 0 1 132 20" fill="none" stroke="var(--amber)" strokeWidth="12" strokeLinecap="round" />
  <path d="M132 20 A85 85 0 0 1 185 100" fill="none" stroke="var(--brick)" strokeWidth="12" strokeLinecap="round" />
  <g transform="rotate(15 100 100)">
    <line x1="100" y1="100" x2="100" y2="30" stroke="var(--ink)" strokeWidth="2.5" strokeLinecap="round" />
  </g>
  <circle cx="100" cy="100" r="5" fill="var(--ink)" />
</svg>
        <div className="font-display text-[34px] font-medium leading-none -mt-6">{risk.score}</div>
        <div className="text-[11px] text-[var(--ink-faint)] mt-1.5">{risk.label}</div>
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
