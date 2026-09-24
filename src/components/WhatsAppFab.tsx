import React from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

export const WhatsAppFab: React.FC = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname.startsWith('/checkout')) return null;

  const settings = storageService.getSettings();
  const msg = `Olá! Vim pelo site da ${settings.storeName} e gostaria de ajuda.`;
  const url = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  // Na página de produto existe uma barra fixa no celular: sobe o botão para não sobrepor
  const lift = pathname.startsWith('/produtos/') ? 'bottom-24 lg:bottom-6' : 'bottom-5 sm:bottom-6';

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a VYBE Studio no WhatsApp"
      className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-lg transition-transform duration-200 hover:scale-105 sm:right-6 ${lift}`}
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
};
