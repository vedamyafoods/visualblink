import { useMemo, useState } from 'react'
import { FiPhone, FiUploadCloud } from 'react-icons/fi'
import { Button } from '../ui/Button'
import { Container } from '../ui/Container'

export function CTA() {
  const [quantity, setQuantity] = useState(500)
  const [finish, setFinish] = useState(35)
  const estimate = useMemo(() => Math.round(49 + quantity * 0.13 + finish), [quantity, finish])

  return (
    <section id="quote" className="section-pad bg-slate-950 text-white">
      <Container>
        <div className="grid items-center gap-10 rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,.65),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,.48),transparent_32%),linear-gradient(135deg,#020617,#111827)] p-6 shadow-[0_40px_120px_rgba(15,23,42,.45)] sm:p-10 lg:grid-cols-[1fr_.8fr] lg:p-14">
          <div>
            <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[14px] font-bold uppercase tracking-[0.22em] text-cyan-100">Instant quote</span>
            <h2 className="mt-7 text-4xl font-extrabold tracking-tight sm:text-6xl">Ready to Print Something Amazing?</h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-200">
              Build a fast estimate, send artwork, or talk to a print specialist for custom packaging and large production runs.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button variant="glow"><FiPhone /> Call Now</Button>
              <Button variant="secondary"><FiUploadCloud /> Upload Design</Button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/15 bg-white/10 p-5 backdrop-blur-2xl">
            <h3 className="text-xl font-extrabold">Quote calculator</h3>
            <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="quantity">Quantity</label>
            <input id="quantity" className="mt-3 w-full accent-cyan-300" type="range" min="100" max="5000" step="100" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
            <div className="mt-2 text-sm text-slate-300">{quantity.toLocaleString()} units</div>
            <label className="mt-6 block text-sm font-semibold text-slate-200" htmlFor="finish">Finishing level</label>
            <input id="finish" className="mt-3 w-full accent-cyan-300" type="range" min="0" max="180" step="15" value={finish} onChange={(event) => setFinish(Number(event.target.value))} />
            <div className="mt-8 rounded-[1.5rem] bg-white p-5 text-slate-950">
              <p className="text-sm font-semibold text-slate-500">Estimated starting price</p>
              <div className="mt-1 text-5xl font-extrabold">${estimate}</div>
              <p className="mt-3 text-[14px] leading-6 text-slate-500">Final pricing depends on material, dieline, proofing, shipping, and production timing.</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
