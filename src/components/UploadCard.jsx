import Card from './Card.jsx'
import { uploads } from '../data.js'

export default function UploadCard() {
  return (
    <Card title="Multimodal upload state" tag="4 sources" dot="var(--violet)">
      <div className="border border-dashed border-[var(--line)] rounded-[8px] py-4 px-4 text-center text-[12px] text-[var(--ink-faint)] mb-4">
        <svg className="mx-auto mb-1.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="1.6">
          <path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1-.5 9H7Z" />
          <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Drop files or <strong className="text-[var(--forest)] font-medium">browse</strong> to add another modality
      </div>

      <div className="flex flex-col gap-3">
        {uploads.map((u) => (
          <div key={u.name} className="flex items-center gap-3">
            <span className="text-[12px] w-[92px] flex-shrink-0">{u.name}</span>
            <div className="flex-1 h-[5px] rounded-full bg-[var(--line-soft)] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${u.pct}%`,
                  background: u.state === 'queued' ? 'var(--line)' : 'var(--forest)',
                }}
              />
            </div>
            <span className="font-mono text-[10.5px] text-[var(--ink-faint)] w-[34px] text-right">
              {u.state === 'queued' ? 'queued' : `${u.pct}%`}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
