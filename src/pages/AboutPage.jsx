import { FiLayers, FiShield, FiHeart, FiCheckCircle, FiAward, FiUsers } from 'react-icons/fi'

export function AboutPage() {
  const values = [
    {
      title: 'Obsessive Calibration',
      desc: 'Our printing presses are calibrated weekly to the FOGRA ISO standard. CMYK color profiles are verified by senior prepress specialists prior to printing.',
      icon: <FiLayers className="w-6 h-6 text-[#FF5A1F]" />
    },
    { 
      title: 'Eco-Ethical Production',
      desc: 'We prioritize FSC-certified recycled paper stocks, vegetable soy inks, and glue-less packaging designs.',
      icon: <FiHeart className="w-6 h-6 text-[#FF5A1F]" />
    },
    {
      title: 'Dispatch Guarantee',
      desc: 'We respect business deadlines. If your order shipment leaves our printing hub later than promised, you receive a full refund.',
      icon: <FiShield className="w-6 h-6 text-[#FF5A1F]" />
    }
  ]

  const stats = [
    { number: '15+', label: 'Years in Printing' },
    { number: '50,000+', label: 'Satisfied Clients' },
    { number: '100,000+', label: 'Orders Delivered' },
    { number: '99.9%', label: 'Color Accuracy' },
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
            <span className="text-[#FF5A1F] font-bold">About Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Legacy of Precision Printing
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Combining advanced offset press engineering with meticulous craftsmanship to power physical brand collateral nationwide.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Story Section */}
        <div className="bg-white rounded-[20px] p-8 sm:p-12 border border-[#E7EAF0] shadow-sm mb-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 text-left">
            <span className="text-[#FF5A1F] text-[14px] font-extrabold tracking-widest uppercase mb-2 block">
              OUR MISSION & CRAFT
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B1633] mb-4">
              We Believe Print Builds Physical Trust
            </h2>
            <p className="text-[#667085] text-[15px] leading-relaxed mb-4">
              Every trifold brochure fold, business card foil accent, and rigid box edge detail represents your corporate signature. That is why we treat print as high-precision engineering.
            </p>
            <p className="text-[#667085] text-[15px] leading-relaxed">
              Equipped with Heidelberg offset lithography presses, digital plotters, and automated die-cutting machines, we ensure your brand looks flawless in every client handoff.
            </p>
          </div>

          <div className="lg:col-span-5 bg-[#07152F] text-white p-8 rounded-[16px] border border-slate-800 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-[14px] bg-[#FF5A1F] flex items-center justify-center mx-auto mb-4 text-white shadow-lg">
              <FiAward className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Certified Print Studio</h3>
            <p className="text-[#909AB0] text-[13.5px] leading-relaxed">
              FOGRA ISO 12647 Color Calibrated & FSC Eco-Certified Paper Stock Partner.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-[16px] p-6 border border-[#E7EAF0] text-center shadow-xs">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#FF5A1F] mb-1">{s.number}</div>
              <div className="text-[14px] text-[#667085] font-semibold">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((v) => (
            <div key={v.title} className="bg-white rounded-[16px] p-7 border border-[#E7EAF0] hover:border-[#FF5A1F]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-[12px] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center mb-4">
                {v.icon}
              </div>
              <h3 className="text-[18px] font-bold text-[#0B1633] mb-2">{v.title}</h3>
              <p className="text-[#667085] text-[14px] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

      </div>

    </div>
  )
}
