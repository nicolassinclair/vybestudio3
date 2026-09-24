import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User,
  ShoppingBag,
  Clock,
  Package,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  Wand2,
  Eye,
  X,
  Phone,
  Mail,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order, CartItem } from '../types';
import { getArtworkFromIndexedDB } from '../services/indexedDb';

export const CustomerAccountPage: React.FC = () => {
  const { customer, customerLoading, customerLogout, updateCustomerProfile, myOrders, refreshMyOrders } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>(tabParam === 'orders' ? 'orders' : 'profile');

  useEffect(() => {
    if (tabParam === 'orders' || tabParam === 'profile') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Perfil form
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Detalhes do pedido selecionado
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);

  // Redireciona para /login se não estiver autenticado
  useEffect(() => {
    if (!customerLoading && !customer) {
      navigate('/login', { state: { from: { pathname: '/minha-conta' } }, replace: true });
    }
  }, [customer, customerLoading, navigate]);

  // Atualiza os campos do perfil quando customer carrega
  useEffect(() => {
    if (customer) {
      setProfileName(customer.name || '');
      setProfileEmail(customer.email || '');
      setProfilePhone(customer.phone || '');
      refreshMyOrders();
    }
  }, [customer]);

  // Carrega arte da personalização se o pedido possuir artworkKey
  useEffect(() => {
    if (selectedOrder) {
      const customItem = selectedOrder.items.find(i => !!i.customization);
      if (customItem?.customization?.customId) {
        getArtworkFromIndexedDB(customItem.customization.customId).then(rec => {
          if (rec?.dataUrl) {
            setArtworkPreview(rec.dataUrl);
          } else {
            setArtworkPreview(
              customItem.customization?.mockupPreviewDataUrl ||
              customItem.customization?.artworkDataUrl ||
              null
            );
          }
        });
      } else {
        setArtworkPreview(null);
      }
    } else {
      setArtworkPreview(null);
    }
  }, [selectedOrder]);

  if (customerLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <span className="text-sm text-stone-500">Carregando seus dados...</span>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMessage(null);
    setIsSavingProfile(true);

    const res = await updateCustomerProfile({
      name: profileName.trim(),
      email: profileEmail.trim(),
      phone: profilePhone.trim(),
    });

    setIsSavingProfile(false);
    if (res.success) {
      setProfileMessage({ type: 'success', text: 'Dados atualizados com sucesso!' });
    } else {
      setProfileMessage({ type: 'error', text: res.error || 'Erro ao atualizar dados.' });
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pendente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            Aguardando confirmação
          </span>
        );
      case 'em_producao':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="w-3 h-3" />
            Em produção
          </span>
        );
      case 'concluido':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Concluído
          </span>
        );
      case 'cancelado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">
            Cancelado
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
            Painel do Cliente
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 mt-1">
            Olá, {customer.name}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            {customer.email}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            customerLogout();
            navigate('/');
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-black hover:bg-stone-100 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da conta</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Tabs */}
        <aside className="lg:col-span-3 space-y-1">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-black text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Meus Pedidos</span>
            </div>
            <span className="font-mono text-[11px] opacity-80">
              ({myOrders.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-black text-white'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <User className="w-4 h-4" />
              <span>Meu Perfil</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>
        </aside>

        {/* Tab Content */}
        <div className="lg:col-span-9">
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <h2 className="text-base font-bold text-stone-900">
                  Histórico de Pedidos
                </h2>
                <span className="text-xs text-stone-500">
                  {myOrders.length} {myOrders.length === 1 ? 'pedido registrado' : 'pedidos registrados'}
                </span>
              </div>

              {myOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-stone-900">Nenhum pedido encontrado</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    Você ainda não finalizou compras com esta conta. Conheça nossos produtos e personalize algo com a sua vibe!
                  </p>
                  <Link
                    to="/produtos"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors mt-2"
                  >
                    <span>Explorar Catálogo</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myOrders.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-3 shadow-xs hover:border-stone-400 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-stone-900">
                            #{order.id}
                          </span>
                          <span className="text-stone-400">·</span>
                          <span className="text-stone-500">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div>{getStatusBadge(order.status)}</div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-stone-900 truncate">
                                {it.name}
                              </span>
                              <span className="text-stone-400 shrink-0">× {it.quantity}</span>
                              {it.customization && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded-xs shrink-0">
                                  <Wand2 className="w-2.5 h-2.5" />
                                  Personalizado
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-stone-700 shrink-0 ml-2">
                              {formatCurrency(it.totalPrice)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Totals & Descontos */}
                      <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="space-y-0.5 text-stone-600">
                          <p>Subtotal: <span className="font-mono font-medium">{formatCurrency(order.subtotal)}</span></p>
                          {order.appliedCoupon && order.discountAmount ? (
                            <p className="text-emerald-700 font-medium">
                              Cupom {order.appliedCoupon.code}: -{formatCurrency(order.discountAmount)}
                            </p>
                          ) : null}
                          <p className="text-sm font-bold text-stone-900">
                            Total: <span className="font-mono">{formatCurrency(order.total)}</span>
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver detalhes</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6 shadow-xs max-w-xl">
              <div>
                <h2 className="text-base font-bold text-stone-900">
                  Dados do Perfil
                </h2>
                <p className="text-xs text-stone-500">
                  Mantenha suas informações de contato atualizadas para agilizar suas compras.
                </p>
              </div>

              {profileMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={profileEmail}
                    onChange={e => setProfileEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Telefone / WhatsApp (opcional)
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-stone-800 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes do Pedido com Visualizador de Arte */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Detalhes do Pedido
                </span>
                <h3 className="text-base font-bold font-mono text-stone-900">
                  #{selectedOrder.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Status atual:</span>
                <div>{getStatusBadge(selectedOrder.status)}</div>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Data da compra:</span>
                <span className="font-medium text-stone-800">
                  {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Forma de recebimento:</span>
                <span className="font-medium text-stone-800">
                  {selectedOrder.customer.deliveryMethod === 'retirada' ? 'Retirada no Estúdio' : 'Entrega / Envio'}
                </span>
              </div>

              {selectedOrder.customer.address && (
                <div>
                  <span className="text-stone-500 block mb-0.5">Endereço de entrega:</span>
                  <p className="bg-stone-50 p-2 rounded-lg text-stone-800 font-mono text-[11px]">
                    {selectedOrder.customer.address}
                  </p>
                </div>
              )}

              {/* Itens */}
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <span className="font-semibold text-stone-900 block">Itens comprados:</span>
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl">
                    <div>
                      <p className="font-semibold text-stone-900">{it.name} × {it.quantity}</p>
                      {it.colorName && <p className="text-[11px] text-stone-500">Cor: {it.colorName}</p>}
                      {it.customization && (
                        <p className="text-[11px] text-stone-600 font-medium">
                          Personalização 2D ({it.customization.printWidthCm}×{it.customization.printHeightCm} cm)
                        </p>
                      )}
                    </div>
                    <span className="font-mono font-semibold text-stone-900">
                      {formatCurrency(it.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Arte Associada */}
              {selectedOrder.hasCustomArtwork && artworkPreview && (
                <div className="pt-2 border-t border-stone-100 space-y-1.5">
                  <span className="font-semibold text-stone-900 block flex items-center gap-1.5">
                    <Wand2 className="w-3.5 h-3.5" />
                    Arte Associada ao Pedido
                  </span>
                  <div className="w-full aspect-[21/9.5] bg-stone-100 border border-stone-200 rounded-xl overflow-hidden flex items-center justify-center p-2">
                    <img
                      src={artworkPreview}
                      alt="Arte configurada no pedido"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Resumo Financeiro */}
              <div className="pt-3 border-t border-stone-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-stone-600">Subtotal:</span>
                  <span className="font-mono font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.appliedCoupon && selectedOrder.discountAmount ? (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Cupom {selectedOrder.appliedCoupon.code}:</span>
                    <span className="font-mono">-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between text-sm font-bold text-stone-900 pt-1 border-t border-stone-100">
                  <span>Total Pago / A Combinar:</span>
                  <span className="font-mono">{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
