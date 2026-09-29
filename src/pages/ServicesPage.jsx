import { motion } from 'framer-motion'
import { FiLayers, FiPrinter, FiCpu, FiShield, FiTruck, FiHeadphones, FiArrowRight } from 'react-icons/fi'

export function ServicesPage() {
  const servicesList = [
    {
      title: 'Offset Lithography Printing',
      subtitle: 'High Volume Enterprise Runs',
      description: 'Ideal for 1,000+ unit brochure, poster, and catalog orders. Provides exact Pantone color matching and crisp typography.',
      icon: <FiPrinter className="w-7 h-7 text-[#FF5A1F]" />,
      badge: 'High Volume',
    },
    {
      title: 'Digital Fast-Turnaround Print',
      subtitle: 'Same-Day & Express Dispatch',
      description: 'Variable data printing for personalized direct mailers, emergency trade show banners, and short-run cards.',
      icon: <FiCpu className="w-7 h-7 text-[#FF5A1F]" />,
      badge: 'Same Day Available',
    },
    {
      title: 'Luxury Foil & Spot UV Finishes',
      subtitle: 'Premium Tactile Textures',
      description: 'Elevate your collateral with raised metallic gold/silver foils, soft-touch matte lamination, and glossy spot UV highlights.',
      icon: <FiLayers className="w-7 h-7 text-[#FF5A1F]" />,
      badge: 'Luxury Touch',
    },
    {
      title: 'Custom Packaging & Rigid Boxes',
      subtitle: 'Structural Box Engineering',
      description: 'End-to-end folding carton design, corrugated mailer boxes, and luxury rigid gift boxes tailored to your brand dimensions.',
      icon: <FiShield className="w-7 h-7 text-[#FF5A1F]" />,
      badge: 'Custom Structural',
    },
    {
      title: 'Bulk Logistics & Doorstep Delivery',
      subtitle: 'Nationwide & Global Shipping',
      description: 'Palletized bulk shipment, multi-branch distribution, and real-time GPS order tracking straight to your location.',
      icon: <FiTruck className="w-7 h-7 text-[#FF5A1F]" />,
      badge: 'Tracked Dispatch',
    },
    {
      title: 'Pre-Press Design Consultation',
      subtitle: 'Dedicated Print Engineer',
      description: 'Free automated pre-flight file check (bleed, CMYK color space, resolution) + 1-on-1 artwork refinement.',
      icon: <FiHeadphones className="w-7 h-7 text-[#FF5A1F]" />,
      badge: 'Free Pre-flight',
    },
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
            <span className="text-[#FF5A1F] font-bold">Our Services</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Print Engineering & Services
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            From precision offset press calibration to automated packaging engineering, we turn artwork into physical perfection.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((s) => (
            <div
              key={s.title}
              className="bg-white rounded-[16px] p-7 border border-[#E7EAF0] hover:border-[#FF5A1F]/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-13 h-13 rounded-[14px] bg-[#FF5A1F]/10 border border-[#FF5A1F]/20 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="bg-[#07152F] text-white text-[14px] font-extrabold px-3 py-1 rounded-full">
                    {s.badge}
                  </span>
                </div>

                <h3 className="text-[19px] font-bold text-[#0B1633] mb-1 leading-snug">
                  {s.title}
                </h3>
                <span className="text-[14px] font-extrabold text-[#FF5A1F] uppercase tracking-wider block mb-3">
                  {s.subtitle}
                </span>
                <p className="text-[#667085] text-[14px] leading-relaxed mb-6">
                  {s.description}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E7EAF0]">
                <button className="text-[#FF5A1F] font-bold text-[14px] inline-flex items-center gap-1.5 hover:gap-2.5 transition-all border-none bg-transparent cursor-pointer p-0">
                  Request Service Details <FiArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
