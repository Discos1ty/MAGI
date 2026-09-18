// Destination: src/api.js (replaces your current file)

export const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export async function listDatasets() {
  const res = await fetch(`${API_BASE}/api/dataset/`)

  if (!res.ok) {
    throw new Error(`Failed to list datasets (${res.status})`)
  }

  const data = await res.json()
  return data.datasets ?? []
}

export async function ingestDataset(file) {
  const formData = new FormData()
  formData.append('features_file', file)

  let res
  try {
    res = await fetch(`${API_BASE}/api/dataset/ingest`, {
      method: 'POST',
      body: formData,
    })
  } catch {
    throw new Error(`Can't reach the backend at ${API_BASE}. Is it running?`)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const detail = data?.detail
    const message =
      typeof detail === 'string'
        ? detail
        : detail?.errors?.join(', ') || `Upload failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export async function getFeatureNames() {
  const res = await fetch(`${API_BASE}/api/predict/feature-names`)

  if (!res.ok) {
    throw new Error(`Failed to load feature names (${res.status})`)
  }

  const data = await res.json()
  return data.features ?? []
}

export async function predictPatient(features) {
  let res
  try {
    res = await fetch(`${API_BASE}/api/predict/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features }),
    })
  } catch {
    throw new Error(`Can't reach the backend at ${API_BASE}. Is it running?`)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const detail = data?.detail
    const message =
      typeof detail === 'string'
        ? detail
        : `Prediction failed (${res.status})`
    throw new Error(message)
  }

  return data
}

export async function getMetrics() {
  const res = await fetch(`${API_BASE}/api/predict/metrics`)

  if (!res.ok) {
    throw new Error(`Failed to load metrics (${res.status})`)
  }

  return res.json()
}