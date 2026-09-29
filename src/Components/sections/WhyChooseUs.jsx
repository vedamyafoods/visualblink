import { motion } from 'framer-motion'
import { FiLayers, FiClock, FiDollarSign, FiHeadphones } from 'react-icons/fi'

export function WhyChooseUs() {
  const features = [
    {
      icon: FiLayers,
      title: 'Premium Quality',
      desc: 'Finest materials and latest printing technology.',
    },
    {
      icon: FiClock,
      title: 'Fast Turnaround',
      desc: 'On-time production and delivery.',
    },
    {
      icon: FiDollarSign,
      title: 'Affordable Pricing',
      desc: 'Best value for your money with transparent pricing.',
    },
    {
      icon: FiHeadphones,
      title: 'Design Support',
      desc: 'Expert design assistance to bring your ideas to life.',
    },
  ]

  return (
    <section className="py-12 sm:py-16 bg-[#F9FAFB] font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 4 Feature Columns with Pink Circular Badge Icons (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="flex items-start gap-4 text-left p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-md transition-all"
              >
                <div className="w-11 h-11 rounded-full bg-pink-100/80 text-[#C026D3] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-[15.5px] font-black text-[#0F172A] mb-1">
                    {f.title}
                  </h3>
                  <p className="text-slate-500 text-[14px] font-normal leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

