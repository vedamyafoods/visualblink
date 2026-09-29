import { FiArrowRight } from 'react-icons/fi';

export function FeaturedProducts() {
  const popularProducts = [
    {
      id: 1,
      title: 'Visiting Cards',
      description: 'Custom designs',
      price: '₹199',
      // Replace with your actual image paths
      imageUrl: '/images/visiting-cards.png',
    },
    {
      id: 2,
      title: 'Pamphlets',
      description: 'High quality prints',
      price: '₹499',
      imageUrl: '/images/pamphlets.png',
    },
    {
      id: 3,
      title: 'Brochures',
      description: 'Various sizes',
      price: '₹699',
      imageUrl: '/images/brochures.png',
    },
    {
      id: 4,
      title: 'Flex Banners',
      description: 'Durable & vibrant',
      price: '₹299',
      imageUrl: '/images/flex-banners.png',
    },
    {
      id: 5,
      title: 'Bill Books',
      description: 'Numbered & carbonless',
      price: '₹199',
      imageUrl: '/images/bill-books.png',
    },
    {
      id: 6,
      title: 'Custom Design',
      description: 'Bring your ideas',
      price: '₹299',
      imageUrl: '/images/custom-design.png',
    }
  ];

  return (
    <section id="products" className="py-16 bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="flex items-center justify-between pb-6 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-wide uppercase">
            Popular Products
          </h2>
          <a
            href="#all-products"
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            View All Products <FiArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Horizontal Slider / Carousel */}
        {/* Added inline styles to hide the scrollbar for webkit and standard browsers */}
        <div
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Webkit scrollbar hiding via style block to ensure it works without global CSS changes */}
          <style dangerouslySetInnerHTML={{
            __html: `
            div::-webkit-scrollbar { display: none; }
          `}} />

          {popularProducts.map((prod) => (
            <div
              key={prod.id}
              className="min-w-[260px] max-w-[260px] sm:min-w-[280px] sm:max-w-[280px] snap-start bg-white rounded-[20px] border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col p-3 group"
            >
              {/* Image Container */}
              <div className="bg-[#F8F9FA] rounded-2xl h-[220px] w-full flex items-center justify-center p-4 mb-4 relative overflow-hidden">
                <img
                  src={prod.imageUrl}
                  alt={prod.title}
                  className="object-contain w-full h-full drop-shadow-sm group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              {/* Product Info */}
              <div className="px-2 pb-2 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900 leading-tight">
                    {prod.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1.5">
                    {prod.description}
                  </p>
                </div>

                {/* Price and Action Button */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-[15px] font-bold text-gray-900">
                    Starting at {prod.price}
                  </p>

                  <a
                    href={`#product-${prod.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="w-8 h-8 rounded-full bg-[#FFC107] text-black flex items-center justify-center font-bold hover:bg-[#e0a800] transition-colors"
                    aria-label={`Buy ${prod.title}`}
                  >
                    <FiArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}