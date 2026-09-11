import Card from './Card.jsx'
import { shapFeatures, meta } from '../data.js'

const TIER_COLOR = {
  high: 'var(--brick)',
  mid: 'var(--amber)',
  low: 'var(--ink-faint)',
}

export default function XaiCard() {
  return (
    <Card title="XAI & imaging view" tag="SHAP · segmentation" dot="var(--forest)">
      <div className="grid grid-cols-1 md:grid-cols-[1.05fr_1fr] gap-6">
        <div className="flex flex-col justify-center gap-3.5">
          {shapFeatures.map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span>{f.label}</span>
                <span className="font-mono text-[var(--ink-dim)]">{f.val}</span>
              </div>
              <div className="h-[6px] rounded-full bg-[var(--line-soft)] overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${f.pct}%`, background: TIER_COLOR[f.tier] }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="border border-[var(--line)] rounded-[8px] p-3 bg-[var(--paper)]">
          <svg width="100%" height="170" viewBox="0 0 240 180">
            <path
              d="M120 10 C60 10 25 55 25 95 C25 140 60 168 90 168 C100 168 105 155 120 155 C135 155 140 168 150 168 C180 168 215 140 215 95 C215 55 180 10 120 10 Z"
              fill="none" stroke="var(--ink-dim)" strokeWidth="1.3"
            />
            <path d="M120 22 C130 45 128 70 120 92 C112 70 110 45 120 22 Z" fill="none" stroke="var(--ink-dim)" strokeWidth="1" />
            <path d="M78 45 C55 60 45 90 55 120 C65 145 85 150 95 140 C75 120 70 85 78 45 Z" fill="none" stroke="var(--ink-faint)" strokeWidth="1" />
            <path d="M162 45 C185 60 195 90 185 120 C175 145 155 150 145 140 C165 120 170 85 162 45 Z" fill="none" stroke="var(--ink-faint)" strokeWidth="1" />
            <circle cx="88" cy="98" r="7" fill="var(--brick)" opacity="0.85" />
            <circle cx="88" cy="98" r="13" fill="none" stroke="var(--brick)" strokeWidth="1" opacity="0.5" />
            <circle cx="150" cy="112" r="5" fill="var(--brick)" opacity="0.85" />
            <circle cx="150" cy="112" r="10" fill="none" stroke="var(--brick)" strokeWidth="1" opacity="0.5" />
          </svg>
          <div className="flex items-center justify-between text-[10.5px] text-[var(--ink-faint)] mt-2">
            <span>{meta.scanCaption}</span>
            <span className="flex items-center gap-1.5 text-[var(--brick)]">
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {meta.flaggedRegions}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
