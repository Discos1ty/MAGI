export default function Disclaimer() {
  return (
    <div className="flex gap-3 items-start mt-6 px-5 py-4 border border-[var(--line)] rounded-[10px] bg-[var(--paper-raise)]">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--brick)" strokeWidth="1.8" className="flex-shrink-0 mt-0.5">
        <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      </svg>
      <div className="text-[11.5px] text-[var(--ink-dim)] leading-relaxed">
        <strong className="text-[var(--ink)] font-semibold">This tool is a decision-support aid, not a diagnosis.</strong>{' '}
        Predictions are generated from available data and may not capture the full clinical picture. Do not fully
        depend on the given data — please continue regular checkups and confirm all findings with a licensed
        physician before making any treatment decisions.
      </div>
    </div>
  )
}
