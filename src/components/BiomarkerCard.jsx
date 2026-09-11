import Card from './Card.jsx'
import { biomarkerDonut } from '../data.js'

const ROWS = [
  { label: 'CA-125', y: 20, dots: [230, 250, 270, 290, 310, 330].map((cx) => ({ cx, cy: 18 + (cx % 7) })), color: 'var(--brick)' },
  {
    label: 'CRP', y: 45, color: null,
    mixed: [
      { cx: 170, color: 'var(--violet)' }, { cx: 190, color: 'var(--violet)' }, { cx: 215, color: 'var(--violet)' },
      { cx: 235, color: 'var(--brick)' }, { cx: 255, color: 'var(--brick)' },
    ],
  },
  { label: 'NODULE VOL', y: 70, dots: [260, 280, 300, 320, 340].map((cx) => ({ cx, cy: 68 + (cx % 4) })), color: 'var(--brick)' },
  { label: 'WBC COUNT', y: 95, dots: [130, 150, 175, 195, 205].map((cx) => ({ cx, cy: 93 + (cx % 4) })), color: 'var(--violet)' },
  { label: 'AGE', y: 120, dots: [200, 220, 240, 260].map((cx) => ({ cx, cy: 118 + (cx % 4) })), color: 'var(--brick)' },
]

export default function BiomarkerCard() {
  return (
    <Card title="Tabular & biomarker analysis" tag="SHAP · distribution" dot="var(--rose)">
      <div className="grid grid-cols-1 md:grid-cols-[1.35fr_1fr] gap-6 items-center">
        <div>
          <svg width="100%" height="150" viewBox="0 0 420 150">
            <line x1="210" y1="10" x2="210" y2="140" stroke="var(--line)" strokeWidth="1" />
            {ROWS.map((row) => (
              <g key={row.label}>
                <text x="10" y={row.y} fill="var(--ink-faint)" fontSize="9" fontFamily="IBM Plex Mono, monospace">
                  {row.label}
                </text>
                {row.mixed
                  ? row.mixed.map((d, i) => (
                      <circle key={i} cx={d.cx} cy={row.y - 2} r="3.5" fill={d.color} />
                    ))
                  : row.dots.map((d, i) => (
                      <circle key={i} cx={d.cx} cy={d.cy} r="3.5" fill={row.color} />
                    ))}
              </g>
            ))}
          </svg>
          <div className="text-center text-[10.5px] text-[var(--ink-faint)] mt-1.5">
            SHAP value — impact on composite risk score
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Donut segments={biomarkerDonut} />
          <div className="flex flex-col gap-2 text-[11px] w-full">
            {biomarkerDonut.map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-mono">{s.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

function Donut({ segments }) {
  let offset = 0
  const circumference = 100
  return (
    <svg width="128" height="128" viewBox="0 0 42 42">
      {segments.map((s) => {
        const dash = `${s.pct} ${circumference - s.pct}`
        const dashOffset = 25 - offset
        offset += s.pct
        return (
          <circle
            key={s.label}
            cx="21" cy="21" r="15.9" fill="transparent"
            stroke={s.color} strokeWidth="6"
            strokeDasharray={dash} strokeDashoffset={dashOffset}
          />
        )
      })}
    </svg>
  )
}
