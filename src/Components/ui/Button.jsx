import clsx from 'clsx'
import { FiArrowRight } from 'react-icons/fi'

export function Button({ children, variant = 'primary', className, icon = true, ...props }) {
  return (
    <button
      className={clsx(
        'group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
        variant === 'primary' &&
          'bg-slate-950 text-white shadow-[0_18px_55px_rgba(15,23,42,.28)] hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(37,99,235,.35)]',
        variant === 'secondary' &&
          'border border-slate-200 bg-white/80 text-slate-950 shadow-[0_16px_45px_rgba(15,23,42,.08)] backdrop-blur hover:-translate-y-0.5 hover:border-blue-200',
        variant === 'glow' &&
          'bg-white text-slate-950 shadow-[0_20px_80px_rgba(255,255,255,.3)] hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative inline-flex items-center gap-2">
        {children}
        {icon && <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />}
      </span>
    </button>
  )
}
