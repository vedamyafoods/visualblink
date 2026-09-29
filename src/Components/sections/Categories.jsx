import { FiArrowUpRight } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { categories } from '../../data/siteData'
import { Container } from '../ui/Container'
import { SectionTitle } from '../ui/SectionTitle'

export function Categories() {
  return (
    <section id="products" className="section-pad bg-slate-50 dark:bg-slate-900">
      <Container>
        <SectionTitle eyebrow="Product universe" title="Every print format your brand touches." text="A premium catalog for launches, replenishment, events, retail, and high-touch customer moments." />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon
            return (
              <motion.a
                key={category.title}
                href="#quote"
                className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/10 dark:border-white/10 dark:bg-white/5"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.035 }}
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${category.tone}`} />
                <div className={`grid h-28 place-items-center rounded-[1.35rem] bg-gradient-to-br ${category.tone} text-4xl text-white shadow-xl shadow-blue-500/10 transition duration-500 group-hover:scale-[1.03]`}>
                  <Icon />
                </div>
                <div className="mt-5 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-950 dark:text-white">{category.title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{category.tag}</p>
                  </div>
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-white/10 dark:text-white">
                    <FiArrowUpRight />
                  </span>
                </div>
              </motion.a>
            )
          })}
        </div>
      </Container>
    </section>
  )
}
