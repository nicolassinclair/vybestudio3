import React, { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { HomePage } from './pages/HomePage';
import { getSeo } from './seo';
import { WhatsAppFab } from './components/WhatsAppFab';
const CatalogPage = lazy(() => import('./pages/CatalogPage').then(m => ({ default: m.CatalogPage })));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const PersonalizeHubPage = lazy(() => import('./pages/PersonalizeHubPage').then(m => ({ default: m.PersonalizeHubPage })));
const MugCustomizerPage = lazy(() => import('./pages/MugCustomizerPage').then(m => ({ default: m.MugCustomizerPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const ComoComprarPage = lazy(() => import('./pages/InfoPages').then(m => ({ default: m.ComoComprarPage })));
const FaqPage = lazy(() => import('./pages/InfoPages').then(m => ({ default: m.FaqPage })));
const TrocasPage = lazy(() => import('./pages/InfoPages').then(m => ({ default: m.TrocasPage })));
const PrivacidadePage = lazy(() => import('./pages/InfoPages').then(m => ({ default: m.PrivacidadePage })));
const TermosPage = lazy(() => import('./pages/InfoPages').then(m => ({ default: m.TermosPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const InspirationsPage = lazy(() => import('./pages/InspirationsPage').then(m => ({ default: m.InspirationsPage })));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const CustomerAccountPage = lazy(() => import('./pages/CustomerAccountPage').then(m => ({ default: m.CustomerAccountPage })));

// Scroll to top helper on route navigation
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Atualiza título e descrição a cada rota
const RouteSeo: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const { title, description } = getSeo(pathname);
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', description);
  }, [pathname]);
  return null;
};

const PageFallback: React.FC = () => (
  <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
    <span className="text-sm text-stone-500">Carregando…</span>
  </div>
);

export function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <RouteSeo />
          <WhatsAppFab />
          <div className="min-h-screen flex flex-col bg-paper text-[#111111] font-sans antialiased selection:bg-black selection:text-white">
            <Navbar onOpenSearch={() => setIsSearchOpen(true)} />

            <main className="flex-1">
              <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/produtos" element={<CatalogPage />} />
                <Route path="/produtos/:id" element={<ProductDetailPage />} />
                <Route path="/personalizar" element={<PersonalizeHubPage />} />
                <Route path="/personalizar/caneca" element={<MugCustomizerPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/cadastro" element={<RegisterPage />} />
                <Route path="/minha-conta" element={<CustomerAccountPage />} />
                <Route path="/esqueci-minha-senha" element={<ForgotPasswordPage />} />
                <Route path="/sobre" element={<AboutPage />} />
                <Route path="/contato" element={<ContactPage />} />
                <Route path="/inspiracoes" element={<InspirationsPage />} />
                <Route path="/como-comprar" element={<ComoComprarPage />} />
                <Route path="/perguntas-frequentes" element={<FaqPage />} />
                <Route path="/trocas-e-devolucoes" element={<TrocasPage />} />
                <Route path="/privacidade" element={<PrivacidadePage />} />
                <Route path="/termos" element={<TermosPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              </Suspense>
            </main>

            <Footer />

            {/* Cart slide-over drawer */}
            <CartDrawer />

            {/* Search modal popup */}
            <SearchModal
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
