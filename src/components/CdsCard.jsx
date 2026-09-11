import Card from './Card.jsx'
import { protocols, validation } from '../data.js'

export default function CdsCard() {
  return (
    <Card title="Clinical decision support" tag="Actionable" dot="var(--sage)">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="text-[11px] font-medium text-[var(--ink-faint)] mb-2.5">Recommended protocols</div>
          <div className="flex flex-col gap-2.5">
            {protocols.map((p) => (
              <div key={p} className="flex gap-2 text-[12px] items-start">
                <span className="text-[var(--sage)] mt-0.5 flex-shrink-0">✓</span>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-medium text-[var(--ink-faint)] mb-1">Human validation</div>
          {validation.map((v) => (
            <div key={v.name} className="flex items-center justify-between py-2.5 border-b border-[var(--line-soft)] last:border-none text-[12px]">
              <span>{v.name}</span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                  v.status === 'pending'
                    ? 'text-[var(--amber)] bg-[var(--amber-dim)]'
                    : 'text-[var(--sage)] bg-[rgba(75,138,111,.10)]'
                }`}
              >
                {v.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
