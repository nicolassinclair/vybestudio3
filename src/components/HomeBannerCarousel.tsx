import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { HomeBanner } from '../types';
import { apiService } from '../services/apiService';

// Banners oficiais iniciais da VYBE Studio
const DEFAULT_BANNERS: HomeBanner[] = [
  {
    id: 'banner-primeira-compra',
    name: 'Primeira Compra 20% OFF',
    desktopImage: 'https://i.postimg.cc/yxrrKP0f/Chat-GPT-Image-24-de-set-de-2026-11-14-29.png',
    mobileImage: '',
    targetUrl: '/personalizar/caneca',
    altText: 'Banner promocional da primeira compra com cupom PRIMEIRAVYBE e 20% de desconto',
    order: 1,
    active: true,
  },
  {
    id: 'banner-catalogo-vybe',
    name: 'Catálogo VYBE Studio',
    desktopImage: 'https://i.postimg.cc/HnQ4Z9B0/Chat-GPT-Image-24-de-set-de-2026-11-22-33.png',
    mobileImage: '',
    targetUrl: '/produtos',
    altText: 'Banner do catálogo com canecas, camisas e presentes personalizados',
    order: 2,
    active: true,
  },
];

interface HomeBannerCarouselProps {
  initialBanners?: HomeBanner[];
}

export const HomeBannerCarousel: React.FC<HomeBannerCarouselProps> = ({ initialBanners }) => {
  const [banners, setBanners] = useState<HomeBanner[]>(
    initialBanners && initialBanners.length > 0 ? initialBanners : DEFAULT_BANNERS
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  // Touch gesture states
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Modal de zoom para consulta detalhada de informações em dispositivos móveis
  const [zoomBanner, setZoomBanner] = useState<HomeBanner | null>(null);

  // Monitora redimensionamento de tela para proporção correta
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carrega banners da API compartilhada com ordenação
  useEffect(() => {
    let isMounted = true;
    apiService.getBanners().then(data => {
      if (isMounted) {
        const activeOnly = data.filter(b => b.active).sort((a, b) => a.order - b.order);
        if (activeOnly.length > 0) {
          setBanners(activeOnly);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const totalBanners = banners.length;

  const nextBanner = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentIndex(prev => (prev + 1) % totalBanners);
  }, [totalBanners]);

  const prevBanner = useCallback(() => {
    if (totalBanners <= 1) return;
    setCurrentIndex(prev => (prev - 1 + totalBanners) % totalBanners);
  }, [totalBanners]);

  const goToBanner = (index: number) => {
    setCurrentIndex(index);
  };

  // Reprodução automática a cada 6 segundos, pausada durante interação
  useEffect(() => {
    if (totalBanners <= 1 || isPaused || zoomBanner) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextBanner();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalBanners, isPaused, zoomBanner, nextBanner]);

  // Gestos de toque horizontal (Touch swipe)
  const minSwipeDistance = 35;

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) {
      setIsPaused(false);
      return;
    }
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextBanner();
    } else if (isRightSwipe) {
      prevBanner();
    }

    setTimeout(() => setIsPaused(false), 2000);
  };

  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex] || banners[0];
  const hasMobileSpecific = Boolean(isMobile && currentBanner.mobileImage);

  return (
    <section
      className="hero-carousel w-full pt-3 sm:pt-5 pb-2 select-none"
      aria-label="Carrossel de banners promocionais da VYBE Studio"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Contêiner centralizado e responsivo */}
      <div className="mx-auto max-w-[1360px] px-3 sm:px-6 lg:px-8">
        <div
          className={`relative w-full overflow-hidden rounded-[14px] sm:rounded-2xl bg-stone-100/70 shadow-xs border border-stone-200/50 transition-all duration-300 ${
            hasMobileSpecific
              ? 'aspect-[4/5] sm:aspect-[1280/427]'
              : 'aspect-[1280/427]'
          }`}
        >
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;
            const hasMobileImg = Boolean(banner.mobileImage);

            const imageElement = (
              <picture className="block w-full h-full">
                {hasMobileImg && (
                  <source media="(max-width: 639px)" srcSet={banner.mobileImage} />
                )}
                <img
                  src={banner.desktopImage}
                  alt={banner.altText}
                  className="hero-carousel__image w-full h-full object-contain block transition-transform duration-300"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  draggable={false}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (banner.id.includes('primeira') || banner.desktopImage.includes('primeiravybe')) {
                      target.src = 'https://i.postimg.cc/yxrrKP0f/Chat-GPT-Image-24-de-set-de-2026-11-14-29.png';
                    } else if (banner.id.includes('catalogo') || banner.desktopImage.includes('catalogo')) {
                      target.src = 'https://i.postimg.cc/HnQ4Z9B0/Chat-GPT-Image-24-de-set-de-2026-11-22-33.png';
                    }
                  }}
                />
              </picture>
            );

            return (
              <div
                key={banner.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
                aria-hidden={!isActive}
              >
                {banner.targetUrl ? (
                  <Link
                    to={banner.targetUrl}
                    className="block w-full h-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-black rounded-[14px]"
                    aria-label={banner.name}
                    tabIndex={isActive ? 0 : -1}
                  >
                    {imageElement}
                  </Link>
                ) : (
                  <div className="w-full h-full">{imageElement}</div>
                )}
              </div>
            );
          })}

          {/* Botão Discreto de Consulta / Ampliação de Informações no Mobile (Seção 20) */}
          {isMobile && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setZoomBanner(currentBanner);
              }}
              aria-label="Ampliar informações do banner para leitura"
              className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 text-white text-[11px] font-medium backdrop-blur-xs shadow-xs transition-colors cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Ampliar</span>
            </button>
          )}

          {/* Setas Laterais de Navegação (32px a 36px no mobile, discretas e sem sobrepor cupons) */}
          {totalBanners > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevBanner();
                }}
                aria-label="Banner anterior"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextBanner();
                }}
                aria-label="Próximo banner"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </>
          )}

          {/* Indicadores Discretos posicionados com segurança */}
          {totalBanners > 1 && (
            <div
              className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs shadow-xs"
              role="tablist"
              aria-label="Controle de slides de banners"
            >
              {banners.map((banner, index) => {
                const isSelected = index === currentIndex;
                return (
                  <button
                    key={banner.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    aria-label={`Ir para o banner ${index + 1}: ${banner.name}`}
                    onClick={() => goToBanner(index)}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? 'w-5 sm:w-7 bg-white shadow-xs'
                        : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE ZOOM / LEITURA DO BANNER NO MOBILE (Seção 20 do briefing)        */}
      {/* ========================================================================= */}
      {zoomBanner && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`Visualização detalhada: ${zoomBanner.name}`}
          onClick={() => setZoomBanner(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="min-w-0 pr-4">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                  {zoomBanner.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Visualização em alta resolução para leitura de condições e cupons.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomBanner(null)}
                aria-label="Fechar visualização ampliada"
                className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-full cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full bg-stone-50 rounded-xl overflow-hidden border border-stone-200 p-2">
              <img
                src={
                  isMobile && zoomBanner.mobileImage
                    ? zoomBanner.mobileImage
                    : zoomBanner.desktopImage
                }
                alt={zoomBanner.altText}
                className="w-full h-auto object-contain max-h-[70vh] mx-auto select-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-stone-500">
                Toque duas vezes ou pince para ampliar no dispositivo.
              </span>
              {zoomBanner.targetUrl && (
                <Link
                  to={zoomBanner.targetUrl}
                  onClick={() => setZoomBanner(null)}
                  className="px-4 py-2 bg-black text-white font-semibold rounded-xl hover:bg-stone-800 transition-colors"
                >
                  Acessar promoção
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
