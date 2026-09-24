import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const actionTo = product.isCustomizable
    ? `/personalizar/caneca?produto=${product.id}`
    : `/produtos/${product.id}`;
  const actionLabel = product.isCustomizable ? 'Personalizar' : 'Ver produto';
  const tag = !product.inStock ? 'Esgotado' : product.isCustomizable ? 'Personalizável' : product.badgeText;

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-brand bg-snow">
      <Link
        to={`/produtos/${product.id}`}
        aria-label={product.name}
        className="block h-full w-full"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          onError={(e) => {
            (e.target as HTMLElement).style.opacity = '0';
          }}
        />
        {tag && (
          <span className="absolute left-3 top-3 rounded-brand bg-snow px-2.5 py-1 text-xs font-semibold text-ink">
            {tag}
          </span>
        )}
      </Link>
        {product.inStock && (
          <Link
            to={actionTo}
            className="absolute inset-x-3 bottom-3 hidden translate-y-2 rounded-brand bg-ink px-3 py-3 text-center text-[13px] font-semibold text-snow opacity-0 transition-all duration-300 hover:bg-graphite focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:hover)]:block"
          >
            {actionLabel}
          </Link>
        )}
      </div>

      <div className="mt-3.5 flex items-baseline justify-between gap-3">
        <Link
          to={`/produtos/${product.id}`}
          className="text-[15px] font-semibold leading-snug text-ink line-clamp-2"
        >
          {product.name}
        </Link>
        <span className="whitespace-nowrap text-[15px] tabular-nums text-stone-500">
          {brl.format(product.price)}
        </span>
      </div>

      {product.inStock && (
        <Link
          to={actionTo}
          className="mt-2 text-[13px] font-semibold text-graphite underline-offset-4 hover:underline [@media(hover:hover)]:hidden"
        >
          {actionLabel}
        </Link>
      )}
    </article>
  );
};
