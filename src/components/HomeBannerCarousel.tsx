import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HomeBanner } from '../types';
import { apiService } from '../services/apiService';

// Banners oficiais padrão (carregamento imediato no primeiro frame)
const DEFAULT_BANNERS: HomeBanner[] = [
  {
    id: 'banner-primeira-compra',
    name: 'Primeira Compra 20% OFF',
    desktopImage: '/images/banners/banner_primeiravybe.png',
    mobileImage: '/images/banners/banner_primeiravybe.png',
    targetUrl: '/personalizar/caneca',
    altText: 'Banner promocional da primeira compra com cupom PRIMEIRAVYBE e 20% de desconto',
    order: 1,
    active: true,
  },
  {
    id: 'banner-catalogo-vybe',
    name: 'Catálogo VYBE Studio',
    desktopImage: '/images/banners/banner_catalogo.png',
    mobileImage: '/images/banners/banner_catalogo.png',
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Carrega banners da API compartilhada
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

  // Reprodução automática a cada 6 segundos (6000ms), pausada em caso de interação
  useEffect(() => {
    if (totalBanners <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextBanner();
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [totalBanners, isPaused, nextBanner]);

  // Gestos de toque (Touch swipe) para dispositivos móveis
  const minSwipeDistance = 40;

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

  return (
    <section
      className="w-full pt-4 sm:pt-6 pb-2 select-none"
      aria-label="Carrossel de banners promocionais da VYBE Studio"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Contêiner centralizado proporcional com largura máxima ajustada à resolução real (1280px-1440px) */}
      <div className="mx-auto max-w-[1360px] px-3 sm:px-6 lg:px-8">
        <div className="relative w-full aspect-[1280/427] overflow-hidden rounded-[14px] bg-stone-100/60 shadow-xs border border-stone-200/50">
          {banners.map((banner, index) => {
            const isActive = index === currentIndex;
            const imageElement = (
              <picture className="block w-full h-full">
                {banner.mobileImage && (
                  <source media="(max-width: 640px)" srcSet={banner.mobileImage} />
                )}
                <img
                  src={banner.desktopImage}
                  alt={banner.altText}
                  className="w-full h-full object-contain block"
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

          {/* Setas Laterais circulares (36 a 40px, centralizadas verticalmente sobre a imagem) */}
          {totalBanners > 1 && (
            <>
              <button
                type="button"
                onClick={prevBanner}
                aria-label="Banner anterior"
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={nextBanner}
                aria-label="Próximo banner"
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicadores Discretos integrados à imagem (16 a 20px da borda inferior) */}
          {totalBanners > 1 && (
            <div
              className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-xs shadow-xs"
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
                        ? 'w-6 sm:w-7 bg-white shadow-xs'
                        : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
