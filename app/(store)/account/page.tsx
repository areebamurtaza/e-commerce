// app/(store)/account/page.tsx
'use client';

import { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Address } from '@prisma/client';
import {
  Package,
  User as UserIcon,
  MapPin,
  LogOut,
  ChevronRight,
  FileText,
  CheckCircle2,
  Plus,
  Check,
  Loader2,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Trash2,
  Truck,
  ExternalLink,
  Search,
} from 'lucide-react';
import { useClerk, useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InvoiceModal } from '@/components/account/invoice-modal';
import { AddressModal } from '@/components/account/address-modal';
import { getUserOrders, DbOrderWithItems } from '@/actions/order';
import {
  getUserAddresses,
  updateUserProfile,
  setDefaultUserAddress,
  deleteUserAddress,
} from '@/actions/user';
import { OrderStatus } from '@prisma/client';

type AccountTab = 'orders' | 'profile' | 'addresses';

export default function MyAccountPage() {
  const router = useRouter();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();

  const [activeTab, setActiveTab] = useState<AccountTab>('orders');
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] =
    useState<DbOrderWithItems | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<boolean>(false);
  const [trackingSearchQuery, setTrackingSearchQuery] = useState<string>('');

  // Orders State
  const [orders, setOrders] = useState<DbOrderWithItems[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState<boolean>(true);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState<boolean>(false);

  // Profile Form State
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Synchronize Clerk profile credentials
  useEffect(() => {
    if (isUserLoaded && user) {
      const resolvedName =
        user.fullName ||
        `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
        'Valued Customer';
      setFullName(resolvedName);
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [isUserLoaded, user]);

  // Fetch Live Orders
  const fetchOrders = useCallback(async () => {
    if (!isUserLoaded) return;
    setIsLoadingOrders(true);
    setOrdersError(null);

    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const userId = user?.id;

      const result = await getUserOrders({ userId, email: userEmail });
      if (result.success && result.data) {
        setOrders(result.data);
      } else {
        setOrdersError(result.error || 'Unable to retrieve order history.');
      }
    } catch (err) {
      console.error('[ACCOUNT_FETCH_ORDERS_ERROR]:', err);
      setOrdersError('Failed to establish connection to database.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [isUserLoaded, user]);

  // Fetch Live Saved Addresses
  const fetchAddresses = useCallback(async () => {
    if (!isUserLoaded) return;
    setIsLoadingAddresses(true);

    try {
      const res = await getUserAddresses();
      if (res.success && res.data) {
        setAddresses(res.data);
      }
    } catch (err) {
      console.error('[ACCOUNT_FETCH_ADDRESSES_ERROR]:', err);
    } finally {
      setIsLoadingAddresses(false);
    }
  }, [isUserLoaded]);

  useEffect(() => {
    fetchOrders();
    fetchAddresses();
  }, [fetchOrders, fetchAddresses]);

  const handleOpenInvoice = (order: DbOrderWithItems) => {
    setSelectedOrderForInvoice(order);
    setIsInvoiceOpen(true);
  };

  const handleQuickTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanQuery = trackingSearchQuery.trim();
    if (cleanQuery) {
      router.push(`/orders/${cleanQuery}`);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError(null);
    setProfileSavedSuccess(false);

    try {
      const res = await updateUserProfile({ fullName });
      if (res.success) {
        setProfileSavedSuccess(true);
        setTimeout(() => setProfileSavedSuccess(false), 3000);
      } else {
        setProfileError(res.error || 'Failed to update profile.');
      }
    } catch {
      setProfileError('Failed to save changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSetDefaultAddress = async (id: string) => {
    await setDefaultUserAddress(id);
    fetchAddresses();
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Are you sure you want to remove this address?')) {
      await deleteUserAddress(id);
      fetchAddresses();
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.DELIVERED:
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300';
      case OrderStatus.SHIPPED:
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300';
      case OrderStatus.PROCESSING:
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300';
      case OrderStatus.CANCELLED:
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300';
      case OrderStatus.PENDING:
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-black pb-24 pt-6 font-satoshi text-black dark:text-white transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 xl:px-[100px] space-y-8">
        {/* Navigation Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-black/60 dark:text-zinc-400 text-sm font-satoshi"
        >
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-black/40 dark:text-zinc-600" />
          <span className="text-black dark:text-white font-medium">My Account</span>
        </nav>

        {/* User Greeting & Instant Tracking Search Bar */}
        <div className="bg-[#F0F0F0]/60 dark:bg-zinc-900/60 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-1.5">
            <h1 className="font-integral font-bold text-2xl sm:text-3xl text-black dark:text-white uppercase tracking-tight">
              MY ACCOUNT
            </h1>
            <p className="text-xs sm:text-sm text-black/60 dark:text-zinc-400">
              Welcome back, <strong className="text-black dark:text-white">{fullName}</strong>.
              Manage your orders, addresses, and live shipment tracking.
            </p>
          </div>

          {/* Quick Order Lookup Form */}
          <form onSubmit={handleQuickTrackSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 dark:text-zinc-500" />
              <Input
                type="text"
                placeholder="Track Order # (e.g. ORD-894201)"
                value={trackingSearchQuery}
                onChange={(e) => setTrackingSearchQuery(e.target.value)}
                className="h-11 rounded-[62px] bg-white dark:bg-black border border-black/10 dark:border-zinc-700 pl-11 pr-4 text-xs font-mono placeholder:font-satoshi text-black dark:text-white focus-visible:ring-1 focus-visible:ring-black dark:focus-visible:ring-white"
              />
            </div>
            <Button
              type="submit"
              className="h-11 px-6 rounded-[62px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 text-xs font-bold shrink-0 cursor-pointer shadow-xs"
            >
              Track
            </Button>
          </form>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-4 sm:p-5 space-y-2 shrink-0 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full h-[54px] px-6 rounded-[62px] flex items-center justify-between text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-black/70 dark:text-zinc-400 hover:bg-[#F0F0F0] dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package size={18} />
                <span>My Orders</span>
              </div>
              {orders.length > 0 && (
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                    activeTab === 'orders'
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-black'
                      : 'bg-black/10 dark:bg-zinc-800 text-black dark:text-white'
                  }`}
                >
                  {orders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full h-[54px] px-6 rounded-[62px] flex items-center gap-3 text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-black/70 dark:text-zinc-400 hover:bg-[#F0F0F0] dark:hover:bg-zinc-800'
              }`}
            >
              <UserIcon size={18} />
              <span>Profile Information</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('addresses')}
              className={`w-full h-[54px] px-6 rounded-[62px] flex items-center gap-3 text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'addresses'
                  ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                  : 'text-black/70 dark:text-zinc-400 hover:bg-[#F0F0F0] dark:hover:bg-zinc-800'
              }`}
            >
              <MapPin size={18} />
              <span>Saved Addresses</span>
            </button>

            <div className="pt-4 border-t border-black/10 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: '/' })}
                className="w-full h-[54px] px-6 rounded-[62px] flex items-center gap-3 text-sm font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-[24px] border border-black/10 dark:border-zinc-800 p-6 sm:p-8 shadow-xs">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-zinc-800">
                  <div>
                    <h2 className="font-satoshi font-bold text-xl text-black dark:text-white">
                      Order History
                    </h2>
                    <p className="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
                      Track active shipments or print official tax receipts for your purchases
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={fetchOrders}
                    disabled={isLoadingOrders}
                    title="Refresh orders"
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-zinc-800 text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw size={16} className={isLoadingOrders ? 'animate-spin' : ''} />
                  </button>
                </div>

                {ordersError && (
                  <div className="p-4 rounded-[16px] bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-600 dark:text-rose-400 text-sm font-medium">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{ordersError}</span>
                  </div>
                )}

                {isLoadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="rounded-[16px] border border-black/10 dark:border-zinc-800 p-5 space-y-4 animate-pulse bg-[#F0F0F0]/50 dark:bg-zinc-800/40"
                      >
                        <div className="flex justify-between items-center">
                          <div className="h-5 bg-black/10 dark:bg-zinc-700 rounded w-28" />
                          <div className="h-5 bg-black/10 dark:bg-zinc-700 rounded-full w-20" />
                        </div>
                        <div className="h-4 bg-black/10 dark:bg-zinc-700 rounded w-3/4" />
                        <div className="h-6 bg-black/10 dark:bg-zinc-700 rounded w-24 pt-2" />
                      </div>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <div
                          key={order.id}
                          className="rounded-[20px] border border-black/10 dark:border-zinc-800 p-5 sm:p-6 space-y-4 bg-white dark:bg-zinc-900 hover:border-black/30 dark:hover:border-zinc-700 transition-all shadow-xs"
                        >
                          {/* Order Header Meta */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/10 dark:border-zinc-800">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-base text-black dark:text-white">
                                  {order.orderNumber}
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusBadge(
                                    order.status
                                  )}`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-xs text-black/50 dark:text-zinc-400 block">
                                Placed on {orderDate} • {order.payment?.paymentMethod || 'CARD'} (
                                {order.paymentStatus})
                              </span>
                            </div>

                            {/* Dual CTAs: Track Shipment & View Invoice */}
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenInvoice(order)}
                                className="h-8.5 px-3.5 rounded-[62px] border-black/10 dark:border-zinc-700 text-xs font-semibold gap-1.5 cursor-pointer bg-white dark:bg-zinc-800 hover:bg-black/5 dark:hover:bg-zinc-700"
                              >
                                <FileText size={13} />
                                <span>Invoice</span>
                              </Button>

                              <Button
                                asChild
                                size="sm"
                                className="h-8.5 px-4 rounded-[62px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
                              >
                                <Link href={`/orders/${order.id}`}>
                                  <Truck size={13} />
                                  <span>Track Order</span>
                                  <ExternalLink size={11} className="opacity-70" />
                                </Link>
                              </Button>
                            </div>
                          </div>

                          {/* Items Preview */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {order.items.map((item) => {
                              const primaryImg =
                                item.variant?.product?.images?.[0]?.url || '/images/pd1.png';

                              return (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-2.5 rounded-[14px] bg-[#F0F0F0]/50 dark:bg-zinc-800/40 border border-black/5 dark:border-zinc-800"
                                >
                                  <div className="relative w-12 h-12 shrink-0 overflow-hidden rounded-[10px] bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800">
                                    <Image
                                      src={primaryImg}
                                      alt={item.title}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-xs text-black dark:text-white truncate">
                                      {item.title}
                                    </h4>
                                    <p className="text-[11px] text-black/60 dark:text-zinc-400">
                                      {item.size} • {item.color} • Qty: {item.quantity}
                                    </p>
                                  </div>

                                  <div className="font-bold text-xs text-black dark:text-white pr-1">
                                    ${item.total.toFixed(2)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Order Footer Summary */}
                          <div className="flex items-center justify-between pt-3 border-t border-black/10 dark:border-zinc-800 text-xs text-black/60 dark:text-zinc-400">
                            <span className="truncate max-w-[280px] sm:max-w-md">
                              Shipping to:{' '}
                              <strong className="text-black dark:text-white">
                                {order.shippingAddress}
                              </strong>
                            </span>
                            <div className="text-right shrink-0">
                              <span>Total: </span>
                              <span className="font-mono font-bold text-sm sm:text-base text-black dark:text-white">
                                ${order.total.toFixed(2)} USD
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full py-16 px-6 flex flex-col items-center justify-center text-center gap-4 bg-[#F0F0F0]/50 dark:bg-zinc-900/50 rounded-[20px] border border-black/10 dark:border-zinc-800">
                    <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 border border-black/10 dark:border-zinc-700 flex items-center justify-center text-black/60 dark:text-zinc-400 shadow-xs">
                      <ShoppingBag className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-integral font-bold text-xl uppercase text-black dark:text-white">
                        No Orders Placed Yet
                      </h3>
                      <p className="font-satoshi text-sm text-black/60 dark:text-zinc-400 max-w-sm">
                        You haven&apos;t placed any orders yet. Discover our fresh arrivals and complete your first purchase!
                      </p>
                    </div>

                    <Link
                      href="/shop"
                      className="mt-2 h-[48px] px-8 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-medium text-sm flex items-center gap-2 hover:bg-black/80 dark:hover:bg-white/80 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>Explore Catalog</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-black/10 dark:border-zinc-800">
                  <h2 className="font-satoshi font-bold text-xl text-black dark:text-white">
                    Profile Details
                  </h2>
                  <p className="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
                    Manage your personal account credentials stored securely in our database
                  </p>
                </div>

                {profileError && (
                  <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-[12px] text-xs font-medium text-rose-600 dark:text-rose-400">
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-5 max-w-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-black dark:text-white">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border border-transparent dark:border-zinc-800 px-5 text-sm text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-black dark:text-white">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={email}
                        className="w-full h-[48px] rounded-[62px] bg-[#F0F0F0] dark:bg-black border border-transparent dark:border-zinc-800 px-5 text-sm text-black/60 dark:text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSavingProfile}
                      className="h-[48px] px-8 rounded-[62px] bg-black dark:bg-white text-white dark:text-black font-satoshi font-bold text-sm hover:bg-black/80 dark:hover:bg-white/80 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      {isSavingProfile ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>Save Changes</span>
                      )}
                    </Button>

                    {profileSavedSuccess && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                        <Check size={16} /> Saved to Database!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-black/10 dark:border-zinc-800">
                  <div>
                    <h2 className="font-satoshi font-bold text-xl text-black dark:text-white">
                      Saved Addresses
                    </h2>
                    <p className="text-xs text-black/60 dark:text-zinc-400 mt-0.5">
                      Manage multiple shipping locations stored in your profile
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    size="sm"
                    className="h-9 px-4 rounded-[62px] bg-black dark:bg-white text-white dark:text-black text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 dark:hover:bg-white/80 transition-all cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Add Address</span>
                  </Button>
                </div>

                {isLoadingAddresses ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-20 rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-zinc-800/40 animate-pulse"
                      />
                    ))}
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="rounded-[16px] border border-black/10 dark:border-zinc-800 p-5 flex items-center justify-between bg-white dark:bg-zinc-900 hover:border-black/30 dark:hover:border-zinc-700 transition-all shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-black dark:text-white">
                              {addr.label}
                            </span>
                            <span className="text-xs text-black/60 dark:text-zinc-400">• {addr.street}</span>
                            {addr.isDefault && (
                              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-black/60 dark:text-zinc-400">
                            {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              className="text-xs text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white underline font-medium cursor-pointer"
                            >
                              Make Default
                            </button>
                          )}
                          {addr.isDefault && (
                            <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1.5 rounded-full text-black/40 dark:text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Delete address"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-black/15 dark:border-zinc-800 rounded-[16px] space-y-2">
                    <p className="text-sm text-black/60 dark:text-zinc-400">
                      No saved addresses yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-xs font-bold text-black dark:text-white underline cursor-pointer"
                    >
                      Click here to add your first address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Modal Mount */}
      <InvoiceModal
        order={selectedOrderForInvoice}
        isOpen={isInvoiceOpen}
        onClose={() => {
          setIsInvoiceOpen(false);
          setSelectedOrderForInvoice(null);
        }}
      />

      {/* Address Modal Mount */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={fetchAddresses}
      />
    </div>
  );
}