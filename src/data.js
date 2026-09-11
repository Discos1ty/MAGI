export const patient = {
  caseId: 'HQ-2291',
  sex: 'F',
  age: 58,
  name: 'Amara Solis',
  physician: 'Dr. A. Okafor',
  studyDate: 'Sep 8, 2026',
  pathway: 'Oncology intake',
}

export const vitals = [
  { name: 'Blood pressure', value: '120/80', range: 'Normal: 90/60 – 120/80 mmHg', status: 'normal' },
  { name: 'Heart rate', value: '72 bpm', range: 'Normal: 60 – 100 bpm', status: 'normal' },
  { name: 'Body temperature', value: '98.6°F', range: 'Normal: 97.0 – 99.0°F', status: 'normal' },
  { name: 'Blood glucose', value: '145 mg/dL', range: 'Normal: 70 – 140 mg/dL', status: 'borderline' },
  { name: 'SpO2', value: '97%', range: 'Normal: 95 – 100%', status: 'normal' },
]

export const shapFeatures = [
  { label: 'Nodule density gradient', val: '+0.31', pct: 88, tier: 'high' },
  { label: 'Serum CA-125', val: '+0.27', pct: 76, tier: 'high' },
  { label: 'Lymphocyte ratio', val: '+0.14', pct: 46, tier: 'mid' },
  { label: 'Cortical thickness Δ', val: '+0.09', pct: 32, tier: 'mid' },
  { label: 'BMI-adjusted CRP', val: '+0.04', pct: 16, tier: 'low' },
  { label: 'Family history score', val: '+0.02', pct: 9, tier: 'low' },
]

export const uploads = [
  { name: 'Imaging', pct: 100, state: 'done' },
  { name: 'Genomic panel', pct: 74, state: 'progress' },
  { name: 'Lab results', pct: 100, state: 'done' },
  { name: 'Clinical notes', pct: 0, state: 'queued' },
]

export const risk = {
  score: '0.81',
  label: 'Risk score — High',
  finding: 'Early-stage malignancy pattern detected',
  ci: '±0.06',
  confidence: '91%',
  uncertainty: '0.04',
  version: 'v4.2',
}

export const biomarkerDonut = [
  { label: 'Normal range', pct: 62, color: 'var(--sage)' },
  { label: 'Borderline', pct: 24, color: 'var(--amber)' },
  { label: 'Critical', pct: 14, color: 'var(--brick)' },
]

export const quantumPipeline = [
  { idx: '01', name: 'Feature encoding' },
  { idx: '02', name: 'Variational circuit' },
  { idx: '03', name: 'Measurement' },
  { idx: '04', name: 'Ensemble classifier' },
]

export const quantumCircuit = [
  { label: 'Logical qubits', value: '12' },
  { label: 'Circuit depth', value: '6 layers' },
  { label: 'Entangling gates', value: 'CNOT, RZZ' },
]

export const quantumHardware = [
  { label: 'Backend', value: 'QPU-cluster-3' },
  { label: 'Coherence T2', value: '42 µs' },
  { label: 'Queue depth', value: '3 jobs' },
]

export const protocols = [
  'Refer to pulmonology within 5 days',
  'Order confirmatory PET-CT',
  'Schedule tumor board review',
]

export const validation = [
  { name: 'Radiologist sign-off', status: 'pending' },
  { name: 'Pathology cross-check', status: 'complete' },
  { name: 'Second-reader review', status: 'pending' },
]

export const meta = {
  updated: 'Updated 2 min ago',
  modelVersion: 'Model v4.2',
  session: 'session HQ-2291',
  lastSync: 'Last sync 09:41',
  runId: 'run #8841',
  flaggedRegions: '2 flagged regions',
  scanCaption: 'Axial CT — segmentation overlay',
}
