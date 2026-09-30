import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
import PageTransition from './components/PageTransition';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Events from './pages/Events';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import BookConsultation from './pages/BookConsultation';
import Auth from './pages/Auth';
import ForgotPassword from './pages/ForgotPassword';
import VerifyEmail from './pages/VerifyEmail';
import NewsletterConfirm from './pages/NewsletterConfirm';
import TalentDashboard from './pages/TalentDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';

/**
 * The route table, keyed on the path so a navigation can cross-fade.
 *
 * The location is handed to Routes as well as used as the key: while the old
 * page is fading out, AnimatePresence keeps rendering the element it was given,
 * and React elements carry their props from the moment they were created. Pass
 * the new location in and the outgoing page would redraw as the incoming one.
 */
function AnimatedRoutes() {
  const location = useLocation();

  // The browser's own back/forward scroll restoration would land the outgoing
  // page somewhere else while it fades. This app scrolls itself, in the new
  // page's mount effect (see PageTransition).
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/consultation" element={<BookConsultation />} />
          <Route path="/book" element={<BookConsultation />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/verify" element={<VerifyEmail />} />
          <Route path="/newsletter/confirm" element={<NewsletterConfirm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/talent/dashboard" element={<TalentDashboard />} />
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}
