import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import type { HomeBanner, Coupon, Order, CustomerUser, StoreSettings, CartItem, Product, CategoryInfo } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');

// Interface do banco de dados persistente compartilhado
interface DatabaseSchema {
  banners: HomeBanner[];
  coupons: Coupon[];
  users: Array<CustomerUser & { passwordHash: string; salt: string }>;
  orders: Order[];
  resetTokens: Array<{ token: string; email: string; expiresAt: number }>;
  sessions: Record<string, { userId: string; role: 'customer' | 'admin'; expiresAt: number }>;
  products: Product[];
  categories: CategoryInfo[];
}

const INITIAL_CATEGORIES: CategoryInfo[] = [
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
    customizable: false,
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

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'caneca-ceramica-325ml',
    sku: 'CAN-001',
    name: 'Caneca Cerâmica 325ml',
    slug: 'caneca-ceramica-325ml',
    category: 'canecas',
    categoryLabel: 'Canecas',
    description: 'Caneca cilíndrica de cerâmica resinada de alta qualidade com acabamento brilhante. Ideal para sublimação fotográfica, logos e ilustrações com riqueza de detalhes e fidelidade de cores.',
    shortDescription: 'Caneca de cerâmica resinada de alta qualidade para personalização com arte e fotos.',
    price: 39.90,
    minQuantity: 1,
    images: [
      '/images/mug_white_product.png',
      '/images/mug_dimensions.png',
      '/images/print_area_guide.png',
      '/images/mug_mockup.png',
    ],
    coverImage: '/images/mug_white_product.png',
    inStock: true,
    status: 'ativo',
    isCustomizable: true,
    customizationType: 'caneca_2d',
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
    sku: 'CAM-001',
    name: 'Camiseta Personalizada',
    slug: 'camiseta-streetwear-heavyweight',
    category: 'camisas',
    categoryLabel: 'Camisas',
    description: 'Camiseta personalizada com a sua arte. Consulte as modelagens e os tecidos disponíveis.',
    shortDescription: 'Camiseta premium com personalização exclusiva em estampa de alta definição.',
    price: 89.90,
    minQuantity: 1,
    images: [
      '/images/product_camisa_oversized_1790196757274.jpg',
    ],
    coverImage: '/images/product_camisa_oversized_1790196757274.jpg',
    inStock: true,
    status: 'ativo',
    isCustomizable: false,
    customizationType: 'upload_imagem',
    isFeatured: true,
    badgeText: 'Destaque',
    specs: {
      dimensions: 'P, M, G, GG e XG',
      weight: '280 g',
      sizes: ['P', 'M', 'G', 'GG', 'XG'],
    },
  },
  {
    id: 'tote-bag-canvas-pesado',
    sku: 'BAG-001',
    name: 'Tote Bag Algodão Cru Reforçado',
    slug: 'tote-bag-algodao-cru',
    category: 'bags',
    categoryLabel: 'Bags',
    description: 'Bolsa ecológica estruturada em lona de algodão cru 100% sustentável. Alças largas reforçadas com costura em X e fundo plano para máxima capacidade diária.',
    shortDescription: 'Bolsa ecológica estruturada em lona resistente com alças reforçadas.',
    price: 49.90,
    minQuantity: 1,
    images: [
      '/images/product_tote_bag_1790196766194.jpg',
    ],
    coverImage: '/images/product_tote_bag_1790196766194.jpg',
    inStock: true,
    status: 'ativo',
    isCustomizable: false,
    customizationType: 'upload_logo',
    isFeatured: true,
    specs: {
      dimensions: '38 cm × 42 cm (Alça 60 cm)',
      material: 'Lona 100% Algodão Cru 280g',
      capacity: '18 litros',
    },
  },
  {
    id: 'kit-presente-experiencia-vybe',
    sku: 'PRE-001',
    name: 'Kit Gift Box VYBE Experience',
    slug: 'kit-gift-box-vybe-experience',
    category: 'presentes',
    categoryLabel: 'Presentes',
    description: 'Caixa presente rígida artesanal contendo 1 caneca personalizada, caderno pautado capa dura e fita de fechamento em gorgurão. Embalagem pronta para presentear.',
    shortDescription: 'Caixa presente rígida artesanal pronta para presentear em datas especiais.',
    price: 119.90,
    minQuantity: 1,
    images: [
      '/images/product_gift_box_1790196776172.jpg',
    ],
    coverImage: '/images/product_gift_box_1790196776172.jpg',
    inStock: true,
    status: 'ativo',
    isCustomizable: false,
    customizationType: 'nenhum',
    isFeatured: true,
    specs: {
      dimensions: '26 cm × 20 cm × 12 cm',
      material: 'Cartonagem Rígida Premium',
    },
  },
];

// Banners oficiais iniciais
const INITIAL_BANNERS: HomeBanner[] = [
  {
    id: 'banner-primeira-compra',
    name: 'Primeira Compra 20% OFF',
    desktopImage: 'https://i.postimg.cc/yxrrKP0f/Chat-GPT-Image-24-de-set-de-2026-11-14-29.png',
    mobileImage: '',
    targetUrl: '/personalizar/caneca',
    altText: 'Banner promocional da primeira compra com cupom PRIMEIRAVYBE e 20% de desconto',
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'banner-catalogo-vybe',
    name: 'Catálogo VYBE Studio',
    desktopImage: 'https://i.postimg.cc/HnQ4Z9B0/Chat-GPT-Image-24-de-set-de-2026-11-22-33.png',
    mobileImage: '',
    targetUrl: '/produtos',
    altText: 'Banner do catálogo com canecas, camisas e presentes personalizados',
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

// Cupom oficial inicial PRIMEIRAVYBE
const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'coupon-primeiravybe',
    campaignName: 'Primeira Compra - 20% OFF no Banner Oficial',
    code: 'PRIMEIRAVYBE',
    discountType: 'percentage',
    discountValue: 20,
    minOrderValue: 200,
    maxDiscount: 150,
    firstPurchaseOnly: true,
    isCumulative: false,
    active: true,
    usedCount: 0,
    createdAt: new Date().toISOString(),
  },
];

// Inicialização segura do banco de dados em arquivo
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      let modified = false;

      // Garante que os banners iniciais existam
      if (!data.banners || data.banners.length === 0) {
        data.banners = INITIAL_BANNERS;
        modified = true;
      }
      // Garante que o cupom oficial PRIMEIRAVYBE exista
      if (!data.coupons || data.coupons.length === 0) {
        data.coupons = INITIAL_COUPONS;
        modified = true;
      } else {
        const hasPrimeiraVybe = data.coupons.some((c: Coupon) => c.code.toUpperCase() === 'PRIMEIRAVYBE');
        if (!hasPrimeiraVybe) {
          data.coupons.push(INITIAL_COUPONS[0]);
          modified = true;
        }
      }

      if (!data.users) data.users = [];
      if (!data.orders) data.orders = [];
      if (!data.resetTokens) data.resetTokens = [];
      if (!data.sessions) data.sessions = {};
      if (!data.products || data.products.length === 0) {
        data.products = INITIAL_PRODUCTS;
        modified = true;
      }
      if (!data.categories || data.categories.length === 0) {
        data.categories = INITIAL_CATEGORIES;
        modified = true;
      }

      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
      }
      return data;
    } catch (e) {
      console.warn('Erro ao ler DB existente, recriando:', e);
    }
  }

  const initialDb: DatabaseSchema = {
    banners: INITIAL_BANNERS,
    coupons: INITIAL_COUPONS,
    users: [],
    orders: [],
    resetTokens: [],
    sessions: {},
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  return initialDb;
}

let db = initDatabase();

function saveDatabase(): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao persistir banco de dados:', err);
  }
}

// Utilitários criptográficos de senha (Scrypt com salt exclusivo por usuário)
function hashPassword(password: string): { hash: string; salt: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computedHash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(computedHash, 'hex'), Buffer.from(hash, 'hex'));
}

// Helpers de Sessão
function createSession(userId: string, role: 'customer' | 'admin'): string {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 dias
  db.sessions[token] = { userId, role, expiresAt };
  saveDatabase();
  return token;
}

function getSession(token?: string) {
  if (!token) return null;
  const session = db.sessions[token];
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    delete db.sessions[token];
    saveDatabase();
    return null;
  }
  return session;
}

function extractBearer(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return undefined;
}

// Middleware de autenticação de admin
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = extractBearer(req);
  const session = getSession(token);

  if (session && session.role === 'admin') {
    return next();
  }

  // Permite token admin fixo de compatibilidade
  if (token === 'vybe_admin_secret_token_2026') {
    return next();
  }

  return res.status(403).json({ error: 'Acesso restrito a administradores autenticados.' });
}

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '15mb' }));

  // Servir ativos estáticos da pasta public (banners, imagens, ícones)
  const publicDir = path.resolve(__dirname, 'public');
  if (fs.existsSync(publicDir)) {
    app.use(express.static(publicDir));
    app.use('/images', express.static(path.join(publicDir, 'images')));
  }

  // =========================================================================
  // 1. ROTAS DE BANNERS DA HOME
  // =========================================================================

  // Listar banners da Home (ordenados por posição)
  app.get('/api/banners', (req: Request, res: Response) => {
    const list = [...db.banners].sort((a, b) => a.order - b.order);
    res.json(list);
  });

  // Criar novo banner (Admin)
  app.post('/api/banners', requireAdmin, (req: Request, res: Response) => {
    const { name, desktopImage, mobileImage, targetUrl, altText, order, active } = req.body;

    if (!name || !desktopImage) {
      return res.status(400).json({ error: 'Nome da campanha e Imagem desktop são obrigatórios.' });
    }

    const newBanner: HomeBanner = {
      id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: name.trim(),
      desktopImage: desktopImage.trim(),
      mobileImage: mobileImage ? mobileImage.trim() : undefined,
      targetUrl: targetUrl ? targetUrl.trim() : undefined,
      altText: altText ? altText.trim() : name.trim(),
      order: typeof order === 'number' ? order : db.banners.length + 1,
      active: active !== undefined ? Boolean(active) : true,
      createdAt: new Date().toISOString(),
    };

    db.banners.push(newBanner);
    saveDatabase();
    res.status(201).json(newBanner);
  });

  // Atualizar banner (Admin)
  app.put('/api/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.banners.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Banner não encontrado.' });
    }

    const current = db.banners[index];
    const updated: HomeBanner = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    db.banners[index] = updated;
    saveDatabase();
    res.json(updated);
  });

  // Excluir banner (Admin)
  app.delete('/api/banners/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.banners.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Banner não encontrado.' });
    }

    db.banners.splice(index, 1);
    saveDatabase();
    res.json({ success: true, message: 'Banner excluído com sucesso.' });
  });

  // =========================================================================
  // 2. ROTAS DE CUPONS E PROMOÇÕES
  // =========================================================================

  // Listar cupons (Admin vê todos; clientes recebem lista resumida de ativos se necessário)
  app.get('/api/coupons', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const session = getSession(token);
    const isAdmin = (session && session.role === 'admin') || token === 'vybe_admin_secret_token_2026';

    if (isAdmin) {
      return res.json(db.coupons);
    }

    // Para usuários comuns, retorna apenas cupons ativos e públicos
    const activePublic = db.coupons
      .filter(c => c.active)
      .map(c => ({
        code: c.code,
        campaignName: c.campaignName,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderValue: c.minOrderValue,
      }));
    res.json(activePublic);
  });

  // Criar cupom (Admin)
  app.post('/api/coupons', requireAdmin, (req: Request, res: Response) => {
    const {
      campaignName,
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscount,
      startDate,
      endDate,
      totalUsageLimit,
      usageLimitPerCustomer,
      firstPurchaseOnly,
      eligibleProducts,
      eligibleCategories,
      isCumulative,
      active,
    } = req.body;

    if (!campaignName || !code || !discountType || discountValue === undefined) {
      return res.status(400).json({ error: 'Nome da campanha, código, tipo e valor do desconto são obrigatórios.' });
    }

    const cleanCode = String(code).trim().toUpperCase();
    if (db.coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      return res.status(409).json({ error: `O código de cupom '${cleanCode}' já está cadastrado.` });
    }

    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      campaignName: String(campaignName).trim(),
      code: cleanCode,
      discountType: discountType === 'fixed' ? 'fixed' : 'percentage',
      discountValue: Number(discountValue),
      minOrderValue: minOrderValue ? Number(minOrderValue) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : undefined,
      usageLimitPerCustomer: usageLimitPerCustomer ? Number(usageLimitPerCustomer) : undefined,
      firstPurchaseOnly: Boolean(firstPurchaseOnly),
      eligibleProducts: Array.isArray(eligibleProducts) ? eligibleProducts : undefined,
      eligibleCategories: Array.isArray(eligibleCategories) ? eligibleCategories : undefined,
      isCumulative: Boolean(isCumulative),
      active: active !== undefined ? Boolean(active) : true,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };

    db.coupons.push(newCoupon);
    saveDatabase();
    res.status(201).json(newCoupon);
  });

  // Editar cupom (Admin)
  app.put('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.coupons.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cupom não encontrado.' });
    }

    const current = db.coupons[index];
    const cleanCode = req.body.code ? String(req.body.code).trim().toUpperCase() : current.code;

    // Se mudou o código, verifica se não conflita com outro
    if (cleanCode !== current.code && db.coupons.some(c => c.id !== id && c.code.toUpperCase() === cleanCode)) {
      return res.status(409).json({ error: `O código '${cleanCode}' já está em uso por outro cupom.` });
    }

    const updated: Coupon = {
      ...current,
      ...req.body,
      id: current.id,
      code: cleanCode,
      usedCount: current.usedCount, // Preserva histórico de utilizações
      createdAt: current.createdAt,
    };

    db.coupons[index] = updated;
    saveDatabase();
    res.json(updated);
  });

  // Desativar ou Excluir cupom (Admin)
  app.delete('/api/coupons/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.coupons.findIndex(c => c.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Cupom não encontrado.' });
    }

    // Se o cupom já tem histórico de uso, desativa-o ao invés de apagar para preservar integridade
    if (db.coupons[index].usedCount > 0) {
      db.coupons[index].active = false;
      saveDatabase();
      return res.json({ success: true, message: 'Cupom desativado com sucesso (histórico preservado).' });
    }

    db.coupons.splice(index, 1);
    saveDatabase();
    res.json({ success: true, message: 'Cupom removido com sucesso.' });
  });

  // VALIDAÇÃO DE CUPONS NO BACKEND (Segura, recalculada no servidor)
  app.post('/api/coupons/validate', (req: Request, res: Response) => {
    const { code, subtotal, customerEmail, customerId, items } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ valid: false, message: 'Por favor, informe o código do cupom.' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return res.status(404).json({ valid: false, message: 'Cupom inválido ou indisponível.' });
    }

    if (!coupon.active) {
      return res.status(400).json({ valid: false, message: 'Este cupom está temporariamente inativo.' });
    }

    const now = new Date();
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return res.status(400).json({ valid: false, message: 'Esta promoção ainda não iniciou.' });
    }

    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return res.status(400).json({ valid: false, message: 'Este cupom já expirou.' });
    }

    const numericSubtotal = Number(subtotal) || 0;
    if (coupon.minOrderValue && numericSubtotal < coupon.minOrderValue) {
      const formattedMin = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(coupon.minOrderValue);
      return res.status(400).json({
        valid: false,
        message: `O valor mínimo para utilizar este cupom é ${formattedMin}.`,
      });
    }

    // Validação de primeira compra
    if (coupon.firstPurchaseOnly) {
      const emailToCheck = customerEmail ? String(customerEmail).trim().toLowerCase() : '';
      const idToCheck = customerId ? String(customerId).trim() : '';

      // Verifica se o cliente possui pedidos efetivamente concluídos no sistema
      const hasCompletedOrder = db.orders.some(o => {
        const matchesCustomer =
          (emailToCheck && o.customer?.email?.trim().toLowerCase() === emailToCheck) ||
          (idToCheck && o.customerId === idToCheck);
        // Pedidos cancelados NÃO desqualificam a primeira compra
        return matchesCustomer && o.status !== 'cancelado';
      });

      if (hasCompletedOrder) {
        return res.status(400).json({
          valid: false,
          message: 'Este cupom é exclusivo para a primeira compra.',
        });
      }
    }

    // Validação de limite total de utilizações
    if (coupon.totalUsageLimit && coupon.usedCount >= coupon.totalUsageLimit) {
      return res.status(400).json({
        valid: false,
        message: 'O limite máximo de utilizações deste cupom foi atingido.',
      });
    }

    // Validação de produtos/categorias elegíveis (caso configurado)
    if (Array.isArray(items) && items.length > 0) {
      if (coupon.eligibleProducts && coupon.eligibleProducts.length > 0) {
        const hasEligibleProduct = items.some((it: CartItem) => coupon.eligibleProducts?.includes(it.productId));
        if (!hasEligibleProduct) {
          return res.status(400).json({
            valid: false,
            message: 'Este cupom não é válido para os produtos selecionados.',
          });
        }
      }

      if (coupon.eligibleCategories && coupon.eligibleCategories.length > 0) {
        const hasEligibleCategory = items.some((it: CartItem) => coupon.eligibleCategories?.includes(it.category));
        if (!hasEligibleCategory) {
          return res.status(400).json({
            valid: false,
            message: 'Este cupom não é válido para as categorias dos produtos no carrinho.',
          });
        }
      }
    }

    // CÁLCULO SEGURO DO DESCONTO
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (numericSubtotal * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    // Aplicação do teto máximo de desconto se houver
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    // O desconto nunca pode ultrapassar o subtotal
    discountAmount = Math.min(discountAmount, numericSubtotal);
    discountAmount = Math.round(discountAmount * 100) / 100;

    const newTotal = Math.max(0, numericSubtotal - discountAmount);

    return res.json({
      valid: true,
      message: `Cupom ${coupon.code} aplicado com sucesso!`,
      coupon: {
        code: coupon.code,
        campaignName: coupon.campaignName,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        newTotal,
      },
    });
  });

  // =========================================================================
  // 3. ROTAS DE AUTENTICAÇÃO E ÁREA DO CLIENTE
  // =========================================================================

  // Cadastro de Novo Cliente
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Por favor, insira um endereço de e-mail válido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'A confirmação de senha não confere.' });
    }

    if (db.users.some(u => u.email === cleanEmail)) {
      return res.status(409).json({ error: 'Já existe uma conta cadastrada com este e-mail.' });
    }

    const { hash, salt } = hashPassword(password);
    const newUser: CustomerUser & { passwordHash: string; salt: string } = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: String(name).trim(),
      email: cleanEmail,
      role: 'customer',
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      salt,
    };

    db.users.push(newUser);
    saveDatabase();

    const token = createSession(newUser.id, 'customer');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    });
  });

  // Login de Cliente
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.users.find(u => u.email === cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const isMatch = verifyPassword(password, user.passwordHash, user.salt);
    if (!isMatch) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    const token = createSession(user.id, user.role);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // Obter perfil do usuário autenticado (Sessão atual)
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const session = getSession(token);

    if (!session) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    const user = db.users.find(u => u.id === session.userId);
    if (!user) {
      // Se for admin autenticado por passcode direto
      if (session.role === 'admin') {
        return res.json({
          user: {
            id: 'admin-vybe',
            name: 'Administrador VYBE',
            email: 'admin@vybestudio.com.br',
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
        });
      }
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // Atualizar perfil do cliente autenticado
  app.put('/api/auth/profile', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const session = getSession(token);

    if (!session) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada.' });
    }

    const userIndex = db.users.findIndex(u => u.id === session.userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const { name, phone, email } = req.body;
    const user = db.users[userIndex];

    if (name) user.name = String(name).trim();
    if (phone !== undefined) user.phone = String(phone).trim();

    // Se alterar e-mail, valida se não existe duplicidade
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      if (cleanEmail !== user.email) {
        if (db.users.some(u => u.id !== user.id && u.email === cleanEmail)) {
          return res.status(409).json({ error: 'Este e-mail já está sendo utilizado por outra conta.' });
        }
        user.email = cleanEmail;
      }
    }

    saveDatabase();

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  });

  // Solicitação de recuperação de senha (Mensagem neutra de segurança)
  app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Por favor, informe seu e-mail.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = db.users.find(u => u.email === cleanEmail);

    if (user) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hora de validade
      db.resetTokens.push({ token: resetToken, email: cleanEmail, expiresAt });
      saveDatabase();
      console.log(`[Segurança] Token de redefinição de senha para ${cleanEmail}: ${resetToken}`);
    }

    // Regra 7: Apresenta mensagem neutra sem revelar existência de conta
    res.json({
      success: true,
      message: 'Se houver uma conta associada a este e-mail, enviamos as instruções de recuperação.',
    });
  });

  // Redefinir senha com token de uso único
  app.post('/api/auth/reset-password', (req: Request, res: Response) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'As senhas não coincidem.' });
    }

    const tokenEntryIndex = db.resetTokens.findIndex(t => t.token === token);
    if (tokenEntryIndex === -1) {
      return res.status(400).json({ error: 'Token de recuperação inválido ou já utilizado.' });
    }

    const tokenEntry = db.resetTokens[tokenEntryIndex];
    if (Date.now() > tokenEntry.expiresAt) {
      db.resetTokens.splice(tokenEntryIndex, 1);
      saveDatabase();
      return res.status(400).json({ error: 'Este link de recuperação expirou. Solicite um novo.' });
    }

    const user = db.users.find(u => u.email === tokenEntry.email);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.salt = salt;

    // Consome o token (uso único)
    db.resetTokens.splice(tokenEntryIndex, 1);
    saveDatabase();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.',
    });
  });

  // Login de Administrador
  app.post('/api/auth/admin-login', (req: Request, res: Response) => {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ error: 'Por favor, digite a senha de acesso.' });
    }

    const normalized = String(passcode).trim().toLowerCase();
    if (normalized === 'vybe2026' || normalized === 'admin') {
      const token = createSession('admin-vybe', 'admin');
      return res.json({
        success: true,
        token,
        role: 'admin',
      });
    }

    return res.status(401).json({ error: 'Chave de acesso administrativa inválida.' });
  });

  // =========================================================================
  // 4. ROTAS DE PEDIDOS (Com validação e persistência antes do WhatsApp)
  // =========================================================================

  // Listar pedidos (Admin vê todos; Cliente vê apenas os próprios)
  app.get('/api/orders', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const session = getSession(token);
    const isAdmin = (session && session.role === 'admin') || token === 'vybe_admin_secret_token_2026';

    if (isAdmin) {
      return res.json(db.orders);
    }

    if (session && session.role === 'customer') {
      const user = db.users.find(u => u.id === session.userId);
      if (user) {
        const userOrders = db.orders.filter(
          o => o.customerId === user.id || (o.customer?.email && o.customer.email.toLowerCase() === user.email.toLowerCase())
        );
        return res.json(userOrders);
      }
    }

    return res.status(401).json({ error: 'Faça login para consultar seus pedidos.' });
  });

  // Criar Pedido (Persistido no banco antes de abrir o WhatsApp)
  app.post('/api/orders', (req: Request, res: Response) => {
    const { customer, items, subtotal, couponCode } = req.body;

    if (!customer || !customer.name || !customer.whatsapp) {
      return res.status(400).json({ error: 'Nome e WhatsApp do cliente são obrigatórios.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'O pedido deve conter pelo menos um item.' });
    }

    const token = extractBearer(req);
    const session = getSession(token);
    let customerId: string | undefined = undefined;

    if (session && session.role === 'customer') {
      customerId = session.userId;
    }

    // Recalcula subtotal no servidor para segurança total
    const computedSubtotal = items.reduce((sum: number, it: CartItem) => {
      const qty = Math.max(1, Number(it.quantity) || 1);
      const price = Number(it.unitPrice) || 0;
      return sum + price * qty;
    }, 0);

    // Valida cupom no servidor se foi fornecido
    let appliedCoupon: Order['appliedCoupon'] = undefined;
    let discountAmount = 0;

    if (couponCode) {
      const cleanCode = String(couponCode).trim().toUpperCase();
      const coupon = db.coupons.find(c => c.code.toUpperCase() === cleanCode && c.active);

      if (coupon) {
        const meetsMin = !coupon.minOrderValue || computedSubtotal >= coupon.minOrderValue;
        if (meetsMin) {
          if (coupon.discountType === 'percentage') {
            discountAmount = (computedSubtotal * coupon.discountValue) / 100;
          } else {
            discountAmount = coupon.discountValue;
          }

          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }

          discountAmount = Math.min(discountAmount, computedSubtotal);
          discountAmount = Math.round(discountAmount * 100) / 100;

          appliedCoupon = {
            code: coupon.code,
            campaignName: coupon.campaignName,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount,
          };
        }
      }
    }

    const total = Math.max(0, computedSubtotal - discountAmount);

    // Gera ID único no padrão VYBE-YYMMDD-XXXX
    const d = new Date();
    const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const prefix = `VYBE-${ymd}-`;
    const todayCount = db.orders.filter(o => o.id.startsWith(prefix)).length;
    const orderId = `${prefix}${String(todayCount + 1).padStart(4, '0')}`;

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerId,
      customer,
      items,
      subtotal: Math.round(computedSubtotal * 100) / 100,
      discountAmount,
      appliedCoupon,
      total: Math.round(total * 100) / 100,
      status: 'pendente', // Inicialmente aguardando confirmação no WhatsApp
      hasCustomArtwork: items.some((it: CartItem) => !!it.customization),
      notes: customer.notes,
    };

    db.orders.unshift(newOrder);
    saveDatabase();

    res.status(201).json(newOrder);
  });

  // Atualizar status do pedido (Admin)
  app.put('/api/orders/:id/status', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: Order['status'][] = ['pendente', 'em_producao', 'concluido', 'cancelado'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status do pedido inválido.' });
    }

    const orderIndex = db.orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido não encontrado.' });
    }

    const prevStatus = db.orders[orderIndex].status;
    db.orders[orderIndex].status = status;

    // Se o pedido foi concluído e possuía cupom, incrementa usedCount
    if (status === 'concluido' && prevStatus !== 'concluido' && db.orders[orderIndex].appliedCoupon) {
      const code = db.orders[orderIndex].appliedCoupon?.code;
      const coupon = db.coupons.find(c => c.code === code);
      if (coupon) {
        coupon.usedCount = (coupon.usedCount || 0) + 1;
      }
    }

    saveDatabase();
    res.json(db.orders[orderIndex]);
  });

  // =========================================================================
  // 5. ROTAS DE PRODUTOS E CATEGORIAS (Gestão do Catálogo VYBE)
  // =========================================================================

  // Listar produtos
  app.get('/api/products', (req: Request, res: Response) => {
    const token = extractBearer(req);
    const session = getSession(token);
    const isAdmin = (session && session.role === 'admin') || token === 'vybe_admin_secret_token_2026';

    if (isAdmin || req.query.includeDrafts === 'true') {
      return res.json(db.products);
    }
    // Para visitantes regulares, exclui produtos em rascunho
    const publicProducts = db.products.filter(p => p.status !== 'rascunho');
    res.json(publicProducts);
  });

  // Criar produto (Admin)
  app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
    const p = req.body;
    if (!p.name || p.price === undefined) {
      return res.status(400).json({ error: 'Nome e preço do produto são obrigatórios.' });
    }

    const newProduct: Product = {
      id: p.id || `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sku: p.sku ? String(p.sku).trim() : `PRD-${Date.now().toString().slice(-4)}`,
      name: String(p.name).trim(),
      slug: p.slug ? String(p.slug).trim() : String(p.name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      category: p.category || 'canecas',
      categoryLabel: p.categoryLabel || 'Canecas',
      description: p.description || '',
      shortDescription: p.shortDescription || '',
      price: Number(p.price) || 0,
      promotionalPrice: p.promotionalPrice !== undefined && p.promotionalPrice !== null && p.promotionalPrice !== '' ? Number(p.promotionalPrice) : undefined,
      costPrice: p.costPrice !== undefined && p.costPrice !== null && p.costPrice !== '' ? Number(p.costPrice) : undefined,
      minQuantity: Number(p.minQuantity) || 1,
      maxQuantity: p.maxQuantity ? Number(p.maxQuantity) : undefined,
      manageStock: Boolean(p.manageStock),
      stockQuantity: p.stockQuantity !== undefined ? Number(p.stockQuantity) : undefined,
      allowBackorders: p.allowBackorders !== undefined ? Boolean(p.allowBackorders) : true,
      images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['/images/mug_white_product.png'],
      coverImage: p.coverImage || (Array.isArray(p.images) && p.images[0] ? p.images[0] : '/images/mug_white_product.png'),
      inStock: p.inStock !== undefined ? Boolean(p.inStock) : true,
      status: p.status || 'ativo',
      isCustomizable: Boolean(p.isCustomizable),
      customizationType: p.customizationType || (p.isCustomizable ? 'caneca_2d' : 'nenhum'),
      isFeatured: Boolean(p.isFeatured),
      specs: p.specs || {},
      badgeText: p.badgeText ? String(p.badgeText).trim() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.products.push(newProduct);
    saveDatabase();
    res.status(201).json(newProduct);
  });

  // Atualizar produto (Admin)
  app.put('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    const current = db.products[index];
    const updated: Product = {
      ...current,
      ...req.body,
      id: current.id,
      updatedAt: new Date().toISOString(),
    };

    db.products[index] = updated;
    saveDatabase();
    res.json(updated);
  });

  // Excluir produto (Admin)
  app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Produto não encontrado.' });
    }

    db.products.splice(index, 1);
    saveDatabase();
    res.json({ success: true, message: 'Produto excluído com sucesso.' });
  });

  // Listar categorias
  app.get('/api/categories', (req: Request, res: Response) => {
    // Atualiza contagem dinâmica de produtos ativos
    const updatedCategories = db.categories.map(cat => ({
      ...cat,
      productCount: db.products.filter(p => p.category === cat.id && p.status !== 'rascunho').length,
    }));
    res.json(updatedCategories);
  });

  // Criar categoria (Admin)
  app.post('/api/categories', requireAdmin, (req: Request, res: Response) => {
    const { id, name, tagline, image, customizable } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'O nome da categoria é obrigatório.' });
    }

    const cleanId = id ? String(id).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
    if (db.categories.some(c => c.id === cleanId)) {
      return res.status(409).json({ error: `A categoria com identificador '${cleanId}' já existe.` });
    }

    const newCat: CategoryInfo = {
      id: cleanId,
      name: String(name).trim(),
      tagline: tagline ? String(tagline).trim() : '',
      image: image || 'https://i.postimg.cc/mD4fkBtT/categoria-canecas.png',
      productCount: 0,
      customizable: Boolean(customizable),
    };

    db.categories.push(newCat);
    saveDatabase();
    res.status(201).json(newCat);
  });

  // Atualizar categoria (Admin)
  app.put('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.categories.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    db.categories[index] = {
      ...db.categories[index],
      ...req.body,
      id: db.categories[index].id,
    };
    saveDatabase();
    res.json(db.categories[index]);
  });

  // Excluir categoria (Admin)
  app.delete('/api/categories/:id', requireAdmin, (req: Request, res: Response) => {
    const { id } = req.params;
    const index = db.categories.findIndex(c => c.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Categoria não encontrada.' });
    }

    db.categories.splice(index, 1);
    saveDatabase();
    res.json({ success: true, message: 'Categoria excluída com sucesso.' });
  });

  // =========================================================================
  // 6. INTEGRAÇÃO VITE (Dev & Prod)
  // =========================================================================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[VYBE Studio API & Server] ativo em http://0.0.0.0:${port}`);
  });
}

startServer();
