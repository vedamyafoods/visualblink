import { useState } from 'react'
import { FiUploadCloud, FiCheckCircle, FiSend, FiFileText } from 'react-icons/fi'
import { addOrderToFirestore, addDesignRequestToFirestore } from '../services/firebase'

export function CustomQuotePage() {
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    productType: 'Custom Packaging Box',
    quantity: '500',
    dimensions: '10 x 8 x 4 inches',
    paperStock: '350gsm Premium Matte',
    finishes: 'Gold Foil + Spot UV',
    notes: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)

    const orderId = `PRT-${Math.floor(10000 + Math.random() * 90000)}`
    const newOrderData = {
      id: orderId,
      customer: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || 'Enterprise Quote Client',
        isB2B: true,
        creditNet15: false
      },
      items: [
        {
          productName: formData.productType,
          variant: `${formData.paperStock} | ${formData.finishes}`,
          quantity: parseInt(formData.quantity) || 500,
          unitPrice: 25,
          total: (parseInt(formData.quantity) || 500) * 25
        }
      ],
      subtotal: (parseInt(formData.quantity) || 500) * 25,
      shippingFee: 0,
      gstAmount: Math.round(((parseInt(formData.quantity) || 500) * 25) * 0.18),
      totalAmount: Math.round(((parseInt(formData.quantity) || 500) * 25) * 1.18),
      status: 'Artwork Verification',
      isExpress: false,
      deliveryMethod: 'Pan-India BlueDart Express',
      deliveryAddress: 'Corporate Office Address',
      artworkFile: {
        fileName: 'custom_quote_brief.pdf',
        fileType: 'pdf',
        dimensions: formData.dimensions || 'Standard',
        resolutionDpi: 300,
        cmykVerified: true,
        previewUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600'
      },
      notes: formData.notes
    }

    // Add live order and design ticket to Firestore
    await addOrderToFirestore(newOrderData)
    await addDesignRequestToFirestore({
      id: `DSGN-${Math.floor(100 + Math.random() * 900)}`,
      orderId: orderId,
      customerName: `${formData.name} (${formData.company || 'Direct'})`,
      phone: formData.phone,
      product: formData.productType,
      brief: formData.notes || `Custom dimensions: ${formData.dimensions}. Stock: ${formData.paperStock}. Finishes: ${formData.finishes}`,
      assignedDesigner: null,
      status: 'Assigned',
      proofUrl: null,
      fee: 299
    })

    setTimeout(() => {
      setSubmitted(false)
      setFormData({
        name: '', company: '', email: '', phone: '',
        productType: 'Custom Packaging Box', quantity: '500',
        dimensions: '', paperStock: '350gsm Premium Matte',
        finishes: 'Gold Foil + Spot UV', notes: ''
      })
    }, 4000)
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
            <span className="text-[#FF5A1F] font-bold">Custom Quote</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-3">
            Instant Custom Print Quote
          </h1>
          <p className="text-slate-300 text-[15px] max-w-2xl leading-relaxed">
            Need bespoke box dimensions, specialized foil leafing, or bulk offset press runs? Request a detailed enterprise estimate.
          </p>
        </div>
      </section>

      {/* Quote Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-[20px] p-8 sm:p-12 border border-[#E7EAF0] shadow-sm">
          <h2 className="text-2xl font-extrabold text-[#0B1633] mb-2">Enterprise Print Estimator</h2>
          <p className="text-[#667085] text-[14px] mb-8">Specify your exact artwork dimensions, stock weight, and volume to get a formal quote within 1 hour.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Acme Corp"
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 00000 00000"
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-[#E7EAF0]">
              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Product Type</label>
                <select
                  value={formData.productType}
                  onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                >
                  <option>Custom Packaging Box</option>
                  <option>Business Cards</option>
                  <option>Brochures & Catalogs</option>
                  <option>Large Outdoor Banners</option>
                  <option>Stickers & Labels</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Required Quantity</label>
                <input
                  type="text"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="e.g. 1000"
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>

              <div>
                <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Custom Dimensions</label>
                <input
                  type="text"
                  value={formData.dimensions}
                  onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                  placeholder="e.g. 10 x 8 x 4 inches"
                  className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
                />
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-[14px] font-bold text-[#0B1633] mb-1.5">Additional Print Notes & Finishing Requests</label>
              <textarea
                rows="4"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mention specific Pantone colors, spot UV placement, embossing, or delivery deadlines..."
                className="w-full bg-[#F7F8FA] border border-[#E7EAF0] rounded-[10px] py-3 px-4 text-[14px] text-[#0B1633] focus:outline-none focus:border-[#FF5A1F]"
              />
            </div>

            <button
              type="submit"
              className="bg-[#FF5A1F] hover:bg-[#e44d15] text-white font-extrabold text-[14px] px-8 py-3.5 rounded-[12px] transition border-none cursor-pointer flex items-center gap-2 shadow-md shadow-[#FF5A1F]/20"
            >
              {submitted ? (
                <>
                  <FiCheckCircle className="w-4 h-4 text-emerald-300" /> Transmitted to Admin Pipeline!
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4" /> Request Custom Quote & Submit to Admin
                </>
              )}
            </button>
          </form>
        </div>
      </div>

    </div>
  )
}
