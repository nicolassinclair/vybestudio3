import React, { useState, useEffect } from 'react';
import {
  Star,
  Shield,
  Lock,
  LogOut,
  Package,
  Layers,
  ShoppingBag,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Info,
  ExternalLink,
  Wand2,
  Eye,
  Tag,
  ArrowUp,
  ArrowDown,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { Product, Order, StoreSettings, HomeBanner, Coupon } from '../types';
import { getArtworkFromIndexedDB } from '../services/indexedDb';

export const AdminPage: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'coupons' | 'orders' | 'customization' | 'settings'>('banners');

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Banners state
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [editingBanner, setEditingBanner] = useState<HomeBanner | null>(null);
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  // Coupons state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isAddingCoupon, setIsAddingCoupon] = useState(false);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilter, setCouponFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderForArtwork, setSelectedOrderForArtwork] = useState<Order | null>(null);
  const [orderArtworkPreview, setOrderArtworkPreview] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<StoreSettings>(storageService.getSettings());
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Load data
  const refreshData = async () => {
    setProducts(storageService.getProducts());
    setSettings(storageService.getSettings());

    try {
      const bList = await apiService.getBanners();
      setBanners(bList.sort((a, b) => a.order - b.order));
    } catch {}

    try {
      const cList = await apiService.getCoupons();
      setCoupons(cList);
    } catch {}

    try {
      const oList = await apiService.getOrders('admin');
      if (oList && oList.length > 0) {
        setOrders(oList);
      } else {
        setOrders(storageService.getOrders());
      }
    } catch {
      setOrders(storageService.getOrders());
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const res = await login(passcode);
    if (!res.success) {
      setLoginError(res.error || 'Credencial inválida.');
    } else {
      refreshData();
    }
  };

  // ----------------------------------------------------
  // Product CRUD
  // ----------------------------------------------------
  const handleSaveProduct = (prod: Product) => {
    let updated: Product[];
    if (products.some(p => p.id === prod.id)) {
      updated = products.map(p => (p.id === prod.id ? prod : p));
    } else {
      updated = [...products, prod];
    }
    setProducts(updated);
    storageService.saveProducts(updated);
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      storageService.saveProducts(updated);
    }
  };

  const handleToggleProductFeatured = (id: string) => {
    const updated = products.map(p => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p));
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  const handleToggleProductStock = (id: string) => {
    const updated = products.map(p => (p.id === id ? { ...p, inStock: !p.inStock } : p));
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  // ----------------------------------------------------
  // Banners CRUD (Seção 5 do briefing)
  // ----------------------------------------------------
  const handleSaveBanner = async (bannerData: Partial<HomeBanner>) => {
    try {
      if (isAddingBanner || !bannerData.id) {
        const created = await apiService.createBanner(bannerData as any);
        setBanners(prev => [...prev, created].sort((a, b) => a.order - b.order));
      } else {
        const updated = await apiService.updateBanner(bannerData.id, bannerData);
        setBanners(prev => prev.map(b => (b.id === updated.id ? updated : b)).sort((a, b) => a.order - b.order));
      }
      setEditingBanner(null);
      setIsAddingBanner(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar banner.');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Deseja realmente excluir este banner da Home?')) return;
    try {
      await apiService.deleteBanner(id);
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir banner.');
    }
  };

  const handleToggleBannerActive = async (banner: HomeBanner) => {
    try {
      const updated = await apiService.updateBanner(banner.id, { active: !banner.active });
      setBanners(prev => prev.map(b => (b.id === banner.id ? updated : b)));
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar banner.');
    }
  };

  const handleMoveBannerOrder = async (banner: HomeBanner, direction: 'up' | 'down') => {
    const index = banners.findIndex(b => b.id === banner.id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const otherBanner = banners[targetIndex];
    const newOrderCurrent = otherBanner.order;
    const newOrderOther = banner.order;

    try {
      await apiService.updateBanner(banner.id, { order: newOrderCurrent });
      await apiService.updateBanner(otherBanner.id, { order: newOrderOther });

      const updated = [...banners];
      updated[index] = { ...banner, order: newOrderCurrent };
      updated[targetIndex] = { ...otherBanner, order: newOrderOther };
      setBanners(updated.sort((a, b) => a.order - b.order));
    } catch (err: any) {
      alert(err.message || 'Erro ao reordenar banner.');
    }
  };

  // ----------------------------------------------------
  // Cupons CRUD (Seção 11 do briefing)
  // ----------------------------------------------------
  const handleSaveCoupon = async (couponData: Partial<Coupon>) => {
    try {
      if (isAddingCoupon || !couponData.id) {
        const created = await apiService.createCoupon(couponData as any);
        setCoupons(prev => [created, ...prev]);
      } else {
        const updated = await apiService.updateCoupon(couponData.id, couponData);
        setCoupons(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      }
      setEditingCoupon(null);
      setIsAddingCoupon(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar cupom.');
    }
  };

  const handleToggleCouponActive = async (coupon: Coupon) => {
    try {
      const updated = await apiService.updateCoupon(coupon.id, { active: !coupon.active });
      setCoupons(prev => prev.map(c => (c.id === coupon.id ? updated : c)));
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar status do cupom.');
    }
  };

  const handleDeleteCoupon = async (coupon: Coupon) => {
    const confirmMsg =
      coupon.usedCount > 0
        ? 'Este cupom possui utilizações registradas. Ele será desativado para preservar o histórico. Continuar?'
        : 'Deseja realmente remover este cupom?';
    if (!confirm(confirmMsg)) return;

    try {
      await apiService.deleteCoupon(coupon.id);
      if (coupon.usedCount > 0) {
        setCoupons(prev => prev.map(c => (c.id === coupon.id ? { ...c, active: false } : c)));
      } else {
        setCoupons(prev => prev.filter(c => c.id !== coupon.id));
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao desativar/remover cupom.');
    }
  };

  // ----------------------------------------------------
  // Orders CRUD
  // ----------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const updated = await apiService.updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
      storageService.updateOrderStatus(orderId, status);
    } catch {
      storageService.updateOrderStatus(orderId, status);
      setOrders(storageService.getOrders());
    }
  };

  const handleViewOrderArtwork = async (order: Order) => {
    setSelectedOrderForArtwork(order);
    const customItem = order.items.find(i => !!i.customization);
    if (customItem?.customization?.customId) {
      const rec = await getArtworkFromIndexedDB(customItem.customization.customId);
      if (rec?.dataUrl) {
        setOrderArtworkPreview(rec.dataUrl);
        return;
      }
    }
    setOrderArtworkPreview(customItem?.customization?.mockupPreviewDataUrl || customItem?.customization?.artworkDataUrl || null);
  };

  // ----------------------------------------------------
  // Settings
  // ----------------------------------------------------
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.saveSettings(settings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-stone-200 p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <img
              src="/images/logo.png"
              alt="VYBE Studio"
              className="h-8 mx-auto object-contain mb-3"
            />
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center mx-auto shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <h1 className="font-display text-2xl font-bold text-stone-900">
              Painel Administrativo
            </h1>
            <p className="text-xs text-stone-500">
              Acesso restrito à gestão de banners, cupons, catálogo e pedidos da VYBE Studio.
            </p>
          </div>

          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-700 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-stone-900">
              <Info className="w-4 h-4 text-stone-700 shrink-0" />
              <span>Acesso Administrativo</span>
            </div>
            <p className="text-[11px] leading-relaxed text-stone-600">
              Digite a chave de acesso (ex: <strong>vybe2026</strong> ou <strong>admin</strong>) para desbloquear a interface administrativa.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Chave de Acesso Administrativo
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Digite sua chave..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition-colors"
                />
              </div>
              {loginError && (
                <p className="text-xs text-rose-600 mt-1">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD
  // ----------------------------------------------------
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch =
      c.code.toLowerCase().includes(couponSearch.toLowerCase()) ||
      c.campaignName.toLowerCase().includes(couponSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (couponFilter === 'active') return c.active;
    if (couponFilter === 'inactive') return !c.active;
    if (couponFilter === 'expired') {
      return c.endDate && new Date(c.endDate) < new Date();
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 space-y-8">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-stone-900">
              Painel de Gestão VYBE Studio
            </h1>
            <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-sm">
              Sincronização Ativa
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Gerencie banners da home, cupons promocionais, produtos, pedidos e configurações comerciais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Painel</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'banners'
              ? 'bg-black text-white shadow-xs'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Banners da Home ({banners.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('coupons')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'coupons'
              ? 'bg-black text-white shadow-xs'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Cupons e Promoções ({coupons.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-black text-white shadow-xs'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pedidos ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'products'
              ? 'bg-black text-white shadow-xs'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Produtos ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('customization')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'customization'
              ? 'bg-black text-white shadow-xs'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <Wand2 className="w-4 h-4" />
          <span>Personalizador 2D</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-black text-white shadow-xs'
              : 'text-stone-600 hover:text-black hover:bg-stone-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configurações & WhatsApp</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA: BANNERS DA HOME (Seção 5 do briefing)                                */}
      {/* ========================================================================= */}
      {activeTab === 'banners' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Banners da Home
              </h2>
              <p className="text-xs text-stone-500">
                Gerencie os slides do carrossel exibidos no topo da página inicial.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEditingBanner({
                  id: '',
                  name: '',
                  desktopImage: '',
                  mobileImage: '',
                  targetUrl: '',
                  altText: '',
                  order: banners.length + 1,
                  active: true,
                });
                setIsAddingBanner(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Novo Banner</span>
            </button>
          </div>

          {/* Modal / Formulário de Banner */}
          {editingBanner && (
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-300 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  {isAddingBanner ? 'Novo Banner Promocional' : `Editar: ${editingBanner.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Nome Interno da Campanha *
                  </label>
                  <input
                    type="text"
                    value={editingBanner.name}
                    onChange={e => setEditingBanner({ ...editingBanner, name: e.target.value })}
                    placeholder="Ex: Primeira Compra 20% OFF"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Link de Destino ao Clicar (opcional)
                  </label>
                  <input
                    type="text"
                    value={editingBanner.targetUrl || ''}
                    onChange={e => setEditingBanner({ ...editingBanner, targetUrl: e.target.value })}
                    placeholder="Ex: /personalizar/caneca ou /produtos"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Imagem Desktop (URL principal) *
                  </label>
                  <input
                    type="text"
                    value={editingBanner.desktopImage}
                    onChange={e => setEditingBanner({ ...editingBanner, desktopImage: e.target.value })}
                    placeholder="/images/banners/banner_primeiravybe.png"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Imagem Mobile (opcional para celulares)
                  </label>
                  <input
                    type="text"
                    value={editingBanner.mobileImage || ''}
                    onChange={e => setEditingBanner({ ...editingBanner, mobileImage: e.target.value })}
                    placeholder="URL ou caminho opcional para celulares"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Texto Alternativo (Acessibilidade / SEO)
                  </label>
                  <input
                    type="text"
                    value={editingBanner.altText}
                    onChange={e => setEditingBanner({ ...editingBanner, altText: e.target.value })}
                    placeholder="Descrição da imagem para leitores de tela"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div className="flex gap-4 items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                    <input
                      type="checkbox"
                      checked={editingBanner.active}
                      onChange={e => setEditingBanner({ ...editingBanner, active: e.target.checked })}
                      className="w-4 h-4 rounded-sm border-stone-300 text-black"
                    />
                    <span>Banner Ativo</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-700">Ordem:</span>
                    <input
                      type="number"
                      min={1}
                      value={editingBanner.order}
                      onChange={e => setEditingBanner({ ...editingBanner, order: Number(e.target.value) || 1 })}
                      className="w-16 px-2 py-1 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview da Imagem */}
              {editingBanner.desktopImage && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[11px] font-semibold text-stone-500 block">Prévia:</span>
                  <div className="w-full aspect-[1280/427] bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                    <img src={editingBanner.desktopImage} alt="" className="w-full h-full object-contain" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveBanner(editingBanner)}
                  className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  Salvar Banner
                </button>
              </div>
            </div>
          )}

          {/* Lista de Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((banner, idx) => (
              <div
                key={banner.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold bg-stone-100 text-stone-800 px-2 py-0.5 rounded-sm">
                      #{banner.order}
                    </span>
                    <h3 className="font-semibold text-stone-900 truncate max-w-[200px]">
                      {banner.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleBannerActive(banner)}
                    className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] cursor-pointer transition-colors ${
                      banner.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}
                  >
                    {banner.active ? 'Ativo na Home' : 'Inativo'}
                  </button>
                </div>

                {/* Banner Thumbnail */}
                <div className="aspect-[1280/427] w-full bg-stone-50 rounded-xl overflow-hidden border border-stone-100 flex items-center justify-center">
                  <img
                    src={banner.desktopImage}
                    alt={banner.altText}
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="text-[11px] text-stone-500 space-y-0.5">
                  <p className="truncate"><strong>Destino:</strong> {banner.targetUrl || 'Sem link configurado'}</p>
                  <p className="truncate"><strong>Alt text:</strong> {banner.altText}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveBannerOrder(banner, 'up')}
                      className="p-1 rounded-md text-stone-500 hover:text-black hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === banners.length - 1}
                      onClick={() => handleMoveBannerOrder(banner, 'down')}
                      className="p-1 rounded-md text-stone-500 hover:text-black hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingBanner(banner);
                        setIsAddingBanner(false);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-stone-700 hover:text-black hover:bg-stone-100 rounded-lg cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded-lg cursor-pointer"
                      title="Excluir banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: CUPONS E PROMOÇÕES (Seção 11 do briefing)                             */}
      {/* ========================================================================= */}
      {activeTab === 'coupons' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Cupons e Promoções
              </h2>
              <p className="text-xs text-stone-500">
                Cadastre e acompanhe cupons promocionais com regras validadas pelo servidor.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingCoupon({
                  id: '',
                  campaignName: '',
                  code: '',
                  discountType: 'percentage',
                  discountValue: 10,
                  minOrderValue: 0,
                  firstPurchaseOnly: false,
                  isCumulative: false,
                  active: true,
                  usedCount: 0,
                  createdAt: new Date().toISOString(),
                });
                setIsAddingCoupon(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Cupom</span>
            </button>
          </div>

          {/* Barra de Filtro e Busca */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-xl border border-stone-200">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={couponSearch}
                onChange={e => setCouponSearch(e.target.value)}
                placeholder="Buscar por código ou campanha..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex items-center gap-1 text-xs self-start sm:self-auto">
              {(['all', 'active', 'inactive', 'expired'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCouponFilter(f)}
                  className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                    couponFilter === f
                      ? 'bg-black text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {f === 'all' && 'Todos'}
                  {f === 'active' && 'Ativos'}
                  {f === 'inactive' && 'Inativos'}
                  {f === 'expired' && 'Expirados'}
                </button>
              ))}
            </div>
          </div>

          {/* Modal / Formulário de Cupom */}
          {editingCoupon && (
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-300 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  {isAddingCoupon ? 'Cadastrar Novo Cupom' : `Editar Regras: ${editingCoupon.code}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Nome da Campanha *
                  </label>
                  <input
                    type="text"
                    value={editingCoupon.campaignName}
                    onChange={e => setEditingCoupon({ ...editingCoupon, campaignName: e.target.value })}
                    placeholder="Ex: Campanha Primeira Compra"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Código do Cupom *
                  </label>
                  <input
                    type="text"
                    value={editingCoupon.code}
                    onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: PRIMEIRAVYBE"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono uppercase tracking-wider"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Tipo de Desconto *
                  </label>
                  <select
                    value={editingCoupon.discountType}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  >
                    <option value="percentage">Percentual (%)</option>
                    <option value="fixed">Valor Fixo (R$)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Valor do Desconto * {editingCoupon.discountType === 'percentage' ? '(%)' : '(R$)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.discountValue}
                    onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: Number(e.target.value) || 0 })}
                    placeholder="20"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Valor Mínimo do Pedido (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.minOrderValue || ''}
                    onChange={e => setEditingCoupon({ ...editingCoupon, minOrderValue: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Ex: 200"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Desconto Máximo / Teto (R$)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.maxDiscount || ''}
                    onChange={e => setEditingCoupon({ ...editingCoupon, maxDiscount: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Ex: 150"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={editingCoupon.startDate ? editingCoupon.startDate.slice(0, 10) : ''}
                    onChange={e => setEditingCoupon({ ...editingCoupon, startDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Data de Término (Expiração)
                  </label>
                  <input
                    type="date"
                    value={editingCoupon.endDate ? editingCoupon.endDate.slice(0, 10) : ''}
                    onChange={e => setEditingCoupon({ ...editingCoupon, endDate: e.target.value || undefined })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Limite Total de Usos
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editingCoupon.totalUsageLimit || ''}
                    onChange={e => setEditingCoupon({ ...editingCoupon, totalUsageLimit: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Ex: 100"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Checkboxes de regras de negócio */}
              <div className="flex flex-wrap gap-6 pt-3 border-t border-stone-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingCoupon.firstPurchaseOnly}
                    onChange={e => setEditingCoupon({ ...editingCoupon, firstPurchaseOnly: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-stone-300 text-black"
                  />
                  <span>Apenas Primeira Compra do Cliente</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingCoupon.isCumulative}
                    onChange={e => setEditingCoupon({ ...editingCoupon, isCumulative: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-stone-300 text-black"
                  />
                  <span>Acumulativo com outras promoções</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-stone-800">
                  <input
                    type="checkbox"
                    checked={editingCoupon.active}
                    onChange={e => setEditingCoupon({ ...editingCoupon, active: e.target.checked })}
                    className="w-4 h-4 rounded-sm border-stone-300 text-black"
                  />
                  <span>Cupom Ativo</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCoupon(editingCoupon)}
                  className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  Salvar Cupom
                </button>
              </div>
            </div>
          )}

          {/* Tabela de Cupons Cadastrados */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Código / Campanha</th>
                    <th className="p-3">Desconto</th>
                    <th className="p-3">Condições</th>
                    <th className="p-3">Utilizações</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCoupons.map(coupon => (
                    <tr key={coupon.id} className="hover:bg-stone-50/70">
                      <td className="p-3">
                        <span className="font-mono font-bold text-sm text-stone-900 bg-stone-100 px-2 py-0.5 rounded-sm">
                          {coupon.code}
                        </span>
                        <span className="block text-[11px] text-stone-500 mt-1">
                          {coupon.campaignName}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold text-stone-900 text-sm">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}%`
                            : `R$ ${coupon.discountValue.toFixed(2).replace('.', ',')}`}
                        </span>
                        {coupon.maxDiscount && (
                          <span className="block text-[11px] text-stone-400">
                            Teto máx: R$ {coupon.maxDiscount}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-stone-600 space-y-0.5 text-[11px]">
                        {coupon.minOrderValue ? (
                          <p>Mínimo: R$ {coupon.minOrderValue.toFixed(2).replace('.', ',')}</p>
                        ) : (
                          <p>Sem pedido mínimo</p>
                        )}
                        {coupon.firstPurchaseOnly && (
                          <span className="inline-block bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded-xs font-semibold">
                            1ª compra
                          </span>
                        )}
                        {coupon.endDate && (
                          <p className="text-stone-400">Válido até: {new Date(coupon.endDate).toLocaleDateString('pt-BR')}</p>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        <span className="font-semibold text-stone-900">{coupon.usedCount}</span>
                        {coupon.totalUsageLimit && (
                          <span className="text-stone-400"> / {coupon.totalUsageLimit}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleCouponActive(coupon)}
                          className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] cursor-pointer transition-colors ${
                            coupon.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-stone-100 text-stone-500 border border-stone-200'
                          }`}
                        >
                          {coupon.active ? 'Ativo' : 'Inativo'}
                        </button>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCoupon(coupon);
                            setIsAddingCoupon(false);
                          }}
                          className="p-1 text-stone-600 hover:text-black cursor-pointer"
                          title="Editar regras"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon)}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title={coupon.usedCount > 0 ? 'Desativar cupom' : 'Excluir cupom'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: PEDIDOS (Seção 17 do briefing)                                       */}
      {/* ========================================================================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Gerenciamento de Pedidos
              </h2>
              <p className="text-xs text-stone-500">
                Acompanhe o status comercial, itens, personalizações e cupons aplicados em cada pedido.
              </p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-xl border border-stone-200">
              <ShoppingBag className="w-8 h-8 text-stone-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-800">Nenhum pedido registrado ainda</p>
              <p className="text-xs text-stone-500 mt-1">
                Quando um cliente finalizar um pedido, ele aparecerá nesta lista com todos os dados.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">ID Pedido</th>
                      <th className="p-3">Data</th>
                      <th className="p-3">Cliente</th>
                      <th className="p-3">WhatsApp</th>
                      <th className="p-3">Itens</th>
                      <th className="p-3">Cupom</th>
                      <th className="p-3">Total</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Arte</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {orders.map(ord => (
                      <tr key={ord.id} className="hover:bg-stone-50/70">
                        <td className="p-3 font-mono font-bold text-stone-900">#{ord.id}</td>
                        <td className="p-3 text-stone-500">
                          {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="p-3 font-medium text-stone-900">{ord.customer.name}</td>
                        <td className="p-3 font-mono text-stone-600">
                          <a
                            href={`https://wa.me/${ord.customer.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline text-black"
                          >
                            {ord.customer.whatsapp}
                          </a>
                        </td>
                        <td className="p-3 text-stone-600">
                          {ord.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                        </td>
                        <td className="p-3">
                          {ord.appliedCoupon ? (
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                              {ord.appliedCoupon.code} (-R${ord.discountAmount})
                            </span>
                          ) : (
                            <span className="text-stone-400">Nenhum</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-semibold text-stone-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ord.total)}
                        </td>
                        <td className="p-3">
                          <select
                            value={ord.status}
                            onChange={e => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                            className="text-xs bg-stone-50 border border-stone-200 rounded-md px-2 py-1 font-medium cursor-pointer"
                          >
                            <option value="pendente">Aguardando confirmação</option>
                            <option value="em_producao">Em Produção</option>
                            <option value="concluido">Concluído</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          {ord.hasCustomArtwork ? (
                            <button
                              type="button"
                              onClick={() => handleViewOrderArtwork(ord)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 hover:bg-black hover:text-white rounded-md text-stone-700 transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Arte</span>
                            </button>
                          ) : (
                            <span className="text-stone-400">Padrão</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Artwork Modal */}
          {selectedOrderForArtwork && (
            <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Arte do Pedido #{selectedOrderForArtwork.id}
                    </h3>
                    <p className="text-xs text-stone-500">
                      Cliente: {selectedOrderForArtwork.customer.name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedOrderForArtwork(null)}
                    className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-center min-h-[220px]">
                  {orderArtworkPreview ? (
                    <img
                      src={orderArtworkPreview}
                      alt="Arte do cliente"
                      className="max-h-72 max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <p className="text-xs text-stone-400">Arte não encontrada no armazenamento.</p>
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 text-xs">
                  <span className="text-stone-500">Área de gabarito: 21 × 9,5 cm</span>
                  {orderArtworkPreview && (
                    <a
                      href={orderArtworkPreview}
                      download={`arte-pedido-${selectedOrderForArtwork.id}.png`}
                      className="px-3 py-1.5 bg-black text-white rounded-lg font-semibold hover:bg-stone-800"
                    >
                      Baixar Imagem
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: PRODUTOS                                                             */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-stone-900">
              Produtos Cadastrados
            </h2>
            <button
              type="button"
              onClick={() => {
                const newP: Product = {
                  id: `prod-${Date.now()}`,
                  name: 'Novo Produto',
                  slug: `novo-produto-${Date.now()}`,
                  category: 'canecas',
                  categoryLabel: 'Canecas',
                  description: 'Descrição do novo produto...',
                  price: 49.90,
                  minQuantity: 1,
                  images: ['/images/mug_white_product.png'],
                  inStock: true,
                  isCustomizable: false,
                  isFeatured: false,
                  specs: { dimensions: 'Dimensões padrão' },
                };
                setEditingProduct(newP);
                setIsAddingProduct(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          </div>

          {/* Product Edit Modal */}
          {editingProduct && (
            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-300 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <h3 className="text-sm font-bold text-stone-900">
                  {isAddingProduct ? 'Novo Produto' : `Editar: ${editingProduct.name}`}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Nome do Produto</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:text-black cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProduct(editingProduct)}
                  className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded-lg hover:bg-stone-800 cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Produto</th>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Preço</th>
                    <th className="p-3">Estoque</th>
                    <th className="p-3">Personalizador</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {products.map(prod => (
                    <tr key={prod.id} className="hover:bg-stone-50/70">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-stone-100 overflow-hidden p-1 shrink-0 flex items-center justify-center">
                          <img src={prod.images[0]} alt="" className="w-full h-full object-contain" />
                        </div>
                        <span className="font-semibold text-stone-900">{prod.name}
                          <span className="block font-mono text-[11px] text-stone-400">SKU {prod.sku}</span></span>
                      </td>
                      <td className="p-3 text-stone-600">{prod.categoryLabel}</td>
                      <td className="p-3 font-mono font-semibold text-stone-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => handleToggleProductStock(prod.id)}
                          className={`px-2 py-0.5 rounded-sm font-semibold text-[11px] cursor-pointer ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {prod.inStock ? 'Disponível' : 'Esgotado'}
                        </button>
                      </td>
                      <td className="p-3">
                        {prod.isCustomizable ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" /> Ativo
                          </span>
                        ) : (
                          <span className="text-stone-400">Padrão</span>
                        )}
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleProductFeatured(prod.id)}
                          aria-pressed={prod.isFeatured}
                          className={`p-1 cursor-pointer ${prod.isFeatured ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'}`}
                          title={prod.isFeatured ? 'Remover destaque da Home' : 'Destacar na Home'}
                        >
                          <Star className="w-3.5 h-3.5" fill={prod.isFeatured ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsAddingProduct(false);
                          }}
                          className="p-1 text-stone-600 hover:text-black cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-1 text-stone-400 hover:text-rose-600 cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: PERSONALIZADOR 2D                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'customization' && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Configuração Técnica do Personalizador 2D
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Parâmetros físicos e de impressão da Caneca Cerâmica 325ml.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900">Dimensões Físicas Oficiais</h4>
              <p>· Diâmetro: <strong>8 cm</strong></p>
              <p>· Altura: <strong>9,5 cm</strong></p>
              <p>· Capacidade: <strong>325 ml</strong></p>
              <p>· Imagem de Gabarito: <span className="font-mono text-stone-500">/images/mug_dimensions.png</span></p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
              <h4 className="font-bold text-stone-900">Área de Impressão Sublimática</h4>
              <p>· Largura: <strong>21 cm</strong></p>
              <p>· Altura: <strong>9,5 cm</strong></p>
              <p>· Proporção: <strong>21 : 9.5 (~2.21:1)</strong></p>
              <p>· Mockup Fotográfico: <span className="font-mono text-stone-500">/images/mug_mockup.png</span></p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA: CONFIGURAÇÕES & WHATSAPP                                             */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-xl border border-stone-200 p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-stone-900">
              Informações Comerciais da Loja & WhatsApp
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure o número oficial para onde os pedidos serão enviados.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Número do WhatsApp Oficial (apenas dígitos com DDI e DDD)
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={e => setSettings({ ...settings, whatsappNumber: e.target.value })}
                placeholder="5511987654321"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Formato de Exibição do WhatsApp
              </label>
              <input
                type="text"
                value={settings.whatsappDisplay}
                onChange={e => setSettings({ ...settings, whatsappDisplay: e.target.value })}
                placeholder="(11) 98765-4321"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">E-mail Comercial</label>
              <input
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Instagram da Marca</label>
              <input
                type="text"
                value={settings.instagram}
                onChange={e => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {settingsSavedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configurações salvas com sucesso!</span>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-stone-200">
            <button
              type="submit"
              className="px-5 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
