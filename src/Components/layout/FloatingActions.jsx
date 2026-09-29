import { useEffect, useState } from 'react'
import { FiArrowUp, FiMessageCircle } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { Button } from '../ui/Button'

export function FloatingActions() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.a
        href="https://wa.me/10000000000"
        className="fixed bottom-24 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-emerald-500 text-xl text-white shadow-2xl shadow-emerald-500/30 transition hover:-translate-y-1"
        aria-label="Chat on WhatsApp"
        whileHover={{ scale: 1.06 }}
      >
        <FiMessageCircle />
      </motion.a>
      <div className="fixed bottom-5 left-1/2 z-40 hidden -translate-x-1/2 sm:block">
        <Button onClick={() => document.querySelector('#quote')?.scrollIntoView({ behavior: 'smooth' })}>
          Get Quote
        </Button>
      </div>
      {visible && (
        <button
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-slate-200 bg-white text-slate-950 shadow-2xl transition hover:-translate-y-1 dark:border-white/10 dark:bg-slate-900 dark:text-white"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <FiArrowUp />
        </button>
      )}
    </>
  )
}
