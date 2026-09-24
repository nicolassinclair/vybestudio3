import { Product, Order, StoreSettings, CategoryInfo } from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'VYBE Studio',
  slogan: 'Personalizados que têm a sua vibe.',
  whatsappNumber: '5511987654321', // Formato internacional DDI+DDD+Número
  whatsappDisplay: '(11) 98765-4321',
  email: 'contato@vybestudio.com.br',
  instagram: '@vybe.studio',
  pickupAddress: 'São Paulo - SP (Retirada com agendamento)',
  standardProductionTime: '2 a 4 dias úteis após aprovação da arte',
  isDemoMode: true,
};

export const INITIAL_CATEGORIES: CategoryInfo[] = [
  {
    id: 'canecas',
    name: 'Canecas',
    tagline: 'Cerâmica premium com impressão fotográfica de alta durabilidade',
    image: 'https://i.postimg.cc/mD4fkBtT/categoria-canecas.png',
    productCount: 1,
    customizable: true,
  },
  {
    id: 'camisas',
    name: 'Camisas',
    tagline: 'Todos os tipos de camisa, personalizadas com a sua arte',
    image: 'https://i.postimg.cc/br6KmnLJ/categoria-camisas.png',
    productCount: 1,
    customizable: false, // Em breve no personalizador
  },
  {
    id: 'bags',
    name: 'Bags',
    tagline: 'Tote bags reforçadas para o dia a dia e eventos',
    image: 'https://i.postimg.cc/zBkmR6g7/categoria-bags.png',
    productCount: 1,
    customizable: false,
  },
  {
    id: 'presentes',
    name: 'Presentes',
    tagline: 'Kits e embalagens pensadas para datas e ocasiões especiais',
    image: 'https://i.postimg.cc/2j2Rjpmr/categoria-presentes.png',
    productCount: 1,
    customizable: false,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'caneca-ceramica-325ml',
    name: 'Caneca Cerâmica 325ml',
    slug: 'caneca-ceramica-325ml',
    category: 'canecas',
    categoryLabel: 'Canecas',
    description: 'Caneca cilíndrica de cerâmica resinada de alta qualidade com acabamento brilhante. Ideal para sublimação fotográfica, logos e ilustrações com riqueza de detalhes e fidelidade de cores.',
    price: 39.90,
    minQuantity: 1,
    images: [
      '/images/mug_white_product.png',
      '/images/mug_dimensions.png',
      '/images/print_area_guide.png',
      '/images/mug_mockup.png',
    ],
    inStock: true,
    isCustomizable: true,
    isFeatured: true,
    badgeText: 'Mais Vendido',
    specs: {
      dimensions: '8 cm × 9,5 cm',
      diameter: '8 cm',
      height: '9,5 cm',
      printArea: '21 cm × 9,5 cm',
      capacity: '325 ml',
      material: 'Cerâmica Resinada Classe AAA',
      weight: '330 g',
      colors: [
        {
          id: 'branca',
          name: 'Branca',
          hex: '#FFFFFF',
          inStock: true,
          imagePreviewUrl: '/images/mug_white_product.png',
        },
      ],
    },
  },
  {
    id: 'camiseta-streetwear-oversized',
    name: 'Camiseta Personalizada',
    slug: 'camiseta-streetwear-heavyweight',
    category: 'camisas',
    categoryLabel: 'Camisas',
    description: 'Camiseta personalizada com a sua arte. Consulte as modelagens e os tecidos disponíveis.',
    price: 89.90,
    minQuantity: 1,
    images: [
      '/images/product_camisa_oversized_1790196757274.jpg',
    ],
    inStock: true,
    isCustomizable: false,
    isFeatured: true,
    badgeText: 'Destaque',
    specs: {
      dimensions: 'P, M, G, GG e XG',
      weight: '280 g',
    },
  },
  {
    id: 'tote-bag-canvas-pesado',
    name: 'Tote Bag Algodão Cru Reforçado',
    slug: 'tote-bag-algodao-cru',
    category: 'bags',
    categoryLabel: 'Bags',
    description: 'Bolsa ecológica estruturada em lona de algodão cru 100% sustentável. Alças largas reforçadas com costura em X e fundo plano para máxima capacidade diária.',
    price: 49.90,
    minQuantity: 1,
    images: [
      '/images/product_tote_bag_1790196766194.jpg',
    ],
    inStock: true,
    isCustomizable: false,
    isFeatured: true,
    specs: {
      dimensions: '38 cm × 42 cm (Alça 60 cm)',
      material: 'Lona 100% Algodão Cru 280g',
      capacity: '18 litros',
    },
  },
  {
    id: 'kit-presente-experiencia-vybe',
    name: 'Kit Gift Box VYBE Experience',
    slug: 'kit-gift-box-vybe-experience',
    category: 'presentes',
    categoryLabel: 'Presentes',
    description: 'Caixa presente rígida artesanal contendo 1 caneca personalizada, caderno pautado capa dura e fita de fechamento em gorgurão. Embalagem pronta para presentear.',
    price: 119.90,
    minQuantity: 1,
    images: [
      '/images/product_gift_box_1790196776172.jpg',
    ],
    inStock: true,
    isCustomizable: false,
    isFeatured: true,
    specs: {
      dimensions: '26 cm × 20 cm × 12 cm',
      material: 'Cartonagem Rígida Premium',
    },
  },
];

const KEYS = {
  SETTINGS: 'vybe_settings_v1',
  PRODUCTS: 'vybe_products_v1',
  CATEGORIES: 'vybe_categories_v1',
  ORDERS: 'vybe_orders_v1',
  CART: 'vybe_cart_v1',
  AUTH_ADMIN: 'vybe_admin_token',
};

// Storage Service Layer
const SKU_PREFIX: Record<string, string> = { canecas: 'CAN', camisas: 'CAM', bags: 'BAG', presentes: 'PRE' };

// Garante um SKU único para todo produto (ex.: CAN-001, CAM-002)
export function ensureProductSkus(products: Product[]): { list: Product[]; changed: boolean } {
  const used = new Set(products.map(p => p.sku).filter(Boolean) as string[]);
  const counters: Record<string, number> = {};
  let changed = false;
  const list = products.map(p => {
    if (p.sku) return p;
    const prefix = SKU_PREFIX[p.category] || 'PRD';
    let n = counters[prefix] || 0;
    let sku = '';
    do {
      n += 1;
      sku = `${prefix}-${String(n).padStart(3, '0')}`;
    } while (used.has(sku));
    counters[prefix] = n;
    used.add(sku);
    changed = true;
    return { ...p, sku };
  });
  return { list, changed };
}

const MIGRATION_KEY = 'vybe_text_migration_2';

// Atualiza textos antigos e imagens oficiais das categorias salvas no navegador
function runTextMigration(): void {
  try {
    const rawCats = localStorage.getItem(KEYS.CATEGORIES);
    if (rawCats) {
      const cats = JSON.parse(rawCats);
      let changed = false;
      const officialImages: Record<string, string> = {
        canecas: 'https://i.postimg.cc/mD4fkBtT/categoria-canecas.png',
        camisas: 'https://i.postimg.cc/br6KmnLJ/categoria-camisas.png',
        bags: 'https://i.postimg.cc/zBkmR6g7/categoria-bags.png',
        presentes: 'https://i.postimg.cc/2j2Rjpmr/categoria-presentes.png',
      };
      cats.forEach((c: any) => {
        if (officialImages[c.id] && c.image !== officialImages[c.id]) {
          c.image = officialImages[c.id];
          changed = true;
        }
        if (c.id === 'camisas' && /streetwear|algod/i.test(c.tagline || '')) {
          c.tagline = 'Todos os tipos de camisa, personalizadas com a sua arte';
          changed = true;
        }
      });
      if (changed) localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(cats));
    }
    if (localStorage.getItem(MIGRATION_KEY)) return;
    const rawProds = localStorage.getItem(KEYS.PRODUCTS);
    if (rawProds) {
      const prods = JSON.parse(rawProds);
      let changed = false;
      prods.forEach((p: any) => {
        if (p.category !== 'camisas') return;
        if (/streetwear/i.test(p.name || '')) { p.name = 'Camiseta Personalizada'; changed = true; }
        if (/streetwear|algod|penteado/i.test(p.description || '')) { p.description = 'Camiseta personalizada com a sua arte. Consulte as modelagens e os tecidos disponíveis.'; changed = true; }
        if (p.specs && /algod/i.test(p.specs.material || '')) { delete p.specs.material; changed = true; }
      });
      if (changed) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(prods));
    }
    localStorage.setItem(MIGRATION_KEY, '1');
  } catch (e) {
    console.warn('Migração de textos ignorada:', e);
  }
}

export const storageService = {
  getSettings(): StoreSettings {
    try {
      const stored = localStorage.getItem(KEYS.SETTINGS);
      if (stored) {
        return { ...INITIAL_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Erro ao ler configurações locais:', e);
    }
    return INITIAL_SETTINGS;
  },

  saveSettings(settings: StoreSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  },

  getProducts(): Product[] {
    runTextMigration();
    try {
      const stored = localStorage.getItem(KEYS.PRODUCTS);
      if (stored) {
        const { list, changed } = ensureProductSkus(JSON.parse(stored));
        if (changed) localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(list));
        return list;
      }
    } catch (e) {
      console.warn('Erro ao ler produtos locais:', e);
    }
    // Salva a lista inicial se for a primeira vez
    const initial = ensureProductSkus(INITIAL_PRODUCTS).list;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(initial));
    return initial;
  },

  saveProducts(products: Product[]): void {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(ensureProductSkus(products).list));
  },

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id || p.slug === id);
  },

  getCategories(): CategoryInfo[] {
    runTextMigration();
    try {
      const stored = localStorage.getItem(KEYS.CATEGORIES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler categorias locais:', e);
    }
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    return INITIAL_CATEGORIES;
  },

  saveCategories(categories: CategoryInfo[]): void {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(KEYS.ORDERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler pedidos locais:', e);
    }
    return [];
  },

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  updateOrderStatus(orderId: string, status: Order['status']): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
  },

  isAdminAuthenticated(): boolean {
    return sessionStorage.getItem(KEYS.AUTH_ADMIN) === 'true';
  },

  setAdminAuthenticated(auth: boolean): void {
    if (auth) {
      sessionStorage.setItem(KEYS.AUTH_ADMIN, 'true');
    } else {
      sessionStorage.removeItem(KEYS.AUTH_ADMIN);
    }
  },
};
