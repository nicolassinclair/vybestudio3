export interface ProductColor {
  id: string;
  name: string;
  hex: string;
  inStock: boolean;
  imagePreviewUrl?: string;
}

export interface CustomAttribute {
  id?: string;
  name: string;
  value: string;
  unit?: string;
}

export interface ProductSpecs {
  dimensions?: string; // e.g. "8 cm × 9,5 cm"
  diameter?: string;   // e.g. "8 cm"
  height?: string;     // e.g. "9,5 cm"
  printArea?: string;  // e.g. "21 cm × 9,5 cm"
  capacity?: string;   // e.g. "325 ml"
  material?: string;   // e.g. "Cerâmica Resinada Classe AAA"
  weight?: string;     // e.g. "330 g"
  colors?: ProductColor[];
  sizes?: string[];
  customAttributes?: CustomAttribute[];
}

export type ProductStatus = 'ativo' | 'indisponivel' | 'rascunho';

export interface Product {
  id: string;
  sku?: string; // ex.: CAN-001
  name: string;
  slug: string;
  category: string;
  categoryLabel: string;
  description: string;
  shortDescription?: string;
  price: number;
  promotionalPrice?: number;
  costPrice?: number;
  minQuantity: number;
  maxQuantity?: number;
  manageStock?: boolean;
  stockQuantity?: number;
  allowBackorders?: boolean;
  images: string[];
  coverImage?: string;
  inStock: boolean;
  status?: ProductStatus;
  isCustomizable: boolean;
  customizationType?: 'caneca_2d' | 'upload_imagem' | 'upload_logo' | 'texto' | 'nenhum';
  isFeatured: boolean;
  showInCatalog?: boolean;
  showInHome?: boolean;
  specs: ProductSpecs;
  badgeText?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomizationData {
  customId: string;
  productId: string;
  productName: string;
  color: ProductColor;
  quantity: number;
  printWidthCm: number;
  printHeightCm: number;
  artworkKey?: string; // IndexedDB key
  artworkDataUrl?: string; // Preview data URL
  offsetX: number; // in percentage or pixels
  offsetY: number;
  scale: number;
  rotation: number;
  dpiEstimate: number;
  dpiRating: 'excelente' | 'boa' | 'baixa';
  mockupPreviewDataUrl?: string;
  originalFileName?: string;
  originalFileSize?: number;
}

export interface CartItem {
  id: string; // Unique cart item ID (customizations have their own unique ID)
  productId: string;
  name: string;
  category: string;
  unitPrice: number;
  quantity: number;
  image: string;
  colorName?: string;
  sizeName?: string;
  sku?: string; // SKU do produto + variação
  customization?: CustomizationData;
  totalPrice: number;
}

export interface CustomerDetails {
  name: string;
  whatsapp: string;
  email?: string;
  deliveryMethod: 'retirada' | 'entrega';
  address?: string;
  notes?: string;
}

export type OrderStatus = 'pendente' | 'em_producao' | 'concluido' | 'cancelado';

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  campaignName: string;          // Identificação interna da promoção
  code: string;                  // Código utilizado pelo cliente
  discountType: DiscountType;    // Percentual ou valor fixo
  discountValue: number;         // Percentual (ex: 20) ou valor em reais (ex: 50)
  minOrderValue?: number;        // Valor mínimo do pedido para utilização
  maxDiscount?: number;          // Limite financeiro do desconto (ex: 150)
  startDate?: string;            // Início da validade (ISO string)
  endDate?: string;              // Encerramento da validade (ISO string)
  totalUsageLimit?: number;      // Quantidade máxima de usos
  usageLimitPerCustomer?: number;// Quantidade permitida por conta
  firstPurchaseOnly: boolean;    // Restringir a novos compradores
  eligibleProducts?: string[];   // Produtos que aceitam o cupom
  eligibleCategories?: string[]; // Categorias participantes
  isCumulative: boolean;         // Permitir ou impedir combinação com outras promoções
  active: boolean;               // Ativo ou inativo
  usedCount: number;             // Quantidade de utilizações confirmadas
  createdAt: string;
}

export interface AppliedCouponInfo {
  code: string;
  campaignName: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
}

export interface HomeBanner {
  id: string;
  name: string;             // Identificação da campanha (nome interno)
  desktopImage: string;     // Arquivo principal
  mobileImage?: string;     // Versão opcional para celulares
  targetUrl?: string;       // Página aberta ao clicar no banner
  altText: string;          // Descrição acessível da imagem
  order: number;            // Posição no carrossel
  active: boolean;          // Ativo ou inativo
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface Order {
  id: string; // e.g. #VYBE-2026-8492
  createdAt: string;
  customerId?: string; // ID da conta do cliente se autenticado
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discountAmount?: number;
  appliedCoupon?: AppliedCouponInfo;
  total: number;
  status: OrderStatus;
  hasCustomArtwork: boolean;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  slogan: string;
  whatsappNumber: string; // 5511999999999
  whatsappDisplay: string; // (11) 99999-9999
  email: string;
  instagram: string;
  pickupAddress: string;
  standardProductionTime: string;
  isDemoMode: boolean;
}

export interface CategoryInfo {
  id: string;
  name: string;
  tagline?: string;
  image?: string;
  productCount?: number;
  customizable?: boolean;
}
