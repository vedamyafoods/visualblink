import clsx from 'clsx'

export function ProductVisual({ tone = 'from-blue-500 via-cyan-400 to-slate-900', type = 'card', className }) {
  if (type === 'box') {
    return (
      <div className={clsx('relative h-56 overflow-hidden rounded-[1.75rem] bg-gradient-to-br', tone, className)}>
        <div className="absolute left-8 top-10 h-32 w-36 rotate-[-8deg] rounded-2xl border border-white/30 bg-white/20 shadow-2xl backdrop-blur" />
        <div className="absolute bottom-8 right-8 h-28 w-40 rotate-6 rounded-3xl border border-white/40 bg-white/35 shadow-2xl backdrop-blur-md" />
        <div className="absolute inset-x-10 bottom-9 h-2 rounded-full bg-black/20 blur-md" />
      </div>
    )
  }

  if (type === 'label') {
    return (
      <div className={clsx('relative h-56 overflow-hidden rounded-[1.75rem] bg-gradient-to-br', tone, className)}>
        <div className="absolute left-1/2 top-1/2 h-36 w-36 -translate-x-1/2 -translate-y-1/2 rounded-full border-[16px] border-white/80 bg-white/20 shadow-2xl" />
        <div className="absolute left-1/2 top-1/2 h-16 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950/70" />
        <div className="absolute right-8 top-8 h-16 w-16 rounded-2xl border border-white/40 bg-white/30 backdrop-blur" />
      </div>
    )
  }

  return (
    <div className={clsx('relative h-56 overflow-hidden rounded-[1.75rem] bg-gradient-to-br', tone, className)}>
      <div className="absolute left-9 top-9 h-32 w-48 rotate-[-10deg] rounded-2xl border border-white/35 bg-white/25 shadow-2xl backdrop-blur" />
      <div className="absolute bottom-8 right-8 h-32 w-48 rotate-6 rounded-2xl border border-white/45 bg-white/35 shadow-2xl backdrop-blur-md" />
      <div className="absolute left-14 top-20 h-2 w-20 rounded-full bg-white/80" />
      <div className="absolute bottom-20 right-16 h-2 w-24 rounded-full bg-white/75" />
    </div>
  )
}
