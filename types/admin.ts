export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'SUCCEEDED'
  | 'PENDING'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethodType =
  | 'CARD'
  | 'STRIPE'
  | 'PAYPAL'
  | 'APPLE_PAY'
  | 'GOOGLE_PAY'
  | 'CASH_ON_DELIVERY';

export interface DashboardMetric {
  title: string;
  value: string | number;
  change: number; // percentage change, e.g., +12.5 or -3.2
  trend: 'up' | 'down' | 'neutral';
  description: string;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
  orders: number;
  refunds: number;
}

export interface SalesByCategoryData {
  category: string;
  sales: number;
  percentage: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethodType;
  itemsCount: number;
  createdAt: string;
}

export interface LowStockAlert {
  id: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
  imageUrl: string;
}

// Payment Dashboard Specific Types
export interface Transaction {
  id: string;
  transactionId: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: PaymentMethodType;
  status: PaymentStatus;
  cardBrand?: string;
  lastFourDigits?: string;
  createdAt: string;
}

export interface PaymentPayout {
  id: string;
  payoutId: string;
  amount: number;
  status: 'PAID' | 'IN_TRANSIT' | 'FAILED';
  bankName: string;
  accountLastFour: string;
  estimatedArrival: string;
  createdAt: string;
}

export interface PaymentMetrics {
  grossVolume: DashboardMetric;
  netVolume: DashboardMetric;
  successfulPayments: DashboardMetric;
  averageOrderValue: DashboardMetric;
  pendingPayouts: DashboardMetric;
}