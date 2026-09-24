import React from 'react';

const INFO_ITEMS = [
  'Canecas personalizadas a partir de R$ 39,90',
  'Personalização com impressão de alta qualidade',
  'Canecas, camisetas, bolsas e presentes personalizados',
  'Produção em 2 a 4 dias úteis após a aprovação da arte',
  'Retirada agendada ou entrega a combinar',
];

const Track: React.FC<{ hidden?: boolean }> = ({ hidden }) => (
  <ul
    className={`flex shrink-0 items-center ${hidden ? 'vybe-marquee-dup' : ''}`}
    aria-hidden={hidden || undefined}
  >
    {INFO_ITEMS.map((item, idx) => (
      <li key={`${item}-${idx}`} className="flex items-center whitespace-nowrap">
        <span className="text-[12px] sm:text-[13px] font-medium text-stone-700 tracking-tight">
          {item}
        </span>
        <span className="mx-5 sm:mx-8 text-stone-300 font-bold select-none text-xs" aria-hidden="true">
          ·
        </span>
      </li>
    ))}
  </ul>
);

export const Marquee: React.FC = () => {
  return (
    <div
      className="w-full border-y border-stone-200/70 bg-white/90 backdrop-blur-xs py-2.5 sm:py-3 select-none overflow-hidden"
      role="region"
      aria-label="Informações comerciais da loja"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="vybe-marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_3%,#000_97%,transparent)]">
          <div className="vybe-marquee-track flex w-max items-center">
            <Track />
            <Track hidden />
          </div>
        </div>
      </div>
    </div>
  );
};
