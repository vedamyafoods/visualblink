import clsx from 'clsx'

export function GlassCard({ children, className }) {
  return (
    <div className={clsx('rounded-[2rem] border border-white/70 bg-white/70 shadow-[0_24px_90px_rgba(15,23,42,.10)] backdrop-blur-2xl', className)}>
      {children}
    </div>
  )
}
