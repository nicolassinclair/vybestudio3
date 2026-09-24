import React from 'react';
import { Product } from '../types';

interface TechnicalSpecsCardProps {
  product: Product;
}

export const TechnicalSpecsCard: React.FC<TechnicalSpecsCardProps> = ({ product }) => {
  const { specs, category } = product;

  // Build the list of technical characteristics based on product data and requirements
  const items: { label: string; value: string }[] = [];

  if (category === 'canecas') {
    items.push({ label: 'Dimensões físicas', value: specs.dimensions || '8 cm × 9,5 cm' });
    items.push({ label: 'Área de impressão', value: specs.printArea || '21 cm × 9,5 cm' });
    items.push({ label: 'Capacidade', value: specs.capacity || '325 ml' });
    items.push({ label: 'Material', value: specs.material || 'Cerâmica Resinada Classe AAA' });
    items.push({ label: 'Peso aproximado', value: specs.weight || '330 g' });
  } else if (category === 'camisas') {
    items.push({ label: 'Tamanhos', value: specs.dimensions || 'P, M, G, GG e XG' });
    if (specs.material) items.push({ label: 'Material', value: specs.material });
    items.push({ label: 'Peso aproximado', value: specs.weight || '280 g' });
  } else if (category === 'bags') {
    items.push({ label: 'Dimensões físicas', value: specs.dimensions || '38 cm × 42 cm (alça de 60 cm)' });
    items.push({ label: 'Capacidade', value: specs.capacity || '18 litros' });
    items.push({ label: 'Material', value: specs.material || 'Lona 100% Algodão Cru 280g' });
  } else {
    // Generic fallback for any other product category
    if (specs.dimensions) items.push({ label: 'Dimensões', value: specs.dimensions });
    if (specs.printArea) items.push({ label: 'Área de personalização', value: specs.printArea });
    if (specs.capacity) items.push({ label: 'Capacidade', value: specs.capacity });
    if (specs.material) items.push({ label: 'Material', value: specs.material });
    if (specs.weight) items.push({ label: 'Peso aproximado', value: specs.weight });
  }

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#737373]">
        ESPECIFICAÇÕES TÉCNICAS
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 pt-1">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col gap-0.5">
            <span className="text-[12px] sm:text-[13px] text-[#737373] leading-snug">
              {item.label}
            </span>
            <span className="text-[13px] sm:text-[14px] font-semibold text-[#111111] leading-snug">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
