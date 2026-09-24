import React from 'react';
import { Link } from 'react-router-dom';
import { Wand2, Clock, ArrowRight, Sparkles } from 'lucide-react';

export const PersonalizeHubPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24 space-y-10">
      {/* Header */}
      <div className="max-w-2xl">
        <span className="text-xs font-bold uppercase tracking-widest text-stone-400 block">
          Estúdio de Criação
        </span>
        <h1 className="title-page mt-1">
          Personalize seu Produto
        </h1>
        <p className="text-stone-600 text-sm mt-2 leading-relaxed">
          Selecione o produto que deseja customizar. Nosso simulador interativo permite posicionar sua arte, ajustar dimensões e visualizar o resultado antes da produção.
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Active: Caneca Cerâmica 325ml */}
        <div className="group bg-white rounded-2xl border-2 border-black p-6 flex flex-col justify-between shadow-md relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-black text-white px-2.5 py-0.5 rounded-sm">
                Disponível Agora
              </span>
              <span className="text-xs text-stone-500 font-mono">2D Interativo</span>
            </div>

            <div className="aspect-4/3 bg-stone-50 rounded-xl overflow-hidden p-4 flex items-center justify-center border border-stone-100">
              <img
                src="/images/mug_white_product.png"
                alt="Personalizador de Caneca Cerâmica"
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-stone-950">
                Personalizar Caneca
              </h2>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                Caneca de cerâmica 325ml com área de impressão panorâmica de 21 × 9,5 cm. Envie sua foto, logo ou frase e veja no mockup fotográfico 2D.
              </p>
            </div>

            <div className="text-xs text-stone-500 space-y-1 pt-2 border-t border-stone-100">
              <p>· Dimensões: 8 × 9,5 cm</p>
              <p>· Área de Impressão: 21 × 9,5 cm</p>
              <p>· Cor: Branca (Cerâmica AAA)</p>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <Link
              to="/personalizar/caneca"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors shadow-xs"
            >
              <Wand2 className="w-4 h-4" />
              <span>Abrir Personalizador de Caneca</span>
            </Link>
          </div>
        </div>

        {/* Future: Personalizar Camisa (Clear Coming Soon state) */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between opacity-85 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-sm border border-stone-200">
                Em Breve
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Em desenvolvimento
              </span>
            </div>

            <div className="aspect-4/3 bg-stone-50 rounded-xl overflow-hidden p-4 flex items-center justify-center border border-stone-100 filter grayscale-30">
              <img
                src="/images/product_camisa_oversized_1790196757274.jpg"
                alt="Personalizador de Camisa"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-stone-700">
                Personalizar Camisa
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Editor com opções de estampa no peito, nas costas e na manga, para todos os tipos de camisa.
              </p>
            </div>

            <div className="text-xs text-stone-400 space-y-1 pt-2 border-t border-stone-100">
              <p>· Grade: P ao XG</p>
              <p>· Simulador visual em preparação</p>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 bg-stone-100 text-stone-400 text-xs font-bold uppercase tracking-wider rounded-xl cursor-not-allowed text-center"
            >
              Simulador em Breve
            </button>
          </div>
        </div>

        {/* Future: Bags & Presentes */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col justify-between opacity-85 relative">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 px-2.5 py-0.5 rounded-sm border border-stone-200">
                Em Breve
              </span>
              <span className="text-xs text-stone-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Planejamento
              </span>
            </div>

            <div className="aspect-4/3 bg-stone-50 rounded-xl overflow-hidden p-4 flex items-center justify-center border border-stone-100 filter grayscale-30">
              <img
                src="/images/product_tote_bag_1790196766194.jpg"
                alt="Personalizador de Bags e Presentes"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h2 className="font-display text-xl font-bold text-stone-700">
                Personalizar Bags & Presentes
              </h2>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Personalização de tote bags reforçadas e kits presentes corporativos com aplicação de identidade visual.
              </p>
            </div>

            <div className="text-xs text-stone-400 space-y-1 pt-2 border-t border-stone-100">
              <p>· Lona pesada e caixas rígidas</p>
              <p>· Serigrafia e DTF têxtil</p>
              <p>· Módulo em desenvolvimento</p>
            </div>
          </div>

          <div className="pt-6 mt-4">
            <button
              type="button"
              disabled
              className="w-full py-3 px-4 bg-stone-100 text-stone-400 text-xs font-bold uppercase tracking-wider rounded-xl cursor-not-allowed text-center"
            >
              Simulador em Breve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
