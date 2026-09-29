import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'
import { faqs } from '../../data/siteData'
import { Container } from '../ui/Container'
import { SectionTitle } from '../ui/SectionTitle'

export function FAQ() {
  const [active, setActive] = useState(0)

  return (
    <section className="section-pad bg-white dark:bg-slate-950">
      <Container>
        <SectionTitle eyebrow="FAQ" title="Answers before the first proof." text="Clear production expectations for teams ordering premium print online." />
        <div className="mx-auto mt-12 max-w-3xl divide-y divide-slate-200 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-950/5 dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
          {faqs.map((faq, index) => (
            <div key={faq.question}>
              <button className="flex min-h-16 w-full items-center justify-between gap-4 px-6 py-5 text-left font-extrabold text-slate-950 dark:text-white" onClick={() => setActive(active === index ? -1 : index)}>
                {faq.question}
                <FiChevronDown className={`shrink-0 transition ${active === index ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence initial={false}>
                {active === index && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                    <p className="px-6 pb-6 text-sm leading-7 text-slate-600 dark:text-slate-300">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
