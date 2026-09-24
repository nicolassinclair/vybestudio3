import React from 'react';
import { Link } from 'react-router-dom';
import {
  Wand2,
  ArrowRight,
  Sparkles,
  Palette,
  Eye,
  MessageCircle,
  Package,
  Upload,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { ProductCard } from '../components/ProductCard';
import { Marquee } from '../components/Marquee';
import { FeaturedCarousel } from '../components/FeaturedCarousel';
import { HomeBannerCarousel } from '../components/HomeBannerCarousel';

export const HomePage: React.FC = () => {
  const products = storageService.getProducts();
  const categories = storageService.getCategories();
  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 12);
  const settings = storageService.getSettings();

  return (
    <div className="flex flex-col w-full">
      {/* ========================================================================= */}
      {/* 2. CARROSSEL DE BANNERS PROMOCIONAIS                                      */}
      {/* ========================================================================= */}
      <HomeBannerCarousel />

      {/* ========================================================================= */}
      {/* 3. BARRA DE BENEFÍCIOS (Marquee)                                          */}
      {/* ========================================================================= */}
      <Marquee />

      {/* ========================================================================= */}
      {/* 4. ESCOLHA SEU PRODUTO (Categorias)                                       */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header da Seção */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="title-section mt-1">
                Categorias
              </h2>
            </div>

            <Link
              to="/produtos"
              className="text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#737373] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Ver todo o catálogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Cards de Categorias com Imagens Maiores (65% a 70% da altura visual) */}
          <ul className="-mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:justify-center lg:gap-12 [&::-webkit-scrollbar]:hidden">
            {categories.map(cat => (
              <li key={cat.id} className="w-28 shrink-0 snap-start text-center sm:w-32 lg:w-40">
                <Link to={`/produtos?categoria=${cat.id}`} className="group block">
                  <span className="block aspect-square overflow-hidden rounded-full border border-stone-200 bg-snow transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-ink">
                    <img src={cat.image} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </span>
                  <span className="mt-3 block text-sm font-semibold text-ink">{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

{/* Informações da loja */}
      <section className="py-6 sm:py-8" aria-label="Como funciona a loja">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:gap-4 [&::-webkit-scrollbar]:hidden">
            {[
              { t: 'Prévia em tempo real', d: 'Veja a arte na caneca antes de finalizar.' },
              { t: 'Produção sob demanda', d: `${settings.standardProductionTime}.` },
              { t: 'Retirada ou entrega', d: 'Retirada com agendamento ou entrega combinada.' },
              { t: 'Atendimento no WhatsApp', d: 'Pagamento, frete e aprovação da arte por lá.' },
            ].map(item => (
              <li key={item.t} className="w-[250px] shrink-0 snap-start rounded-lg border border-stone-200 p-[18px] lg:w-auto">
                <strong className="block text-[15px] text-ink">{item.t}</strong>
                <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500">{item.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PRODUTOS EM DESTAQUE                                                   */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#737373] block">
                SELEÇÃO VYBE
              </span>
              <h2 className="title-section mt-1">
                Produtos em destaque
              </h2>
              <p className="text-xs sm:text-sm text-[#737373] mt-1 max-w-md">
                Conheça os produtos disponíveis para criar algo com a sua identidade.
              </p>
            </div>

            <Link
              to="/produtos"
              className="text-xs font-bold uppercase tracking-wider text-[#111111] hover:text-[#737373] inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Grid de Produtos */}
          <FeaturedCarousel products={featuredProducts} />
        </div>
      </section>

      {/* Personalização */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-lg border border-stone-200 bg-snow px-6 py-9 text-center sm:flex-row sm:px-10 sm:py-12 sm:text-left">
            <div>
              <h2 className="title-section">Tem uma ideia? Vamos transformar em produto.</h2>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-stone-500 sm:text-base">Envie sua arte, veja a prévia e finalize seu pedido.</p>
            </div>
            <Link to="/personalizar" className="inline-flex shrink-0 items-center justify-center rounded-brand bg-ink px-7 py-4 text-[15px] font-semibold text-paper transition-colors duration-200 hover:bg-graphite">
              Criar meu personalizado
            </Link>
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center justify-items-center gap-6 rounded-lg bg-ink px-6 py-9 text-center text-paper md:justify-items-start md:text-left sm:px-10 sm:py-12 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="title-section text-paper">Para empresas e grandes quantidades</h2>
              <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-stone-300 sm:text-base">
                Brindes, kits de equipe e eventos. Conte o objetivo, a quantidade e o prazo e respondemos pelo WhatsApp.
              </p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Gostaria de um orçamento para uma quantidade maior de personalizados. Objetivo, quantidade e prazo: ')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-brand bg-paper px-7 py-4 text-[15px] font-semibold text-ink transition-colors hover:bg-stone-200"
            >
              Pedir orçamento
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
