import { useState } from 'react'
import { FiHelpCircle, FiSearch, FiChevronDown, FiFileText, FiTruck, FiCreditCard, FiRefreshCw } from 'react-icons/fi'

export function HelpCenterPage() {
  const [openFaq, setOpenFaq] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const faqs = [
    {
      q: 'What artwork file formats do you accept for printing?',
      a: 'We accept high-resolution PDF (preferred), Adobe Illustrator (.AI), Photoshop (.PSD), and Vector EPS files. Ensure text is converted to outlines and images are embedded at 300 DPI in CMYK color space.',
    },
    {
      q: 'What is your standard production and delivery timeframe?',
      a: 'Standard print production takes 3-5 business days depending on special finishes (like foil or spot UV). Express same-day production is available on select products.',
    },
    {
      q: 'Can I request a physical sample kit before placing a large order?',
      a: 'Yes! We offer a free print sample kit featuring all paper weights (300gsm, 350gsm, Kraft), matte/gloss lamination samples, and metallic foil textures.',
    },
    {
      q: 'What happens if my printed order has a defect?',
      a: 'We stand by our 100% Print Quality Guarantee. If your order contains printing or cutting defects, we will reprint and re-ship your order free of charge.',
    },
  ]

  const categories = [
    { title: 'Artwork & Bleed Setup', icon: <FiFileText className="w-5 h-5 text-[#FF5A1F]" /> },
    { title: 'Shipping & Delivery', icon: <FiTruck className="w-5 h-5 text-[#FF5A1F]" /> },
    { title: 'Billing & Invoicing', icon: <FiCreditCard className="w-5 h-5 text-[#FF5A1F]" /> },
    { title: 'Returns & Reprints', icon: <FiRefreshCw className="w-5 h-5 text-[#FF5A1F]" /> },
  ]

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633]">
      
      {/* Page Hero Header — Deep Navy #07152F */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start text-[14px] font-semibold text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Help Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Help & Knowledge Base
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Find answers to artwork preparation, paper stock selections, production timelines, and order support.
          </p>
        </div>
      </section>

      {/* Main FAQ & Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Topic Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
          {categories.map((c) => (
            <div key={c.title} className="bg-white rounded-[16px] p-6 border border-[#E7EAF0] shadow-xs hover:border-[#FF5A1F]/40 hover:shadow-md transition cursor-pointer flex items-center gap-4">
              <div className="w-11 h-11 rounded-[12px] bg-[#FF5A1F]/10 flex items-center justify-center flex-shrink-0">
                {c.icon}
              </div>
              <h3 className="text-[14px] font-bold text-[#0B1633] leading-snug">{c.title}</h3>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto bg-white rounded-[20px] p-8 border border-[#E7EAF0] shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#0B1633] mb-6">Frequently Asked Questions</h2>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-[#E7EAF0] pb-4">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left flex items-center justify-between gap-4 border-none bg-transparent cursor-pointer py-2"
                >
                  <span className="text-[15px] font-bold text-[#0B1633]">{faq.q}</span>
                  <FiChevronDown className={`w-5 h-5 text-[#FF5A1F] transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <p className="text-[#667085] text-[14px] leading-relaxed pt-2">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}
