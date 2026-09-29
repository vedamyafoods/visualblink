import { Hero } from '../Components/sections/Hero'
import { CategoryNav } from '../Components/sections/CategoryNav'
import { ShopByCategory } from '../Components/sections/ShopByCategory'
import { Industries } from '../Components/sections/Industries'
import { WhyChooseUs } from '../Components/sections/WhyChooseUs'
import { HowItWorks } from '../Components/sections/HowItWorks'
import { StatsBanner } from '../Components/sections/StatsBanner'
import { DiscountCTA } from '../Components/sections/DiscountCTA'
import { Testimonials } from '../Components/sections/Testimonials'
import { LatestBlog } from '../Components/sections/LatestBlog'

export function HomePage({ setCurrentPage }) {
  return (
    <main className="overflow-hidden bg-white">
      {/* 1. Hero Section — Light warm split layout */}
      <section id="hero">
        <Hero setCurrentPage={setCurrentPage} />
      </section>

      {/* 2. Category Nav Strip — Horizontal icon strip immediately under Hero */}
      <section id="category-nav">
        <CategoryNav setCurrentPage={setCurrentPage} />
      </section>

      {/* 3. Shop by Category — 8 Product Cards Grid */}
      <section id="categories">
        <ShopByCategory setCurrentPage={setCurrentPage} />
      </section>

      {/* 4. Built for Your Business — Industry Use-cases */}
      <section id="business-solutions">
        <Industries setCurrentPage={setCurrentPage} />
      </section>

      {/* 5. Why Choose Us — 4 Feature Columns with vertical dividers */}
      <section id="why-choose-us">
        <WhyChooseUs />
      </section>

      {/* 6. How It Works — 4 Horizontal Steps */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* 7. Stats Banner — Full-width Dark Navy section */}
      <section id="stats">
        <StatsBanner />
      </section>

      {/* 8. Promotional Offer Banner — 20% OFF Promo panel */}
      <section id="cta">
        <DiscountCTA setCurrentPage={setCurrentPage} />
      </section>

      {/* 9. Testimonials — What Our Customers Say */}
      <section id="testimonials">
        <Testimonials />
      </section>

      {/* 10. Latest from Our Blog */}
      <section id="blog">
        <LatestBlog setCurrentPage={setCurrentPage} />
      </section>
    </main>
  )
}
