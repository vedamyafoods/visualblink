import { motion } from 'framer-motion'
import { Badge } from './Badge'

export function SectionTitle({ eyebrow, title, text, align = 'center' }) {
  return (
    <motion.div
      className={align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
    >
      {eyebrow && <Badge>{eyebrow}</Badge>}
      <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{text}</p>}
    </motion.div>
  )
}
