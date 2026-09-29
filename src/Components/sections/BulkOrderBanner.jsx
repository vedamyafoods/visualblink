import { FiArrowRight } from 'react-icons/fi'

export function BulkOrderBanner({ setCurrentPage }) {
  const handleLink = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <section className="py-10 bg-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Rounded Beige Banner Box */}
        <div className="bg-[#FAF6F0] rounded-2xl border border-gray-150 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Leftside Art + Center Info Block */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left flex-1">
            {/* SVG Packaging Box Mockup */}
            <div className="flex-shrink-0 w-32 h-24 bg-[#EBE5DA] rounded-xl flex items-center justify-center relative overflow-hidden shadow-sm">
              <svg viewBox="0 0 100 80" className="w-[105px] h-[85px] drop-shadow-md">
                <path d="M50 15 L80 30 L50 45 L20 30 Z" fill="#2d3b4e" stroke="#1e293b" strokeWidth="1" />
                <path d="M20 30 L50 45 L50 72 L20 57 Z" fill="#0b1426" />
                <path d="M50 45 L80 30 L80 57 L50 72 Z" fill="#1b2a47" />
                <path d="M45 17.5 L55 22.5 L60 20 L50 15 Z" fill="#E5AA17" />
                <circle cx="35" cy="46" r="2.5" fill="#E5AA17" />
                <line x1="39" y1="46" x2="47" y2="46" stroke="#E5AA17" strokeWidth="1.5" />
                <line x1="20" y1="30" x2="50" y2="45" stroke="#ffffff" strokeWidth="0.5" className="opacity-20" />
                <line x1="50" y1="45" x2="80" y2="30" stroke="#ffffff" strokeWidth="0.5" className="opacity-20" />
                <line x1="50" y1="45" x2="50" y2="72" stroke="#ffffff" strokeWidth="0.5" className="opacity-20" />
              </svg>
            </div>
            
            {/* Title / Description Text */}
            <div className="flex flex-col font-sans">
              <h3 className="text-xl sm:text-[23px] font-black text-slate-800 tracking-tight leading-tight">
                Bulk Order?
              </h3>
              <p className="text-[14px] sm:text-sm text-gray-500 font-medium mt-1 leading-relaxed">
                Get special discounts on bulk printing orders.
              </p>
            </div>
          </div>
          
          {/* Right Action Button Block */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => handleLink('contact')}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:border-slate-800 hover:bg-slate-900 hover:text-white transition-all text-slate-800 font-extrabold px-6 py-3.5 rounded-lg text-sm sm:text-[15px] shadow-sm select-none cursor-pointer border-solid"
            >
              Request a Quote <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white" />
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}
