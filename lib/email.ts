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

// Safely instantiate Resend client with dummy fallback to prevent initialization crashes
export const resend = new Resend(resendApiKey || 're_dummy_fallback_key');

export interface OrderItemEmailPayload {
  title: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface SendOrderConfirmationParams {
  toEmail: string;
  customerName: string;
  orderNumber: string;
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
 * Generates an accessible, responsive HTML email template for order receipts
 */
function renderOrderConfirmationHtml(params: SendOrderConfirmationParams): string {
  const {
    customerName,
    orderNumber,
    totalAmount,
    shippingAddress,
    items,
    subtotal,
    shippingFee,
    discount,
    paymentMethod = 'Credit / Debit Card',
  } = params;

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

      return `
        <tr>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; vertical-align: top;">
            <div style="font-size: 14px; font-weight: 700; color: #000000; margin-bottom: 4px; line-height: 1.3;">
              ${item.title}
            </div>
            <div style="font-size: 12px; color: #666666; font-weight: 500;">
              Size: <span style="color: #111111; font-weight: 600;">${item.size}</span>
              &nbsp;&bull;&nbsp;
              Color: <span style="color: #111111; font-weight: 600;">${item.color}</span>
            </div>
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; text-align: center; vertical-align: top; font-size: 14px; font-weight: 600; color: #111111;">
            ${item.quantity}
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: top; font-size: 14px; color: #666666;">
            $${item.unitPrice.toFixed(2)}
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #f0f0f0; text-align: right; vertical-align: top; font-size: 14px; font-weight: 700; color: #000000;">
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
        <title>Order Confirmation - ${orderNumber}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f6f8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111; -webkit-font-smoothing: antialiased;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f6f8; padding: 40px 16px;">
          <tr>
            <td align="center">
              <!-- Main Card Container -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; border: 1px solid #e5e5ea; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                
                <!-- Brand Header -->
                <tr>
                  <td style="background-color: #000000; padding: 32px 40px; text-align: center;">
                    <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: 1px; margin: 0; text-transform: uppercase;">
                      SHOP.CO
                    </h1>
                  </td>
                </tr>

                <!-- Status Banner -->
                <tr>
                  <td style="padding: 32px 40px 20px 40px; text-align: center;">
                    <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 9999px; padding: 6px 16px; margin-bottom: 16px;">
                      <span style="font-size: 13px; font-weight: 700; color: #065f46; letter-spacing: 0.5px;">
                        &#10003; ORDER CONFIRMED
                      </span>
                    </div>
                    <h2 style="font-size: 22px; font-weight: 800; color: #000000; margin: 0 0 8px 0; line-height: 1.25;">
                      Thank you for your order, ${customerName}!
                    </h2>
                    <p style="font-size: 14px; line-height: 1.5; color: #666666; margin: 0;">
                      We have received your order and are currently processing it for fulfillment. Below is a detailed summary of your purchase.
                    </p>
                  </td>
                </tr>

                <!-- Order Details Card -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9f9fb; border: 1px solid #eeeeee; border-radius: 14px; padding: 20px;">
                      <tr>
                        <td width="50%" style="padding: 6px 0; vertical-align: top;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 700; margin-bottom: 2px;">
                            Order Reference
                          </div>
                          <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: #000000;">
                            ${orderNumber}
                          </div>
                        </td>
                        <td width="50%" style="padding: 6px 0; vertical-align: top;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 700; margin-bottom: 2px;">
                            Date Placed
                          </div>
                          <div style="font-size: 13px; font-weight: 600; color: #111111;">
                            ${formattedDate}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td width="50%" style="padding: 10px 0 0 0; vertical-align: top;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 700; margin-bottom: 2px;">
                            Payment Method
                          </div>
                          <div style="font-size: 13px; font-weight: 600; color: #111111;">
                            ${paymentMethod}
                          </div>
                        </td>
                        <td width="50%" style="padding: 10px 0 0 0; vertical-align: top;">
                          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #888888; font-weight: 700; margin-bottom: 2px;">
                            Shipping Destination
                          </div>
                          <div style="font-size: 13px; line-height: 1.4; color: #333333;">
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
                    <h3 style="font-size: 15px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #000000; margin: 0 0 12px 0;">
                      Purchased Items
                    </h3>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #000000;">
                          <th style="padding: 10px 12px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #ffffff; border-radius: 8px 0 0 8px;">
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
                  <td style="padding: 0 40px 32px 40px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 4px 0; font-size: 13px; color: #666666;">Subtotal</td>
                        <td style="padding: 4px 0; font-size: 13px; font-weight: 600; text-align: right; color: #111111;">
                          $${calculatedSubtotal.toFixed(2)}
                        </td>
                      </tr>
                      ${
                        shippingFee !== undefined
                          ? `
                        <tr>
                          <td style="padding: 4px 0; font-size: 13px; color: #666666;">Delivery Fee</td>
                          <td style="padding: 4px 0; font-size: 13px; font-weight: 600; text-align: right; color: ${
                            shippingFee === 0 ? '#059669' : '#111111'
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
                          <td style="padding: 4px 0; font-size: 13px; color: #059669; font-weight: 500;">Promotional Discount</td>
                          <td style="padding: 4px 0; font-size: 13px; font-weight: 600; text-align: right; color: #059669;">
                            -$${discount.toFixed(2)}
                          </td>
                        </tr>
                      `
                          : ''
                      }
                      <tr>
                        <td style="padding: 12px 0 0 0; border-top: 2px solid #000000; font-size: 16px; font-weight: 800; color: #000000;">
                          Total
                        </td>
                        <td style="padding: 12px 0 0 0; border-top: 2px solid #000000; font-size: 18px; font-weight: 900; text-align: right; color: #000000;">
                          $${totalAmount.toFixed(2)} USD
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #fafafa; border-top: 1px solid #eeeeee; padding: 24px 40px; text-align: center;">
                    <p style="font-size: 12px; line-height: 1.6; color: #888888; margin: 0 0 8px 0;">
                      Questions about your order? Reach out to our support team at <a href="mailto:support@shop.co" style="color: #000000; text-decoration: underline; font-weight: 600;">support@shop.co</a>.
                    </p>
                    <p style="font-size: 11px; color: #aaaaaa; margin: 0;">
                      &copy; ${new Date().getFullYear()} SHOP.CO. All rights reserved.
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