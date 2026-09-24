import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Truck,
  Building,
  Wand2,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { Order, CustomerDetails } from '../types';

export const CheckoutPage: React.FC = () => {
  const { cart, subtotal, discountAmount, total, appliedCoupon, totalItems, clearCart } = useCart();
  const { customer: authCustomer, refreshMyOrders } = useAuth();
  const navigate = useNavigate();
  const settings = storageService.getSettings();

  const [customer, setCustomer] = useState<CustomerDetails>({
    name: '',
    whatsapp: '',
    email: '',
    deliveryMethod: 'retirada',
    address: '',
    notes: '',
  });

  // Preenche dados do cliente se estiver autenticado
  useEffect(() => {
    if (authCustomer) {
      setCustomer(prev => ({
        ...prev,
        name: prev.name || authCustomer.name || '',
        email: prev.email || authCustomer.email || '',
        whatsapp: prev.whatsapp || authCustomer.phone || '',
      }));
    }
  }, [authCustomer]);

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!customer.name.trim()) {
      errors.name = 'Por favor, informe seu nome completo.';
    }
    if (!customer.whatsapp.trim()) {
      errors.whatsapp = 'Por favor, informe seu WhatsApp para contato.';
    } else if (customer.whatsapp.replace(/\D/g, '').length < 10) {
      errors.whatsapp = 'Informe um número válido com DDD (ex: 11999998888).';
    }
    if (customer.deliveryMethod === 'entrega' && !customer.address?.trim()) {
      errors.address = 'Informe o endereço completo com CEP para entrega.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFinishWhatsApp = async () => {
    if (!validateForm()) return;
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setSubmitError('');

    // Revalidação prévia do cupom no backend se houver cupom ativo (Seção 15)
    let validatedCoupon = appliedCoupon;
    if (appliedCoupon) {
      try {
        const valRes = await apiService.validateCoupon({
          code: appliedCoupon.code,
          subtotal,
          items: cart,
          customerEmail: customer.email,
          customerId: authCustomer?.id,
        });

        if (!valRes.valid) {
          setIsSubmitting(false);
          setSubmitError(`Cupom inválido: ${valRes.message}`);
          return;
        }
      } catch (e) {
        console.warn('Validação de cupom no servidor ignorada:', e);
      }
    }

    try {
      // 1. Registra o pedido no backend / banco de dados ANTES de abrir o WhatsApp (Seção 16)
      const newOrder = await apiService.createOrder({
        customer,
        items: [...cart],
        subtotal,
        couponCode: validatedCoupon?.code,
      });

      // Também sincroniza no storageService local
      storageService.saveOrder(newOrder);

      // Atualiza lista de pedidos se o cliente estiver logado
      if (authCustomer) {
        refreshMyOrders();
      }

      setCompletedOrder(newOrder);

      // 2. Constrói a mensagem estruturada para o WhatsApp oficial
      let msg = `*NOVO PEDIDO VYBE STUDIO*\n*SKU do pedido: ${newOrder.id}*\n\n`;
      msg += `*Cliente:* ${customer.name}\n`;
      msg += `*WhatsApp:* ${customer.whatsapp}\n`;
      if (customer.email) msg += `*E-mail:* ${customer.email}\n`;
      msg += `*Método:* ${customer.deliveryMethod === 'retirada' ? 'Retirada no estúdio' : 'Entrega / Envio'}\n`;
      if (customer.deliveryMethod === 'entrega' && customer.address) {
        msg += `*Endereço:* ${customer.address}\n`;
      }
      if (customer.notes) {
        msg += `*Observações:* ${customer.notes}\n`;
      }

      msg += `\n*ITENS DO PEDIDO:*\n`;
      cart.forEach((item, idx) => {
        msg += `${idx + 1}. *${item.name}* (Qtd: ${item.quantity})\n`;
        if (item.colorName) msg += `   - Cor: ${item.colorName}\n`;
        if (item.sizeName) msg += `   - Tamanho: ${item.sizeName}\n`;
        if (item.sku) msg += `   - SKU: ${item.sku}\n`;
        if (item.customization) {
          msg += `   - Personalização: Sim (Área: ${item.customization.printWidthCm}×${item.customization.printHeightCm} cm)\n`;
          msg += `   - Arquivo original: ${item.customization.originalFileName || 'Arte personalizada'}\n`;
        }
        msg += `   - Valor unitário: R$ ${item.unitPrice.toFixed(2).replace('.', ',')}\n`;
        msg += `   - Total item: R$ ${item.totalPrice.toFixed(2).replace('.', ',')}\n`;
      });

      msg += `\n*SUBTOTAL:* R$ ${subtotal.toFixed(2).replace('.', ',')}\n`;
      if (newOrder.appliedCoupon && newOrder.discountAmount) {
        msg += `*Cupom aplicado:* ${newOrder.appliedCoupon.code} (${newOrder.appliedCoupon.campaignName})\n`;
        msg += `*Desconto:* - R$ ${newOrder.discountAmount.toFixed(2).replace('.', ',')}\n`;
      }
      msg += `*VALOR TOTAL:* R$ ${newOrder.total.toFixed(2).replace('.', ',')}\n\n`;

      if (newOrder.hasCustomArtwork) {
        msg += `*ENVIO DA ARTE:*\n`;
        msg += `A arte foi configurada no simulador com o pedido #${newOrder.id}. Por favor, anexe o arquivo original de imagem (PNG/JPG) aqui nesta conversa para conferência e produção final.\n`;
      }

      const cleanPhone = settings.whatsappNumber.replace(/\D/g, '');
      const encoded = encodeURIComponent(msg);
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;

      // Limpa carrinho após o pedido ser devidamente persistido
      clearCart();

      // Abre WhatsApp para atendimento
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      setSubmitError(err.message || 'Erro ao registrar o pedido. Seu carrinho foi mantido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center space-y-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Pedido Registrado no Sistema
          </span>
          <h1 className="title-page">
            SKU do pedido: {completedOrder.id}
          </h1>
          <p className="text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            Seu pedido foi registrado com sucesso e está aguardando confirmação. Para combinar pagamento, prazo e entrega, conclua o atendimento no WhatsApp oficial.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-6 text-left space-y-4 max-w-xl mx-auto text-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <span className="font-semibold text-stone-900">Resumo do Pedido</span>
            <span className="font-mono text-stone-500">Status: Aguardando confirmação</span>
          </div>

          <div className="space-y-2">
            {completedOrder.items.map(it => (
              <div key={it.id} className="flex justify-between">
                <div>
                  <span className="font-medium text-stone-800">{it.name}</span>
                  <span className="text-stone-500"> × {it.quantity}</span>
                  {it.customization && (
                    <span className="block text-[10px] text-stone-500">
                      Personalizado (21×9,5 cm)
                    </span>
                  )}
                </div>
                <span className="font-mono font-semibold text-stone-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(it.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Subtotal, Cupom e Total */}
          <div className="pt-3 border-t border-stone-200 space-y-1">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal:</span>
              <span className="font-mono">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(completedOrder.subtotal)}</span>
            </div>

            {completedOrder.appliedCoupon && completedOrder.discountAmount ? (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Cupom ({completedOrder.appliedCoupon.code}):</span>
                <span className="font-mono">
                  - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(completedOrder.discountAmount)}
                </span>
              </div>
            ) : null}

            <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-100">
              <span>Total:</span>
              <span className="font-mono">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(completedOrder.total)}
              </span>
            </div>
          </div>

          {completedOrder.hasCustomArtwork && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1">
              <p className="font-semibold">Envio da Arte no WhatsApp</p>
              <p className="text-[11px] leading-relaxed">
                Por favor, anexe o arquivo original de imagem da sua arte diretamente na conversa do WhatsApp informando o número do seu pedido <strong>#{completedOrder.id}</strong>.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <a
            href={`https://wa.me/${settings.whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-black text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Abrir WhatsApp da VYBE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <Link
            to="/minha-conta"
            className="px-6 py-3.5 bg-stone-100 text-stone-800 text-sm font-medium rounded-xl hover:bg-stone-200 transition-colors"
          >
            Ver em Meus Pedidos
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-stone-900">Seu carrinho está vazio</h2>
        <p className="text-sm text-stone-500 max-w-sm mx-auto">
          Adicione produtos ao carrinho antes de prosseguir para o checkout.
        </p>
        <Link
          to="/produtos"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explorar Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link to="/produtos" className="hover:text-black transition-colors">
            Catálogo
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone-900 font-medium">Finalização de Pedido</span>
        </div>

        <h1 className="title-page">
          Finalizar Pedido
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Revise seus produtos, informe seus dados de entrega e conclua o atendimento com nossa equipe via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Customer & Delivery Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">
                Dados para Atendimento e Entrega
              </h2>
              <p className="text-xs text-stone-500">
                As informações abaixo serão anexadas à sua mensagem de pedido.
              </p>
            </div>
            {authCustomer && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
                Conta Conectada
              </span>
            )}
          </div>

          <div className="space-y-4">
            {/* Nome Completo */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={customer.name}
                onChange={e => setCustomer({ ...customer, name: e.target.value })}
                placeholder="Ex: João da Silva"
                className={`w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl focus:outline-none focus:bg-white transition-colors ${
                  formErrors.name ? 'border-rose-500' : 'border-stone-200 focus:border-black'
                }`}
              />
              {formErrors.name && (
                <p className="text-xs text-rose-600 mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* WhatsApp e E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  value={customer.whatsapp}
                  onChange={e => setCustomer({ ...customer, whatsapp: e.target.value })}
                  placeholder="(11) 99999-8888"
                  className={`w-full px-3.5 py-2.5 text-sm bg-stone-50 border rounded-xl focus:outline-none focus:bg-white transition-colors ${
                    formErrors.whatsapp ? 'border-rose-500' : 'border-stone-200 focus:border-black'
                  }`}
                />
                {formErrors.whatsapp && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={e => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="seuemail@exemplo.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Delivery Method Segmented Options */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-xs font-semibold text-stone-700 block">
                Forma de Recebimento
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setCustomer({ ...customer, deliveryMethod: 'retirada' })}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    customer.deliveryMethod === 'retirada'
                      ? 'border-black bg-stone-50 font-semibold text-black'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <Building className="w-5 h-5 text-stone-800" />
                  <div className="text-xs">
                    <p className="font-semibold">Retirada no Estúdio</p>
                    <p className="text-[11px] text-stone-500">Sem custo de frete</p>
                  </div>
                </div>

                <div
                  onClick={() => setCustomer({ ...customer, deliveryMethod: 'entrega' })}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    customer.deliveryMethod === 'entrega'
                      ? 'border-black bg-stone-50 font-semibold text-black'
                      : 'border-stone-200 text-stone-600 hover:border-stone-400'
                  }`}
                >
                  <Truck className="w-5 h-5 text-stone-800" />
                  <div className="text-xs">
                    <p className="font-semibold">Entrega / Envio</p>
                    <p className="text-[11px] text-stone-500">Frete calculado via WhatsApp</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço de Entrega se selecionado */}
            {customer.deliveryMethod === 'entrega' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700 block">
                  Endereço Completo com CEP *
                </label>
                <textarea
                  rows={2}
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  placeholder="Rua, número, complemento, bairro, cidade, estado e CEP"
                  className={`w-full px-3.5 py-2 text-sm bg-stone-50 border rounded-xl focus:outline-none focus:bg-white transition-colors ${
                    formErrors.address ? 'border-rose-500' : 'border-stone-200 focus:border-black'
                  }`}
                />
                {formErrors.address && (
                  <p className="text-xs text-rose-600">{formErrors.address}</p>
                )}
              </div>
            )}

            {/* Observações */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Observações do Pedido (opcional)
              </label>
              <textarea
                rows={2}
                value={customer.notes}
                onChange={e => setCustomer({ ...customer, notes: e.target.value })}
                placeholder="Ex: Data limite desejada, instruções para embalagem..."
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Right: Items Review & Finish Button */}
        <div className="lg:col-span-5 bg-stone-50 rounded-2xl border border-stone-200 p-6 space-y-6">
          <div className="border-b border-stone-200 pb-3">
            <h2 className="font-display text-lg font-bold text-stone-900">
              Revisão do Pedido
            </h2>
            <span className="text-xs text-stone-500">
              {totalItems} {totalItems === 1 ? 'item' : 'itens'} selecionados
            </span>
          </div>

          {/* List of items */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-200/80"
              >
                <div className="w-14 h-14 bg-stone-50 rounded-lg border border-stone-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                  <img
                    src={item.customization?.mockupPreviewDataUrl || item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-stone-900 truncate">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Qtd: {item.quantity} · Cor: {item.colorName || 'Padrão'}{item.sizeName ? ` · Tam: ${item.sizeName}` : ''}
                  </p>
                  {item.customization && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded-xs mt-0.5">
                      <Wand2 className="w-2.5 h-2.5" />
                      Arte 21×9,5 cm
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold font-mono text-stone-900 shrink-0">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Subtotals with Coupon */}
          <div className="space-y-2 pt-4 border-t border-stone-200 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Subtotal dos produtos:</span>
              <span className="font-mono font-semibold text-stone-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}
              </span>
            </div>

            {appliedCoupon && discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/80 p-2 rounded-lg">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" />
                  Cupom {appliedCoupon.code}:
                </span>
                <span className="font-mono">
                  - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(discountAmount)}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Envio:</span>
              <span>
                {customer.deliveryMethod === 'retirada' ? 'Grátis (Retirada)' : 'A combinar via WhatsApp'}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
              <span>Total Estimado:</span>
              <span className="font-mono text-base">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
              </span>
            </div>
          </div>

          {/* WhatsApp Action Button */}
          <div className="space-y-3 pt-2">
            {submitError && (
              <p role="alert" className="rounded-brand border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {submitError}
              </p>
            )}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleFinishWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-black text-white text-sm font-bold rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors shadow-md cursor-pointer"
            >
              <MessageSquare className="w-5 h-5 text-white" />
              <span>{isSubmitting ? 'Registrando pedido...' : 'Finalizar pedido pelo WhatsApp'}</span>
            </button>

            <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-500 space-y-1">
              <p className="font-semibold text-stone-700">Canal de Atendimento Oficial:</p>
              <p>
                O número de contato da loja é <strong>{settings.whatsappDisplay}</strong>. Ao clicar, seu pedido será registrado em nosso sistema e sua mensagem estruturada será aberta.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
