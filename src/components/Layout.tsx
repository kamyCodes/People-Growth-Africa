import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ConsultationModal from './ConsultationModal';
import WhatsAppConcierge from './WhatsAppConcierge';
import { ConsultationProvider } from '../context/ConsultationContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ConsultationProvider>
      <div className="min-h-screen flex flex-col relative">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <ConsultationModal />
        <WhatsAppConcierge />
      </div>
    </ConsultationProvider>
  );
}
