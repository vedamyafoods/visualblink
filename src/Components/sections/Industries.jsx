import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

export function Industries({ setCurrentPage }) {
  const businessSolutions = [
    {
      title: 'Startups & Small Business',
      desc: 'Make a strong first impression with custom print materials.',
      img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=600',
      query: 'Startups',
    },
    {
      title: 'Restaurants & Cafes',
      desc: 'Menus, table tents, packaging and more.',
      img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=600',
      query: 'Restaurant',
    },
    {
      title: 'Events & Promotions',
      desc: 'Stand out with high-quality event printing.',
      img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=600',
      query: 'Events',
    },
    {
      title: 'Corporate Teams',
      desc: 'Elevate your brand with professional print materials.',
      img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600',
      query: 'Corporate',
    },
  ]

  const handleLink = (query) => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage('products', { category: query }, '#catalog')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-12 sm:py-16 bg-[#F9FAFB] font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[#C026D3] text-[14px] font-black tracking-widest uppercase">
                SOLUTIONS FOR EVERY INDUSTRY
              </span>
              <span className="h-[2px] w-8 bg-gradient-to-r from-[#D946EF] to-[#E11D48] inline-block rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Built for Your <span className="text-gradient">Business</span>
            </h2>
          </div>

          <button
            onClick={() => handleLink()}
            className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[#C026D3] hover:text-[#E11D48] transition-colors border-none bg-transparent cursor-pointer group shrink-0"
          >
            <span>See All Solutions</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Large Industry Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {businessSolutions.map((sol, idx) => (
            <motion.div
              key={sol.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              onClick={() => handleLink(sol.query)}
              className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
            >
              {/* Image Container */}
              <div className="h-[170px] w-full overflow-hidden bg-slate-100 relative">
                <img
                  src={sol.img}
                  alt={sol.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-[16px] font-black text-[#0F172A] group-hover:text-[#C026D3] transition-colors mb-1">
                    {sol.title}
                  </h3>
                  <p className="text-[14px] text-slate-500 font-normal leading-relaxed">
                    {sol.desc}
                  </p>
                </div>

                <div className="mt-4 pt-2 flex items-center gap-1 text-[14px] font-bold text-[#C026D3] group-hover:text-[#E11D48] transition-colors">
                  <span>Explore</span>
                  <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

