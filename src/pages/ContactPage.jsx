import { useState } from 'react'
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend, FiCheck } from 'react-icons/fi'

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setFormData({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' })
    }, 3000)
  }

  return (
    <div className="bg-[#FAFBFD] font-sans min-h-screen text-[#0B1633]">
      
      {/* Page Hero Header — Deep Navy #07152F */}
      <section className="bg-[#07152F] text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-[#FF5A1F]/10 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start text-[14px] font-semibold text-slate-400">
            <span>Home</span>
            <span>/</span>
            <span className="text-[#FF5A1F] font-bold">Contact Us</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Get in Touch
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Have questions about custom printing, paper stocks, or bulk enterprise quotes? Our team is here to assist.
          </p>
        </div>
      </section>

      {/* Main Form & Info Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Contact Info Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#07152F] text-white rounded-[20px] p-7 border border-slate-800 shadow-xl relative overflow-hidden">
              <span className="text-[#FF5A1F] text-[14px] font-extrabold tracking-widest uppercase mb-2 block">
                DIRECT CONTACT
              </span>
              <h3 className="text-2xl font-extrabold text-white mb-6">Contact Details</h3>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                    <FiMapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white leading-snug">Studio Address</h4>
                    <p className="text-[#909AB0] text-[14px]">123 Print Street, Indiana MP 61801</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                    <FiPhone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white leading-snug">Phone Number</h4>
                    <p className="text-[#909AB0] text-[14px]">+91 12345-67-891</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                    <FiMail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white leading-snug">Email Address</h4>
                    <p className="text-[#909AB0] text-[14px]">hello@printo.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-[12px] bg-white/10 flex items-center justify-center text-[#FF5A1F] flex-shrink-0">
                    <FiClock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-bold text-white leading-snug">Working Hours</h4>
                    <p className="text-[#909AB0] text-[14px]">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-[20px] p-8 sm:p-10 border border-[#E7EAF0] shadow-sm">
            <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2">Send Us a Message</h2>
            <p className="text-[#667085] text-[14px] mb-6">Fill out the form below and our print consultants will reply within 2 business hours.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 00000 00000"
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Inquiry Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-medium"
                  >
                    <option>General Inquiry</option>
                    <option>Bulk Order Quote</option>
                    <option>Sample Kit Request</option>
                    <option>Design & Proofing Help</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Message Details *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your printing requirements or questions..."
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F] font-medium"
                />
              </div>

              <button
                type="submit"
                className="bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] px-8 py-3.5 rounded-[12px] transition-all border-none cursor-pointer flex items-center gap-2 shadow-md shadow-[#FF5A1F]/20"
              >
                {submitted ? (
                  <>
                    <FiCheck className="w-4 h-4" /> Message Sent!
                  </>
                ) : (
                  <>
                    <FiSend className="w-4 h-4" /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>

    </div>
  )
}
