// actions/order.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client';

/**
 * Strongly typed Prisma payload representing a customer order with nested relations
 */
export type DbOrderWithItems = Prisma.OrderGetPayload<{
  include: {
    payment: true;
    items: {
      include: {
        variant: {
          include: {
            product: {
              include: {
                images: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export interface GetUserOrdersParams {
  userId?: string;
  email?: string;
}

export interface GetUserOrdersResponse {
  success: boolean;
  data: DbOrderWithItems[];
  orders: DbOrderWithItems[];
  error?: string;
}

export interface AdminOrderFilterParams {
  search?: string;
  status?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  page?: number;
  limit?: number;
}

export interface AdminOrderListResponse {
  success: boolean;
  orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    itemsCount: number;
    createdAt: Date;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface ActionResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Customer Action: Retrieves all orders for the user by session ID, explicit userId, or email
 */
export async function getUserOrders(
  params?: GetUserOrdersParams
): Promise<GetUserOrdersResponse> {
  try {
    const { userId: sessionUserId } = await auth();
    const targetUserId = params?.userId || sessionUserId;
    const targetEmail = params?.email;

    if (!targetUserId && !targetEmail) {
      return {
        success: false,
        data: [],
        orders: [],
        error: 'Authentication required.',
      };
    }

    const orConditions: Prisma.OrderWhereInput[] = [];

    if (targetUserId) {
      orConditions.push({ userId: targetUserId });
    }

    if (targetEmail) {
      orConditions.push({
        customerEmail: { equals: targetEmail, mode: 'insensitive' },
      });
    }

    const orders = await prisma.order.findMany({
      where: {
        OR: orConditions,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        payment: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return {
      success: true,
      data: orders,
      orders,
    };
  } catch (error) {
    console.error('[ACTIONS_GET_USER_ORDERS_ERROR]:', error);
    return {
      success: false,
      data: [],
      orders: [],
      error: error instanceof Error ? error.message : 'Failed to retrieve orders.',
    };
  }
}

/**
 * Admin Action: Retrieves paginated, filterable orders with customer details
 */
export async function getAdminOrders(
  params: AdminOrderFilterParams = {}
): Promise<AdminOrderListResponse> {
  try {
    await verifyAdmin();

    const {
      search = '',
      status = 'ALL',
      paymentStatus = 'ALL',
      page = 1,
      limit = 10,
    } = params;

    const skip = Math.max(0, (page - 1) * limit);

    const where: Prisma.OrderWhereInput = {
      AND: [
        status !== 'ALL' ? { status: status as OrderStatus } : {},
        paymentStatus !== 'ALL' ? { paymentStatus: paymentStatus as PaymentStatus } : {},
        search.trim()
          ? {
              OR: [
                { orderNumber: { contains: search.trim(), mode: 'insensitive' } },
                { customerName: { contains: search.trim(), mode: 'insensitive' } },
                { customerEmail: { contains: search.trim(), mode: 'insensitive' } },
              ],
            }
          : {},
      ],
    };

    const [total, rawOrders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: { quantity: true },
          },
          payment: {
            select: { paymentMethod: true },
          },
        },
      }),
    ]);

    const orders = rawOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      shippingAddress: o.shippingAddress,
      subtotal: o.subtotal,
      shippingFee: o.shippingFee,
      discount: o.discount,
      total: o.total,
      status: o.status,
      paymentStatus: o.paymentStatus,
      paymentMethod: o.payment?.paymentMethod ?? 'STRIPE',
      itemsCount: o.items.reduce((acc, curr) => acc + curr.quantity, 0),
      createdAt: o.createdAt,
    }));

    return {
      success: true,
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.error('[ACTIONS_GET_ADMIN_ORDERS_ERROR]:', error);
    return {
      success: false,
      orders: [],
      pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
      error: error instanceof Error ? error.message : 'Failed to fetch orders.',
    };
  }
}

/**
 * Admin Action: Retrieves a single order record by ID or Order Number
 */
export async function getAdminOrderById(orderIdOrNumber: string) {
  try {
    await verifyAdmin();

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            imageUrl: true,
          },
        },
        payment: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: {
                      orderBy: { isPrimary: 'desc' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    return { success: true, order };
  } catch (error) {
    console.error('[ACTIONS_GET_ADMIN_ORDER_BY_ID_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve order details.',
    };
  }
}

/**
 * Admin Action: Atomic Order Status Dispatcher with inventory sync
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResponse> {
  try {
    await verifyAdmin();

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new Error(`Order with ID "${orderId}" not found.`);
      }

      // Restock inventory when cancelling
      if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { increment: item.quantity },
            },
          });
        }
      }

      // Deduct inventory if un-cancelling
      if (order.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus },
      });
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin');
    revalidatePath('/account');

    return { success: true };
  } catch (error) {
    console.error('[ACTIONS_UPDATE_ORDER_STATUS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status.',
    };
  }
}

/**
 * Admin Action: Updates order payment status
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  newPaymentStatus: PaymentStatus
): Promise<ActionResponse> {
  try {
    await verifyAdmin();

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus: newPaymentStatus },
      });

      await tx.payment.updateMany({
        where: { orderId },
        data: { status: newPaymentStatus },
      });
    });

    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath('/admin/payments');
    revalidatePath('/admin');
    revalidatePath('/account');

    return { success: true };
  } catch (error) {
    console.error('[ACTIONS_UPDATE_PAYMENT_STATUS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment status.',
    };
  }
}