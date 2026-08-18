// components/admin/product-form.tsx
'use client';

import { useState, useTransition, useRef, useEffect, useMemo, ChangeEvent, DragEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
import { createProduct, updateProduct, ProductWithRelations } from '@/actions/product';
import { productFormSchema, ProductFormValues } from '@/schemas/product';
import { DressStyle, Gender } from '@prisma/client';
import { DEPARTMENT_TAXONOMY } from '@/constants/shop';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
  UploadCloud,
  FileImage,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Palette,
  ExternalLink,
} from 'lucide-react';

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFormProps {
  categories: CategoryOption[];
  initialData?: ProductWithRelations | null;
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

// Color palette with standard human names and SKU abbreviations
const COLOR_PALETTE: Array<{ name: string; hex: string; abbr: string }> = [
  { name: 'Black', hex: '#000000', abbr: 'BLK' },
  { name: 'White', hex: '#ffffff', abbr: 'WHT' },
  { name: 'Navy Blue', hex: '#000080', abbr: 'NVY' },
  { name: 'Royal Blue', hex: '#2563eb', abbr: 'BLU' },
  { name: 'Sky Blue', hex: '#38bdf8', abbr: 'SKY' },
  { name: 'Crimson Red', hex: '#dc2626', abbr: 'RED' },
  { name: 'Dark Red', hex: '#991b1b', abbr: 'DRED' },
  { name: 'Emerald Green', hex: '#10b981', abbr: 'EMR' },
  { name: 'Forest Green', hex: '#15803d', abbr: 'FGRN' },
  { name: 'Olive', hex: '#808000', abbr: 'OLV' },
  { name: 'Gold / Yellow', hex: '#eab308', abbr: 'GLD' },
  { name: 'Orange', hex: '#ea580c', abbr: 'ORG' },
  { name: 'Purple', hex: '#9333ea', abbr: 'PRP' },
  { name: 'Violet', hex: '#7c3aed', abbr: 'VLT' },
  { name: 'Pink', hex: '#ec4899', abbr: 'PNK' },
  { name: 'Rose', hex: '#f43f5e', abbr: 'ROS' },
  { name: 'Beige', hex: '#f5f5dc', abbr: 'BEI' },
  { name: 'Khaki', hex: '#c3b091', abbr: 'KHK' },
  { name: 'Brown', hex: '#78350f', abbr: 'BRN' },
  { name: 'Tan', hex: '#d2b48c', abbr: 'TAN' },
  { name: 'Slate Gray', hex: '#64748b', abbr: 'GRY' },
  { name: 'Dark Charcoal', hex: '#18181b', abbr: 'CHR' },
  { name: 'Silver', hex: '#cbd5e1', abbr: 'SLV' },
  { name: 'Teal', hex: '#0d9488', abbr: 'TEA' },
  { name: 'Cyan', hex: '#06b6d4', abbr: 'CYN' },
  { name: 'Maroon', hex: '#800000', abbr: 'MAR' },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  if (clean.length === 3) {
    return [
      parseInt(clean[0] + clean[0], 16) || 0,
      parseInt(clean[1] + clean[1], 16) || 0,
      parseInt(clean[2] + clean[2], 16) || 0,
    ];
  }
  return [
    parseInt(clean.substring(0, 2), 16) || 0,
    parseInt(clean.substring(2, 4), 16) || 0,
    parseInt(clean.substring(4, 6), 16) || 0,
  ];
}

function getClosestColorName(hex: string): { name: string; abbr: string } {
  if (!hex) return { name: 'Black', abbr: 'BLK' };
  const [r1, g1, b1] = hexToRgb(hex);
  let minDistance = Infinity;
  let closest = COLOR_PALETTE[0];

  for (const color of COLOR_PALETTE) {
    const [r2, g2, b2] = hexToRgb(color.hex);
    const dist = Math.sqrt(
      Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = color;
    }
  }
  return { name: closest.name, abbr: closest.abbr };
}

function generateSku(productTitle: string, size: string, colorName: string, colorAbbr?: string): string {
  const cleanTitle = (productTitle || 'PROD')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'PROD';
  const cleanSize = (size || 'M').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const abbr = colorAbbr || colorName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4) || 'COL';
  const randSuffix = Math.floor(100 + Math.random() * 900);
  return `SKU-${cleanTitle}-${cleanSize}-${abbr}-${randSuffix}`;
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Cloudinary Upload States
  const [isUploadingImages, setIsUploadingImages] = useState<boolean>(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [manualImageUrl, setManualImageUrl] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive initial values from initialData if editing
  const defaultFormValues: ProductFormValues = useMemo(() => {
    if (initialData) {
      return {
        title: initialData.title,
        slug: initialData.slug,
        description: initialData.description,
        basePrice: initialData.basePrice,
        discountPercentage: initialData.discountPercentage || 0,
        gender: initialData.gender,
        categoryId: initialData.categoryId,
        dressStyle: initialData.dressStyle,
        isFeatured: initialData.isFeatured,
        isNewArrival: initialData.isNewArrival,
        images:
          initialData.images.length > 0
            ? initialData.images.map((img) => ({
                id: img.id,
                url: img.url,
                isPrimary: img.isPrimary,
              }))
            : [{ url: '/images/pd1.png', isPrimary: true }],
        variants:
          initialData.variants.length > 0
            ? initialData.variants.map((v) => ({
                id: v.id,
                sku: v.sku,
                size: v.size,
                colorName: v.colorName,
                colorHex: v.colorHex,
                priceOffset: v.priceOffset,
                stockQuantity: v.stockQuantity,
              }))
            : [
                {
                  sku: generateSku(initialData.title, 'M', 'Black', 'BLK'),
                  size: 'M',
                  colorName: 'Black',
                  colorHex: '#000000',
                  priceOffset: 0,
                  stockQuantity: 25,
                },
              ],
      };
    }

    return {
      title: '',
      slug: '',
      description: '',
      basePrice: 120.0,
      discountPercentage: 0,
      gender: Gender.MEN,
      categoryId: categories[0]?.id || '',
      dressStyle: DressStyle.CASUAL,
      isFeatured: false,
      isNewArrival: true,
      images: [{ url: '/images/pd1.png', isPrimary: true }],
      variants: [
        {
          sku: generateSku('PRODUCT', 'M', 'Black', 'BLK'),
          size: 'M',
          colorName: 'Black',
          colorHex: '#000000',
          priceOffset: 0,
          stockQuantity: 25,
        },
      ],
    };
  }, [initialData, categories]);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultFormValues,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  // Reset form when initialData changes
  useEffect(() => {
    reset(defaultFormValues);
  }, [defaultFormValues, reset]);

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

  // Synchronize categoryId when department changes in create mode
  useEffect(() => {
    if (!isEditMode && availableCategories.length > 0) {
      const isCurrentValid = availableCategories.some((c) => c.id === currentCategoryId);
      if (!isCurrentValid && availableCategories[0]) {
        setValue('categoryId', availableCategories[0].id, { shouldValidate: true });
      }
    }
  }, [availableCategories, currentCategoryId, setValue, isEditMode]);

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

  // Cloudinary Direct Upload Workflow
  const processFiles = async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;
    setIsUploadingImages(true);
    setUploadError(null);

    const fileList = Array.from(files);
    let uploadedCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file.type.startsWith('image/')) {
        setUploadError(`Skipped "${file.name}": Only image files (PNG, JPG, WEBP, GIF) are supported.`);
        continue;
      }

      setUploadProgressMsg(`Uploading ${i + 1} of ${fileList.length}: ${file.name}...`);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'shopco/products');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();

        if (res.ok && data.success && data.url) {
          appendImage({
            url: data.url,
            isPrimary: imageFields.length === 0 && uploadedCount === 0,
          });
          uploadedCount++;
        } else {
          setUploadError(
            data.error || `Failed to upload "${file.name}". Check Cloudinary configuration in .env.`
          );
        }
      } catch (err) {
        console.error('[IMAGE_UPLOAD_EXCEPTION]:', err);
        setUploadError(`Network error uploading "${file.name}".`);
      }
    }

    setIsUploadingImages(false);
    setUploadProgressMsg(null);
  };

  const handleAddManualImageUrl = (): void => {
    const trimmed = manualImageUrl.trim();
    if (!trimmed) return;
    appendImage({
      url: trimmed,
      isPrimary: imageFields.length === 0,
    });
    setManualImageUrl('');
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

  // Variant Color Picker & Dynamic SKU Generation Handlers
  const handleVariantColorChange = (idx: number, newHex: string): void => {
    setValue(`variants.${idx}.colorHex`, newHex, { shouldValidate: true });
    const { name, abbr } = getClosestColorName(newHex);
    setValue(`variants.${idx}.colorName`, name, { shouldValidate: true });

    const currentSize = watch(`variants.${idx}.size`) || 'M';
    const newSku = generateSku(watchTitle, currentSize, name, abbr);
    setValue(`variants.${idx}.sku`, newSku, { shouldValidate: true });
  };

  const handleVariantSizeChange = (idx: number, newSize: string): void => {
    setValue(`variants.${idx}.size`, newSize, { shouldValidate: true });
    const currentColorName = watch(`variants.${idx}.colorName`) || 'Color';
    const currentColorHex = watch(`variants.${idx}.colorHex`) || '#000000';
    const { abbr } = getClosestColorName(currentColorHex);
    const newSku = generateSku(watchTitle, newSize, currentColorName, abbr);
    setValue(`variants.${idx}.sku`, newSku, { shouldValidate: true });
  };

  const handleRegenerateVariantSku = (idx: number): void => {
    const size = watch(`variants.${idx}.size`) || 'M';
    const colorName = watch(`variants.${idx}.colorName`) || 'Color';
    const hex = watch(`variants.${idx}.colorHex`) || '#000000';
    const { abbr } = getClosestColorName(hex);
    const newSku = generateSku(watchTitle, size, colorName, abbr);
    setValue(`variants.${idx}.sku`, newSku, { shouldValidate: true });
  };

  const handleAddVariantRow = (): void => {
    const defaultColor = COLOR_PALETTE[variantFields.length % COLOR_PALETTE.length] || COLOR_PALETTE[0];
    const defaultSize = AVAILABLE_SIZES[Math.min(variantFields.length, AVAILABLE_SIZES.length - 1)] || 'M';
    const newSku = generateSku(watchTitle, defaultSize, defaultColor.name, defaultColor.abbr);

    appendVariant({
      sku: newSku,
      size: defaultSize,
      colorName: defaultColor.name,
      colorHex: defaultColor.hex,
      priceOffset: 0,
      stockQuantity: 20,
    });
  };

  const onSubmit: SubmitHandler<ProductFormValues> = (data: ProductFormValues) => {
    setServerError(null);
    setSuccessMessage(null);
    setValidationErrors([]);

    const payload: ProductFormValues = {
      ...data,
      isFeatured: isDraft ? false : data.isFeatured,
      isNewArrival: isDraft ? false : data.isNewArrival,
    };

    startTransition(async () => {
      const response = isEditMode && initialData
        ? await updateProduct(initialData.id, payload)
        : await createProduct(payload);

      if (!response.success) {
        setServerError(response.error || 'Failed to save product changes.');
      } else {
        setSuccessMessage(
          isEditMode
            ? 'Product updated successfully! Redirecting...'
            : 'Product created successfully! Redirecting...'
        );
        setTimeout(() => {
          router.push('/admin/products');
          router.refresh();
        }, 800);
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

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6 font-admin text-black dark:text-white pb-12"
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
            <h1 className="text-2xl font-bold font-admin uppercase tracking-tight text-black dark:text-white">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-black/60 dark:text-zinc-400">
              {isEditMode
                ? `Update prices, discounts, stock levels, and media for "${initialData?.title}".`
                : 'Configure department hierarchy, categories, multi-variant matrices, and Cloudinary media.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push('/admin/products')}
            className="h-8.5 rounded-[62px] border-black/10 dark:border-zinc-800 text-xs font-semibold px-4 cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            onClick={() => setIsDraft(false)}
            disabled={isPending || isUploadingImages}
            className="h-8.5 rounded-[62px] bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 text-xs font-bold px-5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving to Catalog...</span>
              </span>
            ) : (
              <span>{isEditMode ? 'Update Product' : 'Publish Product'}</span>
            )}
          </Button>
        </div>
      </div>

      {/* Server & Validation Error Alerts */}
      {serverError && (
        <div className="p-4 rounded-[16px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{serverError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-[16px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-3 text-emerald-700 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="p-4 rounded-[16px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 space-y-1.5 text-xs text-amber-800 dark:text-amber-300">
          <div className="flex items-center gap-2 font-bold">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Please resolve the following validation issues:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 pl-2 text-[11px] text-amber-700 dark:text-amber-400">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Grid: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Core Meta, Media, and Variant Matrix */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white border-b border-black/10 dark:border-zinc-800 pb-3">
              General Information
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Product Title</label>
                <Input
                  placeholder="e.g. Classic Heavyweight Pullover Hoodie"
                  className="h-9 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white"
                  {...register('title')}
                />
                {errors.title && <p className="text-[11px] text-rose-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-black dark:text-white">URL Slug</label>
                  <button
                    type="button"
                    onClick={handleGenerateSlug}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3 w-3" /> Auto Generate
                  </button>
                </div>
                <Input
                  placeholder="classic-heavyweight-pullover-hoodie"
                  className="h-9 text-xs font-mono rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white"
                  {...register('slug')}
                />
                {errors.slug && <p className="text-[11px] text-rose-500">{errors.slug.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-black dark:text-white">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide detailed material specifications, fit guidelines, and styling recommendations..."
                  className="w-full rounded-[16px] bg-[#F0F0F0] dark:bg-black border border-transparent dark:border-zinc-800 p-3.5 text-xs text-black dark:text-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white resize-none"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-[11px] text-rose-500">{errors.description.message}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Cloudinary Media Gallery */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-black dark:text-white flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Cloudinary Media Gallery</span>
                </h3>
                <p className="text-xs text-black/60 dark:text-zinc-400">
                  Upload images directly to Cloudinary CDN or paste image URLs.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImages}
                className="h-8 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 cursor-pointer gap-1.5"
              >
                {isUploadingImages ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <UploadCloud className="h-3.5 w-3.5" />
                )}
                <span>Upload Photos</span>
              </Button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-[16px] p-6 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 scale-[0.99]'
                  : 'border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/50 dark:bg-black/50 hover:bg-[#F0F0F0] dark:hover:bg-zinc-900'
              }`}
            >
              {isUploadingImages ? (
                <div className="space-y-2 py-2">
                  <Loader2 className="h-8 w-8 mx-auto text-blue-600 animate-spin" />
                  <p className="text-xs font-bold text-black dark:text-white">
                    {uploadProgressMsg || 'Uploading directly to Cloudinary CDN...'}
                  </p>
                </div>
              ) : (
                <>
                  <FileImage className="h-8 w-8 mx-auto text-black/40 dark:text-zinc-500 mb-2" />
                  <p className="text-xs font-bold text-black dark:text-white">
                    Drag and drop photos here, or <span className="underline text-blue-600">browse files</span>
                  </p>
                  <p className="text-[11px] text-black/40 dark:text-zinc-500 mt-0.5">
                    Images are optimized and stored securely on Cloudinary CDN
                  </p>
                </>
              )}
            </div>

            {uploadError && (
              <div className="p-3 rounded-[12px] bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Manual Image URL Input Fallback */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Or paste direct image URL (e.g. https://...)"
                value={manualImageUrl}
                onChange={(e) => setManualImageUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddManualImageUrl();
                  }
                }}
                className="h-8.5 text-xs rounded-[62px] bg-[#F0F0F0] dark:bg-black border-none text-black dark:text-white flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddManualImageUrl}
                disabled={!manualImageUrl.trim()}
                className="h-8.5 px-4 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 shrink-0 cursor-pointer"
              >
                Add URL
              </Button>
            </div>

            {/* Uploaded Images List */}
            <div className="space-y-3 pt-2">
              {imageFields.map((field, idx) => {
                const currentUrl = watchedImages?.[idx]?.url || '';
                const isCloudinary = currentUrl.includes('cloudinary.com') || currentUrl.includes('res.cloudinary');

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

                    <div className="flex-1 space-y-0.5 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {isCloudinary && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Cloudinary CDN
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-black/50 dark:text-zinc-500 truncate block">
                          Photo #{idx + 1}
                        </span>
                      </div>
                      <Input
                        placeholder="Image CDN URL..."
                        className="h-7 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                        {...register(`images.${idx}.url`)}
                      />
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-black/70 dark:text-zinc-300 font-medium cursor-pointer shrink-0 pl-2">
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
                        className="h-8 w-8 text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer"
                        title="Remove photo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Variant Matrix with Live Color Picker & Auto-Generated SKUs */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 dark:border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-black dark:text-white flex items-center gap-2">
                  <Palette className="h-4 w-4 text-emerald-600" />
                  <span>Variant Matrix & Color Picker</span>
                </h3>
                <p className="text-xs text-black/60 dark:text-zinc-400">
                  Pick colors, edit hex codes, and watch color names & SKUs synchronize automatically.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddVariantRow}
                className="h-8 text-xs font-semibold rounded-[62px] border-black/10 dark:border-zinc-800 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Variant
              </Button>
            </div>

            <div className="space-y-4">
              {variantFields.map((field, idx) => {
                const currentHex = watch(`variants.${idx}.colorHex`) || '#000000';
                const currentColorName = watch(`variants.${idx}.colorName`) || 'Black';
                const currentSize = watch(`variants.${idx}.size`) || 'M';

                return (
                  <div
                    key={field.id}
                    className="p-4 rounded-[16px] border border-black/10 dark:border-zinc-800 bg-[#F0F0F0]/40 dark:bg-black/40 space-y-3.5"
                  >
                    {/* Row 1: Color Picker & Swatches */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-black/70 dark:text-zinc-300 flex items-center gap-1.5">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full border border-black/20 dark:border-zinc-700 shadow-xs"
                            style={{ backgroundColor: currentHex }}
                          />
                          <span>Colorway (Hex & Name)</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRegenerateVariantSku(idx)}
                          className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                        >
                          <RefreshCw className="h-2.5 w-2.5" /> Sync SKU
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Native Color Picker Circle Button */}
                        <div className="relative h-9 w-9 rounded-full overflow-hidden border border-black/20 dark:border-zinc-700 shadow-xs shrink-0 cursor-pointer">
                          <input
                            type="color"
                            value={currentHex}
                            onChange={(e) => handleVariantColorChange(idx, e.target.value)}
                            className="absolute -inset-4 h-16 w-16 cursor-pointer opacity-100 bg-transparent"
                            title="Open Color Picker"
                          />
                        </div>

                        {/* Hex Text Box */}
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-mono text-black/40 dark:text-zinc-500">
                            #
                          </span>
                          <Input
                            placeholder="000000"
                            value={currentHex.replace('#', '')}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                              handleVariantColorChange(idx, `#${raw}`);
                            }}
                            className="h-8.5 text-xs font-mono rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white pl-6"
                          />
                        </div>

                        {/* Color Name Input */}
                        <Input
                          placeholder="e.g. Navy Blue"
                          className="h-8.5 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white flex-1 min-w-[120px]"
                          {...register(`variants.${idx}.colorName`)}
                          onChange={(e) => {
                            setValue(`variants.${idx}.colorName`, e.target.value);
                            const newSku = generateSku(watchTitle, currentSize, e.target.value);
                            setValue(`variants.${idx}.sku`, newSku);
                          }}
                        />
                      </div>

                      {/* Quick Color Swatch Pills */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {COLOR_PALETTE.slice(0, 10).map((paletteColor) => (
                          <button
                            key={paletteColor.hex}
                            type="button"
                            onClick={() => handleVariantColorChange(idx, paletteColor.hex)}
                            title={paletteColor.name}
                            className={`h-5 px-2 rounded-full text-[10px] font-medium border flex items-center gap-1 transition-all cursor-pointer ${
                              currentHex.toLowerCase() === paletteColor.hex.toLowerCase()
                                ? 'border-black dark:border-white bg-black/10 dark:bg-white/10 font-bold'
                                : 'border-black/10 dark:border-zinc-800 hover:border-black/30'
                            }`}
                          >
                            <span
                              className="h-2 w-2 rounded-full border border-black/20"
                              style={{ backgroundColor: paletteColor.hex }}
                            />
                            <span>{paletteColor.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Row 2: SKU, Size, Stock, Offset */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end pt-2 border-t border-black/10 dark:border-zinc-800">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                          SKU Identifier
                        </label>
                        <Input
                          placeholder="SKU-PROD-M-BLK"
                          className="h-8 text-xs font-mono rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                          {...register(`variants.${idx}.sku`)}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                          Size
                        </label>
                        <select
                          className="w-full h-8 rounded-[62px] bg-white dark:bg-zinc-900 border-none px-3 text-xs text-black dark:text-white focus:outline-none cursor-pointer"
                          value={currentSize}
                          onChange={(e) => handleVariantSizeChange(idx, e.target.value)}
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
                          Stock Units
                        </label>
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="h-8 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                          {...register(`variants.${idx}.stockQuantity`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="space-y-1 flex-1">
                          <label className="text-[11px] font-bold text-black/60 dark:text-zinc-400">
                            Offset ($)
                          </label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="h-8 text-xs rounded-[62px] bg-white dark:bg-zinc-900 border-none text-black dark:text-white"
                            {...register(`variants.${idx}.priceOffset`, { valueAsNumber: true })}
                          />
                        </div>

                        {variantFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(idx)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-700 shrink-0 cursor-pointer self-end"
                            title="Remove variant"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Pricing, Classification, and Visibility */}
        <div className="lg:col-span-4 space-y-6">
          {/* Pricing */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white border-b border-black/10 dark:border-zinc-800 pb-3">
              Pricing & Discounts
            </h3>
            <div className="space-y-3.5">
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

              {/* Quick Ad / Storewide Coupon Callout */}
              <div className="pt-2 border-t border-black/10 dark:border-zinc-800">
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                      Ad & Storewide Coupons
                    </span>
                    <Link
                      href="/admin/coupons"
                      target="_blank"
                      className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      Manage <ExternalLink size={10} />
                    </Link>
                  </div>
                  <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 leading-tight">
                    Create overall promo codes (e.g. 20% off for Meta ads) that customers can apply at checkout.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Classification */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white border-b border-black/10 dark:border-zinc-800 pb-3">
              Taxonomy & Classification
            </h3>
            <div className="space-y-3.5">
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

          {/* Storefront Flags */}
          <Card className="border-black/10 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-[20px] shadow-sm p-6 space-y-4">
            <h3 className="font-bold text-base text-black dark:text-white border-b border-black/10 dark:border-zinc-800 pb-3">
              Storefront Display Flags
            </h3>
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
                <span className="text-xs font-bold text-black dark:text-white">New Arrival Badge</span>
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