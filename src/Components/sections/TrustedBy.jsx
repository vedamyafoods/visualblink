import { brands } from '../../data/siteData'

export function TrustedBy() {
  const items = [...brands, ...brands]

  return (
    <section className="border-y border-slate-200/70 bg-white py-7 dark:border-white/10 dark:bg-slate-950">
      <div className="overflow-hidden">
        <div className="marquee flex w-max items-center gap-5">
          {items.map((brand, index) => (
            <div key={`${brand}-${index}`} className="grid h-14 min-w-40 place-items-center rounded-full border border-slate-200 bg-slate-50 px-8 text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              {brand}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-5 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">Trusted by 100+ growing and enterprise brands</p>
    </section>
  )
}
