import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MobileActionBar from './MobileActionBar';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-cream">
        Skip to content
      </a>
      <Header />
      <main id="main" key={pathname} className="flex-1 animate-fadeIn">
        <Outlet />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
}
