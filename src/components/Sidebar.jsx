import { useState } from 'react'
import { meta } from '../data.js'

const NAV = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'records', label: 'Patient records' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'help', label: 'Help' },
]

export default function Sidebar() {
  const [active, setActive] = useState('dashboard')

  return (
    <aside className="hidden md:flex flex-col gap-8 w-[212px] flex-shrink-0 bg-[var(--paper-raise)] border-r border-[var(--line)] px-4 py-6">
      <div className="flex items-center gap-2.5 pb-5 border-b border-[var(--line)] px-1">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9.5" stroke="var(--forest)" strokeWidth="1.4" />
          <path d="M12 5.5c2.4 2.6 2.4 10.4 0 13M12 5.5c-2.4 2.6-2.4 10.4 0 13" stroke="var(--forest)" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="1.6" fill="var(--brick)" />
        </svg>
        <div>
          <div className="font-display text-[14px] font-medium leading-none">MAGI</div>
          <div className="text-[10px] text-[var(--ink-faint)] mt-1">Early disease detection</div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`text-left text-[13px] font-medium px-3 py-2 rounded-[6px] transition-colors border-l-2 ${
              active === item.key
                ? 'text-[var(--forest)] bg-[var(--forest-dim)] border-[var(--forest)]'
                : 'text-[var(--ink-dim)] border-transparent hover:bg-[var(--line-soft)] hover:text-[var(--ink)]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-[var(--line)] text-[11px] text-[var(--ink-faint)] leading-relaxed">
        {meta.modelVersion} · {meta.session}
        <br />
        {meta.lastSync}
      </div>
    </aside>
  )
}
