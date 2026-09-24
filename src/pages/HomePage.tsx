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
  const featuredProducts = products.filter(p => p.isFeatured && p.status !== 'rascunho').slice(0, 12);
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

      {/* ========================================================================= */}
      {/* 7. BANNER ESTÚDIO CRIATIVO / PERSONALIZAÇÃO                               */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#141414] via-[#1c1c1c] to-[#0c0c0c] border border-stone-800/80 shadow-2xl p-6 sm:p-10 lg:p-14 text-white">
            {/* Subtle decorative background light */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-stone-700/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-stone-800/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Coluna de texto */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-[11px] font-semibold uppercase tracking-wider text-stone-300">
                  <Sparkles className="w-3.5 h-3.5 text-stone-200" />
                  <span>Estúdio Criativo VYBE · Produção Sob Demanda</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                  Tem uma ideia? Vamos transformar em produto.
                </h2>

                <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Do mockup na tela ao produto físico finalizado. Envie sua arte, visualize em tempo real no simulador interativo e garanta peças exclusivas com acabamento profissional.
                </p>

                {/* 3 Diferenciais */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-white">Simulador 2D</span>
                      <span className="block text-[11px] text-stone-400">Prévia real no produto</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-white">Alta Definição</span>
                      <span className="block text-[11px] text-stone-400">Cores fiéis e duradouras</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-xs font-semibold text-white">Sem Pedido Mínimo</span>
                      <span className="block text-[11px] text-stone-400">A partir de 1 unidade</span>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <Link
                    to="/personalizar"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-stone-950 font-bold text-sm rounded-xl hover:bg-stone-200 transition-all shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    <span>Criar meu personalizado</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <a
                    href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Olá! Tenho uma ideia de produto personalizado e gostaria de tirar algumas dúvidas.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar no WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* Coluna visual de destaque */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-white/10">
                    <span className="font-semibold text-white">Etapas da sua personalização</span>
                    <span className="font-mono text-[10px] text-stone-300">100% ONLINE</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        1
                      </div>
                      <div className="text-xs">
                        <strong className="block text-white font-semibold">Escolha o produto base</strong>
                        <span className="text-stone-400 text-[11px]">Canecas de cerâmica, camisas, bags ou presentes</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        2
                      </div>
                      <div className="text-xs">
                        <strong className="block text-white font-semibold">Carregue sua estampa ou arte</strong>
                        <span className="text-stone-400 text-[11px]">Ajuste escala, rotação e posição em tempo real</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        3
                      </div>
                      <div className="text-xs">
                        <strong className="block text-white font-semibold">Receba pronto para impressionar</strong>
                        <span className="text-stone-400 text-[11px]">Produção ágil com controle rigoroso de qualidade</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
