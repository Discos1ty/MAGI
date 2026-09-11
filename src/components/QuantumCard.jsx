import Card from './Card.jsx'
import { quantumPipeline, quantumCircuit, quantumHardware, meta } from '../data.js'

export default function QuantumCard() {
  return (
    <Card title="Quantum pipeline & telemetry" tag={meta.runId} dot="var(--violet)">
      <div className="flex items-center gap-1.5 mb-5 flex-wrap">
        {quantumPipeline.map((step, i) => (
          <div key={step.idx} className="contents">
            <div className="flex-1 min-w-[92px] border border-[var(--line)] rounded-[7px] px-2 py-2 text-center">
              <span className="block font-mono text-[9.5px] text-[var(--violet)] mb-1">{step.idx}</span>
              <span className="text-[10.5px] font-medium">{step.name}</span>
            </div>
            {i < quantumPipeline.length - 1 && <span className="text-[var(--ink-faint)] text-[13px]">→</span>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SubPanel title="Parameterized circuit (ansatz)" rows={quantumCircuit} />
        <SubPanel title="Hardware status" rows={quantumHardware} />
      </div>
    </Card>
  )
}

function SubPanel({ title, rows }) {
  return (
    <div className="border border-[var(--line)] rounded-[8px] p-3">
      <div className="text-[11px] font-semibold mb-2.5">{title}</div>
      {rows.map((r) => (
        <div key={r.label} className="flex justify-between text-[10.5px] text-[var(--ink-dim)] mb-1.5 last:mb-0">
          <span>{r.label}</span>
          <span className="font-mono text-[var(--ink)]">{r.value}</span>
        </div>
      ))}
    </div>
  )
}
