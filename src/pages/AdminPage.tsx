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
  Smartphone,
  Monitor,
  Upload,
  Copy,
  FolderPlus,
  Filter,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { apiService } from '../services/apiService';
import { Product, Order, StoreSettings, HomeBanner, Coupon, CategoryInfo, ProductStatus } from '../types';
import { getArtworkFromIndexedDB } from '../services/indexedDb';
import { ProductAdminModal } from '../components/ProductAdminModal';
import { CategoryAdminModal } from '../components/CategoryAdminModal';

export const AdminPage: React.FC = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'coupons' | 'orders' | 'customization' | 'settings'>('products');

  // Categories state
  const [categories, setCategories] = useState<CategoryInfo[]>(storageService.getCategories());
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Products state & filters
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [productStatusFilter, setProductStatusFilter] = useState<'all' | 'ativo' | 'indisponivel' | 'rascunho'>('all');

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
    setSettings(storageService.getSettings());

    try {
      const pList = await apiService.getProducts(true);
      if (pList && pList.length > 0) {
        setProducts(pList);
        storageService.saveProducts(pList);
      } else {
        setProducts(storageService.getProducts());
      }
    } catch {
      setProducts(storageService.getProducts());
    }

    try {
      const catList = await apiService.getCategories();
      if (catList && catList.length > 0) {
        setCategories(catList);
        storageService.saveCategories(catList);
      } else {
        setCategories(storageService.getCategories());
      }
    } catch {
      setCategories(storageService.getCategories());
    }

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
  const handleSaveProduct = async (prod: Product) => {
    try {
      if (isAddingProduct || !products.some(p => p.id === prod.id)) {
        await apiService.createProduct(prod);
      } else {
        await apiService.updateProduct(prod.id, prod);
      }
    } catch (e) {
      console.warn('API sync warning:', e);
    }

    let updated: Product[];
    if (products.some(p => p.id === prod.id)) {
      updated = products.map(p => (p.id === prod.id ? prod : p));
    } else {
      updated = [prod, ...products];
    }
    setProducts(updated);
    storageService.saveProducts(updated);
    setEditingProduct(null);
    setIsAddingProduct(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto do catálogo?')) {
      try {
        await apiService.deleteProduct(id);
      } catch (e) {
        console.warn('API error:', e);
      }
      const updated = products.filter(p => p.id !== id);
      setProducts(updated);
      storageService.saveProducts(updated);
    }
  };

  const handleDuplicateProduct = async (prod: Product) => {
    const newSku = `${prod.sku || 'PRD'}-COPY-${Math.floor(10 + Math.random() * 90)}`;
    const cloned: Product = {
      ...prod,
      id: `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: `${prod.name} (Cópia)`,
      slug: `${prod.slug}-copia-${Date.now()}`,
      sku: newSku,
      status: 'rascunho',
      isFeatured: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await apiService.createProduct(cloned);
    } catch (e) {
      console.warn('API error:', e);
    }

    const updated = [cloned, ...products];
    setProducts(updated);
    storageService.saveProducts(updated);
    setEditingProduct(cloned);
    setIsAddingProduct(false);
  };

  const handleToggleProductStatus = async (prod: Product) => {
    const nextStatus: ProductStatus =
      prod.status === 'ativo' ? 'indisponivel' : prod.status === 'indisponivel' ? 'rascunho' : 'ativo';
    const updatedProd: Product = { ...prod, status: nextStatus, inStock: nextStatus === 'ativo' };

    try {
      await apiService.updateProduct(prod.id, { status: nextStatus, inStock: updatedProd.inStock });
    } catch (e) {
      console.warn('API error:', e);
    }

    const updated = products.map(p => (p.id === prod.id ? updatedProd : p));
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  const handleToggleProductFeatured = async (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const isFeatured = !prod.isFeatured;

    try {
      await apiService.updateProduct(id, { isFeatured });
    } catch (e) {
      console.warn('API error:', e);
    }

    const updated = products.map(p => (p.id === id ? { ...p, isFeatured } : p));
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  const handleToggleProductStock = async (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    const inStock = !prod.inStock;
    const status: ProductStatus = inStock ? 'ativo' : 'indisponivel';

    try {
      await apiService.updateProduct(id, { inStock, status });
    } catch (e) {
      console.warn('API error:', e);
    }

    const updated = products.map(p => (p.id === id ? { ...p, inStock, status } : p));
    setProducts(updated);
    storageService.saveProducts(updated);
  };

  // ----------------------------------------------------
  // Category Handlers
  // ----------------------------------------------------
  const handleSaveCategory = async (cat: CategoryInfo) => {
    try {
      if (categories.some(c => c.id === cat.id)) {
        await apiService.updateCategory(cat.id, cat);
      } else {
        await apiService.createCategory(cat);
      }
    } catch (e) {
      console.warn('API error:', e);
    }

    let updatedCats: CategoryInfo[];
    if (categories.some(c => c.id === cat.id)) {
      updatedCats = categories.map(c => (c.id === cat.id ? cat : c));
    } else {
      updatedCats = [...categories, cat];
    }
    setCategories(updatedCats);
    storageService.saveCategories(updatedCats);
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await apiService.deleteCategory(catId);
    } catch (e) {
      console.warn('API error:', e);
    }
    const updatedCats = categories.filter(c => c.id !== catId);
    setCategories(updatedCats);
    storageService.saveCategories(updatedCats);
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

  const filteredProducts = products.filter(p => {
    const q = productSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      p.categoryLabel.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) return false;
    if (productStatusFilter !== 'all') {
      const pStatus = p.status || (p.inStock ? 'ativo' : 'indisponivel');
      if (pStatus !== productStatusFilter) return false;
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

      {/* Tabs Navigation Responsiva */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 border-b border-stone-200 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
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
          onClick={() => setActiveTab('banners')}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
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
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
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
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
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
          onClick={() => setActiveTab('customization')}
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
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
          className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] text-xs font-bold rounded-xl transition-colors shrink-0 whitespace-nowrap cursor-pointer ${
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
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-stone-500" />
                      <span>Imagem Desktop (Banner Horizontal) *</span>
                    </label>
                    <label className="text-[11px] text-stone-500 hover:text-black cursor-pointer font-medium flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload de arquivo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => {
                              if (ev.target?.result) {
                                setEditingBanner({ ...editingBanner, desktopImage: ev.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingBanner.desktopImage}
                    onChange={e => setEditingBanner({ ...editingBanner, desktopImage: e.target.value })}
                    placeholder="URL ou arquivo do banner desktop (1280x427)"
                    className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-stone-700 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-stone-500" />
                      <span>Imagem para dispositivos móveis (opcional)</span>
                    </label>
                    <label className="text-[11px] text-stone-500 hover:text-black cursor-pointer font-medium flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      <span>Upload mobile</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = ev => {
                              if (ev.target?.result) {
                                setEditingBanner({ ...editingBanner, mobileImage: ev.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={editingBanner.mobileImage || ''}
                    onChange={e => setEditingBanner({ ...editingBanner, mobileImage: e.target.value })}
                    placeholder="URL ou arquivo específico para telas de celular"
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

              {/* Preview Duplo (Desktop & Mobile) */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-700 block">Prévia Responsiva:</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  {/* Preview Desktop (2 colunas) */}
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-stone-600">
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Versão Desktop (Horizontal)</span>
                    </div>
                    <div className="w-full aspect-[1280/427] bg-white rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center">
                      {editingBanner.desktopImage ? (
                        <img src={editingBanner.desktopImage} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-stone-400 text-xs">Sem imagem desktop</span>
                      )}
                    </div>
                  </div>

                  {/* Preview Mobile (1 coluna) */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
                      <span className="flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Versão Mobile</span>
                      </span>
                      {editingBanner.mobileImage ? (
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">Específica</span>
                      ) : (
                        <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">Fallback original</span>
                      )}
                    </div>
                    <div className="w-full aspect-[4/5] max-w-[200px] mx-auto bg-white rounded-lg overflow-hidden border border-stone-200 flex items-center justify-center p-1">
                      <img
                        src={editingBanner.mobileImage || editingBanner.desktopImage}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

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

                {/* Banner Thumbnails */}
                <div className="space-y-2">
                  <div className="aspect-[1280/427] w-full bg-stone-50 rounded-xl overflow-hidden border border-stone-100 flex items-center justify-center">
                    <img
                      src={banner.desktopImage}
                      alt={banner.altText}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] px-1">
                    <span className="text-stone-500 flex items-center gap-1">
                      <Monitor className="w-3 h-3" />
                      <span>Desktop</span>
                    </span>
                    {banner.mobileImage ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile Ativo</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                        <Smartphone className="w-3 h-3" />
                        <span>Fallback Original</span>
                      </span>
                    )}
                  </div>
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

          {/* VISUALIZAÇÃO MOBILE DE CUPONS */}
          <div className="block sm:hidden space-y-3">
            {filteredCoupons.map(coupon => (
              <div key={coupon.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-sm text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                    {coupon.code}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleToggleCouponActive(coupon)}
                    className={`px-2.5 py-1 rounded-full font-semibold text-[11px] cursor-pointer transition-colors ${
                      coupon.active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500 border border-stone-200'
                    }`}
                  >
                    {coupon.active ? 'Ativo' : 'Inativo'}
                  </button>
                </div>

                <div className="text-xs space-y-1">
                  <p className="font-semibold text-stone-800">{coupon.campaignName}</p>
                  <p className="text-stone-600 font-medium">
                    Desconto:{' '}
                    <strong className="text-stone-900">
                      {coupon.discountType === 'percentage'
                        ? `${coupon.discountValue}% OFF`
                        : `R$ ${coupon.discountValue.toFixed(2).replace('.', ',')}`}
                    </strong>
                    {coupon.maxDiscount ? ` (Teto R$ ${coupon.maxDiscount})` : ''}
                  </p>
                  <p className="text-stone-500">
                    {coupon.minOrderValue ? `Mínimo: R$ ${coupon.minOrderValue.toFixed(2).replace('.', ',')}` : 'Sem pedido mínimo'}
                    {coupon.firstPurchaseOnly ? ' · Apenas 1ª compra' : ''}
                  </p>
                  <p className="text-stone-400 font-mono text-[11px]">
                    Usos: {coupon.usedCount} {coupon.totalUsageLimit ? `/ ${coupon.totalUsageLimit}` : ''}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCoupon(coupon);
                      setIsAddingCoupon(false);
                    }}
                    className="min-h-[44px] px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar Regras</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCoupon(coupon)}
                    className="min-h-[44px] px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela Desktop de Cupons Cadastrados */}
          <div className="hidden sm:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
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
            <>
              {/* VISUALIZAÇÃO MOBILE DE PEDIDOS */}
              <div className="block sm:hidden space-y-3">
                {orders.map(ord => (
                  <div key={ord.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded-md">
                        #{ord.id}
                      </span>
                      <span className="text-[11px] text-stone-500">
                        {new Date(ord.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <p className="font-bold text-stone-900 text-sm">{ord.customer.name}</p>
                      <p className="font-mono text-stone-600">
                        <a
                          href={`https://wa.me/${ord.customer.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-black font-semibold"
                        >
                          {ord.customer.whatsapp}
                        </a>
                      </p>
                      <p className="text-stone-600 text-[11px] pt-1">
                        {ord.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                      </p>
                      {ord.appliedCoupon && (
                        <p className="text-emerald-700 font-bold font-mono text-[11px]">
                          Cupom: {ord.appliedCoupon.code} (-R$ {ord.discountAmount})
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="text-xs text-stone-500">Total do Pedido:</span>
                      <span className="font-mono font-bold text-stone-900 text-sm">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(ord.total)}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-stone-100">
                      <label className="text-[11px] font-semibold text-stone-600">Status do Pedido:</label>
                      <select
                        value={ord.status}
                        onChange={e => handleUpdateOrderStatus(ord.id, e.target.value as any)}
                        className="w-full h-11 px-3 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        <option value="pendente">Aguardando confirmação</option>
                        <option value="em_producao">Em Produção</option>
                        <option value="concluido">Concluído</option>
                        <option value="cancelado">Cancelado</option>
                      </select>

                      {ord.hasCustomArtwork && (
                        <button
                          type="button"
                          onClick={() => handleViewOrderArtwork(ord)}
                          className="w-full min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Ver Arte da Caneca</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabela Desktop de Pedidos */}
              <div className="hidden sm:block bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
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
            </>
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
      {/* ABA: PRODUTOS (Gestão Completa de Catálogo)                               */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Header da aba */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Gerenciamento de Produtos ({products.length})
              </h2>
              <p className="text-xs text-stone-500">
                Cadastre novos itens, organize preços, controle estoque e configure o personalizador do estúdio.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                <FolderPlus className="w-4 h-4 text-stone-600" />
                <span>Gerenciar Categorias</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddingProduct(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] bg-black text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Novo Produto</span>
              </button>
            </div>
          </div>

          {/* Barra de Filtros e Busca */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Buscar por nome, SKU ou categoria..."
                className="w-full h-10 pl-9 pr-3 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-black"
              />
              {productSearch && (
                <button
                  type="button"
                  onClick={() => setProductSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro por Categoria */}
              <select
                value={productCategoryFilter}
                onChange={e => setProductCategoryFilter(e.target.value)}
                className="h-10 px-3 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all">Todas as Categorias</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Filtro por Status */}
              <select
                value={productStatusFilter}
                onChange={e => setProductStatusFilter(e.target.value as any)}
                className="h-10 px-3 bg-white border border-stone-200 rounded-xl text-xs font-medium focus:outline-hidden cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                <option value="ativo">🟢 Ativos</option>
                <option value="indisponivel">🟡 Indisponíveis</option>
                <option value="rascunho">⚪ Rascunhos</option>
              </select>
            </div>
          </div>

          {/* Estado Vazio de Produtos */}
          {filteredProducts.length === 0 ? (
            <div className="py-14 text-center bg-white rounded-2xl border border-stone-200 p-6 space-y-3">
              <Package className="w-8 h-8 text-stone-400 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">Nenhum produto encontrado</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                {productSearch || productCategoryFilter !== 'all' || productStatusFilter !== 'all'
                  ? 'Tente ajustar os filtros ou a busca para localizar o item.'
                  : 'Nenhum produto cadastrado ainda. Clique no botão acima para adicionar o primeiro produto.'}
              </p>
            </div>
          ) : (
            <>
              {/* VISUALIZAÇÃO MOBILE: CARDS RESPONSIVOS */}
              <div className="block sm:hidden space-y-3">
                {filteredProducts.map(prod => {
                  const pStatus = prod.status || (prod.inStock ? 'ativo' : 'indisponivel');
                  return (
                    <div
                      key={prod.id}
                      className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-xl bg-stone-100 overflow-hidden p-1 shrink-0 flex items-center justify-center border border-stone-200">
                          <img
                            src={prod.coverImage || prod.images[0]}
                            alt=""
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded-sm">
                              {prod.sku || 'SKU'}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                pStatus === 'ativo'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : pStatus === 'rascunho'
                                  ? 'bg-stone-100 text-stone-600 border border-stone-300'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {pStatus === 'ativo' ? 'Ativo' : pStatus === 'rascunho' ? 'Rascunho' : 'Esgotado'}
                            </span>
                            {prod.badgeText && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                                {prod.badgeText}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-stone-900 text-sm truncate mt-1">
                            {prod.name}
                          </h3>

                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="font-mono font-bold text-stone-900 text-sm">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)}
                            </span>
                            {prod.promotionalPrice && (
                              <span className="font-mono text-xs text-stone-400 line-through">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.promotionalPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-100">
                        <span>Categoria: <strong className="text-stone-700">{prod.categoryLabel}</strong></span>
                        <span>{prod.isCustomizable ? '🎨 Personalizável' : '📦 Padrão'}</span>
                      </div>

                      {/* Ações Mobile com touch targets confortáveis */}
                      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleToggleProductFeatured(prod.id)}
                          className={`min-h-[44px] flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                            prod.isFeatured ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-stone-50 border-stone-200 text-stone-500'
                          }`}
                          title="Destaque na Home"
                        >
                          <Star className="w-4 h-4" fill={prod.isFeatured ? 'currentColor' : 'none'} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateProduct(prod)}
                          className="min-h-[44px] flex items-center justify-center rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 transition-colors cursor-pointer"
                          title="Duplicar Produto"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct(prod);
                            setIsAddingProduct(false);
                          }}
                          className="min-h-[44px] flex items-center justify-center gap-1 col-span-1 rounded-xl bg-black text-white font-bold text-xs hover:bg-stone-800 transition-colors cursor-pointer"
                          title="Editar Produto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="min-h-[44px] flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                          title="Excluir Produto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VISUALIZAÇÃO DESKTOP: TABELA COMPLETA */}
              <div className="hidden sm:block bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5">Produto</th>
                        <th className="p-3.5">Categoria</th>
                        <th className="p-3.5">Preço</th>
                        <th className="p-3.5">Estoque</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Personalização</th>
                        <th className="p-3.5 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredProducts.map(prod => {
                        const pStatus = prod.status || (prod.inStock ? 'ativo' : 'indisponivel');
                        return (
                          <tr key={prod.id} className="hover:bg-stone-50/70 transition-colors">
                            <td className="p-3.5 flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden p-1 shrink-0 flex items-center justify-center border border-stone-200">
                                <img
                                  src={prod.coverImage || prod.images[0]}
                                  alt=""
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-stone-900 text-sm truncate max-w-[220px]">
                                    {prod.name}
                                  </span>
                                  {prod.badgeText && (
                                    <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-xs shrink-0">
                                      {prod.badgeText}
                                    </span>
                                  )}
                                </div>
                                <span className="block font-mono text-[11px] text-stone-400 mt-0.5">
                                  SKU: {prod.sku || 'Nenhum'}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <span className="font-medium text-stone-800">{prod.categoryLabel}</span>
                            </td>

                            <td className="p-3.5 font-mono">
                              <span className="font-bold text-stone-900 text-sm">
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.price)}
                              </span>
                              {prod.promotionalPrice && (
                                <span className="block text-[11px] text-stone-400 line-through">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(prod.promotionalPrice)}
                                </span>
                              )}
                            </td>

                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => handleToggleProductStock(prod.id)}
                                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] cursor-pointer transition-colors ${
                                  prod.inStock
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                              >
                                {prod.inStock ? 'Disponível' : 'Esgotado'}
                              </button>
                            </td>

                            <td className="p-3.5">
                              <button
                                type="button"
                                onClick={() => handleToggleProductStatus(prod)}
                                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] cursor-pointer transition-colors ${
                                  pStatus === 'ativo'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : pStatus === 'rascunho'
                                    ? 'bg-stone-100 text-stone-600 border border-stone-300'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                }`}
                                title="Clique para alternar o status"
                              >
                                {pStatus === 'ativo' ? '🟢 Ativo' : pStatus === 'rascunho' ? '⚪ Rascunho' : '🟡 Indisponível'}
                              </button>
                            </td>

                            <td className="p-3.5">
                              {prod.isCustomizable ? (
                                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{prod.customizationType === 'caneca_2d' ? 'Simulador 2D' : 'Upload'}</span>
                                </span>
                              ) : (
                                <span className="text-stone-400">Padrão</span>
                              )}
                            </td>

                            <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => handleToggleProductFeatured(prod.id)}
                                aria-pressed={prod.isFeatured}
                                className={`p-1.5 rounded-lg hover:bg-stone-100 cursor-pointer transition-colors ${
                                  prod.isFeatured ? 'text-amber-500' : 'text-stone-300 hover:text-stone-500'
                                }`}
                                title={prod.isFeatured ? 'Remover destaque da Home' : 'Destacar na Home'}
                              >
                                <Star className="w-4 h-4" fill={prod.isFeatured ? 'currentColor' : 'none'} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDuplicateProduct(prod)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-black hover:bg-stone-100 cursor-pointer transition-colors"
                                title="Duplicar Produto"
                              >
                                <Copy className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProduct(prod);
                                  setIsAddingProduct(false);
                                }}
                                className="p-1.5 rounded-lg text-stone-600 hover:text-black hover:bg-stone-100 cursor-pointer transition-colors"
                                title="Editar Produto"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(prod.id)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
                                title="Excluir Produto"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Modal Completo de Produto */}
          {(editingProduct !== null || isAddingProduct) && (
            <ProductAdminModal
              isOpen={editingProduct !== null || isAddingProduct}
              onClose={() => {
                setEditingProduct(null);
                setIsAddingProduct(false);
              }}
              product={editingProduct}
              isAdding={isAddingProduct}
              categories={categories}
              onSave={handleSaveProduct}
              onOpenCategoryManager={() => setIsCategoryModalOpen(true)}
            />
          )}

          {/* Modal de Gestão de Categorias */}
          {isCategoryModalOpen && (
            <CategoryAdminModal
              isOpen={isCategoryModalOpen}
              onClose={() => setIsCategoryModalOpen(false)}
              categories={categories}
              onSaveCategory={handleSaveCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}
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
