import clsx from 'clsx'

export function Container({ children, className }) {
  return (
    <div className={clsx('mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8', className)}>
      {children}
    </div>
  )
}
