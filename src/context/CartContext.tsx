import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { CartItem, CustomizationData, AppliedCouponInfo } from '../types';
import { storageService } from '../services/storageService';
import { saveArtworkToIndexedDB } from '../services/indexedDb';
import { apiService } from '../services/apiService';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: {
    productId: string;
    name: string;
    category: string;
    unitPrice: number;
    quantity: number;
    image: string;
    colorName?: string;
    sizeName?: string;
    customization?: CustomizationData;
  }) => Promise<string>;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountAmount: number;
  total: number;
  appliedCoupon: AppliedCouponInfo | null;
  couponMessage: { type: 'success' | 'error'; text: string } | null;
  setCouponMessage: (msg: { type: 'success' | 'error'; text: string } | null) => void;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'vybe_cart_v1';
const COUPON_STORAGE_KEY = 'vybe_applied_coupon_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar carrinho:', e);
    }
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponInfo | null>(() => {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erro ao carregar cupom salvo:', e);
    }
    return null;
  });

  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Subtotal dos itens
  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calcula desconto seguro
  const calculateDiscount = (coupon: AppliedCouponInfo | null, currentSubtotal: number): number => {
    if (!coupon || currentSubtotal <= 0) return 0;
    let disc = 0;
    if (coupon.discountType === 'percentage') {
      disc = (currentSubtotal * coupon.discountValue) / 100;
    } else {
      disc = coupon.discountValue;
    }
    // Aplica o desconto efetivo registrado ou limitador
    if (coupon.discountAmount && disc > coupon.discountAmount && coupon.discountType === 'percentage') {
      // Se houver limite teto fixado no registro do cupom
      disc = Math.min(disc, coupon.discountAmount);
    }
    disc = Math.min(disc, currentSubtotal);
    return Math.round(disc * 100) / 100;
  };

  const discountAmount = calculateDiscount(appliedCoupon, subtotal);
  const total = Math.max(0, subtotal - discountAmount);

  // Salva carrinho no localStorage
  useEffect(() => {
    try {
      const safeItems = cart.map(item => {
        if (!item.customization) return item;
        return {
          ...item,
          customization: { ...item.customization },
        };
      });
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(safeItems));
    } catch (e) {
      console.warn('Erro ao salvar carrinho no localStorage:', e);
    }
  }, [cart]);

  // Salva cupom no localStorage
  useEffect(() => {
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.warn('Erro ao salvar cupom no localStorage:', e);
    }
  }, [appliedCoupon]);

  // Revalidação automática do cupom quando o subtotal ou os itens mudam (Seção 13)
  const prevSubtotalRef = useRef(subtotal);
  useEffect(() => {
    if (prevSubtotalRef.current !== subtotal && appliedCoupon) {
      prevSubtotalRef.current = subtotal;

      if (cart.length === 0) {
        setAppliedCoupon(null);
        setCouponMessage(null);
        return;
      }

      // Revalida as regras do cupom no backend
      apiService
        .validateCoupon({
          code: appliedCoupon.code,
          subtotal,
          items: cart,
        })
        .then(result => {
          if (!result.valid) {
            setAppliedCoupon(null);
            setCouponMessage({
              type: 'error',
              text: result.message || 'Cupom removido: o pedido deixou de atender às condições.',
            });
          } else if (result.coupon) {
            setAppliedCoupon(result.coupon);
          }
        })
        .catch(() => {});
    } else {
      prevSubtotalRef.current = subtotal;
    }
  }, [subtotal, cart, appliedCoupon]);

  const buildSku = (productId: string, colorName?: string, sizeName?: string) => {
    const base = storageService.getProductById(productId)?.sku;
    if (!base) return undefined;
    const slug = (t?: string) =>
      (t || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toUpperCase();
    return [base, slug(colorName), slug(sizeName)].filter(Boolean).join('-');
  };

  const addToCart = async (item: {
    productId: string;
    name: string;
    category: string;
    unitPrice: number;
    quantity: number;
    image: string;
    colorName?: string;
    sizeName?: string;
    customization?: CustomizationData;
  }): Promise<string> => {
    if (item.customization && item.customization.artworkDataUrl) {
      try {
        await saveArtworkToIndexedDB({
          id: item.customization.customId,
          fileName: item.customization.originalFileName || 'arte-personalizada.png',
          fileType: 'image/png',
          fileSize: item.customization.originalFileSize || 0,
          dataUrl: item.customization.artworkDataUrl,
          createdAt: Date.now(),
        });
      } catch (err) {
        console.warn('IndexedDB save fallback:', err);
      }
    }

    const uniqueId = item.customization
      ? `cust-${item.customization.customId}`
      : `item-${item.productId}-${item.colorName || 'standard'}-${item.sizeName || 'un'}`;

    setCart(prevCart => {
      if (item.customization) {
        const newItem: CartItem = {
          id: uniqueId,
          productId: item.productId,
          name: item.name,
          category: item.category,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          image: item.image,
          colorName: item.colorName,
          sku: buildSku(item.productId, item.colorName),
          customization: item.customization,
          totalPrice: item.unitPrice * item.quantity,
        };
        return [...prevCart, newItem];
      }

      const existingIndex = prevCart.findIndex(
        ci => !ci.customization && ci.productId === item.productId && ci.colorName === item.colorName && ci.sizeName === item.sizeName
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + item.quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          totalPrice: updated[existingIndex].unitPrice * newQty,
        };
        return updated;
      }

      const newItem: CartItem = {
        id: uniqueId,
        productId: item.productId,
        name: item.name,
        category: item.category,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        image: item.image,
        colorName: item.colorName,
        sizeName: item.sizeName,
        sku: buildSku(item.productId, item.colorName, item.sizeName),
        totalPrice: item.unitPrice * item.quantity,
      };
      return [...prevCart, newItem];
    });

    setIsCartOpen(true);
    return uniqueId;
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.id === cartItemId) {
          return {
            ...item,
            quantity,
            totalPrice: item.unitPrice * quantity,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  // Aplicação de Cupom com validação no backend
  const applyCoupon = async (code: string): Promise<{ success: boolean; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      const msg = 'Digite o código do cupom.';
      setCouponMessage({ type: 'error', text: msg });
      return { success: false, message: msg };
    }

    if (cart.length === 0) {
      const msg = 'Adicione produtos ao carrinho antes de aplicar um cupom.';
      setCouponMessage({ type: 'error', text: msg });
      return { success: false, message: msg };
    }

    try {
      const result = await apiService.validateCoupon({
        code: cleanCode,
        subtotal,
        items: cart,
      });

      if (result.valid && result.coupon) {
        setAppliedCoupon(result.coupon);
        setCouponMessage({ type: 'success', text: result.message });
        return { success: true, message: result.message };
      } else {
        setCouponMessage({ type: 'error', text: result.message });
        return { success: false, message: result.message };
      }
    } catch {
      const msg = 'Erro ao validar o cupom. Tente novamente.';
      setCouponMessage({ type: 'error', text: msg });
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponMessage(null);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        discountAmount,
        total,
        appliedCoupon,
        couponMessage,
        setCouponMessage,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
};
