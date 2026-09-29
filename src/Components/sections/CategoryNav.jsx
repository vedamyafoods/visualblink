import { motion } from 'framer-motion'
import * as FiIcons from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { subscribeToHomepageCategories } from '../../services/firebase'

export function CategoryNav({ setCurrentPage }) {
  const [categoryItems, setCategoryItems] = useState([]);

  useEffect(() => {
    const unsub = subscribeToHomepageCategories((data) => {
      setCategoryItems(data && data.length > 0 ? data : [
        { title: 'Business Cards', icon: 'FiCreditCard', query: 'Business Cards' },
        { title: 'Brochures & Flyers', icon: 'FiBookOpen', query: 'Brochures' },
        { title: 'Posters & Banners', icon: 'FiTv', query: 'Posters' },
        { title: 'Stickers & Labels', icon: 'FiTag', query: 'Labels & Stickers' },
        { title: 'Packaging', icon: 'FiBox', query: 'Packaging' },
        { title: 'Apparel & Merch', icon: 'FiShoppingBag', query: 'Apparel' },
        { title: 'Stationery', icon: 'FiFileText', query: 'Stationery' },
        { title: 'Gifts & Personalised', icon: 'FiGift', query: 'Gifts' },
      ]);
    });
    return () => unsub();
  }, []);

  const handleCategoryClick = (categoryQuery) => {
    if (typeof setCurrentPage === 'function') {
      setCurrentPage('products', { category: categoryQuery }, '#catalog')
    }
  }

  return (
    <div className="bg-[#F9FAFB] py-4 border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Clean White Rounded Card Container (No Scrollbar, 8-Grid on Desktop) */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-xs p-2 sm:p-3 overflow-hidden no-scrollbar">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {categoryItems.map((cat, i) => {
              const Icon = typeof cat.icon === 'string' ? FiIcons[cat.icon] : cat.icon;
              const SafeIcon = Icon || FiIcons.FiBox;
              return (
                <motion.button
                  key={cat.title}
                  onClick={() => handleCategoryClick(cat.query)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-pink-50/50 transition-all cursor-pointer group text-center border-none bg-transparent"
                >
                  <div className="w-8.5 h-8.5 rounded-full bg-pink-50 text-[#C026D3] group-hover:bg-gradient-to-r group-hover:from-[#D946EF] group-hover:to-[#E11D48] group-hover:text-white flex items-center justify-center transition-all mb-1.5 flex-shrink-0">
                    <SafeIcon className="w-4 h-4 text-[#C026D3] group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-[14px] sm:text-[14px] font-bold text-slate-800 group-hover:text-[#C026D3] transition-colors leading-tight">
                    {cat.title}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}

