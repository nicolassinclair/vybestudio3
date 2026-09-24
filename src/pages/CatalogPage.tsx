import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storageService';
import { ProductCard } from '../components/ProductCard';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('categoria') || 'todas';

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');

  const products = storageService.getProducts();
  const categories = storageService.getCategories();

  const handleCategoryChange = (catId: string) => {
    if (catId === 'todas') {
      searchParams.delete('categoria');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ categoria: catId });
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        // Ignora rascunhos no catálogo público
        if (p.status === 'rascunho') return false;

        // Category filter
        if (currentCategory !== 'todas' && p.category !== currentCategory) {
          return false;
        }
        // Text search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.categoryLabel.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, currentCategory, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block">
          Catálogo Oficial
        </span>
        <h1 className="title-page mt-1">
          Nossos Produtos
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mt-2">
          Itens de vestuário, cerâmica, utilitários e presentes desenvolvidos para receber a sua personalização com acabamento premium.
        </p>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pt-4 border-t border-stone-200">
        {/* Category Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => handleCategoryChange('todas')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              currentCategory === 'todas'
                ? 'bg-black text-white'
                : 'text-stone-600 hover:text-black hover:bg-stone-100'
            }`}
          >
            Todas as categorias
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                currentCategory === cat.id
                  ? 'bg-black text-white'
                  : 'text-stone-600 hover:text-black hover:bg-stone-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search & Sort controls */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="py-1.5 pl-3 pr-8 text-xs font-medium bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-black appearance-none cursor-pointer"
            >
              <option value="relevance">Destaques</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
            </select>
            <SlidersHorizontal className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-stone-50 rounded-2xl border border-stone-200/80 p-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-stone-200/60 flex items-center justify-center text-stone-500 mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-900">
            Nenhum produto encontrado
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-5">
            Não encontramos produtos para os filtros selecionados. Tente alterar sua pesquisa ou categoria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              handleCategoryChange('todas');
            }}
            className="px-4 py-2 text-xs font-semibold text-white bg-black rounded-lg hover:bg-stone-800"
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};
