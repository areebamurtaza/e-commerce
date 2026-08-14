// types/cart.ts

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  title: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export type CartItemInput = Omit<CartItem, 'id'>;

export interface OrderSummaryValues {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
}