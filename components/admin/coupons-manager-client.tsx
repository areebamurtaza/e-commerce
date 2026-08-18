// components/admin/coupons-manager-client.tsx
'use client';

import { useState, useTransition, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  CouponItem,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '@/actions/coupon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AdminToast, AdminToastState } from '@/components/admin/admin-toast';
import {
  Tag,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Calendar,
  Sparkles,
  Percent,
  Search,
  Loader2,
  X,
  Megaphone,
} from 'lucide-react';

interface CouponsManagerClientProps {
  initialCoupons: CouponItem[];
}

export function CouponsManagerClient({ initialCoupons }: CouponsManagerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastState, setToastState] = useState<AdminToastState | null>(null);

  // New Coupon Form state
  const [newCode, setNewCode] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDiscount, setNewDiscount] = useState('15');
  const [newMinOrder, setNewMinOrder] = useState('');
  const [newMaxDiscount, setNewMaxDiscount] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredCoupons = initialCoupons.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    (c.description && c.description.toLowerCase().includes(search.toLowerCase()))
  );

  const activeCount = initialCoupons.filter((c) => c.isActive).length;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setToastState({
      type: 'success',
      message: `Coupon code "${code}" copied to clipboard!`,
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      const res = await toggleCouponStatus(id);
      if (res.success) {
        setToastState({ type: 'success', message: res.message || 'Status updated.' });
        router.refresh();
      } else {
        setToastState({ type: 'error', message: res.error || 'Failed to update.' });
      }
    });
  };

  const handleDelete = (id: string, code: string) => {
    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (res.success) {
        setToastState({ type: 'success', message: `Coupon "${code}" deleted.` });
        router.refresh();
      } else {
        setToastState({ type: 'error', message: res.error || 'Failed to delete.' });
      }
    });
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const discountVal = parseFloat(newDiscount);
    if (isNaN(discountVal) || discountVal <= 0 || discountVal > 100) {
      setFormError('Discount must be between 1% and 100%.');
      return;
    }

    startTransition(async () => {
      const res = await createCoupon({
        code: newCode,
        description: newDescription,
        discountPercentage: discountVal,
        minOrderAmount: newMinOrder ? parseFloat(newMinOrder) : undefined,
        maxDiscount: newMaxDiscount ? parseFloat(newMaxDiscount) : undefined,
        expiresAt: newExpiresAt || undefined,
      });

      if (res.success) {
        setIsCreateOpen(false);
        setNewCode('');
        setNewDescription('');
        setNewDiscount('15');
        setNewMinOrder('');
        setNewMaxDiscount('');
        setNewExpiresAt('');
        setToastState({
          type: 'success',
          message: res.message || 'Coupon created successfully!',
        });
        router.refresh();
      } else {
        setFormError(res.error || 'Failed to create coupon.');
      }
    });
  };

  return (
    <div className="space-y-6 font-admin text-black dark:text-white transition-colors">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-admin uppercase tracking-tight text-black dark:text-white flex items-center gap-2.5">
            <Tag className="h-6 w-6 text-black dark:text-white" />
            COUPONS & AD PROMOS
          </h1>
          <p className="text-xs text-black/60 dark:text-zinc-400 mt-1">
            Create and manage storewide promo codes, ad campaign vouchers, and influencer discounts.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-[62px] text-xs font-bold bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-5 h-9 flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
        >
          <Plus size={16} /> Create Campaign Coupon
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="rounded-[20px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-black/50 dark:text-zinc-400 uppercase tracking-wider">
                Total Coupons
              </p>
              <p className="text-2xl font-extrabold text-black dark:text-white mt-1">
                {initialCoupons.length}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Tag size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-black/50 dark:text-zinc-400 uppercase tracking-wider">
                Active Campaigns
              </p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {activeCount}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <CardContent className="p-0 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-black/50 dark:text-zinc-400 uppercase tracking-wider">
                Total Redemptions
              </p>
              <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                {initialCoupons.reduce((acc, curr) => acc + curr.usageCount, 0)}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Megaphone size={18} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table Card */}
      <Card className="rounded-[20px] border border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-black/10 dark:border-zinc-800 flex items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 dark:text-zinc-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon code or campaign..."
              className="pl-9 h-9 text-xs rounded-full border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
            />
          </div>
          <span className="text-xs text-black/50 dark:text-zinc-400 font-medium">
            Showing {filteredCoupons.length} coupon(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 dark:border-zinc-800 bg-black/[0.02] dark:bg-zinc-800/40 text-black/60 dark:text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Campaign Description</th>
                <th className="p-4">Min. Order</th>
                <th className="p-4">Usage</th>
                <th className="p-4">Expiration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-zinc-800">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-black/40 dark:text-zinc-500">
                    No coupons found. Click &quot;Create Campaign Coupon&quot; to add one!
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                  return (
                    <tr
                      key={coupon.id}
                      className="hover:bg-black/[0.01] dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="p-4 font-bold">
                        <div className="flex items-center gap-2">
                          <span className="font-mono bg-[#F0F0F0] dark:bg-zinc-800 px-2.5 py-1 rounded-lg text-black dark:text-white border border-black/5 dark:border-zinc-700">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy Code"
                            className="p-1 rounded text-black/40 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <Percent size={11} /> {coupon.discountPercentage}% OFF
                        </span>
                      </td>

                      <td className="p-4 text-black/80 dark:text-zinc-300 max-w-[200px] truncate">
                        {coupon.description || <span className="text-black/30 dark:text-zinc-600">Storewide Promo</span>}
                      </td>

                      <td className="p-4 text-black/70 dark:text-zinc-400">
                        {coupon.minOrderAmount > 0 ? `$${coupon.minOrderAmount.toFixed(2)}` : 'None'}
                      </td>

                      <td className="p-4 font-semibold text-black dark:text-white">
                        {coupon.usageCount} orders
                      </td>

                      <td className="p-4 text-black/70 dark:text-zinc-400">
                        {coupon.expiresAt ? (
                          <span className={`inline-flex items-center gap-1 ${isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                            <Clock size={12} />
                            {new Date(coupon.expiresAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {isExpired && ' (Expired)'}
                          </span>
                        ) : (
                          <span className="text-black/40 dark:text-zinc-500">No Expiry</span>
                        )}
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => handleToggle(coupon.id)}
                          disabled={isPending}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition-all ${
                            coupon.isActive && !isExpired
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          {coupon.isActive && !isExpired ? (
                            <>
                              <CheckCircle2 size={12} /> Active
                            </>
                          ) : (
                            <>
                              <XCircle size={12} /> Disabled
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isPending}
                          onClick={() => handleDelete(coupon.id, coupon.code)}
                          className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                          title="Delete Coupon"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Coupon Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 shadow-2xl overflow-hidden font-admin text-black dark:text-white animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-black/10 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold">
                  <Tag size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold">Create Campaign Coupon</h2>
                  <p className="text-xs text-black/60 dark:text-zinc-400">
                    Add a storewide or ad campaign discount code
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 rounded-full text-black/50 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300 mb-1.5">
                  Coupon Code *
                </label>
                <Input
                  required
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER25, INSTA15, BLACKFRIDAY"
                  className="font-mono text-sm uppercase rounded-xl border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300 mb-1.5">
                    Discount (%) *
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newDiscount}
                      onChange={(e) => setNewDiscount(e.target.value)}
                      placeholder="15"
                      className="pr-8 text-sm rounded-xl border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
                    />
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 dark:text-zinc-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300 mb-1.5">
                    Min. Order ($)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newMinOrder}
                    onChange={(e) => setNewMinOrder(e.target.value)}
                    placeholder="Optional (e.g. 50)"
                    className="text-sm rounded-xl border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300 mb-1.5">
                  Campaign / Ad Description
                </label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Instagram Reels Ad Promo or Influencer Deal"
                  className="text-xs rounded-xl border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300 mb-1.5">
                    Max Discount Cap ($)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={newMaxDiscount}
                    onChange={(e) => setNewMaxDiscount(e.target.value)}
                    placeholder="Optional (e.g. 50)"
                    className="text-sm rounded-xl border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-black/70 dark:text-zinc-300 mb-1.5">
                    Expiration Date
                  </label>
                  <Input
                    type="date"
                    value={newExpiresAt}
                    onChange={(e) => setNewExpiresAt(e.target.value)}
                    className="text-xs rounded-xl border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/60"
                  />
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
                  {formError}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={isPending}
                  className="h-9 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-9 text-xs font-bold rounded-[62px] bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-zinc-200 px-5 cursor-pointer shadow-sm"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1.5" />
                      Creating...
                    </>
                  ) : (
                    'Save & Activate'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <AdminToast toast={toastState} onDismiss={() => setToastState(null)} />
    </div>
  );
}
