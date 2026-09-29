import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiStar, FiArrowRight } from 'react-icons/fi'
import { subscribeToHomepageTestimonials } from '../../services/firebase'

export function Testimonials() {
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    const unsub = subscribeToHomepageTestimonials((data) => {
      setReviews(data && data.length > 0 ? data : [
        {
          name: 'Rohan Mehta',
          role: 'Founder, Event & Office',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          quote: 'Excellent quality and fast delivery. Visual Blink has become our go-to partner for all our branding needs.',
          rating: 5,
        },
        {
          name: 'Priya Sharma',
          role: 'Event Planner',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
          quote: 'Amazing print quality and customer support. Highly recommended for small businesses!',
          rating: 5,
        },
        {
          name: 'Amit Verma',
          role: 'Marketing Manager',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
          quote: 'Easy ordering process and super fast delivery. The prints came out even better than expected.',
          rating: 5,
        }
      ]);
    });
    return () => unsub();
  }, []);
  // Render

  return (
    <section className="py-12 sm:py-16 bg-white font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[#C026D3] text-[14px] font-black tracking-widest uppercase">
                OUR CUSTOMERS
              </span>
              <span className="h-[2px] w-8 bg-gradient-to-r from-[#D946EF] to-[#E11D48] inline-block rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              What Our <span className="text-gradient">Customers Say</span>
            </h2>
          </div>

          <button className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[#C026D3] hover:text-[#E11D48] transition-colors border-none bg-transparent cursor-pointer group shrink-0">
            <span>View All Reviews</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 3 Review Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              className="bg-[#F9FAFB] rounded-2xl p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-[#C026D3]/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: r.rating }).map((_, si) => (
                    <FiStar key={si} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-[#0F172A] text-[14px] font-medium italic leading-relaxed mb-6">
                  "{r.quote}"
                </p>
              </div>

              {/* Author Row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h4 className="text-[14px] font-bold text-[#0F172A] leading-snug">{r.name}</h4>
                    <p className="text-[14px] text-slate-500">{r.role}</p>
                  </div>
                </div>

                <span className="text-pink-300 text-2xl font-serif">”</span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}

