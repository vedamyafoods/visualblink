export function CredentialsBanner() {
  const credentials = [
    {
      id: 1,
      title: 'Premium Quality',
      description: 'Top-quality materials and advanced printing technology',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-7 h-7 text-[#E5AA17]">
          {/* Custom logo shield/print wheel look */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
      )
    },
    {
      id: 2,
      title: 'Fast Turnaround',
      description: 'Quick processing and on-time delivery',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-7 h-7 text-[#E5AA17]">
          {/* Custom clock with fast arrows */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 3,
      title: 'Free Design Check',
      description: 'Our experts review your design for perfect printing',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-7 h-7 text-[#E5AA17]">
          {/* Ruler and pencil design check */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
        </svg>
      )
    },
    {
      id: 4,
      title: 'Secure & Easy Payment',
      description: '100% secure transactions with multiple payment options',
      icon: (
        <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-7 h-7 text-[#E5AA17]">
          {/* Secure lock inside credit card / shield */}
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      )
    }
  ]

  return (
    <section className="py-12 bg-[#0b1426] text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {credentials.map((cred) => (
            <div key={cred.id} className="flex items-center gap-4 text-left">
              {/* Circular golden icon base */}
              <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#E5AA17]/70 flex items-center justify-center bg-[#0e1b33]">
                {cred.icon}
              </div>
              {/* Text info */}
              <div className="flex flex-col">
                <h3 className="text-sm sm:text-base font-black text-white tracking-wide">
                  {cred.title}
                </h3>
                <p className="text-[14px] sm:text-[14px] text-gray-400 font-medium leading-relaxed mt-1">
                  {cred.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
