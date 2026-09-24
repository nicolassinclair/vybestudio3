import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Wand2 } from 'lucide-react';
import { storageService } from '../services/storageService';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const products = storageService.getProducts();
    const q = query.toLowerCase();
    const filtered = products.filter(
      p =>
        p.status !== 'rascunho' &&
        (p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q))
    );
    setResults(filtered);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (productId: string) => {
    onClose();
    navigate(`/produtos/${productId}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative mx-auto max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Search input bar */}
        <div className="relative flex items-center px-4 border-b border-stone-200">
          <Search className="w-5 h-5 text-stone-400 mr-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar canecas, camisas, bags ou presentes..."
            autoFocus
            className="w-full py-4 text-sm sm:text-base text-stone-900 placeholder:text-stone-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-stone-400 hover:text-stone-700 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold uppercase text-stone-500 hover:text-black px-2 py-1 rounded-sm"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions */}
        <div className="max-h-96 overflow-y-auto p-4 divide-y divide-stone-100">
          {query.trim() === '' ? (
            <div className="py-6 text-center">
              <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-3">
                Sugestões rápidas
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Caneca Cerâmica 325ml', 'Camiseta', 'Tote Bag', 'Kit Presente'].map(item => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="px-3 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm font-semibold text-stone-800">Nenhum produto encontrado</p>
              <p className="text-xs text-stone-500 mt-1">Tente buscar por "caneca", "camisa" ou "bag".</p>
            </div>
          ) : (
            results.map(product => (
              <div
                key={product.id}
                onClick={() => handleSelect(product.id)}
                className="pt-3 pb-3 first:pt-0 cursor-pointer flex items-center justify-between hover:bg-stone-50 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-md overflow-hidden p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      {product.categoryLabel}
                    </span>
                    <h4 className="text-sm font-semibold text-stone-900">
                      {product.name}
                    </h4>
                    <span className="text-xs font-mono font-medium text-stone-600">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {product.isCustomizable && (
                    <span className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-sm flex items-center gap-1">
                      <Wand2 className="w-2.5 h-2.5" />
                      Personalizável
                    </span>
                  )}
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
