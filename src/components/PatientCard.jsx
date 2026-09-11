import Card from './Card.jsx'
import { patient, vitals } from '../data.js'

const STATUS_STYLE = {
  normal: 'text-[var(--sage)] bg-[rgba(75,138,111,.10)]',
  borderline: 'text-[var(--amber)] bg-[var(--amber-dim)]',
}

export default function PatientCard() {
  return (
    <Card title="Patient overview & vital signs" tag={`Case ${patient.caseId}`} dot="var(--forest)">
      <div className="flex flex-wrap items-end justify-between gap-5 pb-5 mb-5 border-b border-[var(--line-soft)]">
        <div>
          <div className="font-mono text-[12px] text-[var(--ink-faint)]">
            {patient.caseId} · {patient.sex} · {patient.age}
          </div>
          <div className="font-display text-[26px] font-medium mt-0.5">{patient.name}</div>
        </div>
        <div className="flex gap-7 text-right flex-wrap">
          <Fact label="Referring physician" value={patient.physician} />
          <Fact label="Study date" value={patient.studyDate} />
          <Fact label="Care pathway" value={patient.pathway} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {vitals.map((v) => (
          <div key={v.name} className="border border-[var(--line)] rounded-[8px] p-3">
            <div className="text-[12px] font-medium mb-2">{v.name}</div>
            <div className="font-mono text-[17px] font-semibold leading-none">{v.value}</div>
            <div className="text-[9.5px] text-[var(--ink-faint)] mt-1.5 mb-2.5 leading-snug">{v.range}</div>
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full ${STATUS_STYLE[v.status]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {v.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}

function Fact({ label, value }) {
  return (
    <div>
      <div className="text-[10.5px] text-[var(--ink-faint)]">{label}</div>
      <div className="text-[13px] font-medium mt-0.5">{value}</div>
    </div>
  )
}
