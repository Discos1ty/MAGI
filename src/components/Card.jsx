export default function Card({ title, tag, dot, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`bg-[var(--paper-raise)] border border-[var(--forest)] rounded-[10px] ${className}`}>
      <header className="flex items-center justify-between px-5 py-4 border-b border-[var(--line-soft)]">
        <div className="flex items-center gap-2.5">
          {dot && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />}
          <h2 className="font-display text-[15px] font-medium tracking-[-0.01em]">{title}</h2>
        </div>
        {tag && <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">{tag}</span>}
      </header>
      <div className={`p-5 ${bodyClassName}`}>{children}</div>
    </section>
  )
}
