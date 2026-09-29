import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { stats } from '../../data/siteData'
import { Container } from '../ui/Container'

function AnimatedCount({ end, suffix }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (end <= 0) {
      setValue(0)
      return undefined
    }

    const duration = 1600
    const startTime = performance.now()
    let frameId = 0

    const tick = (currentTime) => {
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(end * eased))

      if (progress < 1) {
        frameId = window.requestAnimationFrame(tick)
      }
    }

    frameId = window.requestAnimationFrame(tick)

    return () => window.cancelAnimationFrame(frameId)
  }, [end])

  return <>{value}{suffix}</>
}

export function Stats() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.25 })

  return (
    <section ref={ref} className="bg-slate-950 py-12 text-white">
      <Container>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7 text-center">
              <div className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                {inView ? <AnimatedCount end={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-300">{stat.label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
