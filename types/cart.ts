export interface CartItem {
  id: string;
  productId: string;
  title: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface OrderSummaryValues {
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  deliveryFee: number;
  total: number;
}