import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Wand2, Tag, Check, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    total,
    totalItems,
    appliedCoupon,
    couponMessage,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const navigate = useNavigate();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const formattedSubtotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(subtotal);

  const formattedDiscount = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(discountAmount);

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(total);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCodeInput);
    setIsApplyingCoupon(false);
    setCouponCodeInput('');
  };

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-stone-800" />
              <h2 className="text-base font-bold text-stone-900">
                Seu Carrinho
              </h2>
              <span className="text-xs text-stone-500 font-mono">
                ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Fechar carrinho"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Item List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 divide-y divide-stone-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-stone-800">Seu carrinho está vazio</h3>
                <p className="text-xs text-stone-500 max-w-xs mt-1 mb-5">
                  Explore nosso catálogo e personalize produtos com a sua vibe.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/produtos');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-white bg-black rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-stone-50 border border-stone-200 rounded-lg shrink-0 overflow-hidden flex items-center justify-center p-1.5 relative">
                    <img
                      src={
                        item.customization?.mockupPreviewDataUrl ||
                        item.customization?.artworkDataUrl ||
                        item.image
                      }
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                    {item.customization && (
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded-xs font-mono">
                        2D
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-stone-900 leading-tight">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                          title="Remover do carrinho"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Customization badge */}
                      {item.customization ? (
                        <div className="mt-1 space-y-0.5 text-xs text-stone-500">
                          <p className="flex items-center gap-1 text-[11px] font-medium text-stone-700">
                            <Wand2 className="w-3 h-3 text-stone-800" />
                            <span>Arte personalizada ({item.customization.printWidthCm}×{item.customization.printHeightCm}cm)</span>
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Cor: {item.customization.color.name}
                          </p>
                        </div>
                      ) : (
                        item.colorName && (
                          <p className="text-[11px] text-stone-500 mt-0.5">Cor: {item.colorName}{item.sizeName ? ` · Tam: ${item.sizeName}` : ''}</p>
                        )
                      )}
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-50">
                      <div className="flex items-center border border-stone-200 rounded-md">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-stone-500 hover:text-black hover:bg-stone-100 transition-colors cursor-pointer"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-stone-800 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-stone-500 hover:text-black hover:bg-stone-100 transition-colors cursor-pointer"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-stone-900 font-mono tabular-nums">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(item.totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Cupons & Resumo Financeiro Completo */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50 space-y-4">
              {/* Seção de Cupons (Seção 13 do briefing) */}
              <div className="border border-stone-200 bg-white rounded-xl p-3.5 space-y-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-stone-600" />
                  Possui um cupom de desconto?
                </span>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg p-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold font-mono text-black bg-stone-200 px-2 py-0.5 rounded-sm">
                          {appliedCoupon.code}
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700">
                          {appliedCoupon.discountType === 'percentage'
                            ? `${appliedCoupon.discountValue}% OFF`
                            : `- ${formattedDiscount}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {appliedCoupon.campaignName}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer px-2 py-1"
                    >
                      Remover cupom
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ex: PRIMEIRAVYBE"
                      value={couponCodeInput}
                      onChange={e => setCouponCodeInput(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-black uppercase font-mono tracking-wider"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCodeInput.trim()}
                      className="px-3.5 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 disabled:opacity-50 transition-colors shrink-0 cursor-pointer"
                    >
                      {isApplyingCoupon ? 'Aplicando...' : 'Aplicar cupom'}
                    </button>
                  </form>
                )}

                {/* Mensagens de validação de cupom */}
                {couponMessage && (
                  <div
                    className={`text-[11px] flex items-start gap-1.5 pt-1 ${
                      couponMessage.type === 'success' ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {couponMessage.type === 'success' ? (
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    )}
                    <span>{couponMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Resumo Financeiro (Seção 14 do briefing) */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums font-semibold text-stone-900">
                    {formattedSubtotal}
                  </span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-medium">
                    <span>Cupom {appliedCoupon.code}</span>
                    <span className="font-mono tabular-nums font-semibold">
                      - {formattedDiscount}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-stone-500">
                  <span>Envio / Retirada</span>
                  <span>Calculado na finalização</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Total</span>
                  <span className="font-mono tabular-nums text-base">
                    {formattedTotal}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
              >
                <span>Finalizar Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={closeCart}
                className="w-full text-center text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors py-1 cursor-pointer"
              >
                Continuar Comprando
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
