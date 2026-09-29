import { motion } from 'framer-motion'
import { processSteps } from '../../data/siteData'
import { Container } from '../ui/Container'
import { SectionTitle } from '../ui/SectionTitle'

export function PrintingProcess() {
  return (
    <section id="process" className="section-pad bg-white dark:bg-slate-950">
      <Container>
        <SectionTitle eyebrow="Printing process" title="From idea to doorstep, beautifully orchestrated." text="A guided workflow keeps teams aligned from product selection through proof approval and delivery." />
        <div className="relative mt-16">
          <svg className="absolute left-0 top-14 hidden h-24 w-full lg:block" viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true">
            <motion.path
              d="M20 70 C180 10 270 110 420 58 S690 18 820 70 S940 88 980 40"
              fill="none"
              stroke="url(#line)"
              strokeWidth="4"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
            />
            <defs>
              <linearGradient id="line" x1="0" x2="1">
                <stop stopColor="#2563EB" />
                <stop offset=".55" stopColor="#8B5CF6" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="grid gap-5 lg:grid-cols-5">
            {processSteps.map((step, index) => (
              <motion.div
                key={step}
                className="relative rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 text-center shadow-sm dark:border-white/10 dark:bg-white/5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-xl font-extrabold text-white shadow-xl shadow-blue-500/20 dark:bg-white dark:text-slate-950">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-lg font-extrabold text-slate-950 dark:text-white">{step}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {index === 0 && 'Select specs, quantity, finishes, and paper.'}
                  {index === 1 && 'Send artwork or request expert design support.'}
                  {index === 2 && 'Review color, bleed, dielines, and finish layers.'}
                  {index === 3 && 'Your order moves through calibrated production.'}
                  {index === 4 && 'Track dispatch through doorstep delivery.'}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
