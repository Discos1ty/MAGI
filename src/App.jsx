import Sidebar from './components/Sidebar.jsx'
import PatientCard from './components/PatientCard.jsx'
import XaiCard from './components/XaiCard.jsx'
import BiomarkerCard from './components/BiomarkerCard.jsx'
import UploadCard from './components/UploadCard.jsx'
import RiskCard from './components/RiskCard.jsx'
import QuantumCard from './components/QuantumCard.jsx'
import CdsCard from './components/CdsCard.jsx'
import Disclaimer from './components/Disclaimer.jsx'
import { meta, patient } from './data.js'

export default function App() {
  return (
    <div className="relative flex min-h-screen">
      <div className="ambient-background">
        <div className="aurora-blob aurora-blob-forest" />
        <div className="aurora-blob aurora-blob-violet" />
        <div className="aurora-blob aurora-blob-rose" />
      </div>

      <Sidebar />

      <main className="relative z-10 flex-1 px-6 md:px-9 py-7 max-w-[1400px]">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-7">
          <h1 className="font-display text-[26px] font-medium tracking-[-0.01em]">Diagnostic dashboard</h1>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--forest)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--forest)] animate-pulse" />
            {meta.updated}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.62fr_1fr] gap-5 items-start">
          <div className="flex flex-col gap-5">
            <PatientCard />
            <XaiCard />
            <BiomarkerCard />
          </div>

          <div className="flex flex-col gap-5">
            <UploadCard />
            <RiskCard />
            <QuantumCard />
            <CdsCard />
          </div>
        </div>

        <Disclaimer />
      </main>
    </div>
  )
}