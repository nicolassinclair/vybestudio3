import React from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';

export const AboutPage: React.FC = () => {
  const settings = storageService.getSettings();
  const categories = storageService.getCategories();
  const whatsappUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Conheci a ${settings.storeName} e gostaria de criar um produto personalizado.`)}`;

  const steps = [
    { t: 'Escolha o produto', d: 'Navegue pelo catálogo e escolha o que quer personalizar.' },
    { t: 'Envie a sua ideia', d: 'Mande a sua arte, nome ou referência. Nos produtos com simulador, você vê a prévia antes de pedir.' },
    { t: 'Aprove a arte', d: 'Conferimos os detalhes com você pelo WhatsApp antes de produzir.' },
    { t: 'Receba o seu produto', d: `Produção sob demanda: ${settings.standardProductionTime}. Retirada ou entrega combinada.` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
      <header className="max-w-3xl">
        <h1 className="title-page">Um estúdio para transformar ideias em produtos.</h1>
        <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-stone-600 sm:text-lg">
          A {settings.storeName} cria produtos personalizados sob demanda. Cada peça é produzida depois do seu pedido,
          com a sua arte, o seu nome ou a sua ideia.
        </p>
      </header>

      <section className="mt-16" aria-labelledby="sobre-fazemos">
        <h2 id="sobre-fazemos" className="title-section">O que fazemos</h2>
        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {categories.map(cat => (
            <li key={cat.id} className="border-t border-ink pt-4">
              <Link to={`/produtos?categoria=${cat.id}`} className="group block">
                <h3 className="font-display text-lg font-bold text-ink group-hover:underline underline-offset-4">{cat.name}</h3>
                {cat.tagline && <p className="mt-1 text-sm leading-relaxed text-stone-500">{cat.tagline}</p>}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[60ch] text-sm leading-relaxed text-stone-500">
          O catálogo cresce com novos produtos. Não achou o que procurava? Conte a sua ideia e vemos como fazer.
        </p>
      </section>

      <section className="mt-16" aria-labelledby="sobre-como">
        <h2 id="sobre-como" className="title-section">Como trabalhamos</h2>
        <ol className="mt-8 grid grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2">
          {steps.map((step, i) => (
            <li key={step.t} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper" aria-hidden="true">{i + 1}</span>
              <div>
                <h3 className="font-semibold text-ink">{step.t}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">{step.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-16 flex flex-col items-center justify-between gap-6 rounded-lg border border-stone-200 bg-snow px-6 py-9 text-center sm:flex-row sm:px-10 sm:py-12 sm:text-left">
        <div>
          <h2 className="title-section">Vamos criar juntos?</h2>
          <p className="mt-2 max-w-[48ch] text-sm leading-relaxed text-stone-500 sm:text-base">Escolha um produto ou conte a sua ideia pelo WhatsApp.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/produtos" className="inline-flex items-center justify-center rounded-brand bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-graphite">Ver produtos</Link>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-brand border border-stone-300 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink">Falar no WhatsApp</a>
        </div>
      </section>
    </div>
  );
};
