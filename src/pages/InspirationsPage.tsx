import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Sparkles, ArrowRight } from 'lucide-react';

interface InspirationItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  relatedProductId?: string;
  isCustomizable: boolean;
}

export const InspirationsPage: React.FC = () => {
  const [filter, setFilter] = useState<string>('todos');

  // Controle temporário de ativação da aba Inspirações
  // Para reativar futuramente, basta alterar esta flag para true
  const IS_INSPIRATIONS_ACTIVE = false;

  const inspirations: InspirationItem[] = [
    {
      id: 'insp-1',
      title: 'Monograma Minimalista em Caneca Branca',
      category: 'canecas',
      image: '/images/mug_white_product.png',
      description: 'Estética clean com iniciais e tipografia moderna com alto contraste sobre cerâmica brilhante.',
      relatedProductId: 'caneca-ceramica-325ml',
      isCustomizable: true,
    },
    {
      id: 'insp-2',
      title: 'Tipografia em Camiseta',
      category: 'camisas',
      image: '/images/product_camisa_oversized_1790196757274.jpg',
      description: 'Design minimalista monocromático em camiseta oversized.',
      relatedProductId: 'camiseta-streetwear-heavyweight',
      isCustomizable: false,
    },
    {
      id: 'insp-3',
      title: 'Tote Bag com Ilustração Linear',
      category: 'bags',
      image: '/images/product_tote_bag_1790196766194.jpg',
      description: 'Lona crua 100% algodão estruturada com traços finos para o dia a dia urbano.',
      relatedProductId: 'tote-bag-canvas-pesado',
      isCustomizable: false,
    },
    {
      id: 'insp-4',
      title: 'Gift Box Completo de Boas-Vindas',
      category: 'presentes',
      image: '/images/product_gift_box_1790196776172.jpg',
      description: 'Kit de presentes personalizado com caneca, papelaria e embalagem premium.',
      relatedProductId: 'kit-presente-experiencia-vybe',
      isCustomizable: false,
    },
    {
      id: 'insp-5',
      title: 'Foto Panorâmica 21 × 9,5 cm em Caneca',
      category: 'canecas',
      image: '/images/mug_mockup.png',
      description: 'Fotografia contínua ocupando toda a área útil de sublimação sem cortes na alça.',
      relatedProductId: 'caneca-ceramica-325ml',
      isCustomizable: true,
    },
    {
      id: 'insp-6',
      title: 'Composição de Estúdio Criativo',
      category: 'destaques',
      image: '/images/hero_vybe_showcase_1790196747315.jpg',
      description: 'Conjunto harmônico de personalizados para lançamentos de marcas e estúdios.',
      relatedProductId: 'caneca-ceramica-325ml',
      isCustomizable: true,
    },
  ];

  const filtered = filter === 'todos' ? inspirations : inspirations.filter(i => i.category === filter);

  // Exibição temporária enquanto a aba Inspirações estiver desativada
  if (!IS_INSPIRATIONS_ACTIVE) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-8 sm:p-14 shadow-2xs space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-[#111111] text-white flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-3 max-w-lg mx-auto">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight">
              Em breve, novas inspirações para você.
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Estamos preparando novas composições, ideias de personalização e projetos exclusivos para inspirar sua criatividade.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/produtos"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#111111] text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors shadow-sm"
            >
              <span>Explorar produtos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28 space-y-10">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block">
          Galeria de Ideias
        </span>
        <h1 className="title-page mt-1">
          Inspirações VYBE
        </h1>
        <p className="text-stone-600 text-sm max-w-xl mt-2 leading-relaxed">
          Exemplos práticos de criações, composições e aplicações de arte em nossos produtos sob demanda.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200">
        {[
          { id: 'todos', label: 'Todos os Projetos' },
          { id: 'canecas', label: 'Canecas' },
          { id: 'camisas', label: 'Camisas' },
          { id: 'bags', label: 'Bags' },
          { id: 'presentes', label: 'Presentes' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              filter === tab.id
                ? 'bg-black text-white'
                : 'text-stone-600 hover:text-black hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(item => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-stone-400 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="aspect-4/3 bg-stone-50 overflow-hidden p-6 flex items-center justify-center relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {item.isCustomizable && (
                <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black text-white px-2 py-0.5 rounded-sm">
                  Personalizável
                </span>
              )}
            </div>

            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 block mb-1">
                  {item.category}
                </span>
                <h3 className="font-display text-base font-bold text-stone-900 leading-snug">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between">
                {item.isCustomizable ? (
                  <Link
                    to="/personalizar/caneca"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-black hover:underline"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Personalizar este modelo</span>
                  </Link>
                ) : item.relatedProductId ? (
                  <Link
                    to={`/produtos/${item.relatedProductId}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-black"
                  >
                    <span>Ver especificações</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
