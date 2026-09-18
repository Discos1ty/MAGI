// Destination: src/components/UploadCard.jsx (replaces your current file)

import { useEffect, useRef, useState } from 'react'
import Card from './Card.jsx'
import { listDatasets, ingestDataset, getFeatureNames, predictPatient } from '../api.js'

// Minimal CSV parse — just the header row and the first data row, which is
// all a single-patient prediction file needs. Assumes plain comma-separated
// values with no embedded commas/quotes (matches the WDBC-style exports
// this project already uses elsewhere).
function parseFirstRow(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return null
  const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
  const values = lines[1].split(',').map((v) => v.trim())
  return { headers, values }
}

export default function UploadCard({ onPredicted }) {
  const [datasets, setDatasets] = useState([])
  const [status, setStatus] = useState('idle') // idle | uploading | success | error
  const [message, setMessage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const refreshDatasets = () => {
    listDatasets()
      .then(setDatasets)
      .catch(() => {})
  }

  useEffect(refreshDatasets, [])

  // Returns true if the file was handled as a single-patient prediction
  // (i.e. it matched the 30-feature shape), false if it should fall through
  // to the existing bulk-dataset ingest flow instead.
  const tryPredictSinglePatient = async (file, text) => {
    const parsed = parseFirstRow(text)
    if (!parsed) return false

    const featureNames = await getFeatureNames()
    const wanted = featureNames.map((n) => n.toLowerCase())

    // Case 1: headers include the 30 known WDBC feature names (in any
    // order — extra columns like id/diagnosis are ignored).
    const indices = wanted.map((name) => parsed.headers.indexOf(name))
    const namesMatched = indices.every((i) => i !== -1)

    let orderedValues
    if (namesMatched) {
      orderedValues = indices.map((i) => Number(parsed.values[i]))
    } else if (parsed.values.length === 30) {
      // Case 2: exactly 30 columns with no recognizable header — assume
      // they're already in sklearn's load_breast_cancer() order.
      orderedValues = parsed.values.map(Number)
    } else {
      return false
    }

    if (orderedValues.some((v) => Number.isNaN(v))) return false

    setStatus('uploading')
    setMessage(`Running prediction on ${file.name}…`)

    const result = await predictPatient(orderedValues)
    onPredicted?.(result)

    setStatus('success')
    setMessage(
      `Prediction complete — classical: ${result.classical.prediction}, quantum: ${result.quantum.prediction}`
    )
    return true
  }

  const handleFile = async (file) => {
    if (!file) return

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setStatus('error')
      setMessage('Only CSV files are supported.')
      return
    }

    setStatus('uploading')
    setMessage(file.name)

    try {
      const text = await file.text()
      const handledAsPatient = await tryPredictSinglePatient(file, text)
      if (handledAsPatient) return

      // Not a single-patient file — fall back to the existing bulk
      // dataset ingest flow.
      const result = await ingestDataset(file)
      setStatus('success')
      setMessage(
        `${result.dataset.rows} rows × ${result.dataset.columns} columns ingested`
      )
      refreshDatasets()
    } catch (err) {
      setStatus('error')
      setMessage(err.message)
    }
  }

  return (
    <Card
      title="Dataset upload"
      tag={`${datasets.length} dataset${datasets.length === 1 ? '' : 's'}`}
      dot="var(--violet)"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files?.[0])
        }}
        className="border border-dashed rounded-[8px] py-4 px-4 text-center text-[12px] mb-4 cursor-pointer transition-colors"
        style={{
          borderColor: dragOver ? 'var(--violet)' : 'var(--line)',
          color: 'var(--ink-faint)',
        }}
      >
        <svg className="mx-auto mb-1.5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="1.6">
          <path d="M7 18a4 4 0 0 1-.6-7.96A5.5 5.5 0 0 1 17 8.5a4.5 4.5 0 0 1-.5 9H7Z" />
          <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Drop a CSV or <strong className="text-[var(--forest)] font-medium">browse</strong> to upload a patient's features or a dataset
      </div>

      {status !== 'idle' && (
        <div
          className="text-[12px] mb-4 truncate"
          style={{
            color:
              status === 'error'
                ? 'var(--brick)'
                : status === 'success'
                ? 'var(--forest)'
                : 'var(--ink-faint)',
          }}
        >
          {status === 'uploading' && `Uploading ${message}…`}
          {status === 'success' && message}
          {status === 'error' && message}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {datasets.length === 0 && status !== 'uploading' && (
          <div className="text-[12px] text-[var(--ink-faint)]">No datasets uploaded yet.</div>
        )}

        {datasets.map((d) => (
          <div key={d.dataset_id} className="flex items-center gap-3">
            <span className="text-[12px] flex-1 truncate">{d.filename ?? d.dataset_id}</span>
            <span className="font-mono text-[10.5px] text-[var(--ink-faint)] flex-shrink-0">
              {d.rows}×{d.columns}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}