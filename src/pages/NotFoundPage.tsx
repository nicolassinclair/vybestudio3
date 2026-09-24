import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => (
  <section className="mx-auto flex max-w-xl flex-col items-center gap-5 text-center px-5 py-24 sm:px-6">
    <h1 className="title-page">Página não encontrada</h1>
    <p className="text-stone-500">O endereço que você abriu não existe ou foi movido. Volte para os produtos ou crie o seu personalizado.</p>
    <div className="flex flex-wrap justify-center gap-4 pt-2">
      <Link to="/produtos" className="rounded-brand bg-ink px-6 py-3.5 text-sm font-semibold text-snow hover:bg-graphite transition-colors">Ver produtos</Link>
      <Link to="/" className="border-b border-stone-200 pb-0.5 py-3.5 text-sm font-semibold hover:border-ink transition-colors">Ir para o início</Link>
    </div>
  </section>
);
