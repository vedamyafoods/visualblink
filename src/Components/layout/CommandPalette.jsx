import { useEffect, useState } from 'react'
import { FiCommand, FiSearch, FiX } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { commands } from '../../data/siteData'

export function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const filtered = commands.filter((item) => item.toLowerCase().includes(query.toLowerCase()))

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-start bg-slate-950/45 px-4 pt-28 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/95 shadow-2xl dark:border-white/10 dark:bg-slate-950/95" initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.98 }}>
            <div className="flex items-center gap-3 border-b border-slate-200 p-4 dark:border-white/10">
              <FiSearch className="text-slate-400" />
              <input autoFocus className="min-h-12 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400 dark:text-white" placeholder="Search products, quotes, orders..." value={query} onChange={(event) => setQuery(event.target.value)} />
              <button className="icon-btn" aria-label="Close search" onClick={onClose}>
                <FiX />
              </button>
            </div>
            <div className="p-3">
              {filtered.map((item) => (
                <button key={item} className="flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 text-left font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10" onClick={onClose}>
                  <FiCommand className="text-blue-500" />
                  {item}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
