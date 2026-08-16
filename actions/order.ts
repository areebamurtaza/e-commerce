// actions/order.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { OrderStatus, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';

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

export interface CartCheckoutItem {
  variantId: string;
  quantity: number;
  price: number;
}

export interface CreateCodOrderInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  items: CartCheckoutItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
}

export interface CreateCheckoutOrderInput {
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  items: CartCheckoutItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  stripePaymentIntentId?: string;
}

export interface CreateCheckoutOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

/**
 * 1. Immediate Pre-Paid Settlement (Stripe Card Checkout)
 * Marks payment as SUCCEEDED immediately upon successful card authorization.
 */
export async function confirmStripeOrderPayment(
  orderId: string,
  paymentIntentId: string
): Promise<ActionResponse<{ orderNumber: string }>> {
  try {
    return await withDbRetry(async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, payment: true },
      });

      if (!order) {
        return { success: false, error: 'Order record not found.' };
      }

      if (order.paymentStatus === PaymentStatus.SUCCEEDED) {
        return { success: true, data: { orderNumber: order.orderNumber } };
      }

      await prisma.$transaction(async (tx) => {
        // 1. Atomically deduct inventory for every purchased variant
        for (const item of order.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            select: { id: true, stockQuantity: true },
          });

          if (variant) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: {
                  decrement: Math.min(variant.stockQuantity, item.quantity),
                },
              },
            });
          }
        }

        // 2. Stripe processing fee calculation: 2.9% + $0.30
        const fee = Number((order.total * 0.029 + 0.3).toFixed(2));
        const netAmount = Number((order.total - fee).toFixed(2));

        // 3. Card is charged -> Immediate SUCCEEDED payment & PROCESSING order status
        await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.SUCCEEDED,
          },
        });

        await tx.payment.updateMany({
          where: { orderId },
          data: {
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId: paymentIntentId,
            fee,
            netAmount,
          },
        });
      });

      revalidatePath('/admin/products');
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath('/admin/payments');
      revalidatePath('/admin/payments/transactions');
      revalidatePath('/admin');
      revalidatePath('/shop');
      revalidatePath('/account');

      return { success: true, data: { orderNumber: order.orderNumber } };
    });
  } catch (error) {
    console.error('[CONFIRM_STRIPE_PAYMENT_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to finalize Stripe settlement.',
    };
  }
}

/**
 * 2. Deferred Settlement (Cash on Delivery)
 * Reserves stock immediately, but initializes payment as PENDING until doorstep collection.
 */
export async function createCashOnDeliveryOrder(
  input: CreateCodOrderInput
): Promise<ActionResponse<{ orderNumber: string }>> {
  try {
    const { userId } = await auth();

    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Cannot process checkout with an empty cart.' };
    }

    return await withDbRetry(async () => {
      const createdOrder = await prisma.$transaction(async (tx) => {
        const orderItemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const item of input.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: { select: { title: true } } },
          });

          if (!variant) {
            throw new Error(`Variant ${item.variantId} was not found.`);
          }

          if (variant.stockQuantity < item.quantity) {
            throw new Error(
              `Insufficient stock for "${variant.product.title}" (${variant.size}, ${variant.colorName}). Only ${variant.stockQuantity} remaining.`
            );
          }

          // Atomically lock and decrement variant stock
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          orderItemsToCreate.push({
            title: variant.product.title,
            size: variant.size,
            color: variant.colorName,
            unitPrice: item.price,
            quantity: item.quantity,
            total: Number((item.price * item.quantity).toFixed(2)),
            variant: {
              connect: { id: item.variantId },
            },
          });
        }

        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${timestamp}-${randomSuffix}`;

        let userConnectInput: Prisma.UserCreateNestedOneWithoutOrdersInput | undefined = undefined;
        if (userId) {
          const userExists = await tx.user.findFirst({
            where: {
              OR: [{ id: userId }, { email: input.customerEmail.toLowerCase() }],
            },
            select: { id: true },
          });
          if (userExists) {
            userConnectInput = { connect: { id: userExists.id } };
          }
        }

        return await tx.order.create({
          data: {
            orderNumber,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            shippingAddress: `${input.shippingAddress}, ${input.city}, ${input.postalCode}, ${input.country}`,
            subtotal: input.subtotal,
            shippingFee: input.shippingFee,
            discount: input.discount,
            total: input.total,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING, // COD remains PENDING until physical handover
            ...(userConnectInput ? { user: userConnectInput } : {}),
            items: {
              create: orderItemsToCreate,
            },
            payment: {
              create: {
                amount: input.total,
                fee: 0,
                netAmount: input.total,
                status: PaymentStatus.PENDING,
                paymentMethod: PaymentMethod.COD,
              },
            },
          },
        });
      });

      revalidatePath('/admin/products');
      revalidatePath('/admin/orders');
      revalidatePath('/admin/payments');
      revalidatePath('/admin/payments/transactions');
      revalidatePath('/admin');
      revalidatePath('/shop');
      revalidatePath('/account');

      return { success: true, data: { orderNumber: createdOrder.orderNumber } };
    });
  } catch (error) {
    console.error('[CREATE_COD_ORDER_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to place Cash on Delivery order.',
    };
  }
}

/**
 * 3. Lifecycle-Aware Admin Status Dispatcher
 * Properly handles COD doorstep collection, Stripe pre-paid settlements, and restocks.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<ActionResponse<{ currentStatus: OrderStatus; paymentStatus: PaymentStatus }>> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      const updatedData = await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true, payment: true },
        });

        if (!order) {
          throw new Error(`Order "${orderId}" was not found.`);
        }

        const isCOD = order.payment?.paymentMethod === PaymentMethod.COD;
        const isStripe = order.payment?.paymentMethod === PaymentMethod.STRIPE;

        // A. Inventory Adjustments on Cancellation / Re-opening
        if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
          // Restock variant quantities
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { increment: item.quantity },
              },
            });
          }
        } else if (order.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
          // Deduct quantities if uncancelled
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          }
        }

        // B. Determine New Payment Status Based on Channel
        let nextPaymentStatus: PaymentStatus = order.paymentStatus;

        if (newStatus === OrderStatus.DELIVERED) {
          // COD: Cash is collected upon physical delivery -> Transition to SUCCEEDED
          if (isCOD && order.paymentStatus === PaymentStatus.PENDING) {
            nextPaymentStatus = PaymentStatus.SUCCEEDED;
          }
        } else if (newStatus === OrderStatus.CANCELLED) {
          // Pre-paid Card: Customer was already charged -> Transition to REFUNDED
          if (isStripe && order.paymentStatus === PaymentStatus.SUCCEEDED) {
            nextPaymentStatus = PaymentStatus.REFUNDED;
          }
          // Post-paid COD: No money was collected -> Transition to FAILED/CANCELLED (not refunded)
          else if (isCOD && order.paymentStatus === PaymentStatus.PENDING) {
            nextPaymentStatus = PaymentStatus.FAILED;
          }
        }

        const calculatedFee = Number((order.total * 0.029 + 0.3).toFixed(2));
        const calculatedNet = Number((order.total - calculatedFee).toFixed(2));

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: newStatus,
            paymentStatus: nextPaymentStatus,
          },
        });

        // C. Synchronize the Payment Record
        if (nextPaymentStatus === PaymentStatus.SUCCEEDED && order.paymentStatus !== PaymentStatus.SUCCEEDED) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: PaymentStatus.SUCCEEDED,
              fee: isStripe ? calculatedFee : 0,
              netAmount: isStripe ? calculatedNet : order.total,
            },
          });
        } else if (nextPaymentStatus === PaymentStatus.REFUNDED) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: PaymentStatus.REFUNDED,
            },
          });
        } else if (nextPaymentStatus === PaymentStatus.FAILED) {
          await tx.payment.updateMany({
            where: { orderId },
            data: {
              status: PaymentStatus.FAILED,
            },
          });
        }

        return {
          currentStatus: updatedOrder.status,
          paymentStatus: updatedOrder.paymentStatus,
        };
      });

      revalidatePath('/admin/products');
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath('/admin/payments');
      revalidatePath('/admin/payments/transactions');
      revalidatePath('/admin');
      revalidatePath('/shop');
      revalidatePath('/account');

      return { success: true, data: updatedData };
    });
  } catch (error) {
    console.error('[ACTIONS_UPDATE_ORDER_STATUS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update order status.',
    };
  }
}

/**
 * 4. General Server Action: createCheckoutOrder (Combined Gateway)
 */
export async function createCheckoutOrder(
  input: CreateCheckoutOrderInput
): Promise<CreateCheckoutOrderResponse> {
  try {
    const { userId } = await auth();

    if (!input.items || input.items.length === 0) {
      return { success: false, error: 'Cannot process checkout with an empty cart.' };
    }

    return await withDbRetry(async () => {
      const createdOrder = await prisma.$transaction(async (tx) => {
        const orderItemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const item of input.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: { select: { title: true } } },
          });

          if (!variant) {
            throw new Error(`Product variant with ID "${item.variantId}" was not found.`);
          }

          if (variant.stockQuantity < item.quantity) {
            throw new Error(
              `Insufficient stock for "${variant.product.title}" (${variant.size}, ${variant.colorName}). Only ${variant.stockQuantity} available.`
            );
          }

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stockQuantity: {
                decrement: item.quantity,
              },
            },
          });

          orderItemsToCreate.push({
            title: variant.product.title,
            size: variant.size,
            color: variant.colorName,
            unitPrice: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
            variant: {
              connect: { id: item.variantId },
            },
          });
        }

        const timestamp = Date.now().toString().slice(-6);
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `ORD-${timestamp}-${randomSuffix}`;

        const isPaymentSettled = Boolean(
          input.stripePaymentIntentId && input.stripePaymentIntentId.startsWith('pi_')
        );
        const initialPaymentStatus = isPaymentSettled
          ? PaymentStatus.SUCCEEDED
          : PaymentStatus.PENDING;
        const initialOrderStatus = isPaymentSettled
          ? OrderStatus.PROCESSING
          : OrderStatus.PENDING;

        const fee = Number((input.total * 0.029 + 0.3).toFixed(2));
        const netAmount = Number((input.total - fee).toFixed(2));

        let userConnectInput: Prisma.UserCreateNestedOneWithoutOrdersInput | undefined = undefined;
        if (userId) {
          const userExists = await tx.user.findFirst({
            where: {
              OR: [{ id: userId }, { email: input.customerEmail.toLowerCase() }],
            },
            select: { id: true },
          });
          if (userExists) {
            userConnectInput = { connect: { id: userExists.id } };
          }
        }

        return await tx.order.create({
          data: {
            orderNumber,
            customerName: input.customerName,
            customerEmail: input.customerEmail,
            shippingAddress: `${input.shippingAddress}, ${input.city}, ${input.postalCode}, ${input.country}`,
            subtotal: input.subtotal,
            shippingFee: input.shippingFee,
            discount: input.discount,
            total: input.total,
            status: initialOrderStatus,
            paymentStatus: initialPaymentStatus,
            ...(userConnectInput ? { user: userConnectInput } : {}),
            items: {
              create: orderItemsToCreate,
            },
            payment: {
              create: {
                amount: input.total,
                fee: isPaymentSettled ? fee : 0,
                netAmount: isPaymentSettled ? netAmount : input.total,
                status: initialPaymentStatus,
                paymentMethod: PaymentMethod.STRIPE,
                stripePaymentIntentId: input.stripePaymentIntentId || null,
              },
            },
          },
        });
      });

      revalidatePath('/admin/products');
      revalidatePath('/admin/orders');
      revalidatePath('/admin/payments');
      revalidatePath('/admin/payments/transactions');
      revalidatePath('/admin');
      revalidatePath('/shop');
      revalidatePath('/cart');
      revalidatePath('/account');

      return {
        success: true,
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
      };
    });
  } catch (error) {
    console.error('[ACTIONS_CREATE_CHECKOUT_ORDER_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order and reserve stock.',
    };
  }
}

/**
 * 5. Customer Action: Retrieves all orders for the user by session ID, explicit userId, or email
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

    return await withDbRetry(async () => {
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
    });
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
 * 6. Admin Action: Retrieves paginated, filterable orders with customer details
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

    return await withDbRetry(async () => {
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
    });
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
 * 7. Admin Action: Fetch single order by ID or Order Number with retry protection
 */
export async function getAdminOrderById(orderIdOrNumber: string) {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
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
    });
  } catch (error) {
    console.error('[ACTIONS_GET_ADMIN_ORDER_BY_ID_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to retrieve order details.',
    };
  }
}

/**
 * 8. Admin Action: Explicit Payment Status Override
 */
export async function updateOrderPaymentStatus(
  orderId: string,
  newPaymentStatus: PaymentStatus
): Promise<ActionResponse> {
  try {
    await verifyAdmin();

    return await withDbRetry(async () => {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new Error(`Order "${orderId}" not found.`);
      }

      const fee = Number((order.total * 0.029 + 0.3).toFixed(2));
      const netAmount = Number((order.total - fee).toFixed(2));

      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: { paymentStatus: newPaymentStatus },
        }),
        prisma.payment.updateMany({
          where: { orderId },
          data: {
            status: newPaymentStatus,
            fee: newPaymentStatus === PaymentStatus.SUCCEEDED ? fee : 0,
            netAmount: newPaymentStatus === PaymentStatus.SUCCEEDED ? netAmount : 0,
          },
        }),
      ]);

      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath('/admin/payments');
      revalidatePath('/admin/payments/transactions');
      revalidatePath('/admin');
      revalidatePath('/account');

      return { success: true };
    });
  } catch (error) {
    console.error('[ACTIONS_UPDATE_PAYMENT_STATUS_ERROR]:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update payment status.',
    };
  }
}