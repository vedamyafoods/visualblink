import { motion } from 'framer-motion'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'
import { ProductVisual } from '../ui/ProductVisual'
import { SectionTitle } from '../ui/SectionTitle'

export function QualityShowcase() {
  return (
    <section id="showcase" className="section-pad overflow-hidden bg-slate-50 dark:bg-slate-900">
      <Container className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div>
          <SectionTitle align="left" eyebrow="Quality showcase" title="A finish library your customers can feel." text="Matte lamination, spot UV, foil, embossing, textured stock, rigid board, and edge color in one production ecosystem." />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button>Explore Portfolio</Button>
            <Button variant="secondary">Upload Design</Button>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div className="sm:pt-16" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <ProductVisual type="box" tone="from-violet-500 via-blue-500 to-cyan-400" className="h-72 shadow-2xl" />
          </motion.div>
          <motion.div className="grid gap-5" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}>
            <ProductVisual tone="from-slate-950 via-blue-700 to-cyan-400" className="h-52 shadow-2xl" />
            <ProductVisual type="label" tone="from-emerald-400 via-cyan-500 to-blue-700" className="h-52 shadow-2xl" />
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
