import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Check,
  Star,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Layers,
  Wand2,
  Sliders,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Info,
  Palette,
  Package,
} from 'lucide-react';
import { Product, CategoryInfo, ProductColor, ProductStatus } from '../types';

interface ProductAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  isAdding: boolean;
  categories: CategoryInfo[];
  onSave: (product: Product) => Promise<void> | void;
  onOpenCategoryManager?: () => void;
}

export const ProductAdminModal: React.FC<ProductAdminModalProps> = ({
  isOpen,
  onClose,
  product,
  isAdding,
  categories,
  onSave,
  onOpenCategoryManager,
}) => {
  const [activeSection, setActiveSection] = useState<'basic' | 'images' | 'pricing' | 'specs'>('basic');

  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'canecas',
    categoryLabel: 'Canecas',
    status: 'ativo',
    description: '',
    shortDescription: '',
    price: 39.9,
    promotionalPrice: undefined,
    costPrice: undefined,
    minQuantity: 1,
    maxQuantity: undefined,
    manageStock: false,
    stockQuantity: undefined,
    allowBackorders: true,
    images: ['/images/mug_white_product.png'],
    coverImage: '/images/mug_white_product.png',
    inStock: true,
    isCustomizable: false,
    customizationType: 'nenhum',
    isFeatured: false,
    badgeText: '',
    specs: {
      material: '',
      dimensions: '',
      printArea: '',
      capacity: '',
      weight: '',
      colors: [],
      sizes: [],
    },
  });

  // Auxiliary input states
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newSizeName, setNewSizeName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        status: product.status || 'ativo',
        shortDescription: product.shortDescription || '',
        specs: {
          material: product.specs?.material || '',
          dimensions: product.specs?.dimensions || '',
          diameter: product.specs?.diameter || '',
          height: product.specs?.height || '',
          printArea: product.specs?.printArea || '',
          capacity: product.specs?.capacity || '',
          weight: product.specs?.weight || '',
          colors: product.specs?.colors ? [...product.specs.colors] : [],
          sizes: product.specs?.sizes ? [...product.specs.sizes] : [],
        },
      });
    } else {
      // Default new product
      setFormData({
        id: `prod-${Date.now()}`,
        sku: `PRD-${Date.now().toString().slice(-4)}`,
        name: '',
        slug: '',
        category: categories[0]?.id || 'canecas',
        categoryLabel: categories[0]?.name || 'Canecas',
        status: 'ativo',
        description: '',
        shortDescription: '',
        price: 49.9,
        promotionalPrice: undefined,
        costPrice: undefined,
        minQuantity: 1,
        manageStock: false,
        stockQuantity: undefined,
        allowBackorders: true,
        images: ['/images/mug_white_product.png'],
        coverImage: '/images/mug_white_product.png',
        inStock: true,
        isCustomizable: false,
        customizationType: 'nenhum',
        isFeatured: false,
        badgeText: '',
        specs: {
          material: '',
          dimensions: '',
          printArea: '',
          capacity: '',
          weight: '',
          colors: [],
          sizes: [],
        },
      });
    }
    setActiveSection('basic');
    setErrors({});
  }, [product, isAdding, isOpen, categories]);

  if (!isOpen) return null;

  // Gerar SKU automático
  const handleGenerateSku = () => {
    const prefixMap: Record<string, string> = {
      canecas: 'CAN',
      camisas: 'CAM',
      bags: 'BAG',
      presentes: 'PRE',
    };
    const prefix = prefixMap[formData.category || 'canecas'] || 'PRD';
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormData(prev => ({ ...prev, sku: `${prefix}-${randNum}` }));
  };

  // Gerenciamento de Imagens
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    const currentImages = formData.images || [];
    const updatedImages = [...currentImages, url];
    setFormData(prev => ({
      ...prev,
      images: updatedImages,
      coverImage: prev.coverImage || url,
    }));
    setNewImageUrl('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageUploadLoading(true);
    const file = files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const currentImages = formData.images || [];
      const updatedImages = [...currentImages, dataUrl];
      setFormData(prev => ({
        ...prev,
        images: updatedImages,
        coverImage: prev.coverImage || dataUrl,
      }));
      setImageUploadLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };

    reader.onerror = () => {
      alert('Erro ao carregar o arquivo de imagem.');
      setImageUploadLoading(false);
    };

    reader.readAsDataURL(file);
  };

  const handleSetCover = (imgUrl: string) => {
    setFormData(prev => ({ ...prev, coverImage: imgUrl }));
  };

  const handleDeleteImage = (indexToRemove: number) => {
    const currentImages = formData.images || [];
    if (currentImages.length <= 1) {
      alert('O produto precisa ter pelo menos 1 imagem.');
      return;
    }
    const removedImg = currentImages[indexToRemove];
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    const updatedCover = formData.coverImage === removedImg ? updatedImages[0] : formData.coverImage;

    setFormData(prev => ({
      ...prev,
      images: updatedImages,
      coverImage: updatedCover,
    }));
  };

  const handleMoveImage = (currentIndex: number, direction: 'left' | 'right') => {
    const currentImages = [...(formData.images || [])];
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;

    const temp = currentImages[currentIndex];
    currentImages[currentIndex] = currentImages[targetIndex];
    currentImages[targetIndex] = temp;

    setFormData(prev => ({ ...prev, images: currentImages }));
  };

  // Cores
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    const currentColors = formData.specs?.colors || [];
    const newColor: ProductColor = {
      id: `col-${Date.now()}`,
      name: newColorName.trim(),
      hex: newColorHex,
      inStock: true,
    };
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        colors: [...currentColors, newColor],
      },
    }));
    setNewColorName('');
  };

  const handleRemoveColor = (id: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        colors: (prev.specs?.colors || []).filter(c => c.id !== id),
      },
    }));
  };

  // Tamanhos
  const handleAddSize = () => {
    if (!newSizeName.trim()) return;
    const cleanSize = newSizeName.trim().toUpperCase();
    const currentSizes = formData.specs?.sizes || [];
    if (!currentSizes.includes(cleanSize)) {
      setFormData(prev => ({
        ...prev,
        specs: {
          ...prev.specs,
          sizes: [...currentSizes, cleanSize],
        },
      }));
    }
    setNewSizeName('');
  };

  const handleRemoveSize = (sz: string) => {
    setFormData(prev => ({
      ...prev,
      specs: {
        ...prev.specs,
        sizes: (prev.specs?.sizes || []).filter(s => s !== sz),
      },
    }));
  };

  // Validação e Salvar
  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'O nome do produto é obrigatório.';
    }

    if (formData.price === undefined || formData.price === null || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Informe um preço válido maior que zero.';
    }

    if (!formData.images || formData.images.length === 0) {
      newErrors.images = 'Adicione ao menos uma imagem do produto.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Move para a aba correspondente
      if (newErrors.name) setActiveSection('basic');
      else if (newErrors.images) setActiveSection('images');
      else if (newErrors.price) setActiveSection('pricing');
      return;
    }

    setIsSaving(true);
    try {
      const selectedCat = categories.find(c => c.id === formData.category);
      const categoryLabel = selectedCat ? selectedCat.name : formData.categoryLabel || 'Geral';

      const finalProduct: Product = {
        id: formData.id || `prod-${Date.now()}`,
        sku: formData.sku?.trim() || `PRD-${Date.now().toString().slice(-4)}`,
        name: formData.name!.trim(),
        slug: formData.slug?.trim() || formData.name!.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        category: formData.category || 'canecas',
        categoryLabel,
        status: (formData.status as ProductStatus) || 'ativo',
        description: formData.description?.trim() || '',
        shortDescription: formData.shortDescription?.trim() || '',
        price: Number(formData.price),
        promotionalPrice: formData.promotionalPrice ? Number(formData.promotionalPrice) : undefined,
        costPrice: formData.costPrice ? Number(formData.costPrice) : undefined,
        minQuantity: Math.max(1, Number(formData.minQuantity) || 1),
        maxQuantity: formData.maxQuantity ? Number(formData.maxQuantity) : undefined,
        manageStock: Boolean(formData.manageStock),
        stockQuantity: formData.manageStock && formData.stockQuantity !== undefined ? Number(formData.stockQuantity) : undefined,
        allowBackorders: Boolean(formData.allowBackorders),
        images: formData.images && formData.images.length > 0 ? formData.images : ['/images/mug_white_product.png'],
        coverImage: formData.coverImage || (formData.images && formData.images[0]) || '/images/mug_white_product.png',
        inStock: formData.status === 'indisponivel' ? false : formData.inStock !== undefined ? formData.inStock : true,
        isCustomizable: Boolean(formData.isCustomizable),
        customizationType: formData.customizationType || (formData.isCustomizable ? 'caneca_2d' : 'nenhum'),
        isFeatured: Boolean(formData.isFeatured),
        badgeText: formData.badgeText?.trim() || undefined,
        specs: formData.specs || {},
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(finalProduct);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  // Cálculo de desconto % para feedback imediato
  const discountPercent =
    formData.price && formData.promotionalPrice && formData.promotionalPrice < formData.price
      ? Math.round(((formData.price - formData.promotionalPrice) / formData.price) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-stone-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header fixo */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-stone-200 bg-stone-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-900 leading-tight">
                {isAdding ? 'Cadastrar Novo Produto' : `Editar: ${formData.name || 'Produto'}`}
              </h2>
              <p className="text-[11px] text-stone-500">
                Gerencie catálogo, preços, estoque, imagens e personalização do estúdio.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Abas / Seções Responsiva */}
        <div className="flex items-center gap-1 sm:gap-2 px-4 sm:px-7 py-2.5 bg-stone-100/60 border-b border-stone-200 overflow-x-auto [scrollbar-width:none] shrink-0">
          <button
            type="button"
            onClick={() => setActiveSection('basic')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'basic'
                ? 'bg-black text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Informações Básicas</span>
            {errors.name && <span className="w-2 h-2 rounded-full bg-rose-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('images')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'images'
                ? 'bg-black text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>2. Imagens & Capa ({formData.images?.length || 0})</span>
            {errors.images && <span className="w-2 h-2 rounded-full bg-rose-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'pricing'
                ? 'bg-black text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>3. Preços & Estoque</span>
            {errors.price && <span className="w-2 h-2 rounded-full bg-rose-500" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('specs')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              activeSection === 'specs'
                ? 'bg-black text-white shadow-xs'
                : 'text-stone-600 hover:text-black hover:bg-white/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>4. Personalização & Especificações</span>
          </button>
        </div>

        {/* Corpo scrollável do formulário */}
        <form onSubmit={handleSaveSubmit} className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6">
          {/* ========================================================================= */}
          {/* SEÇÃO 1: INFORMAÇÕES BÁSICAS                                              */}
          {/* ========================================================================= */}
          {activeSection === 'basic' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Nome do produto */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Caneca Cerâmica 325ml"
                    className={`w-full h-11 px-3.5 bg-stone-50 border rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all ${
                      errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                    }`}
                  />
                  {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
                </div>

                {/* SKU */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-800">
                      Código SKU *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateSku}
                      className="text-[10px] font-bold text-stone-500 hover:text-black uppercase tracking-wider cursor-pointer"
                    >
                      Gerar Auto
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                    placeholder="Ex: CAN-001"
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs sm:text-sm font-bold uppercase focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Categoria */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-800">
                      Categoria do Produto *
                    </label>
                    {onOpenCategoryManager && (
                      <button
                        type="button"
                        onClick={onOpenCategoryManager}
                        className="text-[11px] font-semibold text-stone-600 hover:text-black flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Gerenciar Categorias</span>
                      </button>
                    )}
                  </div>
                  <select
                    value={formData.category || 'canecas'}
                    onChange={e => {
                      const catId = e.target.value;
                      const catObj = categories.find(c => c.id === catId);
                      setFormData({
                        ...formData,
                        category: catId,
                        categoryLabel: catObj ? catObj.name : catId,
                      });
                    }}
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status do produto */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Status de Publicação *
                  </label>
                  <select
                    value={formData.status || 'ativo'}
                    onChange={e => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all cursor-pointer"
                  >
                    <option value="ativo">🟢 Ativo (Visível no catálogo público)</option>
                    <option value="indisponivel">🟡 Indisponível (Visível mas marcado como esgotado)</option>
                    <option value="rascunho">⚪ Rascunho (Oculto do catálogo público)</option>
                  </select>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Produtos em rascunho são visíveis apenas para os administradores.
                  </p>
                </div>
              </div>

              {/* Descrição resumida */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Descrição Resumida (Card do catálogo & Metadados)
                </label>
                <input
                  type="text"
                  value={formData.shortDescription || ''}
                  onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Ex: Caneca de cerâmica resinada classe AAA para sublimação fotográfica."
                  maxLength={180}
                  className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                />
                <span className="text-[10px] text-stone-400 block text-right mt-1">
                  {(formData.shortDescription || '').length}/180 caracteres
                </span>
              </div>

              {/* Descrição completa */}
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">
                  Descrição Completa (Página de Detalhes do Produto)
                </label>
                <textarea
                  rows={4}
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Apresente as características técnicas, acabamento, instruções de lavagem, processo de impressão e apelo comercial do produto..."
                  className="w-full p-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all resize-y"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 2: IMAGENS & CAPA                                                   */}
          {/* ========================================================================= */}
          {activeSection === 'images' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Painel de Upload e Adição */}
              <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                      Adicionar Nova Imagem ao Produto
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      Aceita PNG com fundo transparente, JPG, JPEG e WebP sem distorção.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-black text-white text-xs font-bold rounded-xl hover:bg-stone-800 transition-colors cursor-pointer shadow-xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUploadLoading ? 'Carregando...' : 'Fazer Upload'}</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleFileUpload}
                        disabled={imageUploadLoading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => setNewImageUrl(e.target.value)}
                    placeholder="Ou cole o link direto da imagem (https://...)"
                    className="flex-1 h-10 px-3 bg-white border border-stone-300 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!newImageUrl.trim()}
                    className="h-10 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Adicionar URL
                  </button>
                </div>
              </div>

              {/* Grid de Imagens Cadastradas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Galeria do Produto ({formData.images?.length || 0})
                  </span>
                  <span className="text-[11px] text-stone-500">
                    A primeira imagem ou a imagem marcada como <strong>Capa</strong> será exibida nos cards do catálogo.
                  </span>
                </div>

                {(!formData.images || formData.images.length === 0) ? (
                  <div className="py-12 text-center bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300">
                    <ImageIcon className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-stone-700">Nenhuma imagem adicionada</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">Faça upload ou cole uma URL acima.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {formData.images.map((imgUrl, idx) => {
                      const isCover = formData.coverImage === imgUrl || (!formData.coverImage && idx === 0);
                      return (
                        <div
                          key={`${imgUrl}-${idx}`}
                          className={`group relative rounded-xl border overflow-hidden bg-stone-100 flex flex-col transition-all ${
                            isCover ? 'ring-2 ring-black border-black shadow-md' : 'border-stone-200'
                          }`}
                        >
                          {/* Badge de Capa */}
                          {isCover && (
                            <div className="absolute top-2 left-2 z-10 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              <span>Capa</span>
                            </div>
                          )}

                          {/* Preview da Imagem */}
                          <div className="aspect-square w-full flex items-center justify-center p-3 bg-stone-50/80">
                            <img
                              src={imgUrl}
                              alt=""
                              className="max-h-full max-w-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          {/* Controles de Ação */}
                          <div className="p-2 bg-white border-t border-stone-200 flex items-center justify-between gap-1 text-[11px]">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'left')}
                                disabled={idx === 0}
                                className="p-1 text-stone-500 hover:text-black hover:bg-stone-100 rounded-md disabled:opacity-30 cursor-pointer"
                                title="Mover para esquerda"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveImage(idx, 'right')}
                                disabled={idx === formData.images!.length - 1}
                                className="p-1 text-stone-500 hover:text-black hover:bg-stone-100 rounded-md disabled:opacity-30 cursor-pointer"
                                title="Mover para direita"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="flex items-center gap-1">
                              {!isCover && (
                                <button
                                  type="button"
                                  onClick={() => handleSetCover(imgUrl)}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold rounded-md text-[10px] cursor-pointer"
                                >
                                  Tornar Capa
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(idx)}
                                className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                                title="Excluir imagem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 3: PREÇOS & ESTOQUE                                                 */}
          {/* ========================================================================= */}
          {activeSection === 'pricing' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Preço Regular */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Preço Regular (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price !== undefined ? formData.price : ''}
                      onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      placeholder="49,90"
                      className="w-full h-11 pl-10 pr-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                {/* Preço Promocional */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-stone-800">
                      Preço Promocional (R$)
                    </label>
                    {discountPercent !== null && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-sm">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.promotionalPrice !== undefined ? formData.promotionalPrice : ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          promotionalPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="39,90 (opcional)"
                      className="w-full h-11 pl-10 pr-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>

                {/* Preço de Custo */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Custo Unitário (R$ - Interno)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500">
                      R$
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.costPrice !== undefined ? formData.costPrice : ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          costPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      placeholder="18,50 (opcional)"
                      className="w-full h-11 pl-10 pr-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Quantidade mínima e máxima */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Quantidade Mínima por Pedido
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.minQuantity || 1}
                    onChange={e => setFormData({ ...formData, minQuantity: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">Geralmente 1 para itens unitários.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Quantidade Máxima por Pedido (Opcional)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.maxQuantity || ''}
                    onChange={e => setFormData({ ...formData, maxQuantity: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="Sem limite"
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-black transition-all"
                  />
                </div>
              </div>

              {/* Gestão de Estoque */}
              <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-stone-900 block cursor-pointer">
                      Controlar Estoque deste Produto
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Desative caso trabalhe exclusivamente com produção sob demanda ilimitada.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.manageStock)}
                    onChange={e => setFormData({ ...formData, manageStock: e.target.checked })}
                    className="w-5 h-5 rounded-md border-stone-300 text-black cursor-pointer"
                  />
                </div>

                {formData.manageStock && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-200 animate-in fade-in duration-150">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">
                        Quantidade em Estoque Físico
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={formData.stockQuantity !== undefined ? formData.stockQuantity : ''}
                        onChange={e => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                        placeholder="Ex: 50"
                        className="w-full h-11 px-3.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm font-mono font-bold"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-6">
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-800 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(formData.allowBackorders)}
                          onChange={e => setFormData({ ...formData, allowBackorders: e.target.checked })}
                          className="w-4 h-4 rounded-sm border-stone-300 text-black cursor-pointer"
                        />
                        <span>Permitir encomendas sob demanda quando o estoque zerar</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 4: PERSONALIZAÇÃO & ESPECIFICAÇÕES                                  */}
          {/* ========================================================================= */}
          {activeSection === 'specs' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Personalização */}
              <div className="p-4 sm:p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs sm:text-sm font-bold text-stone-900 block cursor-pointer flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-emerald-600" />
                      <span>Produto Personalizável pelo Cliente</span>
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Habilita o simulador ou botão de envio de arte na página do produto.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isCustomizable)}
                    onChange={e => setFormData({ ...formData, isCustomizable: e.target.checked })}
                    className="w-5 h-5 rounded-md border-stone-300 text-black cursor-pointer"
                  />
                </div>

                {formData.isCustomizable && (
                  <div className="pt-3 border-t border-stone-200 space-y-3 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-stone-800">
                      Tipo de Motor de Personalização
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.customizationType === 'caneca_2d' ? 'border-black bg-stone-100 font-bold' : 'border-stone-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="customType"
                          value="caneca_2d"
                          checked={formData.customizationType === 'caneca_2d'}
                          onChange={() => setFormData({ ...formData, customizationType: 'caneca_2d' })}
                          className="mt-0.5"
                        />
                        <div>
                          <strong className="block text-stone-900">Simulador 2D Interativo (Caneca)</strong>
                          <span className="text-[11px] text-stone-500 font-normal">Gabarito 21×9.5cm, rotação, zoom e preview em tempo real.</span>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.customizationType === 'upload_imagem' ? 'border-black bg-stone-100 font-bold' : 'border-stone-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="customType"
                          value="upload_imagem"
                          checked={formData.customizationType === 'upload_imagem'}
                          onChange={() => setFormData({ ...formData, customizationType: 'upload_imagem' })}
                          className="mt-0.5"
                        />
                        <div>
                          <strong className="block text-stone-900">Envio de Arte / Estampa do Cliente</strong>
                          <span className="text-[11px] text-stone-500 font-normal">Upload do arquivo para aprovação via WhatsApp pelo estúdio.</span>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.customizationType === 'upload_logo' ? 'border-black bg-stone-100 font-bold' : 'border-stone-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="customType"
                          value="upload_logo"
                          checked={formData.customizationType === 'upload_logo'}
                          onChange={() => setFormData({ ...formData, customizationType: 'upload_logo' })}
                          className="mt-0.5"
                        />
                        <div>
                          <strong className="block text-stone-900">Aplicação de Logotipo / Marca</strong>
                          <span className="text-[11px] text-stone-500 font-normal">Ideal para empresas, eventos e brindes corporativos.</span>
                        </div>
                      </label>

                      <label className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                        formData.customizationType === 'texto' ? 'border-black bg-stone-100 font-bold' : 'border-stone-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="customType"
                          value="texto"
                          checked={formData.customizationType === 'texto'}
                          onChange={() => setFormData({ ...formData, customizationType: 'texto' })}
                          className="mt-0.5"
                        />
                        <div>
                          <strong className="block text-stone-900">Apenas Nome / Frase Curta</strong>
                          <span className="text-[11px] text-stone-500 font-normal">Cliente digita o texto desejado no checkout.</span>
                        </div>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Destaque na Home e Selo Promocional */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-stone-900 block cursor-pointer flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Destacar na Página Inicial</span>
                    </label>
                    <p className="text-[11px] text-stone-500">Aparecerá no carrossel de destaques da Home.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isFeatured)}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="w-5 h-5 rounded-md border-stone-300 text-black cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Selo / Tag Promocional (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.badgeText || ''}
                    onChange={e => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="Ex: Mais Vendido, Lançamento, Edição Limitada"
                    className="w-full h-11 px-3.5 bg-stone-50 border border-stone-300 rounded-xl text-xs sm:text-sm font-semibold"
                  />
                </div>
              </div>

              {/* Especificações Técnicas */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Ficha Técnica & Dimensões
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Material / Composição
                    </label>
                    <input
                      type="text"
                      value={formData.specs?.material || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          specs: { ...formData.specs, material: e.target.value },
                        })
                      }
                      placeholder="Ex: Cerâmica Resinada Classe AAA"
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Dimensões Físicas Gerais
                    </label>
                    <input
                      type="text"
                      value={formData.specs?.dimensions || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          specs: { ...formData.specs, dimensions: e.target.value },
                        })
                      }
                      placeholder="Ex: 8 cm × 9,5 cm ou 38 cm × 42 cm"
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Área de Impressão / Gabarito
                    </label>
                    <input
                      type="text"
                      value={formData.specs?.printArea || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          specs: { ...formData.specs, printArea: e.target.value },
                        })
                      }
                      placeholder="Ex: 21 cm × 9,5 cm"
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Capacidade Volumétrica
                    </label>
                    <input
                      type="text"
                      value={formData.specs?.capacity || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          specs: { ...formData.specs, capacity: e.target.value },
                        })
                      }
                      placeholder="Ex: 325 ml ou 18 Litros"
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Peso do Produto
                    </label>
                    <input
                      type="text"
                      value={formData.specs?.weight || ''}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          specs: { ...formData.specs, weight: e.target.value },
                        })
                      }
                      placeholder="Ex: 330 g"
                      className="w-full h-10 px-3 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Gerenciamento de Cores */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-stone-500" />
                      <span>Variações de Cor Disponíveis</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={e => setNewColorHex(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-stone-300 p-0.5 cursor-pointer bg-white"
                      title="Seletor de cor HEX"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={e => setNewColorName(e.target.value)}
                      placeholder="Nome da cor (ex: Branca, Preto Fosco, Azul)"
                      className="flex-1 h-9 px-3 bg-white border border-stone-300 rounded-lg text-xs font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      disabled={!newColorName.trim()}
                      className="h-9 px-3 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                    >
                      Adicionar Cor
                    </button>
                  </div>

                  {formData.specs?.colors && formData.specs.colors.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {formData.specs.colors.map(col => (
                        <div
                          key={col.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-xs"
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-stone-300 shrink-0"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span className="font-semibold text-stone-800">{col.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(col.id)}
                            className="text-stone-400 hover:text-rose-600 p-0.5 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gerenciamento de Tamanhos (Vestuário) */}
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <label className="text-xs font-bold text-stone-800 block">
                    Variações de Tamanho (Vestuário)
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newSizeName}
                      onChange={e => setNewSizeName(e.target.value)}
                      placeholder="Tamanho (ex: P, M, G, GG, XG, Único)"
                      className="flex-1 h-9 px-3 bg-white border border-stone-300 rounded-lg text-xs font-mono uppercase font-bold"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      disabled={!newSizeName.trim()}
                      className="h-9 px-3 bg-black text-white text-xs font-bold rounded-lg hover:bg-stone-800 disabled:opacity-50 cursor-pointer"
                    >
                      Adicionar
                    </button>
                  </div>

                  {formData.specs?.sizes && formData.specs.sizes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {formData.specs.sizes.map(sz => (
                        <span
                          key={sz}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-stone-200 rounded-md font-mono text-xs font-bold text-stone-900"
                        >
                          {sz}
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(sz)}
                            className="text-stone-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rodapé fixo do Modal com botões touch-friendly */}
          <div className="sticky -bottom-4 sm:-bottom-7 -mx-4 sm:-mx-7 px-4 sm:px-7 py-4 bg-white/95 backdrop-blur-md border-t border-stone-200 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-stone-500 w-full sm:w-auto text-center sm:text-left">
              Campos marcados com * são obrigatórios.
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 sm:flex-none h-11 px-5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 sm:flex-none h-11 px-6 bg-black hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'Salvando...' : isAdding ? 'Cadastrar Produto' : 'Salvar Alterações'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
