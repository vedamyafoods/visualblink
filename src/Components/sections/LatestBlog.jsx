import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'
import { subscribeToHomepageBlogs } from '../../services/firebase'

export function LatestBlog({ setCurrentPage }) {
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    const unsub = subscribeToHomepageBlogs((data) => {
      setBlogPosts(data && data.length > 0 ? data : [
        {
          title: '5 Creative Business Card Ideas That Stand Out',
          category: 'Design Tips',
          date: 'Mar 12, 2024',
          img: 'https://images.unsplash.com/photo-1612831819695-7e71f5ccf16c?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'How Custom Packaging Can Boost Your Brand',
          category: 'Business Growth',
          date: 'Mar 8, 2024',
          img: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'A Complete Guide to Choosing the Right Paper for Your Prints',
          category: 'Print Guides',
          date: 'Feb 28, 2024',
          img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
        },
      ]);
    });
    return () => unsub();
  }, []);


  const handleLink = () => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage('blog')
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
                TIPS, IDEAS & INSPIRATION
              </span>
              <span className="h-[2px] w-8 bg-gradient-to-r from-[#D946EF] to-[#E11D48] inline-block rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Latest from Our <span className="text-gradient">Blog</span>
            </h2>
          </div>

          <button
            onClick={handleLink}
            className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[#C026D3] hover:text-[#E11D48] transition-colors border-none bg-transparent cursor-pointer group shrink-0"
          >
            <span>View All Posts</span>
            <FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 3 Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.35 }}
              onClick={handleLink}
              className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 bg-white hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Overlay Category Tag */}
                <div className="relative h-[180px] w-full overflow-hidden bg-slate-100">
                  <img
                    src={post.img}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 btn-gradient text-white text-[10.5px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>

                {/* Content Area */}
                <div className="p-5">
                  <p className="text-[14px] text-slate-400 font-semibold mb-2">{post.date}</p>
                  <h3 className="text-[16px] font-black text-[#0F172A] group-hover:text-[#C026D3] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>
                </div>
              </div>

              {/* Read More Link */}
              <div className="px-5 pb-5 pt-0">
                <div className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#C026D3] group-hover:text-[#E11D48] transition-colors">
                  <span>Read More</span>
                  <FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.article>
          ))}
        </div>

      </div>
    </section>
  )
}

