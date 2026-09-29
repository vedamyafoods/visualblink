export function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-white/75 px-4 py-2 text-[14px] font-semibold uppercase tracking-[0.22em] text-blue-700 shadow-sm backdrop-blur">
      <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,.85)]" />
      {children}
    </span>
  )
}
