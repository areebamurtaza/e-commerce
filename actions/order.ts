// actions/order.ts
'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/admin-auth';
import { OrderStatus, PaymentStatus, PaymentMethod, Prisma } from '@prisma/client';
import { z } from 'zod';

// ==========================================
// 1. CANONICAL PRISMA TYPES
// ==========================================

export type DbOrderWithItems = Prisma.OrderGetPayload<{
  include: {
    payment: true;
    user: true;
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

export interface ActionResponse<T = undefined> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

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
  data?: {
    orders: DbOrderWithItems[];
    totalCount: number;
    totalPages: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface CartCheckoutItem {
  variantId: string;
  productId?: string;
  title?: string;
  size?: string;
  color?: string;
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
  userId?: string | null;
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
  userId?: string | null;
  stripePaymentIntentId?: string;
}

export interface CreateCheckoutOrderResponse {
  success: boolean;
  orderId?: string;
  orderNumber?: string;
  error?: string;
}

// ==========================================
// 2. SCHEMAS
// ==========================================

const codOrderSchema = z.object({
  customerName: z.string().trim().min(2, 'Customer name is required'),
  customerEmail: z.string().trim().email('Valid email address is required'),
  shippingAddress: z.string().trim().min(5, 'Valid shipping address is required'),
  city: z.string().trim().min(1, 'City is required'),
  postalCode: z.string().trim().min(1, 'Postal code is required'),
  country: z.string().default('United States'),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, 'Variant ID is required'),
        productId: z.string().optional(),
        title: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        quantity: z.number().int().positive('Quantity must be at least 1'),
        price: z.number().nonnegative('Price cannot be negative'),
      })
    )
    .min(1, 'Order must have at least one item'),
  subtotal: z.number().nonnegative(),
  shippingFee: z.number().nonnegative(),
  discount: z.number().nonnegative(),
  total: z.number().positive(),
  userId: z.string().optional().nullable(),
});

// ==========================================
// 3. PAYMENT SETTLEMENT & COD
// ==========================================

/**
 * Immediate Pre-Paid Settlement (Stripe Card Checkout)
 * Marks payment as SUCCEEDED immediately upon successful card authorization.
 */
export async function confirmStripeOrderPayment(
  orderId: string,
  paymentIntentId: string
): Promise<ActionResponse<{ orderId: string; orderNumber: string }>> {
  try {
    return await withDbRetry(async () => {
      const order = await prisma.$transaction(async (tx) => {
        const targetOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { items: true },
        });

        if (!targetOrder) {
          throw new Error('Order record not found.');
        }

        if (targetOrder.paymentStatus === PaymentStatus.SUCCEEDED) {
          return targetOrder;
        }

        // Deduct inventory stock for each purchased item
        for (const item of targetOrder.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
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

        const fee = Number((targetOrder.total * 0.029 + 0.3).toFixed(2));
        const netAmount = Number((targetOrder.total - fee).toFixed(2));

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.SUCCEEDED,
            expiresAt: null,
          },
        });

        await tx.payment.upsert({
          where: { orderId },
          update: {
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId: paymentIntentId,
            fee,
            netAmount,
          },
          create: {
            orderId,
            status: PaymentStatus.SUCCEEDED,
            stripePaymentIntentId: paymentIntentId,
            amount: targetOrder.total,
            fee,
            netAmount,
          },
        });

        return updatedOrder;
      });

      revalidatePath('/admin/products');
      revalidatePath('/admin/orders');
      revalidatePath(`/admin/orders/${orderId}`);
      revalidatePath('/admin/payments');
      revalidatePath('/admin/payments/transactions');
      revalidatePath('/admin');
      revalidatePath('/shop');
      revalidatePath(`/orders/${orderId}`);
      revalidatePath('/account');

      return {
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      };
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
 * Deferred Settlement (Cash on Delivery)
 * Reserves stock immediately, initializing payment as PENDING until doorstep collection.
 */
export async function createCashOnDeliveryOrder(
  input: CreateCodOrderInput
): Promise<ActionResponse<{ orderId: string; orderNumber: string }>> {
  try {
    const validated = codOrderSchema.parse(input);
    const { userId: sessionUserId } = await auth().catch(() => ({ userId: null }));
    const effectiveUserId = validated.userId || sessionUserId;

    return await withDbRetry(async () => {
      const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const order = await prisma.$transaction(async (tx) => {
        const orderItemsToCreate: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const item of validated.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variantId },
            include: { product: { select: { title: true } } },
          });

          if (!variant) {
            throw new Error(`Product variant "${item.variantId}" was not found.`);
          }

          if (variant.stockQuantity < item.quantity) {
            throw new Error(
              `Insufficient stock for "${variant.product.title}" (${variant.size}, ${variant.colorName}). Only ${variant.stockQuantity} remaining.`
            );
          }

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

        let userConnectInput: Prisma.UserCreateNestedOneWithoutOrdersInput | undefined = undefined;
        if (effectiveUserId) {
          const userExists = await tx.user.findFirst({
            where: {
              OR: [{ id: effectiveUserId }, { email: validated.customerEmail.toLowerCase() }],
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
            customerName: validated.customerName,
            customerEmail: validated.customerEmail,
            shippingAddress: `${validated.shippingAddress}, ${validated.city}, ${validated.postalCode}, ${validated.country}`,
            subtotal: validated.subtotal,
            shippingFee: validated.shippingFee,
            discount: validated.discount,
            total: validated.total,
            status: OrderStatus.PROCESSING,
            paymentStatus: PaymentStatus.PENDING,
            expiresAt: null,
            ...(userConnectInput ? { user: userConnectInput } : {}),
            items: {
              create: orderItemsToCreate,
            },
            payment: {
              create: {
                amount: validated.total,
                fee: 0,
                netAmount: validated.total,
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

      return {
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
        },
      };
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
 * Combined Gateway Order Creator
 */
export async function createCheckoutOrder(
  input: CreateCheckoutOrderInput
): Promise<CreateCheckoutOrderResponse> {
  try {
    const { userId: sessionUserId } = await auth().catch(() => ({ userId: null }));
    const effectiveUserId = input.userId || sessionUserId;

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
        if (effectiveUserId) {
          const userExists = await tx.user.findFirst({
            where: {
              OR: [{ id: effectiveUserId }, { email: input.customerEmail.toLowerCase() }],
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
            expiresAt: null,
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

// ==========================================
// 4. CUSTOMER ACTIONS
// ==========================================

/**
 * Retrieves all orders belonging to a customer by session ID, explicit userId, or email
 */
export async function getUserOrders(
  params?: GetUserOrdersParams
): Promise<GetUserOrdersResponse> {
  try {
    const { userId: sessionUserId } = await auth().catch(() => ({ userId: null }));
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
          user: true,
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
 * Retrieves a single order by ID or orderNumber for tracking
 */
export async function getOrderById(
  orderIdOrNumber: string
): Promise<ActionResponse<DbOrderWithItems | null>> {
  try {
    return await withDbRetry(async () => {
      const order = await prisma.order.findFirst({
        where: {
          OR: [{ id: orderIdOrNumber }, { orderNumber: orderIdOrNumber }],
        },
        include: {
          payment: true,
          user: true,
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

      if (!order) {
        return {
          success: false,
          data: null,
          error: 'Order not found.',
        };
      }

      return {
        success: true,
        data: order,
      };
    });
  } catch (error) {
    console.error('[ACTIONS_GET_ORDER_BY_ID_ERROR]:', error);
    return {
      success: false,
      data: null,
      error: 'Failed to retrieve order details.',
    };
  }
}

// ==========================================
// 5. ADMIN ACTIONS
// ==========================================

/**
 * Retrieves paginated, filterable orders with customer details
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
            payment: true,
            user: true,
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
        data: {
          orders: rawOrders,
          totalCount: total,
          totalPages: Math.ceil(total / limit) || 1,
        },
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
 * Fetch single order by ID or Order Number with relations
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
        return { success: false, data: null, order: null, error: 'Order not found.' };
      }

      return { success: true, data: order, order };
    });
  } catch (error) {
    console.error('[ACTIONS_GET_ADMIN_ORDER_BY_ID_ERROR]:', error);
    return {
      success: false,
      data: null,
      order: null,
      error: error instanceof Error ? error.message : 'Failed to retrieve order details.',
    };
  }
}

/**
 * Lifecycle-Aware Admin Status Dispatcher
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

        // Inventory Adjustments on Cancellation / Re-opening
        if (newStatus === OrderStatus.CANCELLED && order.status !== OrderStatus.CANCELLED) {
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { increment: item.quantity },
              },
            });
          }
        } else if (order.status === OrderStatus.CANCELLED && newStatus !== OrderStatus.CANCELLED) {
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stockQuantity: { decrement: item.quantity },
              },
            });
          }
        }

        let nextPaymentStatus: PaymentStatus = order.paymentStatus;

        if (newStatus === OrderStatus.DELIVERED) {
          if (isCOD && order.paymentStatus === PaymentStatus.PENDING) {
            nextPaymentStatus = PaymentStatus.SUCCEEDED;
          }
        } else if (newStatus === OrderStatus.CANCELLED) {
          if (isStripe && order.paymentStatus === PaymentStatus.SUCCEEDED) {
            nextPaymentStatus = PaymentStatus.REFUNDED;
          } else if (isCOD && order.paymentStatus === PaymentStatus.PENDING) {
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
            expiresAt: newStatus === OrderStatus.CANCELLED ? null : order.expiresAt,
          },
        });

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
 * Admin Action: Explicit Payment Status Override
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