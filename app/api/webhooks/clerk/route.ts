// app/api/webhooks/clerk/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

interface ClerkEmailAddress {
  id: string;
  email_address: string;
}

interface ClerkPhoneNumber {
  id: string;
  phone_number: string;
}

interface ClerkUserData {
  id: string;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_numbers?: ClerkPhoneNumber[];
  image_url?: string | null;
  profile_image_url?: string | null;
}

interface ClerkWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted' | string;
  data: ClerkUserData;
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('❌ Missing CLERK_WEBHOOK_SECRET in environment variables.');
    return NextResponse.json(
      { error: 'Server configuration error: missing webhook secret.' },
      { status: 500 }
    );
  }

  // 1. Extract Svix headers for signature verification
  const svixId = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: 'Missing required Svix verification headers.' },
      { status: 400 }
    );
  }

  // 2. Extract raw body payload
  const body = await req.text();
  const wh = new Webhook(webhookSecret);

  let event: ClerkWebhookEvent;

  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown signature error';
    console.error(`❌ Clerk webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Invalid signature: ${errorMessage}` },
      { status: 400 }
    );
  }

  const { type, data } = event;

  try {
    // 3. Handle User Events
    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const primaryEmailObj = data.email_addresses?.find(
          (email) => email.id === data.primary_email_address_id
        ) || data.email_addresses?.[0];

        const primaryEmail = primaryEmailObj?.email_address;

        if (!primaryEmail) {
          console.warn(`⚠️ User event ${type} skipped: No email address found for ID ${data.id}`);
          return NextResponse.json({ message: 'User skipped due to missing email.' }, { status: 200 });
        }

        const fullName = [data.first_name, data.last_name]
          .filter(Boolean)
          .join(' ')
          .trim() || null;

        const phone = data.phone_numbers?.[0]?.phone_number || null;
        const imageUrl = data.image_url || data.profile_image_url || null;

        // Upsert user into Neon Database
        await prisma.user.upsert({
          where: { id: data.id },
          update: {
            email: primaryEmail,
            name: fullName,
            phone,
            imageUrl,
          },
          create: {
            id: data.id,
            email: primaryEmail,
            name: fullName,
            phone,
            imageUrl,
            role: Role.CUSTOMER,
          },
        });

        console.log(`✅ User ${data.id} (${primaryEmail}) synced to PostgreSQL via Clerk webhook.`);
        break;
      }

      case 'user.deleted': {
        if (!data.id) {
          return NextResponse.json({ error: 'Missing user ID for deletion.' }, { status: 400 });
        }

        // Check if user exists before attempting deletion
        const existingUser = await prisma.user.findUnique({
          where: { id: data.id },
        });

        if (existingUser) {
          await prisma.user.delete({
            where: { id: data.id },
          });
          console.log(`🗑️ User ${data.id} deleted from PostgreSQL via Clerk webhook.`);
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled Clerk event received: ${type}`);
    }

    return NextResponse.json({ success: true, event: type }, { status: 200 });
  } catch (dbError) {
    console.error(`❌ Database sync error for Clerk webhook [${type}]:`, dbError);
    return NextResponse.json(
      { error: 'Internal Server Error during database synchronization.' },
      { status: 500 }
    );
  }
}