import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CommandPalette } from './Components/layout/CommandPalette'
import { CursorGlow } from './Components/layout/CursorGlow'
import { FloatingActions } from './Components/layout/FloatingActions'
import { Footer } from './Components/layout/Footer'
import { Navbar } from './Components/layout/Navbar'
import { useLenis } from './hooks/useLenis'
import { useScrollProgress } from './hooks/useScrollProgress'
import { HomePage } from './pages/HomePage'

// Sub pages imports
import { ProductsPage } from './pages/ProductsPage'
import { ServicesPage } from './pages/ServicesPage'
import { TemplatesPage } from './pages/TemplatesPage'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { TrackOrderPage } from './pages/TrackOrderPage'
import { HelpCenterPage } from './pages/HelpCenterPage'
import { BlogPage } from './pages/BlogPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderSuccessPage } from './pages/OrderSuccessPage'
import { OrdersPage } from './pages/OrdersPage'
import { OrderDetailsPage } from './pages/OrderDetailsPage'
import { CustomQuotePage } from './pages/CustomQuotePage'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { AccountPage } from './pages/AccountPage'
import { AdminApp } from './admin/AdminApp'

import { AuthProvider } from './context/AuthContext'
import { AuthModal } from './Components/auth/AuthModal'

function AppContent() {
  const [darkMode, setDarkMode] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const progress = useScrollProgress()
  useLenis()

  // Initial page state resolved from pathname, searchParams (?page=...), or hash
  const getPageFromUrl = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    if (pageParam) return pageParam;

    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || path.startsWith('/admin/')) return 'admin';
    return 'home';
  };

  const [currentPage, setCurrentPageState] = useState(getPageFromUrl);

  // Synchronize state with URL and browser history (pushState)
  const setCurrentPage = (page, extraParams = {}, fragment = '') => {
    setCurrentPageState(page);
    try {
      const url = new URL(window.location.href);
      if (page === 'admin') {
        url.pathname = '/admin';
      } else {
        url.pathname = '/';
      }

      // Reset search params to only include 'page' and explicit extraParams
      url.search = '';
      url.searchParams.set('page', page);

      // Update additional query params if provided
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.set(k, v);
        }
      });

      // Update URL hash fragment if provided
      if (fragment) {
        url.hash = fragment.startsWith('#') ? fragment : `#${fragment}`;
      } else {
        url.hash = '';
      }

      window.history.pushState(null, '', url.toString());
      window.dispatchEvent(new Event('popstate'));
      window.dispatchEvent(new Event('urlchange'));
    } catch (e) {}
  };

  // Sync state on browser back/forward buttons (popstate, urlchange & hashchange)
  useEffect(() => {
    const handleUrlChange = () => {
      const page = getPageFromUrl();
      setCurrentPageState(page);

      // Handle smooth scrolling for hash fragments if present
      if (window.location.hash) {
        const targetId = window.location.hash.replace('#', '');
        const el = document.getElementById(targetId);
        if (el) {
          setTimeout(() => {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('urlchange', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('urlchange', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Smooth scroll to fragment if present when currentPage mounts
  useEffect(() => {
    if (window.location.hash) {
      const targetId = window.location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      } else {
        window.scrollTo(0, 0);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(true)
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (currentPage === 'admin') {
    return <AdminApp />
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative selection:bg-purple-500 selection:text-white">
      {/* Top Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-purple-500 via-pink-500 to-[#FF5A1F] z-50 transform-gpu origin-left"
        style={{ scaleX: progress }}
      />

      <CursorGlow />

      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="flex-1">
        {currentPage === 'home' && <HomePage setCurrentPage={setCurrentPage} />}
        {currentPage === 'products' && (
          <ProductsPage
            onNavigateCart={() => setCurrentPage('cart')}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === 'services' && <ServicesPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'templates' && <TemplatesPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'about' && <AboutPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'contact' && <ContactPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'track' && <TrackOrderPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'help' && <HelpCenterPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'blog' && <BlogPage setCurrentPage={setCurrentPage} />}
        {currentPage === 'cart' && (
          <CartPage
            onNavigateCheckout={() => setCurrentPage('checkout')}
            onNavigateProducts={() => setCurrentPage('products')}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === 'checkout' && (
          <CheckoutPage
            onSuccess={() => setCurrentPage('order-success')}
            onNavigateCart={() => setCurrentPage('cart')}
          />
        )}
        {currentPage === 'order-success' && (
          <OrderSuccessPage
            onNavigateHome={() => setCurrentPage('home')}
            onNavigateOrders={() => setCurrentPage('orders')}
          />
        )}
        {currentPage === 'orders' && (
          <OrdersPage
            onNavigateHome={() => setCurrentPage('home')}
            onNavigateDetails={(orderId) => setCurrentPage('order-details', { id: orderId })}
          />
        )}
        {currentPage === 'order-details' && (
          <OrderDetailsPage
            onBack={() => setCurrentPage('orders')}
          />
        )}
        {currentPage === 'quote' && (
          <CustomQuotePage
            onNavigateHome={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'login' && (
          <LoginPage
            onNavigateSignup={() => setCurrentPage('signup')}
            onSuccess={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'signup' && (
          <SignupPage
            onNavigateLogin={() => setCurrentPage('login')}
            onSuccess={() => setCurrentPage('home')}
          />
        )}
        {currentPage === 'account' && (
          <AccountPage
            onNavigateOrders={() => setCurrentPage('orders')}
          />
        )}
      </main>

      <Footer setCurrentPage={setCurrentPage} />

      <FloatingActions
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        setCommandOpen={setCommandOpen}
      />

      <CommandPalette
        isOpen={commandOpen}
        onClose={() => setCommandOpen(false)}
        setCurrentPage={setCurrentPage}
      />

      <AuthModal />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
