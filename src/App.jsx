// Destination: src/App.jsx (replaces your current file)

import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import PatientCard from './components/PatientCard.jsx'
import XaiCard from './components/XaiCard.jsx'
import BiomarkerCard from './components/BiomarkerCard.jsx'
import UploadCard from './components/UploadCard.jsx'
import RiskCard from './components/RiskCard.jsx'
import QuantumCard from './components/QuantumCard.jsx'
import CdsCard from './components/CdsCard.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import AnalyticsPage from './components/AnalyticsPage.jsx'
import { meta, patient } from './data.js'

export default function App() {
  // Which sidebar page is showing. No router library in this project yet —
  // Sidebar's nav buttons just call onNavigate to flip this.
  const [page, setPage] = useState('dashboard')

  // Result of the last /api/predict/ call, lifted here so RiskCard can
  // render live model output once UploadCard successfully predicts on a
  // single-patient CSV.
  const [prediction, setPrediction] = useState(null)

  return (
    <div className="relative flex min-h-screen">
      <div className="ambient-background">
        <div className="aurora-blob aurora-blob-forest" />
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-rose" />
      </div>

      <Sidebar active={page} onNavigate={setPage} />

      <main className="relative z-10 flex-1 px-6 md:px-9 py-7 max-w-[1400px]">
        {page === 'dashboard' && (
          <>
            <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
              <h1 className="font-display text-[26px] font-medium tracking-[-0.01em]">Diagnostic dashboard</h1>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[1.62fr_1fr] gap-5 items-start">
              <div className="flex flex-col gap-5">
                <PatientCard />
                  <XaiCard xai={prediction} />
  <BiomarkerCard xai={prediction} />
              </div>

              <div className="flex flex-col gap-5">
                <UploadCard onPredicted={setPrediction} />
                <RiskCard prediction={prediction} />
                <CdsCard />
              </div>
            </div>

            <Disclaimer />
          </>
        )}

        {page === 'analytics' && <AnalyticsPage />}

        {(page === 'records' || page === 'help') && (
          <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
            <h1 className="font-display text-[26px] font-medium tracking-[-0.01em]">
              {page === 'records' ? 'Patient records' : 'Help'}
            </h1>
            <p className="text-[13px] text-[var(--ink-faint)]">Coming soon.</p>
          </div>
        )}
      </main>
    </div>
  )
}