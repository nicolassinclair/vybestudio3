import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

export const FeaturedCarousel: React.FC<{ products: Product[] }> = ({ products }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update, products.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (products.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Novos destaques em breve. <Link to="/produtos" className="font-semibold text-ink underline underline-offset-4">Veja o catálogo completo</Link>.
      </p>
    );
  }

  const arrow =
    'absolute top-[38%] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-stone-200 bg-paper text-ink shadow-sm transition-colors hover:border-ink md:flex';

  return (
    <div className="relative" role="region" aria-roledescription="carrossel" aria-label="Produtos em destaque">
      {canPrev && (
        <button type="button" onClick={() => scrollByPage(-1)} aria-label="Produtos anteriores" className={`${arrow} -left-5`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div
        ref={ref}
        onScroll={update}
        className="-mx-5 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden motion-reduce:scroll-auto"
      >
        {products.map(product => (
          <div key={product.id} className="w-[72%] shrink-0 snap-start sm:w-[45%] lg:w-[calc((100%-4.5rem)/4)]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {canNext && (
        <button type="button" onClick={() => scrollByPage(1)} aria-label="Próximos produtos" className={`${arrow} -right-5`}>
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
