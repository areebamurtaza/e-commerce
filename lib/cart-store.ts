import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/cart';

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-item-1',
    productId: '1',
    title: 'Gradient Graphic T-shirt',
    image: '/images/m2.png',
    size: 'Large',
    color: 'White',
    price: 145,
    quantity: 1,
  },
  {
    id: 'cart-item-2',
    productId: 'n3',
    title: 'Checkered Shirt',
    image: '/images/n3.png',
    size: 'Medium',
    color: 'Red',
    price: 180,
    quantity: 1,
  },
  {
    id: 'cart-item-3',
    productId: 'n2',
    title: 'Skinny Fit Jeans',
    image: '/images/n2.png',
    size: 'Large',
    color: 'Blue',
    price: 240,
    quantity: 1,
  },
];

interface CartState {
  items: CartItem[];
  discountPercentage: number;
  deliveryFee: number;
  promoCode: string;
  isPromoApplied: boolean;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  applyPromoCode: (code: string) => boolean;
  clearCart: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTotal: () => number;
  getTotalItemsCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: INITIAL_CART_ITEMS,
      discountPercentage: 20,
      deliveryFee: 15,
      promoCode: '',
      isPromoApplied: false,

      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.size === newItem.size &&
              item.color === newItem.color
          );

          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          }

          const createdItem: CartItem = {
            ...newItem,
            id: `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          };

          return { items: [...state.items, createdItem] };
        });
      },

      updateQuantity: (id: string, delta: number) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              const newQuantity = Math.max(1, item.quantity + delta);
              return { ...item, quantity: newQuantity };
            }
            return item;
          }),
        }));
      },

      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      applyPromoCode: (code: string) => {
        const trimmed = code.trim();
        if (trimmed.length > 0) {
          set({ promoCode: trimmed, isPromoApplied: true });
          return true;
        }
        return false;
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        if (get().items.length === 0) return 0;
        return Math.round(subtotal * (get().discountPercentage / 100));
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (get().items.length === 0) return 0;
        const discount = get().getDiscountAmount();
        return subtotal - discount + get().deliveryFee;
      },

      getTotalItemsCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'shopco-cart-storage',
    }
  )
);