import React from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';

interface Section { h: string; p?: string; items?: string[] }

const Shell: React.FC<{ title: string; intro?: string; children: React.ReactNode }> = ({ title, intro, children }) => (
  <article className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
    <h1 className="title-page">{title}</h1>
    {intro && <p className="mt-4 max-w-[60ch] text-base leading-relaxed text-stone-500">{intro}</p>}
    <div className="mt-10 space-y-9">{children}</div>
  </article>
);

const Blocks: React.FC<{ sections: Section[] }> = ({ sections }) => (
  <>
    {sections.map(s => (
      <section key={s.h}>
        <h2 className="text-lg font-semibold text-ink">{s.h}</h2>
        {s.p && <p className="mt-2 leading-relaxed text-stone-600">{s.p}</p>}
        {s.items && (
          <ul className="mt-2 list-disc space-y-1.5 pl-5 leading-relaxed text-stone-600">
            {s.items.map(i => <li key={i}>{i}</li>)}
          </ul>
        )}
      </section>
    ))}
  </>
);

const Pending = 'A definir pela VYBE Studio antes da divulgação da loja.';

export const ComoComprarPage: React.FC = () => {
  const st = storageService.getSettings();
  return (
    <Shell title="Como comprar" intro="Do produto ao pedido em poucos passos.">
      <ol className="space-y-6">
        {[
          ['Escolha o produto', 'Navegue pelo catálogo e abra o produto para ver detalhes, cores e tamanhos.'],
          ['Personalize, quando disponível', 'Nos produtos personalizáveis, envie sua arte e veja a prévia antes de pedir.'],
          ['Finalize o pedido', 'Informe seus dados e escolha retirada ou entrega. O resumo do pedido abre no nosso WhatsApp.'],
          ['Confirme pelo WhatsApp', 'Combinamos o pagamento, o frete (nas entregas) e a aprovação da arte por lá.'],
          ['Produção e entrega', `Prazo de produção: ${st.standardProductionTime}.`],
        ].map(([t, d], i) => (
          <li key={t} className="flex gap-4">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-paper">{i + 1}</span>
            <div><h2 className="font-semibold text-ink">{t}</h2><p className="mt-1 leading-relaxed text-stone-600">{d}</p></div>
          </li>
        ))}
      </ol>
      <div className="flex justify-center"><Link to="/produtos" className="inline-flex rounded-brand bg-ink px-6 py-3.5 text-sm font-semibold text-paper transition-colors hover:bg-graphite">Ver produtos</Link></div>
    </Shell>
  );
};

export const FaqPage: React.FC = () => {
  const st = storageService.getSettings();
  const faq: [string, string][] = [
    ['Como faço um pedido?', 'Adicione os produtos ao carrinho, preencha seus dados e finalize. O resumo do pedido abre no WhatsApp da loja.'],
    ['Como envio a minha arte?', 'Configure a arte no simulador para conferir a prévia. Depois, envie o arquivo original pelo WhatsApp junto com o número do pedido.'],
    ['Qual é o prazo de produção?', `${st.standardProductionTime}.`],
    ['Como funciona o frete?', 'Na retirada não há frete. Nas entregas, o valor é calculado e combinado pelo WhatsApp.'],
    ['Quais são as formas de pagamento?', 'As formas de pagamento são combinadas pelo WhatsApp na confirmação do pedido.'],
    ['Posso pedir mais de uma unidade?', 'Sim. Ajuste a quantidade na página do produto ou no carrinho.'],
  ];
  return (
    <Shell title="Perguntas frequentes" intro="Respostas rápidas sobre pedidos, arte, prazo e entrega.">
      <div className="divide-y divide-stone-200 border-y border-stone-200">
        {faq.map(([q, a]) => (
          <details key={q} className="group py-4">
            <summary className="cursor-pointer list-none font-semibold text-ink marker:hidden">{q}</summary>
            <p className="mt-2 leading-relaxed text-stone-600">{a}</p>
          </details>
        ))}
      </div>
      <p className="text-stone-600">Não achou o que procurava? <Link to="/contato" className="font-semibold text-ink underline underline-offset-4">Fale com a gente</Link>.</p>
    </Shell>
  );
};

export const TrocasPage: React.FC = () => (
  <Shell title="Trocas e devoluções" intro="Regras para trocas, devoluções e produtos com defeito.">
    <Blocks sections={[
      { h: 'Prazo para solicitar', p: Pending },
      { h: 'Produtos personalizados', p: Pending },
      { h: 'Produtos com defeito ou avaria', p: Pending },
      { h: 'Como solicitar', p: 'Entre em contato pelo WhatsApp informando o número do pedido.' },
    ]} />
  </Shell>
);

export const PrivacidadePage: React.FC = () => {
  const st = storageService.getSettings();
  return (
    <Shell title="Privacidade" intro="Como tratamos os dados que você informa na loja.">
      <Blocks sections={[
        { h: 'Dados que coletamos', items: ['Nome e WhatsApp', 'E-mail e endereço, quando informados para entrega', 'Observações do pedido e a arte enviada para personalização'] },
        { h: 'Para que usamos', p: 'Apenas para atender, produzir e entregar o seu pedido.' },
        { h: 'Onde os dados ficam', p: 'Atualizar este item quando o banco de dados da loja for ativado.' },
        { h: 'Contato sobre seus dados', p: `Escreva para ${st.email} ou pelo WhatsApp ${st.whatsappDisplay}.` },
      ]} />
    </Shell>
  );
};

export const TermosPage: React.FC = () => (
  <Shell title="Termos de uso" intro="Condições gerais para compras na loja.">
    <Blocks sections={[
      { h: 'Pedidos e confirmação', p: 'O pedido é confirmado após o contato pelo WhatsApp e a aprovação da arte, quando houver personalização.' },
      { h: 'Pagamento', p: Pending },
      { h: 'Produção e entrega', p: 'Os prazos seguem o informado nas páginas de produto e no carrinho.' },
      { h: 'Responsabilidade pela arte enviada', p: Pending },
    ]} />
  </Shell>
);
