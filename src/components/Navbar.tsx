import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Shield, Menu, X, User, LogOut, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const location = useLocation();
  const { totalItems, openCart } = useCart();
  const { customer, customerLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Produtos', path: '/produtos' },
    { name: 'Personalizar', path: '/personalizar' },
    { name: 'Sobre', path: '/sobre' },
    { name: 'Contato', path: '/contato' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Fechar menu ao mudar de rota
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [location.pathname, location.search]);

  // Fechar dropdown de usuário ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fechar menu ao pressionar Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Zona 1: Botão das 3 Listras (lado esquerdo da logo) + Logo Oficial */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
              className="inline-flex h-11 w-11 items-center justify-center text-stone-700 hover:text-black hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Logo oficial, centralizada no cabeçalho */}
          <Link
            to="/"
            className="absolute left-1/2 flex -translate-x-1/2 items-center py-1 transition-opacity hover:opacity-85"
            aria-label="VYBE Studio - Página Inicial"
          >
            <img
              src="/images/logo.png"
              alt="VYBE Studio"
              className="h-7 w-auto object-contain min-[400px]:h-8 sm:h-10 md:h-11"
              loading="eager"
            />
          </Link>

          {/* Zona 3: Ações primárias (Busca, Conta do Cliente, Carrinho) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Busca */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Buscar produtos"
              className="inline-flex h-11 w-11 items-center justify-center text-stone-700 hover:text-black hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Menu de Conta do Cliente (Seção 9 do briefing) */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserDropdownOpen(prev => !prev)}
                aria-expanded={userDropdownOpen}
                aria-label="Opções de conta do cliente"
                className={`inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors cursor-pointer ${
                  customer
                    ? 'text-black bg-stone-100 hover:bg-stone-200'
                    : 'text-stone-700 hover:text-black hover:bg-stone-100'
                }`}
              >
                <User className="w-5 h-5" />
              </button>

              {/* Dropdown desktop */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-stone-200 shadow-xl py-2 z-50 text-xs">
                  {customer ? (
                    <>
                      <div className="px-4 py-2 border-b border-stone-100">
                        <p className="font-semibold text-stone-900 truncate">{customer.name}</p>
                        <p className="text-[11px] text-stone-400 truncate">{customer.email}</p>
                      </div>

                      <Link
                        to="/minha-conta"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-stone-50 hover:text-black font-medium transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>Minha conta</span>
                      </Link>

                      <Link
                        to="/minha-conta"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-stone-700 hover:bg-stone-50 hover:text-black font-medium transition-colors"
                      >
                        <Package className="w-3.5 h-3.5 text-stone-500" />
                        <span>Meus pedidos</span>
                      </Link>

                      <div className="pt-1 mt-1 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            customerLogout();
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-left font-medium transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sair</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-1.5 border-b border-stone-100">
                        <p className="font-semibold text-stone-900">Conta do Cliente</p>
                      </div>

                      <Link
                        to="/login"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-stone-800 hover:bg-stone-50 font-semibold transition-colors"
                      >
                        <span>Entrar</span>
                      </Link>

                      <Link
                        to="/cadastro"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-stone-600 hover:bg-stone-50 font-medium transition-colors"
                      >
                        <span>Criar conta</span>
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Carrinho */}
            <button
              type="button"
              onClick={openCart}
              aria-label="Carrinho de compras"
              className="flex min-h-11 items-center gap-2 px-3 py-2 text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold uppercase tracking-wider">
                Carrinho
              </span>
            </button>
          </div>
        </div>

        {/* Links desktop */}
        <nav className="hidden lg:flex items-center justify-center gap-8 pb-3 text-sm font-medium text-stone-600">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition-colors hover:text-[#111111] py-1 relative ${
                isActive(link.path)
                  ? 'text-[#111111] font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#111111]'
                  : 'text-stone-600'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Menu / Drawer responsivo com opções integradas no celular */}
      {mobileMenuOpen && (
        <div className="vybe-drop border-t border-stone-200 bg-snow px-4 pt-3 pb-6 space-y-4 shadow-lg max-h-[85vh] overflow-y-auto">
          {/* Seção do Usuário no celular */}
          <div className="p-3 bg-white rounded-xl border border-stone-200">
            {customer ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center font-bold text-xs text-stone-800">
                    {customer.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-900 truncate">{customer.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{customer.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-medium">
                  <Link
                    to="/minha-conta"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-800 text-center"
                  >
                    Minha Conta
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      customerLogout();
                    }}
                    className="p-2 rounded-lg bg-rose-50 text-rose-700 text-center"
                  >
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-center">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-black text-white"
                >
                  Entrar
                </Link>
                <Link
                  to="/cadastro"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800"
                >
                  Criar conta
                </Link>
              </div>
            )}
          </div>

          {/* Abas Principais */}
          <div className="space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-stone-100 text-black font-semibold'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-stone-600 hover:text-black text-sm"
            >
              <Shield className="w-4 h-4" />
              <span>Painel Administrativo</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
