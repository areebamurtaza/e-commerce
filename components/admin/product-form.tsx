// components/admin/product-form.tsx
'use client';

import { useState, useTransition, useRef, useEffect, useMemo, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  useForm,
  useFieldArray,
  Controller,
  SubmitHandler,
  SubmitErrorHandler,
  FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProduct } from '@/actions/product';
import { productFormSchema, ProductFormValues } from '@/schemas/product';
import { DressStyle, Gender } from '@prisma/client';
import { DEPARTMENT_TAXONOMY } from '@/constants/shop';
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
  UploadCloud,
  FileImage,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
}

const AVAILABLE_SIZES = ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const;

const GENDERS: Array<{ label: string; value: Gender }> = [
  { label: "Men's Apparel", value: Gender.MEN },
  { label: "Women's Apparel", value: Gender.WOMEN },
  { label: "Kids' Apparel", value: Gender.KIDS },
  { label: 'Unisex', value: Gender.UNISEX },
];

const DRESS_STYLES: DressStyle[] = [
  DressStyle.CASUAL,
  DressStyle.FORMAL,
  DressStyle.PARTY,
  DressStyle.GYM,
];

export function ProductForm({ categories }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      basePrice: 120.0,
      discountPercentage: 0,
      gender: Gender.MEN,
      categoryId: '',
      dressStyle: DressStyle.CASUAL,
      isFeatured: false,
      isNewArrival: true,
      images: [{ url: '/images/hero1.png', isPrimary: true }],
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

  const selectedGender = (watch('gender') || Gender.MEN) as Gender;
  const currentCategoryId = watch('categoryId');
  const watchTitle = watch('title');
  const watchedImages = watch('images');

  // Reactively calculate available subcategories for the selected department
  const availableCategories = useMemo<CategoryOption[]>(() => {
    const departmentConfig =
      DEPARTMENT_TAXONOMY[selectedGender] || DEPARTMENT_TAXONOMY[Gender.MEN];
    const allowedSlugs = departmentConfig.subcategories.map((s: { slug: string }) =>
      s.slug.toLowerCase()
    );

    const matched = categories.filter((cat) =>
      allowedSlugs.some(
        (slug: string) =>
          cat.slug.toLowerCase() === slug ||
          cat.name.toLowerCase().includes(slug) ||
          slug.includes(cat.slug.toLowerCase())
      )
    );

    return matched.length > 0 ? matched : categories;
  }, [categories, selectedGender]);

  // Synchronize categoryId when department changes
  useEffect(() => {
    if (availableCategories.length > 0) {
      const isCurrentValid = availableCategories.some((c) => c.id === currentCategoryId);
      if (!isCurrentValid && availableCategories[0]) {
        setValue('categoryId', availableCategories[0].id, { shouldValidate: true });
      }
    }
  }, [availableCategories, currentCategoryId, setValue]);

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

  const handleGenerateSlug = (): void => {
    if (!watchTitle) return;
    const generated = watchTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setValue('slug', generated, { shouldValidate: true });
  };

  const processFiles = (files: FileList | null): void => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('Please select valid image files only (PNG, JPG, WEBP).');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const base64Url = event.target?.result;
        if (typeof base64Url === 'string') {
          appendImage({
            url: base64Url,
            isPrimary: imageFields.length === 0,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    processFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const onSubmit: SubmitHandler<ProductFormValues> = (data: ProductFormValues) => {
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

  const onInvalid: SubmitErrorHandler<ProductFormValues> = (
    formErrors: FieldErrors<ProductFormValues>
  ) => {
    const errorList: string[] = [];

    if (formErrors.title?.message) errorList.push(`Title: ${formErrors.title.message}`);
    if (formErrors.slug?.message) errorList.push(`Slug: ${formErrors.slug.message}`);
    if (formErrors.description?.message)
      errorList.push(`Description: ${formErrors.description.message}`);
    if (formErrors.basePrice?.message)
      errorList.push(`Base Price: ${formErrors.basePrice.message}`);
    if (formErrors.gender?.message) errorList.push(`Department: ${formErrors.gender.message}`);
    if (formErrors.categoryId?.message)
      errorList.push(`Category: ${formErrors.categoryId.message}`);

    if (formErrors.images) {
      if (formErrors.images.message) {
        errorList.push(`Images: ${formErrors.images.message}`);
      } else if (Array.isArray(formErrors.images)) {
        formErrors.images.forEach((imgErr, idx: number) => {
          if (imgErr?.url?.message) {
            errorList.push(`Image #${idx + 1}: ${imgErr.url.message}`);
          }
        });
      }
    }

    if (formErrors.variants) {
      if (formErrors.variants.message) {
        errorList.push(`Variants: ${formErrors.variants.message}`);
      } else if (Array.isArray(formErrors.variants)) {
        formErrors.variants.forEach((vErr, idx: number) => {
          if (vErr?.sku?.message) {
            errorList.push(`Variant #${idx + 1} SKU: ${vErr.sku.message}`);
          }
          if (vErr?.size?.message) {
            errorList.push(`Variant #${idx + 1} Size: ${vErr.size.message}`);
          }
          if (vErr?.colorHex?.message) {
            errorList.push(`Variant #${idx + 1} Color: ${vErr.colorHex.message}`);
          }
        });
      }
    }

    setValidationErrors(errorList);
  };

  const handleAddVariantRow = (): void => {
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
              Configure department hierarchy, categories, multi-variant matrices, and gallery media.
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
        {/* Left Column: Details, Gallery, Variants */}
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
                    className="text-[11px] font-bold text-black/60 dark:text-zinc-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
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
                  Description (Min 10 characters)
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

          {/* Media Gallery */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-black dark:text-white">Product Gallery</h3>
                <p className="text-xs text-black/60 dark:text-zinc-400">
                  Upload photos directly from your computer or paste image URLs.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 gap-1.5"
              >
                <UploadCloud className="h-3.5 w-3.5" /> Upload from Computer
              </Button>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 scale-[0.99]'
                  : 'border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-black/50 hover:bg-[#F0F0F0] dark:hover:bg-zinc-900'
              }`}
            >
              <FileImage className="h-8 w-8 mx-auto text-black/40 dark:text-zinc-500 mb-2" />
              <p className="text-xs font-bold text-black dark:text-white">
                Drag and drop your photos here, or <span className="underline">browse files</span>
              </p>
              <p className="text-[11px] text-black/40 dark:text-zinc-500 mt-0.5">
                Supports PNG, JPG, or WEBP up to 5MB
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {imageFields.map((field, idx) => {
                const currentUrl = watchedImages?.[idx]?.url || '';
                return (
                  <div
                    key={field.id}
                    className="flex items-center gap-3 p-3 rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/40 dark:bg-black/40"
                  >
                    <div className="relative h-12 w-12 rounded-[10px] overflow-hidden bg-white dark:bg-zinc-900 border border-black/10 dark:border-zinc-800 shrink-0">
                      {currentUrl ? (
                        <Image
                          src={currentUrl}
                          alt={`Product photo ${idx + 1}`}
                          fill
                          sizes="48px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 m-auto text-black/30 dark:text-zinc-600" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1">
                      <Input
                        placeholder="Image URL or Base64 data..."
                        className="h-8.5 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`images.${idx}.url`)}
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-black/70 dark:text-zinc-300 font-medium cursor-pointer shrink-0">
                      <input
                        type="radio"
                        name="primaryImageRadio"
                        checked={Boolean(watchedImages?.[idx]?.isPrimary)}
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

          {/* Variant Matrix */}
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
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                        SKU Code
                      </label>
                      <Input
                        placeholder="SKU-PROD-01"
                        className="h-8 text-xs font-mono rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`variants.${idx}.sku`)}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                        Apparel Size
                      </label>
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
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                        Color (Name / Hex)
                      </label>
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
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                        Available Stock
                      </label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        className="h-8 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`variants.${idx}.stockQuantity`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                        Price Offset ($)
                      </label>
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

        {/* Right Column: Pricing, Classification, and Visibility */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white">Pricing</h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Base Price ($ USD)
                </label>
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
                <label className="text-xs font-bold text-black dark:text-white">
                  Discount Percentage (%)
                </label>
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
              {/* Target Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">
                  Target Department
                </label>
                <select
                  className="w-full h-9 rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-xs text-black dark:text-white focus:outline-none cursor-pointer font-medium"
                  {...register('gender')}
                >
                  {GENDERS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <p className="text-[11px] text-rose-500">{errors.gender.message}</p>
                )}
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black dark:text-white">
                    Apparel Subcategory
                  </label>
                  <span className="text-[10px] text-black/50 dark:text-zinc-400 font-medium">
                    Filtered for {DEPARTMENT_TAXONOMY[selectedGender]?.name || 'Department'}
                  </span>
                </div>
                <select
                  className="w-full h-9 rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-xs text-black dark:text-white focus:outline-none cursor-pointer font-medium"
                  {...register('categoryId')}
                >
                  {availableCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-[11px] text-rose-500">{errors.categoryId.message}</p>
                )}
              </div>

              {/* Dress Style */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Dress Style</label>
                <select
                  className="w-full h-9 rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none px-4 text-xs text-black dark:text-white focus:outline-none cursor-pointer font-medium"
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

          {/* Visibility Flags */}
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