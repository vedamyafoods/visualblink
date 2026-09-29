import { useState, useEffect, useRef } from 'react'
import { animate, useInView } from 'framer-motion'
import { subscribeToHomepageStats } from '../../services/firebase'

function CounterNumber({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [displayVal, setDisplayVal] = useState('0')

  useEffect(() => {
    if (!isInView) return
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
      onUpdate(latest) {
        if (decimals > 0) {
          setDisplayVal(latest.toFixed(decimals))
        } else {
          setDisplayVal(Math.floor(latest).toLocaleString('en-US'))
        }
      },
    })
    return () => controls.stop()
  }, [isInView, value, decimals])

  return (
    <span ref={ref}>
      {displayVal}{suffix}
    </span>
  )
}

export function StatsBanner() {
  const [statsList, setStatsList] = useState([]);

  useEffect(() => {
    const unsub = subscribeToHomepageStats((data) => {
      setStatsList(data && data.length > 0 ? data.sort((a, b) => a.value - b.value) : [
        { value: 50000, suffix: '+', label: 'Happy Customers' },
        { value: 100000, suffix: '+', label: 'Orders Completed' },
        { value: 500, suffix: '+', label: 'Premium Products' },
        { value: 99.9, decimals: 1, suffix: '%', label: 'Customer Satisfaction' },
      ]);
    });
    return () => unsub();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-[#07152F] text-white font-sans border-y border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-800/80">
          {statsList.map((st, i) => (
            <div
              key={st.label}
              className={`flex flex-col items-center text-center ${i !== 0 ? 'pt-4 sm:pt-0 sm:pl-6' : ''
                }`}
            >
              <div className="text-3xl sm:text-4xl lg:text-[44px] font-black text-white leading-none tracking-tight mb-2">
                <CounterNumber value={st.value} suffix={st.suffix} decimals={st.decimals || 0} />
              </div>
              <div className="text-[14px] sm:text-[14px] text-slate-300 font-medium">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
