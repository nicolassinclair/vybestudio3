const SITE = 'VYBE Studio';
const DEFAULT_DESC = 'Estúdio criativo de personalizados: canecas com simulador em tempo real, camisas, bags e presentes com a sua identidade.';

const ROUTES: Record<string, { title: string; description?: string }> = {
  '/': { title: `${SITE} | Sua ideia ganha forma` },
  '/produtos': { title: `Produtos | ${SITE}`, description: 'Canecas, camisas, bags e presentes personalizados.' },
  '/personalizar': { title: `Personalizar | ${SITE}`, description: 'Escolha um produto e crie o seu personalizado.' },
  '/personalizar/caneca': { title: `Personalizar caneca | ${SITE}`, description: 'Envie sua arte e veja a prévia da caneca em tempo real.' },
  '/checkout': { title: `Finalizar pedido | ${SITE}` },
  '/sobre': { title: `Sobre | ${SITE}` },
  '/contato': { title: `Contato | ${SITE}` },
  '/inspiracoes': { title: `Inspirações | ${SITE}` },
  '/como-comprar': { title: `Como comprar | ${SITE}`, description: 'Veja como fazer seu pedido na VYBE Studio.' },
  '/perguntas-frequentes': { title: `Perguntas frequentes | ${SITE}` },
  '/trocas-e-devolucoes': { title: `Trocas e devoluções | ${SITE}` },
  '/privacidade': { title: `Privacidade | ${SITE}` },
  '/termos': { title: `Termos de uso | ${SITE}` },
  '/admin': { title: `Admin | ${SITE}` },
  '/login': { title: `Entrar na Conta | ${SITE}`, description: 'Acesse sua conta para acompanhar seus pedidos e personalizados.' },
  '/cadastro': { title: `Criar Conta | ${SITE}`, description: 'Cadastre-se na VYBE Studio para acompanhar seus pedidos.' },
  '/minha-conta': { title: `Minha Conta | ${SITE}`, description: 'Área do cliente: histórico de pedidos e dados de perfil.' },
  '/esqueci-minha-senha': { title: `Recuperar Senha | ${SITE}`, description: 'Recuperação de acesso à conta de cliente.' },
};

export function getSeo(pathname: string) {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (ROUTES[clean]) return { description: DEFAULT_DESC, ...ROUTES[clean] };
  if (clean.startsWith('/produtos/')) return { title: `Produto | ${SITE}`, description: DEFAULT_DESC };
  return { title: `Página não encontrada | ${SITE}`, description: DEFAULT_DESC };
}
