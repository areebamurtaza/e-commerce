// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { prisma, withDbRetry } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET in environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: missing webhook secret.' },
      { status: 500 }
    );
  }

  // 1. Extract Svix verification headers
  const headerPayload = await headers();
  const svixId = headerPayload.get('svix-id');
  const svixTimestamp = headerPayload.get('svix-timestamp');
  const svixSignature = headerPayload.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing required Svix verification headers.' },
      { status: 400 }
    );
  }

  // 2. Verify Cryptographic Signature
  const rawBody = await req.text();
  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(rawBody, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown signature error';
    console.error(`❌ Clerk webhook signature verification failed: ${msg}`);
    return NextResponse.json({ error: `Invalid signature: ${msg}` }, { status: 400 });
  }

  const { type, data } = evt;

  try {
    return await withDbRetry(async () => {
      // 3. Handle User Creation & Updates
      if (type === 'user.created' || type === 'user.updated') {
        const { id, email_addresses, first_name, last_name, phone_numbers, image_url, public_metadata } = data;

        const primaryEmail =
          email_addresses?.find((e) => e.id === data.primary_email_address_id)?.email_address ||
          email_addresses?.[0]?.email_address;

        if (!primaryEmail) {
          console.warn(`⚠️ User event ${type} skipped: No email address for user ${id}`);
          return NextResponse.json({ message: 'User skipped: missing email.' }, { status: 200 });
        }

        const fullName = [first_name, last_name].filter(Boolean).join(' ').trim() || null;
        const phone = phone_numbers?.[0]?.phone_number || null;
        const imageUrl = image_url || null;
        const role = (public_metadata?.role as Role) || Role.CUSTOMER;

        await prisma.user.upsert({
          where: { id },
          update: {
            email: primaryEmail.toLowerCase(),
            name: fullName,
            phone,
            imageUrl,
            role,
          },
          create: {
            id,
            email: primaryEmail.toLowerCase(),
            name: fullName,
            phone,
            imageUrl,
            role,
          },
        });

        console.log(`✅ User ${id} (${primaryEmail}) synced to PostgreSQL.`);
        revalidatePath('/account');
        revalidatePath('/admin');
      }

      // 4. Handle User Deletion (Safely handle order constraints)
      if (type === 'user.deleted') {
        const { id } = data;

        if (id) {
          const userOrdersCount = await prisma.order.count({ where: { userId: id } });

          if (userOrdersCount > 0) {
            await prisma.user.update({
              where: { id },
              data: {
                email: `deleted_${id}@shop.co`,
                name: 'Former Customer',
                imageUrl: null,
                phone: null,
              },
            });
            console.log(`🔒 User ${id} has historical orders; unlinked identity safely.`);
          } else {
            await prisma.user.deleteMany({ where: { id } });
            console.log(`🗑️ User ${id} deleted from database.`);
          }

          revalidatePath('/admin');
        }
      }

      return NextResponse.json({ success: true, event: type }, { status: 200 });
    });
  } catch (dbError) {
    console.error(`❌ Database sync error for Clerk webhook [${type}]:`, dbError);
    return NextResponse.json(
      { error: 'Internal Server Error during database synchronization.' },
      { status: 500 }
    );
  }
}