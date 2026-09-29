import { useState } from 'react'
import { FiArrowRight, FiClock, FiTag, FiSearch } from 'react-icons/fi'

export function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const posts = [
    {
      id: 1,
      tag: 'Design Guide',
      title: '5 Crucial Tips for Designing High-Impact Business Cards',
      desc: 'Learn font hierarchy, bleed margins, spot UV placement, and stock choices that leave lasting corporate impressions.',
      date: 'Jan 24, 2024',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1612831819695-7e71f5ccf16c?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 2,
      tag: 'Paper Stocks',
      title: 'GSM Breakdown: Choosing the Right Paper Weight for Brochures',
      desc: 'A complete breakdown of 150gsm, 300gsm, matte coatings, and eco-recycled kraft paper options.',
      date: 'Jan 18, 2024',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 3,
      tag: 'Packaging',
      title: 'How Custom Mailer Boxes Increase Unboxing Brand Engagement',
      desc: 'Discover why custom printed packaging boxes boost customer retention and organic social sharing.',
      date: 'Jan 12, 2024',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600',
    },
    {
      id: 4,
      tag: 'Prepress Tips',
      title: 'CMYK vs RGB: Why Your Screen Colors Shift in Print',
      desc: 'Understand color space calibration, Pantone swatches, and resolution requirements for zero color mismatch.',
      date: 'Jan 05, 2024',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&q=80&w=600',
    },
  ]

  const filtered = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633]">
      
      {/* Page Hero Header — Deep Navy #07152F */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start text-[14px] font-semibold text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Blog & Insights</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Print Design Insights
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Expert articles on prepress setup, paper stock comparisons, foil stamping techniques, and brand collateral strategies.
          </p>
        </div>
      </section>

      {/* Main Articles Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        
        {/* Search */}
        <div className="mb-10 max-w-md relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#667085] w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#E7EAF0] rounded-[12px] text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-[16px] overflow-hidden border border-[#E7EAF0] hover:border-[#FF5A1F]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
            >
              <div className="relative h-[220px] w-full overflow-hidden bg-[#F7F8FA]">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-4 left-4 bg-[#FF5A1F] text-white text-[14px] font-extrabold px-3 py-1 rounded-full">
                  {post.tag}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-[14px] text-[#667085] font-semibold mb-2">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> {post.readTime}</span>
                  </div>
                  <h2 className="text-[20px] font-bold text-[#0B1633] group-hover:text-[#FF5A1F] transition-colors leading-snug mb-3">
                    {post.title}
                  </h2>
                  <p className="text-[#667085] text-[14px] leading-relaxed mb-6">
                    {post.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E7EAF0]">
                  <button className="text-[#FF5A1F] font-bold text-[14px] inline-flex items-center gap-1.5 group-hover:gap-2.5 transition-all border-none bg-transparent cursor-pointer p-0">
                    Read Full Article <FiArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>

    </div>
  )
}
