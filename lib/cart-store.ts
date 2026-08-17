// lib/cart-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartItem, CartItemInput, OrderSummaryValues } from '@/types/cart';
import { validatePromoCode } from '@/lib/constants';

export interface CartState {
  items: CartItem[];
  discountPercentage: number;
  deliveryFee: number;
  promoCode: string;
  isPromoApplied: boolean;

  // Mutations
  addItem: (item: CartItemInput) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  applyPromoCode: (code: string) => boolean;
  removePromoCode: () => void;
  clearCart: () => void;

  // Selectors & Computations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getTotalItemsCount: () => number;
  getSummary: () => OrderSummaryValues;

  // Backward-compatibility Aliases
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [], // Default to empty array for live database synchronization
      discountPercentage: 0,
      deliveryFee: 15,
      promoCode: '',
      isPromoApplied: false,

      addItem: (newItem: CartItemInput) => {
        set((state) => {
          const existingIndex = state.items.findIndex((item) => {
            if (newItem.variantId && item.variantId) {
              return item.variantId === newItem.variantId;
            }
            return (
              item.productId === newItem.productId &&
              item.size.toLowerCase() === newItem.size.toLowerCase() &&
              item.color.toLowerCase() === newItem.color.toLowerCase()
            );
          });

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentItem = updatedItems[existingIndex];
            if (currentItem) {
              updatedItems[existingIndex] = {
                ...currentItem,
                quantity: currentItem.quantity + newItem.quantity,
              };
            }
            return { items: updatedItems };
          }

          const createdItem: CartItem = {
            ...newItem,
            id: newItem.variantId || `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          };

          return { items: [...state.items, createdItem] };
        });
      },

      updateQuantity: (id: string, delta: number) => {
        set((state) => ({
          items: state.items
            .map((item) => {
              if (item.id === id) {
                const newQuantity = item.quantity + delta;
                return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
              }
              return item;
            })
            .filter((item): item is CartItem => item !== null),
        }));
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      applyPromoCode: (code: string) => {
        const { valid, discountPercent, code: formattedCode } = validatePromoCode(code);
        if (valid && formattedCode) {
          set({
            promoCode: formattedCode,
            discountPercentage: discountPercent,
            isPromoApplied: true,
          });
          return true;
        }
        set({ promoCode: '', discountPercentage: 0, isPromoApplied: false });
        return false;
      },

      removePromoCode: () => {
        set({ promoCode: '', discountPercentage: 0, isPromoApplied: false });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const rawSubtotal = get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        return Math.round(rawSubtotal * 100) / 100;
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        if (get().items.length === 0) return 0;
        const discount = (subtotal * get().discountPercentage) / 100;
        return Math.round(discount * 100) / 100;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (get().items.length === 0) return 0;
        const discount = get().getDiscountAmount();
        const fee = subtotal > 200 ? 0 : get().deliveryFee;
        const total = Math.max(0, subtotal - discount + fee);
        return Math.round(total * 100) / 100;
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSummary: (): OrderSummaryValues => {
        const subtotal = get().getSubtotal();
        const discountPercentage = get().discountPercentage;
        const discountAmount = get().getDiscountAmount();
        const deliveryFee = subtotal > 200 || subtotal === 0 ? 0 : get().deliveryFee;
        const total = get().getTotal();

        return {
          subtotal,
          discountPercentage,
          discountAmount,
          deliveryFee,
          total,
        };
      },

      getTotalPrice: () => get().getSubtotal(),
      getTotalItems: () => get().getTotalItemsCount(),
    }),
    {
      name: 'shopco-cart-storage',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
);