// Destination: src/components/AnalyticsPage.jsx (new)

import { useEffect, useState } from 'react'
import Card from './Card.jsx'
import { getMetrics } from '../api.js'

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')

  useEffect(() => {
    getMetrics()
      .then((data) => {
        setMetrics(data)
        setStatus('ready')
      })
      .catch((err) => {
        setError(err.message)
        setStatus('error')
      })
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
        <h1 className="font-display text-[26px] font-medium tracking-[-0.01em]">Analytics</h1>
      </div>

      <Card title="Classical vs. quantum model comparison" tag="MAGI" dot="var(--violet)">
        {status === 'loading' && (
          <div className="text-[12px] text-[var(--ink-faint)]">
            Running the comparison for the first time can take a minute (training the VQC)…
          </div>
        )}

        {status === 'error' && (
          <div className="text-[12px]" style={{ color: 'var(--brick)' }}>
            Couldn't load metrics: {error}
          </div>
        )}

        {status === 'ready' && metrics && (
          <div className="grid grid-cols-2 gap-6">
            <ModelColumn title="Classical (XGBoost)" data={metrics.classical} color="var(--forest)" />
            <ModelColumn title="Quantum (VQC)" data={metrics.quantum} color="var(--violet)" />
          </div>
        )}
      </Card>

      <p className="mt-4 text-[11px] text-[var(--ink-faint)] leading-relaxed">
        Both models are trained on the same PCA-reduced, MinMax-scaled 4-feature
        representation of the UCI WDBC dataset, so this reflects the classifiers
        themselves rather than differing inputs.
      </p>
    </>
  )
}

function ModelColumn({ title, data, color }) {
  return (
    <div>
      <div className="text-[13px] font-semibold mb-3" style={{ color }}>
        {title}
      </div>
      <div className="flex flex-col gap-3">
        <Metric label="Accuracy" value={data.accuracy} color={color} />
        <Metric label="Recall" value={data.recall} color={color} />
        <Metric label="ROC-AUC" value={data.roc_auc} color={color} />
      </div>
    </div>
  )
}

function Metric({ label, value, color }) {
  const pct = Math.round(value * 100)
  return (
    <div>
      <div className="flex justify-between text-[11px] text-[var(--ink-faint)] mb-1">
        <span>{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <div className="h-[6px] rounded-full bg-[var(--line-soft)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
