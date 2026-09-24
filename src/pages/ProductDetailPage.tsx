import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Wand2, ShoppingBag, ArrowLeft, Check, Truck, ShieldCheck, HelpCircle, Plus, Minus } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useCart } from '../context/CartContext';
import { TechnicalSpecsCard } from '../components/TechnicalSpecsCard';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

const ConfigRow: React.FC<{
  id: string;
  label: string;
  value: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ id, label, value, open, onToggle, children }) => (
  <div className="px-5 py-4">
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[13px] text-stone-500">{label}</p>
        <div className="mt-0.5 text-[15px] font-semibold text-ink">{value}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`panel-${id}`}
        className={`min-h-11 shrink-0 rounded-full border border-ink px-5 text-xs font-bold tracking-wide transition-colors ${open ? 'bg-ink text-paper' : 'bg-paper text-ink hover:bg-ink hover:text-paper'}`}
      >
        EDITAR {open ? '▴' : '▾'}
      </button>
    </div>
    {open && <div id={`panel-${id}`} className="mt-4">{children}</div>}
  </div>
);

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = storageService.getProductById(id || '');
  const settings = storageService.getSettings();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(product?.minQuantity || 1);
  const [selectedColor, setSelectedColor] = useState(
    product?.specs.colors?.[0]?.name || 'Padrão'
  );
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900">Produto não encontrado</h2>
        <p className="text-sm text-stone-500 mt-2 mb-6">
          O produto que você procura não existe ou foi removido do catálogo.
        </p>
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </Link>
      </div>
    );
  }

  const hasPromo = product.promotionalPrice && product.promotionalPrice > 0 && product.promotionalPrice < product.price;
  const effectivePrice = hasPromo ? product.promotionalPrice! : product.price;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(effectivePrice);

  const originalPriceFormatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  const sizes = product.specs.sizes ?? (product.category === 'camisas' ? ['P', 'M', 'G', 'GG', 'XG'] : undefined);
  const minQty = product.minQuantity || 1;
  const maxQty = (product.manageStock && !product.allowBackorders && typeof product.stockQuantity === 'number')
    ? product.stockQuantity
    : (product.maxQuantity || 9999);

  const colors = product.specs.colors ?? [];
  const total = brl.format(effectivePrice * quantity);
  const toggle = (id: string) => setOpenRow(openRow === id ? null : id);
  const waMessage = `Olá! Vi o produto ${product.name} na ${settings.storeName} e gostaria de saber mais.`;
  const waUrl = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`;

  const handleAddToCart = async () => {
    if (sizes && !selectedSize) {
      setSizeError(true);
      setOpenRow('tam');
      return;
    }
    setIsAdding(true);
    await addToCart({
      productId: product.id,
      name: product.name,
      category: product.categoryLabel,
      unitPrice: effectivePrice,
      quantity,
      image: product.coverImage || product.images[0],
      colorName: selectedColor,
      sizeName: selectedSize || undefined,
    });
    setTimeout(() => setIsAdding(false), 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-12">
      {/* Breadcrumb back */}
      <div className="flex items-center gap-2 text-xs text-stone-500">
        <Link to="/produtos" className="hover:text-black transition-colors">
          Catálogo
        </Link>
        <span aria-hidden="true">/</span>
        <span className="capitalize">{product.categoryLabel}</span>
        <span aria-hidden="true">/</span>
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </div>

      {/* Main PDP Grid: Gallery Left, Sticky Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-4/3 sm:aspect-square bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden p-6 flex items-center justify-center relative">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="max-w-full max-h-full object-contain"
              referrerPolicy="no-referrer"
            />
            {product.isCustomizable && (
              <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-sm shadow-xs">
                Personalizável
              </span>
            )}
          </div>

          {/* Thumbnails if multiple images */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-xl bg-stone-50 border overflow-hidden p-1.5 transition-all shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-black ring-1 ring-black'
                      : 'border-stone-200 hover:border-stone-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Technical Specs Card Reutilizável */}
          <div className="mt-8">
            <TechnicalSpecsCard product={product} />
          </div>
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-stone-400 block">
              {product.categoryLabel}
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink mt-1">
              {product.name}
            </h1>
            {product.sku && <p className="mt-1 text-xs text-stone-400">SKU: {product.sku}</p>}

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-black font-mono tabular-nums">
                {formattedPrice}
              </span>
              {hasPromo && (
                <span className="text-sm font-semibold text-stone-400 line-through tabular-nums">
                  {originalPriceFormatted}
                </span>
              )}
              <span className="text-xs text-stone-500">
                · {product.inStock ? (
                  product.manageStock && typeof product.stockQuantity === 'number'
                    ? `${product.stockQuantity} disponíveis`
                    : 'Em estoque'
                ) : 'Sob encomenda'}
              </span>
            </div>
          </div>

          <p className="text-sm text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Configure do seu jeito */}
          {(colors.length > 0 || sizes || product.isCustomizable) && (
            <div className="overflow-hidden rounded-lg border border-stone-200 bg-paper">
              <h2 className="bg-ink px-5 py-4 text-base font-semibold text-paper">Configure do seu jeito</h2>
              <div className="divide-y divide-stone-200">
                {colors.length > 0 && (
                  <ConfigRow
                    id="cor"
                    label="Cor"
                    open={openRow === 'cor'}
                    onToggle={() => toggle('cor')}
                    value={
                      <span className="flex items-center gap-2">
                        <span className="h-3.5 w-3.5 rounded-full border border-stone-300" style={{ backgroundColor: colors.find(c => c.name === selectedColor)?.hex }} />
                        {selectedColor}
                      </span>
                    }
                  >
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Cor">
                      {colors.map(color => (
                        <button
                          key={color.id}
                          type="button"
                          aria-pressed={selectedColor === color.name}
                          onClick={() => { setSelectedColor(color.name); setOpenRow(null); }}
                          className={`flex h-11 items-center gap-2 rounded-md border px-4 text-sm transition-colors ${selectedColor === color.name ? 'border-ink bg-ink text-paper' : 'border-stone-200 bg-paper text-stone-800 hover:border-ink'}`}
                        >
                          <span className="h-3.5 w-3.5 rounded-full border border-stone-300" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </ConfigRow>
                )}

                {sizes && (
                  <ConfigRow
                    id="tam"
                    label="Tamanho"
                    open={openRow === 'tam'}
                    onToggle={() => toggle('tam')}
                    value={selectedSize || <span className="font-normal text-stone-500">Escolha uma opção</span>}
                  >
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Tamanho">
                      {sizes.map(sz => (
                        <button
                          key={sz}
                          type="button"
                          aria-pressed={selectedSize === sz}
                          onClick={() => { setSelectedSize(sz); setSizeError(false); setOpenRow(null); }}
                          className={`h-11 min-w-12 rounded-md border px-4 text-sm transition-colors ${selectedSize === sz ? 'border-ink bg-ink text-paper' : 'border-stone-200 bg-paper text-stone-800 hover:border-ink'}`}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </ConfigRow>
                )}
                {sizeError && <p role="alert" className="px-5 pb-4 text-xs text-rose-600">Escolha um tamanho para continuar.</p>}

                {product.isCustomizable && (
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-[13px] text-stone-500">Personalização</p>
                      <p className="mt-0.5 text-[15px] font-semibold text-ink">Envie sua arte e veja a prévia</p>
                    </div>
                    <Link
                      to={`/personalizar/caneca?produto=${product.id}`}
                      className="inline-flex min-h-11 shrink-0 items-center rounded-full bg-ink px-5 text-xs font-bold tracking-wide text-paper transition-colors hover:bg-graphite"
                    >
                      ABRIR
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Resumo */}
          <div className="overflow-hidden rounded-lg border border-stone-200 bg-paper">
            <h2 className="border-b border-stone-200 bg-snow px-5 py-4 text-base font-semibold text-ink">Resumo</h2>
            <div className="px-5 py-4">
              <dl className="space-y-1.5 text-[13px]">
                {[
                  ['Produto', product.name],
                  ...(colors.length > 0 ? [['Cor', selectedColor]] : []),
                  ...(sizes ? [['Tamanho', selectedSize || '—']] : []),
                  ['Quantidade', String(quantity)],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-stone-500">{k}</dt>
                    <dd className="text-right font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-4 border-t border-stone-200 pt-5 text-center">
                <span className="text-xs tracking-widest text-stone-500">TOTAL</span>
                <p className="mt-1 font-display text-4xl font-bold tabular-nums tracking-tight text-ink" aria-live="polite">{total}</p>
              </div>

              <div className="my-4 rounded-md bg-snow p-4 text-center">
                <div className="inline-flex items-center rounded-md border border-stone-200 bg-paper">
                  <button type="button" onClick={() => setQuantity(Math.max(minQty, quantity - 1))} className="flex h-11 w-11 items-center justify-center text-stone-600 hover:text-ink" aria-label="Diminuir quantidade">
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-11 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} className="flex h-11 w-11 items-center justify-center text-stone-600 hover:text-ink" aria-label="Aumentar quantidade">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-stone-500">Preço unitário: <strong className="text-ink">{brl.format(product.price)}</strong></p>
                {minQty > 1 && <p className="mt-1 text-xs text-stone-500">Pedido mínimo: {minQty} unidades</p>}
              </div>

          {/* Main Action Buttons */}
          <div className="space-y-3">
            {/* If product is customizable: prominent customize CTA */}
            {product.isCustomizable && (
              <Link
                to={`/personalizar/caneca?produto=${product.id}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-black text-white text-sm font-bold rounded-xl hover:bg-stone-800 transition-all shadow-sm"
              >
                <Wand2 className="w-4 h-4" />
                <span>Personalizar este produto</span>
              </Link>
            )}

            {/* Standard Add to Cart button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={isAdding}
              className={`w-full flex items-center justify-center gap-2 py-3 px-6 text-sm font-semibold rounded-xl border transition-all ${
                product.isCustomizable
                  ? 'bg-stone-100 text-stone-800 border-stone-200 hover:bg-stone-200'
                  : 'bg-black text-white border-transparent hover:bg-stone-800'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{isAdding ? 'Adicionando...' : 'Adicionar ao carrinho'}</span>
            </button>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center rounded-xl border border-stone-200 px-6 py-3 text-sm font-semibold text-stone-800 transition-colors hover:border-black"
            >
              Tirar dúvida sobre este produto no WhatsApp
            </a>
          </div>
            </div>
          </div>

          {/* Commercial Trust Items */}
          <div className="space-y-3 pt-6 border-t border-stone-100 text-xs text-stone-600">
            <div className="flex items-start gap-2.5">
              <Truck className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Produção sob demanda</span>
                <span>Prazo de confecção de 2 a 4 dias úteis após a aprovação da arte.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-stone-800 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block">Garantia VYBE Studio</span>
                <span>Sublimação de alta definição que não desbota na lavagem regular.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    <div className="h-20 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-4 border-t border-stone-200 bg-white px-5 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
        <strong className="whitespace-nowrap text-base tabular-nums">{formattedPrice}</strong>
        {product.isCustomizable ? (
          <Link to={`/personalizar/caneca?produto=${product.id}`} className="flex h-12 flex-1 items-center justify-center rounded-lg bg-black text-sm font-semibold text-white">
            Personalizar
          </Link>
        ) : (
          <button type="button" onClick={handleAddToCart} disabled={isAdding} className="h-12 flex-1 rounded-lg bg-black text-sm font-semibold text-white active:scale-[0.98] transition-transform">
            {isAdding ? 'Adicionando...' : 'Adicionar ao carrinho'}
          </button>
        )}
      </div>
    </div>
  );
};
