import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Layout from './components/Layout';
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
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
        </Layout>
      </AuthProvider>
      <Analytics />
    </BrowserRouter>
  );
}
