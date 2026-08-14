// components/admin/product-form.tsx
'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
  SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProduct } from '@/actions/product';
import { productFormSchema, ProductFormValues } from '@/schemas/product';
import { DressStyle } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ProductFormProps {
  categories: Array<{ id: string; name: string; slug: string }>;
}

const AVAILABLE_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const;
const DRESS_STYLES: DressStyle[] = ['CASUAL', 'FORMAL', 'PARTY', 'GYM'];

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      basePrice: 120.0,
      discountPercentage: 0,
      categoryId: categories[0]?.id || '',
      dressStyle: 'CASUAL',
      isFeatured: false,
      isNewArrival: true,
      images: [
        { url: '/images/hero1.png', isPrimary: true },
      ],
      variants: [
        {
          sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}-M-BLK`,
          size: 'M',
          colorName: 'Black',
          colorHex: '#000000',
          priceOffset: 0,
          stockQuantity: 25,
        },
      ],
    },
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const {
    fields: imageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: 'images',
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: 'variants',
  });

  const watchTitle = watch('title');
  const watchedImages = watch('images');

  const handleGenerateSlug = () => {
    if (!watchTitle) return;
    const generated = watchTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', generated, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ProductFormValues> = (data) => {
    setServerError(null);
    setValidationErrors([]);

    const payload: ProductFormValues = {
      ...data,
      isFeatured: isDraft ? false : data.isFeatured,
      isNewArrival: isDraft ? false : data.isNewArrival,
    };

    startTransition(async () => {
      const response = await createProduct(payload);
      if (!response.success) {
        setServerError(response.error || 'Failed to create product.');
      } else {
        router.push('/admin/products');
        router.refresh();
      }
    });
  };

  const onInvalid: SubmitErrorHandler<ProductFormValues> = (formErrors) => {
    const errorList: string[] = [];

    if (formErrors.title) errorList.push(`Title: ${formErrors.title.message}`);
    if (formErrors.slug) errorList.push(`Slug: ${formErrors.slug.message}`);
    if (formErrors.description) errorList.push(`Description: ${formErrors.description.message}`);
    if (formErrors.basePrice) errorList.push(`Base Price: ${formErrors.basePrice.message}`);
    if (formErrors.categoryId) errorList.push(`Category: ${formErrors.categoryId.message}`);
    if (formErrors.images) {
      if (formErrors.images.message) {
        errorList.push(`Images: ${formErrors.images.message}`);
      } else if (Array.isArray(formErrors.images)) {
        formErrors.images.forEach((imgErr, idx) => {
          if (imgErr?.url) errorList.push(`Image #${idx + 1}: ${imgErr.url.message}`);
        });
      }
    }
    if (formErrors.variants) {
      if (formErrors.variants.message) {
        errorList.push(`Variants: ${formErrors.variants.message}`);
      } else if (Array.isArray(formErrors.variants)) {
        formErrors.variants.forEach((vErr, idx) => {
          if (vErr?.sku) errorList.push(`Variant #${idx + 1} SKU: ${vErr.sku.message}`);
          if (vErr?.colorHex) errorList.push(`Variant #${idx + 1} Hex: ${vErr.colorHex.message}`);
        });
      }
    }

    setValidationErrors(errorList);
  };

  const handleAddImageRow = () => {
    const defaultImages = ['/images/m2.png', '/images/n3.png', '/images/n2.png', '/images/m3.png'];
    const nextUrl = defaultImages[imageFields.length % defaultImages.length];
    appendImage({ url: nextUrl, isPrimary: imageFields.length === 0 });
  };

  const handleAddVariantRow = () => {
    const randomSku = `SKU-${Math.floor(1000 + Math.random() * 9000)}-L-BLU`;
    appendVariant({
      sku: randomSku,
      size: 'L',
      colorName: 'Navy Blue',
      colorHex: '#000080',
      priceOffset: 0,
      stockQuantity: 15,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6 font-satoshi text-black dark:text-white pb-12"
    >
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 rounded-lg border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold font-integral uppercase tracking-tight text-black dark:text-white">
              Add New Product
            </h1>
            <p className="text-xs text-black/60 dark:text-zinc-400">
              Configure inventory, multi-variant matrices, and pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/products')}
            className="h-8.5 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-black dark:text-white px-5"
          >
            Discard
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            onClick={() => setIsDraft(false)}
            className="h-8.5 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 rounded-[62px] text-xs font-semibold px-6"
          >
            {isPending ? 'Publishing...' : 'Publish Product'}
          </Button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationErrors.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            Please correct the following before publishing:
          </div>
          <ul className="list-disc pl-5 space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Server Error Banner */}
      {serverError && (
        <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {/* 2-Column Form Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column (8 cols): Details, Images, Variants */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Details */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <CardHeader className="p-0">
              <CardTitle className="text-base font-bold text-black dark:text-white">
                Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Product Name</label>
                <Input
                  placeholder="e.g. Classic Heavyweight Graphic T-Shirt"
                  className="h-9 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black dark:text-white">URL Slug</label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[11px] font-bold text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Auto-generate from title
                  </button>
                </div>
                <Input
                  placeholder="e.g. classic-heavyweight-graphic-tshirt"
                  className="h-9 text-xs font-mono rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white"
                  {...register('slug')}
                />
                {errors.slug && (
                  <p className="text-[11px] text-rose-500 font-medium">{errors.slug.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Description (Min 20 characters)
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe material compositions, fabric weight, cut, model sizing, and care details..."
                  className="w-full rounded-[16px] bg-[#F0F0F0] dark:bg-black border-none p-3 text-xs text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-zinc-500 focus:outline-none"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Images Manager */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-black dark:text-white">Product Images</h3>
                <p className="text-xs text-black/60 dark:text-zinc-400">
                  Provide image paths (e.g. <span className="font-mono">/images/hero1.png</span>) or CDN URLs.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddImageRow}
                className="h-8 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Image
              </Button>
            </div>

            <div className="space-y-3">
              {imageFields.map((field, idx) => {
                const currentUrl = watchedImages?.[idx]?.url || '';
                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/40 dark:bg-black/40"
                  >
                    {/* Thumbnail Preview */}
                    <div className="relative h-11 w-11 rounded-[10px] overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 shrink-0">
                      {currentUrl ? (
                        <Image
                          src={currentUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 m-auto text-black/30 dark:text-zinc-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="/images/hero1.png or https://..."
                        className="h-8.5 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`images.${idx}.url`)}
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-black/70 dark:text-zinc-300 font-medium cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="primaryImageRadio"
                        checked={watch(`images.${idx}.isPrimary`)}
                        onChange={() => {
                          imageFields.forEach((_, i) => {
                            setValue(`images.${i}.isPrimary`, i === idx);
                          });
                        }}
                        className="accent-black dark:accent-white cursor-pointer"
                      />
                      Primary
                    </label>

                    {imageFields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeImage(idx)}
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Variants Matrix */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-black dark:text-white">Product Variants</h3>
                <p className="text-xs text-black/60 dark:text-zinc-400">
                  Size choices, color variations, SKU tags, and stock counts.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariantRow}
                className="h-8 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variantFields.map((field, idx) => (
                <div
                  key={field.id}
                  className="p-4 rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/40 dark:bg-black/40 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">SKU Code</label>
                      <Input
                        placeholder="SKU-PROD-01"
                        className="h-8 text-xs font-mono rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`variants.${idx}.sku`)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">Apparel Size</label>
                      <select
                        className="w-full h-8 rounded-[62px] bg-white dark:bg-zinc-900 border-none px-3 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                        {...register(`variants.${idx}.size`)}
                      >
                        {AVAILABLE_SIZES.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">Color (Name / Hex)</label>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="e.g. Navy"
                          className="h-8 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white flex-1"
                          {...register(`variants.${idx}.colorName`)}
                        />
                        <Controller
                          control={control}
                          name={`variants.${idx}.colorHex`}
                          render={({ field: hexField }) => (
                            <input
                              type="color"
                              value={hexField.value}
                              onChange={(e) => hexField.onChange(e.target.value)}
                              className="h-8 w-8 rounded-full border border-black/10 dark:border-zinc-700 cursor-pointer bg-transparent shrink-0"
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">Available Stock</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-8 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`variants.${idx}.stockQuantity`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">Price Offset ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="h-8 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`variants.${idx}.priceOffset`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="flex justify-end">
                      {variantFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeVariant(idx)}
                          className="h-8 text-xs text-rose-500 hover:text-rose-700 gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (4 cols): Pricing, Classification & Visibility */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white">Pricing</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Base Price ($ USD)</label>
                <Input
                  type="number"
                  step="0.01"
                  className="h-9 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white"
                  {...register('basePrice', { valueAsNumber: true })}
                />
                {errors.basePrice && (
                  <p className="text-[11px] text-rose-500">{errors.basePrice.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Discount Percentage (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  className="h-9 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white"
                  {...register('discountPercentage', { valueAsNumber: true })}
                />
              </div>
            </div>
          </Card>

          {/* Classification */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white">Classification</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Category</label>
                <select
                  className="w-full h-9 rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                  {...register('categoryId')}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-[11px] text-rose-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Dress Style</label>
                <select
                  className="w-full h-9 rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                  {...register('dressStyle')}
                >
                  {DRESS_STYLES.map((style) => (
                    <option key={style} value={style}>
                      {style}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Flags */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white">Storefront Flags</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-bold text-black dark:text-white">Featured Product</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-black dark:accent-white cursor-pointer"
                  {...register('isFeatured')}
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer border-t border-black/10 dark:border-zinc-800 pt-3">
                <span className="text-xs font-bold text-black dark:text-white">New Arrival Tag</span>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded accent-black dark:accent-white cursor-pointer"
                  {...register('isNewArrival')}
                />
              </label>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}