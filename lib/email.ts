// lib/email.ts
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const rawFrom = process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_FROM;

// Format sender address to include display name if not already formatted
const emailFrom = rawFrom
  ? rawFrom.includes('<')
    ? rawFrom
    : `SHOP.CO <${rawFrom}>`
  : 'SHOP.CO <onboarding@resend.dev>';

if (!resendApiKey && process.env.NODE_ENV === 'production') {
  console.warn(
    '[EMAIL_CONFIG_WARNING]: RESEND_API_KEY is not configured in production environment variables.'
  );
}

// Safely instantiate Resend client with fallback
export const resend = new Resend(resendApiKey || 're_dummy_fallback_key');

export interface OrderItemEmailPayload {
  title: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  image?: string;
}

export interface SendOrderConfirmationParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  orderId?: string;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItemEmailPayload[];
  subtotal?: number;
  shippingFee?: number;
  discount?: number;
  paymentMethod?: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Normalizes image URLs to absolute HTTPS URLs for email clients
 */
function resolveEmailImageUrl(url?: string): string {
  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://shopco-byareeba.vercel.app');

  if (!url) {
    return `${appBaseUrl}/images/pd1.png`;
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${appBaseUrl}${cleanPath}`;
}

/**
 * Generates an accessible, responsive, premium HTML email template for order receipts
 */
function renderOrderConfirmationHtml(params: SendOrderConfirmationParams): string {
  const {
    customerName,
    orderNumber,
    orderId,
    totalAmount,
    shippingAddress,
    items,
    subtotal,
    shippingFee,
    discount,
    paymentMethod = 'Credit / Debit Card (Stripe)',
  } = params;

  const appBaseUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://shopco-byareeba.vercel.app');

  const trackOrderUrl = orderId
    ? `${appBaseUrl}/orders/${orderId}`
    : `${appBaseUrl}/order-confirmation?orderNumber=${orderNumber}`;

  const calculatedSubtotal =
    subtotal !== undefined
      ? subtotal
      : items.reduce((acc, curr) => acc + curr.unitPrice * curr.quantity, 0);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const itemsHtml = items
    .map((item) => {
      const lineTotal =
        item.total !== undefined
          ? item.total
          : Number((item.unitPrice * item.quantity).toFixed(2));
      const imageUrl = resolveEmailImageUrl(item.image);

      return `
        <tr>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle; width: 64px;">
            <div style="width: 60px; height: 60px; border-radius: 10px; overflow: hidden; background-color: #f4f4f5; border: 1px solid #e4e4e7; text-align: center;">
              <img 
                src="${imageUrl}" 
                alt="${item.title}" 
                width="60" 
                height="60" 
                style="width: 60px; height: 60px; object-fit: cover; display: block; border-radius: 10px;"
              />
            </div>
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: middle;">
            <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 4px; line-height: 1.3;">
              ${item.title}
            </div>
            <div style="font-size: 12px; color: #6b7280; font-weight: 500;">
              Size: <span style="color: #111827; font-weight: 600;">${item.size}</span>
              &nbsp;&bull;&nbsp;
              Color: <span style="color: #111827; font-weight: 600;">${item.color}</span>
            </div>
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; vertical-align: middle; font-size: 14px; font-weight: 600; color: #111827;">
            ${item.quantity}
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: middle; font-size: 13px; color: #6b7280;">
            $${item.unitPrice.toFixed(2)}
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: middle; font-size: 14px; font-weight: 700; color: #111827;">
            $${lineTotal.toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${orderNumber}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #18181b; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f5; padding: 36px 12px;">
          <tr>
            <td align="center">
              <!-- Main Card Container -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #000000; padding: 32px 40px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; margin: 0; text-transform: uppercase;">
                      SHOP.CO
                    </h1>
                    <p style="color: #a1a1aa; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin: 6px 0 0 0;">
                      Order Receipt & Fulfillment Confirmation
                    </p>
                  </td>
                </tr>

                <!-- Status Banner -->
                <tr>
                  <td style="padding: 32px 40px 20px 40px; text-align: center;">
                    <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 6px 18px; margin-bottom: 16px;">
                      <span style="font-size: 13px; font-weight: 700; color: #065f46; letter-spacing: 0.5px;">
                        &#10003; ORDER CONFIRMED
                      </span>
                    </div>
                    <h2 style="font-size: 22px; font-weight: 800; color: #18181b; margin: 0 0 8px 0; line-height: 1.25;">
                      Thank you for your purchase, ${customerName}!
                    </h2>
                    <p style="font-size: 14px; line-height: 1.5; color: #52525b; margin: 0;">
                      Your order has been verified and passed to our fulfillment queue. You can track preparation and shipping progress below.
                    </p>
                  </td>
                </tr>

                <!-- Order Details Card -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 16px; padding: 20px;">
                      <tr>
                        <td width="50%" style="padding: 6px 12px 6px 0; vertical-align: top;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; font-weight: 700; margin-bottom: 2px;">
                            Order Reference
                          </div>
                          <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: #000000;">
                            ${orderNumber}
                          </div>
                        </td>
                        <td width="50%" style="padding: 6px 0 6px 12px; vertical-align: top;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; font-weight: 700; margin-bottom: 2px;">
                            Date Placed
                          </div>
                          <div style="font-size: 13px; font-weight: 600; color: #18181b;">
                            ${formattedDate}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 12px 12px 0 0; vertical-align: top; border-top: 1px solid #f0f0f0;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; font-weight: 700; margin-bottom: 2px;">
                            Payment Method
                          </div>
                          <div style="font-size: 13px; font-weight: 600; color: #18181b;">
                            ${paymentMethod}
                          </div>
                        </td>
                        <td width="50%" style="padding: 12px 0 0 12px; vertical-align: top; border-top: 1px solid #f0f0f0;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #71717a; font-weight: 700; margin-bottom: 2px;">
                            Shipping Destination
                          </div>
                          <div style="font-size: 13px; line-height: 1.4; color: #27272a;">
                            ${shippingAddress}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Itemized Summary Section -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #000000; margin: 0 0 12px 0;">
                      Purchased Items
                    </h3>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #000000;">
                          <th colspan="2" style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff; border-radius: 8px 0 0 8px;">
                            Item
                          </th>
                          <th style="padding: 10px 12px; text-align: center; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff;">
                            Qty
                          </th>
                          <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff;">
                            Price
                          </th>
                          <th style="padding: 10px 12px; text-align: right; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff; border-radius: 0 8px 8px 0;">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsHtml}
                      </tbody>
                    </table>
                  </td>
                </tr>

                <!-- Financial Breakdown -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #71717a;">Subtotal</td>
                        <td style="padding: 4px 0; font-size: 13px; font-weight: 600; text-align: right; color: #18181b;">
                          $${calculatedSubtotal.toFixed(2)}
                        </td>
                      </tr>
                      ${
                        shippingFee !== undefined
                          ? `
                        <tr>
                          <td style="padding: 4px 0; font-size: 13px; color: #71717a;">Delivery Fee</td>
                          <td style="padding: 4px 0; font-size: 13px; font-weight: 600; text-align: right; color: ${
                            shippingFee === 0 ? '#059669' : '#18181b'
                          };">
                            ${shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                          </td>
                        </tr>
                      `
                          : ''
                      }
                      ${
                        discount !== undefined && discount > 0
                          ? `
                        <tr>
                          <td style="padding: 4px 0; font-size: 13px; color: #059669; font-weight: 600;">Promotional Discount</td>
                          <td style="padding: 4px 0; font-size: 13px; font-weight: 700; text-align: right; color: #059669;">
                            -$${discount.toFixed(2)}
                          </td>
                        </tr>
                      `
                          : ''
                      }
                      <tr>
                        <td style="padding: 12px 0 0 0; border-top: 2px solid #000000; font-size: 16px; font-weight: 800; color: #000000;">
                          Total Paid
                        </td>
                        <td style="padding: 12px 0 0 0; border-top: 2px solid #000000; font-size: 18px; font-weight: 900; text-align: right; color: #000000;">
                          $${totalAmount.toFixed(2)} USD
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Track Order CTA Button -->
                <tr>
                  <td style="padding: 0 40px 32px 40px; text-align: center;">
                    <a 
                      href="${trackOrderUrl}" 
                      style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 32px; border-radius: 9999px; letter-spacing: 0.5px; box-shadow: 0 4px 10px rgba(0,0,0,0.15);"
                    >
                      Track Order & View Invoice &rarr;
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 24px 40px; text-align: center;">
                    <p style="font-size: 12px; line-height: 1.6; color: #71717a; margin: 0 0 8px 0;">
                      Questions or modifications regarding your order? Contact our concierge team at <a href="mailto:support@shop.co" style="color: #000000; text-decoration: underline; font-weight: 600;">support@shop.co</a>.
                    </p>
                    <p style="font-size: 11px; color: #a1a1aa; margin: 0;">
                      &copy; ${new Date().getFullYear()} SHOP.CO. All rights reserved. High-End Fashion & Apparel.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Asynchronously dispatches an order confirmation email via Resend
 */
export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationParams
): Promise<EmailResponse> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_dummy')) {
      console.info(
        `[EMAIL_DEV_MODE]: Skipping actual email dispatch to ${params.toEmail} for order ${params.orderNumber} (RESEND_API_KEY is not configured).`
      );
      return { success: true };
    }

    const htmlContent = renderOrderConfirmationHtml(params);

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [params.toEmail],
      subject: `Order Confirmation #${params.orderNumber} | SHOP.CO`,
      html: htmlContent,
    });

    if (error) {
      console.error('[EMAIL_SEND_API_ERROR]: Failed to send order receipt email:', {
        orderNumber: params.orderNumber,
        toEmail: params.toEmail,
        error: error.message,
      });
      return { success: false, error: error.message };
    }

    console.info('[EMAIL_SEND_SUCCESS]: Confirmation email dispatched successfully:', {
      orderNumber: params.orderNumber,
      toEmail: params.toEmail,
      messageId: data?.id,
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown email dispatch exception';
    console.error('[EMAIL_SEND_EXCEPTION]: Unhandled error during email dispatch:', {
      orderNumber: params.orderNumber,
      toEmail: params.toEmail,
      error: errorMessage,
    });
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export interface SendOrderStatusEmailParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
  orderId: string;
  newStatus: string;
  carrier?: string;
  trackingNumber?: string;
}

/**
 * Sends order status update email (e.g. SHIPPED, DELIVERED)
 */
export async function sendOrderStatusUpdateEmail(
  params: SendOrderStatusEmailParams
): Promise<EmailResponse> {
  try {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_dummy')) {
      console.info(
        `[EMAIL_DEV_MODE]: Skipping status update email to ${params.toEmail} for order ${params.orderNumber}.`
      );
      return { success: true };
    }

    const appBaseUrl =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://shopco-byareeba.vercel.app');

    const trackingUrl = `${appBaseUrl}/orders/${params.orderId}`;
    const statusTitle =
      params.newStatus === 'SHIPPED'
        ? '📦 Your Order Has Shipped!'
        : params.newStatus === 'DELIVERED'
        ? '🎉 Your Order Has Been Delivered!'
        : `Order #${params.orderNumber} Status: ${params.newStatus}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${statusTitle}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAFAFA; margin: 0; padding: 24px; color: #111111;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E5E5E5; overflow: hidden;">
    <tr>
      <td style="background-color: #000000; padding: 24px 32px; text-align: center;">
        <h1 style="color: #FFFFFF; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin: 0; text-transform: uppercase;">SHOP.CO</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0; color: #111111;">${statusTitle}</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #555555; margin: 0 0 20px 0;">
          Hi <strong>${params.customerName}</strong>,<br>
          Great news! The status of your order <strong>#${params.orderNumber}</strong> has been updated to <strong style="color: #000000; text-transform: uppercase;">${params.newStatus}</strong>.
        </p>

        <div style="background-color: #F7F7F7; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <p style="margin: 0 0 8px 0; font-size: 13px; color: #666666;"><strong>Order Reference:</strong> #${params.orderNumber}</p>
          <p style="margin: 0; font-size: 13px; color: #666666;"><strong>Current Status:</strong> <span style="display: inline-block; padding: 2px 8px; border-radius: 99px; background-color: #E6F4EA; color: #137333; font-weight: bold; font-size: 11px;">${params.newStatus}</span></p>
        </div>

        <div style="text-align: center; margin: 28px 0 16px 0;">
          <a href="${trackingUrl}" style="background-color: #000000; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 99px; font-size: 14px; font-weight: bold; display: inline-block;">
            Track Your Package ➔
          </a>
        </div>

        <p style="font-size: 12px; color: #888888; text-align: center; margin: 20px 0 0 0;">
          If you have questions regarding your delivery, simply reply directly to this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    const { data, error } = await resend.emails.send({
      from: emailFrom,
      to: [params.toEmail],
      subject: `${statusTitle} (#${params.orderNumber})`,
      html: htmlContent,
    });

    if (error) {
      console.error('[EMAIL_STATUS_UPDATE_ERROR]:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown status email error';
    console.error('[EMAIL_STATUS_EXCEPTION]:', errorMsg);
    return { success: false, error: errorMsg };
  }
}