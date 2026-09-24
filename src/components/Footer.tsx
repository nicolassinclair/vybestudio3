import React from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';

export const Footer: React.FC = () => {
  const settings = storageService.getSettings();

  return (
    <footer className="bg-[#111111] text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          {/* Brand & Slogan */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center px-4 py-2 rounded-xl bg-white hover:opacity-90 transition-opacity">
              <img
                src="/images/logo.png"
                alt={settings.storeName}
                className="h-9 sm:h-11 w-auto max-w-[190px] sm:max-w-[220px] object-contain"
                loading="lazy"
              />
            </Link>
            <p className="text-stone-400 text-sm max-w-sm leading-relaxed">
              {settings.slogan}
            </p>
            <div className="text-xs text-stone-500 pt-1 space-y-1">
              <p>Estúdio criativo especializado em produtos personalizados sob demanda.</p>
              <p>Atendimento direto e personalizado via WhatsApp.</p>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Navegação
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/produtos" className="hover:text-white transition-colors">Produtos</Link>
              </li>
              <li>
                <Link to="/personalizar" className="hover:text-white transition-colors">Personalizar</Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link>
              </li>
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Institucional
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">Sobre</Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">Contato</Link>
              </li>
              <li>
                <Link to="/como-comprar" className="hover:text-white transition-colors">Como comprar</Link>
              </li>
              <li>
                <Link to="/perguntas-frequentes" className="hover:text-white transition-colors">Perguntas frequentes</Link>
              </li>
              <li>
                <Link to="/trocas-e-devolucoes" className="hover:text-white transition-colors">Trocas e devoluções</Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-white transition-colors">Privacidade</Link>
              </li>
              <li>
                <Link to="/termos" className="hover:text-white transition-colors">Termos de uso</Link>
              </li>
            </ul>
          </div>

          {/* Atendimento */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
              Atendimento
            </h4>
            <div className="space-y-2.5 text-sm">
              <p className="text-stone-300">
                <span className="block text-xs text-stone-500">WhatsApp:</span>
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors font-medium text-white"
                >
                  {settings.whatsappDisplay}
                </a>
              </p>
              <p className="text-stone-300">
                <span className="block text-xs text-stone-500">Instagram:</span>
                <span className="text-stone-300">{settings.instagram}</span>
              </p>
              <p className="text-stone-300">
                <span className="block text-xs text-stone-500">E-mail:</span>
                <span className="text-stone-300">{settings.email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {settings.storeName}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link to="/termos" className="hover:text-stone-300 transition-colors">Termos de uso</Link>
            <span aria-hidden="true">·</span>
            <Link to="/privacidade" className="hover:text-stone-300 transition-colors">Privacidade</Link>
            <span aria-hidden="true">·</span>
            <Link to="/contato" className="hover:text-stone-300 transition-colors">Fale Conosco</Link>
            <span aria-hidden="true">·</span>
            <Link to="/admin" className="hover:text-stone-300 transition-colors">Gestão da Loja</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
