// app/admin/coupons/page.tsx
import { getAdminCoupons } from '@/actions/coupon';
import { CouponsManagerClient } from '@/components/admin/coupons-manager-client';
import { verifyAdmin } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage() {
  await verifyAdmin();
  const res = await getAdminCoupons();

  return <CouponsManagerClient initialCoupons={res.coupons || []} />;
}
