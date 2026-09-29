import { useState } from 'react'
import { FiDownload, FiSearch, FiLayout, FiEye, FiCheck } from 'react-icons/fi'

export function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  const templatesList = [
    {
      id: 1,
      title: 'Corporate Business Card Standard 3.5x2"',
      category: 'Business Cards',
      fileType: 'PSD, AI, PDF',
      dimensions: '1050 x 600 px (300 DPI)',
      downloads: '14.2k',
      image: 'https://images.unsplash.com/photo-1612831819695-7e71f5ccf16c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 2,
      title: 'Tri-Fold Marketing Brochure A4',
      category: 'Brochures',
      fileType: 'INDD, AI, PDF',
      dimensions: '297 x 210 mm (300 DPI)',
      downloads: '9.8k',
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      title: 'Product Packaging Box Dieline Template',
      category: 'Packaging',
      fileType: 'AI, EPS, PDF',
      dimensions: 'Custom Scalable Vector',
      downloads: '7.5k',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
      title: 'Event Poster Banner 24x36"',
      category: 'Posters',
      fileType: 'PSD, PDF',
      dimensions: '24 x 36 inches (300 DPI)',
      downloads: '11.4k',
      image: 'https://images.unsplash.com/photo-1608502374980-67d5c35a5302?auto=format&fit=crop&q=80&w=600',
    },
  ]

  const filtered = templatesList.filter(t => 
    (activeTab === 'All' || t.category === activeTab) &&
    t.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633]">
      
      {/* Page Hero Header — Deep Navy #07152F */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start text-[14px] font-semibold text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Print Templates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Free Print Dielines & Templates
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Download print-ready die-cut vector lines, CMYK color profiles, and pre-formatted layout grids in Illustrator, Photoshop, and InDesign formats.
          </p>
        </div>
      </section>

      {/* Main Templates Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Search Bar */}
        <div className="mb-8 relative max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085] w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates (e.g., Business Card, Brochure...)"
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E7EAF0] rounded-[12px] text-[14px] text-[#0B1633] placeholder-[#667085] focus:outline-none focus:border-[#FF5A1F] transition shadow-xs"
          />
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-[16px] overflow-hidden border border-[#E7EAF0] hover:border-[#FF5A1F]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div className="relative h-[170px] w-full overflow-hidden bg-[#F7F8FA]">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 right-3 bg-[#07152F] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {item.fileType}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[14px] font-extrabold text-[#FF5A1F] uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <h3 className="text-[16px] font-bold text-[#0B1633] group-hover:text-[#FF5A1F] transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-[#667085] mb-4">
                    Dimensions: {item.dimensions}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#E7EAF0] flex items-center justify-between">
                  <span className="text-[14px] text-[#667085] font-medium">{item.downloads} downloads</span>
                  <button className="inline-flex items-center gap-1.5 bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-bold text-[14px] px-3.5 py-2 rounded-[10px] transition cursor-pointer border-none shadow-xs">
                    <FiDownload className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
