import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Upload,
  RotateCw,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Move,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Check,
  AlertTriangle,
  Info,
  Layers,
  Sparkles,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { useCart } from '../context/CartContext';
import { CustomizationData, ProductColor } from '../types';
import { MugCanvasPreview } from '../components/MugCanvasPreview';

export const MugCustomizerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Load base mug product
  const productId = searchParams.get('produto') || 'caneca-ceramica-325ml';
  const product = storageService.getProductById(productId) || storageService.getProductById('caneca-ceramica-325ml')!;

  // 10. Selected Color (defaulting to white)
  const defaultColor: ProductColor = product.specs.colors?.[0] || {
    id: 'branca',
    name: 'Branca',
    hex: '#FFFFFF',
    inStock: true,
    imagePreviewUrl: '/images/mug_white_product.png',
  };
  const [selectedColor, setSelectedColor] = useState<ProductColor>(defaultColor);

  // 14. Quantity
  const [quantity, setQuantity] = useState(1);

  // 12. Editor State
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkUrl, setArtworkUrl] = useState<string | null>(null);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [imageMetrics, setImageMetrics] = useState<{
    width: number;
    height: number;
    dpi: number;
    rating: 'excelente' | 'boa' | 'baixa';
  } | null>(null);

  // 13. Preview View Mode ('mockup' | 'flat')
  const [viewMode, setViewMode] = useState<'mockup' | 'flat'>('mockup');
  const [mockupSnapshot, setMockupSnapshot] = useState<string>('');

  // UI state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editorBoxRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  // Handle File Upload & Validation
  const handleFileChange = (file: File) => {
    // Validate image format
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, envie um arquivo de imagem no formato PNG, JPG ou JPEG.');
      return;
    }

    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target?.result as string;
      setArtworkUrl(result);
      setArtworkFile(file);

      // Measure image dimensions and calculate print DPI
      const img = new Image();
      img.onload = () => {
        // Physical print size in inches: 21 cm / 2.54 = 8.27 in; 9.5 cm / 2.54 = 3.74 in
        const widthInches = 8.267;
        const estimatedDpi = Math.round(img.width / widthInches);
        let rating: 'excelente' | 'boa' | 'baixa' = 'boa';
        if (estimatedDpi >= 250) rating = 'excelente';
        else if (estimatedDpi < 150) rating = 'baixa';

        setImageMetrics({
          width: img.width,
          height: img.height,
          dpi: estimatedDpi,
          rating,
        });

        // Reset transform to center
        setOffsetX(0);
        setOffsetY(0);
        setScale(1.0);
        setRotation(0);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Reset Transformations
  const handleResetTransform = () => {
    setOffsetX(0);
    setOffsetY(0);
    setScale(1.0);
    setRotation(0);
  };

  // Center Art
  const handleCenterArt = () => {
    setOffsetX(0);
    setOffsetY(0);
  };

  // Rotate 90 degrees
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Drag handlers for mouse & touch on interactive editor
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!artworkUrl) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!artworkUrl || e.touches.length === 0) return;
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX - offsetX,
      y: e.touches[0].clientY - offsetY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length === 0) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add to Cart
  const handleAddToCart = async () => {
    if (!artworkUrl) {
      alert('Por favor, faça o upload de uma arte antes de adicionar a caneca personalizada ao carrinho.');
      return;
    }

    setIsAddingToCart(true);
    const customId = `caneca-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const customizationData: CustomizationData = {
      customId,
      productId: product.id,
      productName: product.name,
      color: selectedColor,
      quantity,
      printWidthCm: 21,
      printHeightCm: 9.5,
      artworkDataUrl: artworkUrl,
      offsetX,
      offsetY,
      scale,
      rotation,
      dpiEstimate: imageMetrics?.dpi || 200,
      dpiRating: imageMetrics?.rating || 'boa',
      mockupPreviewDataUrl: mockupSnapshot || artworkUrl,
      originalFileName: artworkFile?.name || 'arte-caneca.png',
      originalFileSize: artworkFile?.size || 0,
    };

    await addToCart({
      productId: product.id,
      name: product.name,
      category: product.categoryLabel,
      unitPrice: product.price,
      quantity,
      image: mockupSnapshot || product.images[0],
      colorName: selectedColor.name,
      customization: customizationData,
    });

    setIsAddingToCart(false);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 4000);
  };

  const scrollToEditor = () => {
    editorBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const unitPrice = product.price;
  const totalPrice = unitPrice * quantity;
  const colorsList: ProductColor[] = product.specs.colors && product.specs.colors.length > 0
    ? product.specs.colors
    : [defaultColor];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 space-y-10">
      {/* Breadcrumb & Page Title */}
      <div>
        <div className="flex items-center gap-2 text-xs text-stone-500 mb-2">
          <Link to="/personalizar" className="hover:text-black transition-colors">
            Personalizar
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-stone-900 font-medium">Caneca Cerâmica 325ml</span>
        </div>

        <h1 className="title-page">
          Personalizador de Canecas
        </h1>
        <p className="text-sm text-stone-600 max-w-2xl mt-1.5 leading-relaxed">
          Configure a caneca, faça o upload da sua arte e visualize em tempo real no simulador fotográfico calibrado para a área oficial de 21 × 9,5 cm.
        </p>
      </div>

      {/* Main Two-Column Desktop / Single-Column Mobile Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ========================================================================= */}
        {/* COLUNA ESQUERDA (Desktop ~56% / col-span-7) */}
        {/* Componentes: 1. Pré-visualização | 2. Editor de Arte | 3. Quantidade e Valores */}
        {/* ========================================================================= */}
        <div className="contents lg:block lg:col-span-7 lg:space-y-6">
          {/* 1. Pré-visualização da Caneca (Mobile order-1) */}
          <div className="order-1 lg:order-none">
            <MugCanvasPreview
              artworkUrl={artworkUrl}
              offsetX={offsetX}
              offsetY={offsetY}
              scale={scale}
              rotation={rotation}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onSnapshotReady={setMockupSnapshot}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) handleFileChange(e.target.files[0]);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-4 text-sm font-semibold transition-colors ${artworkUrl ? 'border border-stone-200 bg-white text-stone-800 hover:border-black' : 'border-2 border-dashed border-stone-300 text-ink hover:border-black'}`}
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span>{artworkUrl ? 'Trocar imagem' : 'Anexar imagem'}</span>
              {!artworkUrl && <span className="hidden font-normal text-stone-500 sm:inline">ou arraste aqui (PNG ou JPG)</span>}
            </button>
          </div>

          {/* 2. Editor de Arte da Caneca (Mobile order-5) */}
          <div
            ref={editorBoxRef}
            className="order-5 lg:order-none bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-5 shadow-xs"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-stone-100 pb-3.5 gap-2">
              <div>
                <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
                  Editor de Arte da Caneca
                </h2>
                <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                  Envie sua imagem e ajuste o posicionamento dentro da área de impressão de 21 × 9,5 cm.
                </p>
              </div>

              {artworkUrl && (
                <button
                  type="button"
                  onClick={handleResetTransform}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-black bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors shrink-0"
                  title="Restaurar posição original"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restaurar</span>
                </button>
              )}
            </div>

            {/* Upload Area (no art uploaded) */}
            {!artworkUrl ? (
              <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
                Anexe a sua imagem no card de pré-visualização para ajustar a posição aqui.
              </p>
            ) : (
              /* Interactive Canvas Drag Box */
              <div className="space-y-4">
                {/* 21x9.5 cm Proportional Drag Arena */}
                <div className="relative w-full aspect-21/9 bg-stone-100 border border-stone-300 rounded-xl overflow-hidden select-none cursor-move">
                  <div
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="absolute inset-0 flex items-center justify-center overflow-hidden touch-none select-none"
                  >
                    {/* Visual guidelines */}
                    <div className="absolute inset-3 border border-dashed border-stone-400/60 pointer-events-none rounded-xs flex items-center justify-center">
                      <span className="text-[10px] text-stone-400 font-mono select-none">
                        Área de Impressão 21 × 9,5 cm
                      </span>
                    </div>

                    {/* Image being dragged/transformed */}
                    <img
                      src={artworkUrl}
                      alt="Arte em edição"
                      style={{
                        transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale}) rotate(${rotation}deg)`,
                        transformOrigin: 'center center',
                        pointerEvents: 'none',
                        maxWidth: '55%',
                        maxHeight: '90%',
                      }}
                      className="transition-transform duration-75 select-none"
                    />
                  </div>

                  {/* Drag affordance badge */}
                  <div className="absolute bottom-2 left-2 pointer-events-none bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-sm flex items-center gap-1 font-mono">
                    <Move className="w-3 h-3" />
                    <span>Arraste com o mouse ou toque</span>
                  </div>
                </div>

                {/* Resolution & DPI Quality Check Badge */}
                {imageMetrics && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      imageMetrics.rating === 'excelente'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                        : imageMetrics.rating === 'boa'
                        ? 'bg-stone-50 border-stone-200 text-stone-800'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                    }`}
                  >
                    {imageMetrics.rating === 'baixa' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-0.5 flex-1">
                      <p className="font-semibold">
                        Resolução da imagem: {imageMetrics.width} × {imageMetrics.height} px (~{imageMetrics.dpi} DPI)
                      </p>
                      <p className="text-[11px] leading-relaxed">
                        {imageMetrics.rating === 'excelente'
                          ? 'Excelente! Sua arte possui densidade de pixels ideal para sublimação com máxima nitidez.'
                          : imageMetrics.rating === 'boa'
                          ? 'Boa qualidade. A arte terá resultado adequado na impressão física.'
                          : 'Aviso: Resolução abaixo de 150 DPI pode apresentar leve perda de nitidez na impressão física. Você ainda pode prosseguir normalmente.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Fine Controls Toolbar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Zoom Slider */}
                  <div className="space-y-1.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
                      <span>Zoom / Escala</span>
                      <span className="font-mono text-stone-500">{Math.round(scale * 100)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScale(Math.max(0.3, Number((scale - 0.1).toFixed(2))))}
                        className="p-1 text-stone-600 hover:text-black rounded-sm"
                        aria-label="Diminuir zoom"
                      >
                        <ZoomOut className="w-4 h-4" />
                      </button>
                      <input
                        type="range"
                        min="0.3"
                        max="2.5"
                        step="0.05"
                        value={scale}
                        onChange={e => setScale(parseFloat(e.target.value))}
                        className="w-full accent-black cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setScale(Math.min(2.5, Number((scale + 0.1).toFixed(2))))}
                        className="p-1 text-stone-600 hover:text-black rounded-sm"
                        aria-label="Aumentar zoom"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleCenterArt}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 transition-colors"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Centralizar</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleRotate}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Girar 90° ({rotation}°)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-xl text-xs font-medium text-stone-800 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Trocar Arte</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setArtworkUrl(null);
                        setArtworkFile(null);
                        setImageMetrics(null);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-medium transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Quantidade e Valores (Mobile order-6) */}
          <div className="order-6 lg:order-none bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
                Quantidade e Valores
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Preço oficial atualizado do catálogo.
              </p>
            </div>

            {/* Single horizontal line on desktop: Preço unitário | Seletor | Valor total */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
              {/* Preço Unitário (Esquerda) */}
              <div className="sm:w-1/3">
                <span className="text-xs text-stone-500 block">Preço unitário:</span>
                <span className="text-base sm:text-lg font-semibold text-stone-900 font-mono tabular-nums">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitPrice)}
                </span>
              </div>

              {/* Seletor de Quantidade (Centro) */}
              <div className="sm:w-1/3 flex sm:justify-center">
                <div className="inline-flex items-center border border-stone-200 rounded-xl bg-stone-50 p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1.5 text-stone-600 hover:text-black hover:bg-white rounded-lg transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-5 text-sm font-bold font-mono text-stone-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1.5 text-stone-600 hover:text-black hover:bg-white rounded-lg transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Valor Total (Direita, maior destaque) */}
              <div className="sm:w-1/3 sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                <span className="text-xs text-stone-500 block">Valor total:</span>
                <span className="text-xl sm:text-2xl font-extrabold text-stone-950 font-mono tabular-nums">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLUNA DIREITA (Desktop ~44% / col-span-5) */}
        {/* Componentes: 1. Caneca Cerâmica 325ml | 2. Cor da caneca | 3. Área de impressão | 4. Resumo da Personalização */}
        {/* ========================================================================= */}
        <div className="contents lg:block lg:col-span-5 lg:space-y-6">
          {/* 1. Caneca Cerâmica 325ml (Mobile order-2) */}
          <div className="order-2 lg:order-none bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
                Caneca Cerâmica 325ml
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Dimensões físicas do modelo oficial.
              </p>
            </div>

            {/* Imagem Técnica - ocupa quase toda largura útil, preservando proporção */}
            <div className="w-full bg-[#FAFAFA] rounded-xl border border-stone-200/70 p-3 flex items-center justify-center overflow-hidden">
              <img
                src="/images/mug_dimensions.png"
                alt="Dimensões Físicas da Caneca 8 cm x 9,5 cm"
                className="w-full h-auto max-h-[300px] object-contain"
                loading="lazy"
              />
            </div>

            {/* Três características técnicas em blocos horizontais */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              <div className="bg-stone-50 p-2.5 sm:p-3 rounded-xl border border-stone-100 text-center">
                <span className="text-stone-500 block text-[11px]">Diâmetro:</span>
                <span className="font-bold text-stone-900 font-mono text-sm sm:text-base">8 cm</span>
              </div>
              <div className="bg-stone-50 p-2.5 sm:p-3 rounded-xl border border-stone-100 text-center">
                <span className="text-stone-500 block text-[11px]">Altura:</span>
                <span className="font-bold text-stone-900 font-mono text-sm sm:text-base">9,5 cm</span>
              </div>
              <div className="bg-stone-50 p-2.5 sm:p-3 rounded-xl border border-stone-100 text-center">
                <span className="text-stone-500 block text-[11px]">Capacidade:</span>
                <span className="font-bold text-stone-900 font-mono text-sm sm:text-base">325 ml</span>
              </div>
            </div>

            {/* Observação */}
            <p className="text-[11px] text-stone-500 leading-relaxed bg-stone-50 p-2.5 rounded-lg border border-stone-100">
              Estas são as dimensões físicas da caneca. A área de impressão é configurada separadamente.
            </p>
          </div>

          {/* 2. Cor da caneca (Mobile order-3) */}
          <div className="order-3 lg:order-none bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
                Cor da caneca
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Selecione a cor de base para sublimação.
              </p>
            </div>

            {/* Grade de cores com suporte responsivo a novas adições */}
            <div className="grid grid-cols-1 gap-3">
              {colorsList.map(color => (
                <div
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`flex items-center gap-3.5 p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedColor.id === color.id
                      ? 'border-black bg-stone-50/90 shadow-xs'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg border border-stone-200 overflow-hidden p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={color.imagePreviewUrl || '/images/mug_white_product.png'}
                      alt={`Caneca ${color.name}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-stone-900">{color.name}</span>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                        Disponível.
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5 truncate">
                      Cerâmica resinada classe AAA para máxima vivacidade de cores.
                    </p>
                  </div>

                  {/* Indicador de seleção à direita */}
                  <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center shrink-0">
                    {selectedColor.id === color.id && (
                      <div className="w-2.5 h-2.5 bg-black rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Área de impressão (Mobile order-4) */}
          <div className="order-4 lg:order-none bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-display text-base sm:text-lg font-bold text-stone-900">
                Área de impressão
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Dimensões calibradas para sublimação panorâmica.
              </p>
            </div>

            {/* Imagem de referência da área de impressão */}
            <div className="w-full bg-[#FAFAFA] rounded-xl border border-stone-200/70 p-3 flex items-center justify-center overflow-hidden">
              <img
                src="/images/print_area_guide.png"
                alt="Gabarito da área de impressão 21 cm x 9,5 cm"
                className="w-full h-auto max-h-[220px] object-contain"
                loading="lazy"
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-stone-900">
                21 × 9,5 cm = Área disponível para impressão.
              </p>
              <p className="text-stone-500 leading-relaxed">
                Esta área funciona como referência para o posicionamento, centralização e dimensionamento da sua arte.
              </p>
            </div>
          </div>

          {/* 4. Resumo da Personalização (Mobile order-7) */}
          <div
            ref={summaryRef}
            className="order-7 lg:order-none bg-[#111111] text-white rounded-2xl border border-stone-800 p-5 sm:p-6 shadow-xl space-y-5"
          >
            {/* Header com linha divisória discreta */}
            <div className="border-b border-stone-800 pb-3">
              <h2 className="font-display text-base sm:text-lg font-bold text-white tracking-tight">
                Resumo da Personalização
              </h2>
            </div>

            {/* Informações do Produto */}
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl bg-stone-900 border border-stone-800 p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
                <img
                  src="/images/mug_mockup.png"
                  alt="Miniatura Caneca Cerâmica 325ml"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5 text-xs text-stone-300 flex-1 min-w-0">
                <p className="font-bold text-white text-sm leading-snug">
                  Caneca Cerâmica 325ml
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <p className="text-stone-400">
                    Cor: <span className="text-white font-medium">{selectedColor.name}</span>
                  </p>
                  <p className="text-stone-400">
                    Área de impressão: <span className="text-white font-mono">21 × 9,5 cm</span>
                  </p>
                  <p className="text-stone-400 sm:col-span-2 break-words">
                    Arte:{' '}
                    <span className={artworkUrl ? "text-emerald-400 font-semibold" : "text-amber-300 font-medium"}>
                      {artworkUrl
                        ? (artworkFile?.name ? `Arquivo carregado (${artworkFile.name})` : 'Arquivo carregado com sucesso')
                        : 'Nenhuma arte enviada'}
                    </span>
                  </p>
                  <p className="text-stone-400">
                    Quantidade: <span className="text-white font-mono font-bold">{quantity} {quantity === 1 ? 'unidade' : 'unidades'}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Divisor discreto e Destaque do Valor Total */}
            <div className="border-t border-stone-800/80 pt-4 flex items-baseline justify-between gap-4">
              <div>
                <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">
                  VALOR TOTAL
                </span>
                {quantity > 1 && (
                  <span className="text-[11px] text-stone-400 font-normal block mt-0.5">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(unitPrice)} cada
                  </span>
                )}
              </div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice)}
              </span>
            </div>

            {/* Botões de Ação */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || !artworkUrl}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  !artworkUrl
                    ? 'bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-700'
                    : 'bg-white text-[#111111] hover:bg-stone-200 cursor-pointer active:scale-[0.99]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 shrink-0" />
                <span>
                  {isAddingToCart
                    ? 'Adicionando ao carrinho...'
                    : !artworkUrl
                    ? 'Adicionar ao carrinho (envie sua arte)'
                    : 'Adicionar ao carrinho'}
                </span>
              </button>

              <button
                type="button"
                onClick={scrollToEditor}
                className="w-full py-2.5 px-4 text-xs font-semibold text-stone-300 hover:text-white transition-colors text-center border border-stone-800 hover:border-stone-700 rounded-xl bg-stone-900/60 hover:bg-stone-900 cursor-pointer"
              >
                Editar personalização
              </button>
            </div>

            {addedSuccess && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-200 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Caneca personalizada adicionada com sucesso ao carrinho!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
