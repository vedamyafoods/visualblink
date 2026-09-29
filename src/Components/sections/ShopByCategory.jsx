import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import { subscribeToHomepageCategories } from '../../services/firebase'

export function ShopByCategory({ setCurrentPage }) {
  const [categoriesList, setCategoriesList] = useState([]);

  useEffect(() => {
    const unsub = subscribeToHomepageCategories((data) => {
      setCategoriesList(data && data.length > 0 ? data : [
        {
          title: 'Business Cards',
          sub: 'Premium cards with foil & matte finishes',
          query: 'Business Cards',
          icon: 'FiCreditCard',
          img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Brochures & Flyers',
          sub: 'Professional marketing & tri-fold materials',
          query: 'Brochures',
          icon: 'FiBookOpen',
          img: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Posters & Banners',
          sub: 'Large format outdoor & event displays',
          query: 'Posters',
          icon: 'FiTv',
          img: 'https://images.unsplash.com/photo-1572949645841-094f3a9c4c94?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Invitations & Cards',
          sub: 'Special occasions & luxury embossed cards',
          query: 'Gifts',
          icon: 'FiGift',
          img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Stickers & Labels',
          sub: 'Custom die-cut vinyl & roll labels',
          query: 'Labels & Stickers',
          icon: 'FiTag',
          img: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Custom Packaging',
          sub: 'Custom mailer boxes & packaging',
          query: 'Packaging',
          icon: 'FiBox',
          img: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Stationery',
          sub: 'Branded letterheads & notebooks',
          query: 'Stationery',
          icon: 'FiFileText',
          img: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
        },
        {
          title: 'Photo Printing',
          sub: 'High quality prints & canvas frames',
          query: 'Displays',
          icon: 'FiImage',
          img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600',
        },
      ]);
    });
    return () => unsub();
  }, []);


  const handleLink = (categoryQuery) => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage('products', categoryQuery ? { category: categoryQuery } : {}, '#catalog')
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-12 sm:py-16 bg-[#F9FAFB] font-sans border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header (Matching Screenshot 2) */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[#C026D3] text-[14px] font-black tracking-widest uppercase">
                OUR PRODUCTS
              </span>
              <span className="h-[2px] w-8 bg-gradient-to-r from-[#D946EF] to-[#E11D48] inline-block rounded-full" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] tracking-tight">
              Shop by <span className="text-gradient">Category</span>
            </h2>
          </div>

          <button
            onClick={() => handleLink()}
            className="inline-flex items-center gap-1.5 text-[14px] font-extrabold text-[#C026D3] hover:text-[#E11D48] transition-colors border-none bg-transparent cursor-pointer group shrink-0"
          >
            <span>View All Products</span>
            <FiIcons.FiArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* 4 Cards Grid per row (Matching Screenshot 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat, idx) => {
            const Icon = typeof cat.icon === 'string' ? FiIcons[cat.icon] : cat.icon;
            const SafeIcon = Icon || FiIcons.FiBox;
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                onClick={() => handleLink(cat.query)}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Image Container with Top-Left Floating Circle Badge */}
                <div className="relative h-[180px] w-full overflow-hidden bg-slate-100">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top-Left Floating Circle Badge Icon (Matching Screenshot 2) */}
                  <div className="absolute top-3.5 left-3.5 w-9 h-9 rounded-full bg-white shadow-md border border-slate-100 flex items-center justify-center text-[#C026D3] group-hover:scale-110 transition-transform">
                    <SafeIcon className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5 flex flex-col justify-between flex-1 bg-white">
                  <div>
                    <h3 className="text-[16px] font-black text-[#0F172A] group-hover:text-[#C026D3] transition-colors mb-1.5 leading-snug">
                      {cat.title}
                    </h3>
                    <p className="text-slate-500 text-[14px] font-normal leading-relaxed">
                      {cat.sub}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 flex items-center gap-1.5 text-[14px] font-bold text-[#C026D3] group-hover:text-[#E11D48] transition-colors">
                    <span>Explore Now</span>
                    <FiIcons.FiArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>

              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

