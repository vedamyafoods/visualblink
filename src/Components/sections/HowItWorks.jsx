import { motion, useReducedMotion } from 'framer-motion'
import { FiGrid, FiUploadCloud, FiCheckCircle, FiBox, FiShoppingBag, FiTruck, FiFileText, FiShield, FiAward, FiClock, FiHeadphones } from 'react-icons/fi'

export function HowItWorks() {
  const prefersReducedMotion = useReducedMotion()

  const steps = [
    {
      num: '01',
      title: 'Choose Product',
      desc: 'Select from our wide range of premium printing products.',
      mainIcon: (
        <svg className="w-9 h-9 text-[#E55325]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      ),
      bottomIcon: <FiShoppingBag className="w-4 h-4 text-white" />,
      themeColor: '#E55325',
      badgeBorder: 'border-[#E55325]',
      badgeText: 'text-[#E55325]',
      waveFill: '#FCECE7',
      circleBg: 'bg-[#FCE6DF]',
      bottomBg: 'bg-[#E55325]',
    },
    {
      num: '02',
      title: 'Upload Design',
      desc: 'Upload your design or use our templates to create your own.',
      mainIcon: (
        <svg className="w-9 h-9 text-[#2462EA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 16l-4-4-4 4" />
          <path d="M12 12v9" />
          <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3" />
          <path d="M16 16l-4-4-4 4" />
        </svg>
      ),
      bottomIcon: <FiUploadCloud className="w-4 h-4 text-white" />,
      themeColor: '#2462EA',
      badgeBorder: 'border-[#2462EA]',
      badgeText: 'text-[#2462EA]',
      waveFill: '#EAF1FE',
      circleBg: 'bg-[#E0ECFE]',
      bottomBg: 'bg-[#2462EA]',
    },
    {
      num: '03',
      title: 'Review & Order',
      desc: 'Review your order and proceed to secure payment.',
      mainIcon: (
        <svg className="w-9 h-9 text-[#20A040]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      bottomIcon: <FiFileText className="w-4 h-4 text-white" />,
      themeColor: '#20A040',
      badgeBorder: 'border-[#20A040]',
      badgeText: 'text-[#20A040]',
      waveFill: '#EAF7EE',
      circleBg: 'bg-[#DFFAF]',
      circleBgStyle: '#DDF4E4',
      bottomBg: 'bg-[#20A040]',
    },
    {
      num: '04',
      title: 'We Print & Deliver',
      desc: 'We print with precision and deliver to your doorstep.',
      mainIcon: (
        <svg className="w-9 h-9 text-[#8936D7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      ),
      bottomIcon: <FiTruck className="w-4 h-4 text-white" />,
      themeColor: '#8936D7',
      badgeBorder: 'border-[#8936D7]',
      badgeText: 'text-[#8936D7]',
      waveFill: '#F4EAFB',
      circleBg: 'bg-[#EFE2FA]',
      bottomBg: 'bg-[#8936D7]',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.12,
        delayChildren: 0.15,
      },
    },
  }

  const stepVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section className="py-16 sm:py-20 bg-[#FAFBFD] font-sans border-b border-[#E7EAF0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header Matching Reference Image 100% */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E55325] inline-block" />
            <span className="h-[2px] w-8 bg-[#E55325] inline-block rounded-full" />
            <span className="text-[#E55325] text-[14px] font-extrabold tracking-widest uppercase px-1">
              SIMPLE 4-STEP JOURNEY
            </span>
            <span className="h-[2px] w-8 bg-[#E55325] inline-block rounded-full" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#E55325] inline-block" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-bold text-[#07152F] tracking-tight">
            How It Works
          </h2>
          <p className="text-[#667085] text-[16px] sm:text-[17px] font-normal mt-2 max-w-lg mx-auto leading-relaxed">
            Simple 4 steps to get your print products delivered to your doorstep.
          </p>

          {/* Underline Indicator */}
          <div className="w-12 h-1 bg-[#E55325] rounded-full mx-auto mt-4" />
        </div>

        {/* 4 Process Cards Grid */}
        <div className="relative">

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 relative z-10"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {steps.map((step, index) => (
              <div key={step.title} className="relative flex flex-col items-center pt-5">
                
                {/* Dotted Arrow Connector between cards (Desktop) */}
                {index < 3 && (
                  <div className="hidden lg:flex absolute top-[48%] -right-4 z-30 items-center text-slate-400">
                    <span className="text-[14px] font-bold tracking-[0.2em] text-slate-400">...</span>
                    <span className="text-sm font-bold text-slate-500 ml-0.5">→</span>
                  </div>
                )}

                {/* Top Number Badge Floating Above Card */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center">
                  <div className={`w-11 h-11 rounded-full bg-white border-[2px] ${step.badgeBorder} shadow-sm flex items-center justify-center text-[14px] font-black ${step.badgeText}`}>
                    {step.num}
                  </div>
                  {/* Small vertical connector line & dot */}
                  <div className="flex flex-col items-center -mt-0.5">
                    <div className={`w-[1.5px] h-3 ${step.bottomBg}`} />
                    <div className={`w-1.5 h-1.5 rounded-full ${step.bottomBg} -mt-0.5`} />
                  </div>
                </div>

                {/* Card Main Body Container */}
                <motion.div
                  variants={stepVariants}
                  className="group w-full bg-white rounded-[24px] border border-[#E7EAF0] shadow-sm hover:shadow-2xl transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 text-center flex flex-col items-center relative overflow-hidden pt-12 pb-8 px-5 min-h-[340px]"
                >
                  {/* Top-Left Wave Soft Pastel Background SVG */}
                  <svg className="absolute top-0 left-0 w-36 h-36 pointer-events-none" viewBox="0 0 120 120" fill="none">
                    <path d="M 0 0 L 120 0 C 95 35 60 70 0 85 Z" fill={step.waveFill} />
                  </svg>

                  {/* Central Large Icon Circle */}
                  <div
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 relative z-10 shadow-inner group-hover:scale-105 transition-transform duration-300 ${step.circleBg}`}
                    style={step.circleBgStyle ? { backgroundColor: step.circleBgStyle } : {}}
                  >
                    {step.mainIcon}
                  </div>

                  {/* Title & Description */}
                  <div className="relative z-10 mb-6 flex-1 flex flex-col justify-center">
                    <h3 className="text-[19px] font-bold text-[#07152F] mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-[#667085] text-[14.5px] font-normal leading-relaxed max-w-[210px] mx-auto">
                      {step.desc}
                    </p>
                  </div>

                  {/* Bottom Bar & Floating Badge Tab */}
                  <div className="w-full absolute bottom-0 inset-x-0">
                    {/* Solid Bottom Border Bar */}
                    <div className={`w-full h-[12px] ${step.bottomBg}`} />
                    
                    {/* Centered Floating Notch Tab Badge */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      {/* Top connector dot above tab */}
                      <div className={`w-1.5 h-1.5 rounded-full ${step.bottomBg} mb-0.5 opacity-60`} />
                      
                      {/* Tab Pill */}
                      <div className={`w-12 h-9 ${step.bottomBg} rounded-t-[14px] rounded-b-[10px] flex items-center justify-center shadow-md`}>
                        {step.bottomIcon}
                      </div>
                    </div>
                  </div>

                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Trust Card Banner Matching Reference Image 100% */}
        <div className="mt-16 max-w-5xl mx-auto bg-white rounded-2xl sm:rounded-full border border-[#E7EAF0] shadow-sm p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-gray-100 text-left sm:text-center lg:text-left">
            
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 justify-center py-2 sm:py-0 px-2">
              <div className="w-10 h-10 rounded-full bg-[#FCECE7] flex items-center justify-center flex-shrink-0 text-[#E55325]">
                <FiShield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#07152F] leading-snug">Secure Payments</h4>
                <p className="text-[14px] text-[#667085]">100% safe & secure</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 justify-center py-2 sm:py-0 px-2">
              <div className="w-10 h-10 rounded-full bg-[#EAF1FE] flex items-center justify-center flex-shrink-0 text-[#2462EA]">
                <FiAward className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#07152F] leading-snug">Premium Quality</h4>
                <p className="text-[14px] text-[#667085]">Top-notch printing</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 justify-center py-2 sm:py-0 px-2">
              <div className="w-10 h-10 rounded-full bg-[#EAF7EE] flex items-center justify-center flex-shrink-0 text-[#20A040]">
                <FiClock className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#07152F] leading-snug">On-time Delivery</h4>
                <p className="text-[14px] text-[#667085]">Right to your door</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-3.5 justify-center py-2 sm:py-0 px-2">
              <div className="w-10 h-10 rounded-full bg-[#F4EAFB] flex items-center justify-center flex-shrink-0 text-[#8936D7]">
                <FiHeadphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#07152F] leading-snug">Customer Support</h4>
                <p className="text-[14px] text-[#667085]">We're here to help</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  )
}