// prisma/seed.ts
import { PrismaClient, DressStyle, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SHOP.CO database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database records.');

  // 2. Seed Default Admin User
  const adminUser = await prisma.user.create({
    data: {
      id: 'user_admin_shopco',
      email: 'admin@shop.co',
      name: 'Shop.co Admin',
      role: Role.ADMIN,
    },
  });

  // 3. Seed Categories
  const tshirts = await prisma.category.create({
    data: {
      name: 'T-Shirts',
      slug: 't-shirts',
      description: 'Casual, graphic, and premium heavyweight everyday t-shirts.',
    },
  });

  const shirts = await prisma.category.create({
    data: {
      name: 'Shirts',
      slug: 'shirts',
      description: 'Formal, oxford, and casual patterned button-up shirts.',
    },
  });

  const jeans = await prisma.category.create({
    data: {
      name: 'Jeans',
      slug: 'jeans',
      description: 'Skinny, straight-leg, and relaxed denim trousers.',
    },
  });

  const hoodies = await prisma.category.create({
    data: {
      name: 'Hoodies',
      slug: 'hoodies',
      description: 'Heavyweight fleece and oversized cotton streetwear hoodies.',
    },
  });

  console.log('📁 Categories created.');

  // 4. Seed Catalog Products with Variants, Images & Reviews
  const productsData = [
    {
      title: 'T-shirt with Tape Details',
      slug: 't-shirt-with-tape-details',
      description: 'Modern black cotton t-shirt featuring high-contrast geometric side tape detailing and comfortable relaxed fit.',
      basePrice: 120.0,
      discountPercentage: 0,
      rating: 4.5,
      reviewCount: 42,
      dressStyle: DressStyle.CASUAL,
      isFeatured: true,
      isNewArrival: true,
      categoryId: tshirts.id,
      images: ['/images/m1.png'],
      variants: [
        { sku: 'TS-TAPE-BLK-S', size: 'S', colorName: 'Black', colorHex: '#000000', stockQuantity: 25, priceOffset: 0 },
        { sku: 'TS-TAPE-BLK-M', size: 'M', colorName: 'Black', colorHex: '#000000', stockQuantity: 30, priceOffset: 0 },
        { sku: 'TS-TAPE-BLK-L', size: 'L', colorName: 'Black', colorHex: '#000000', stockQuantity: 18, priceOffset: 0 },
        { sku: 'TS-TAPE-BLK-XL', size: 'XL', colorName: 'Black', colorHex: '#000000', stockQuantity: 10, priceOffset: 5 },
      ],
    },
    {
      title: 'Skinny Fit Jeans',
      slug: 'skinny-fit-jeans',
      description: 'Stretch-infused deep indigo denim with tailored slim contours, reinforced stitching, and durable copper hardware.',
      basePrice: 260.0,
      discountPercentage: 20, // Final: $208.00
      rating: 4.8,
      reviewCount: 88,
      dressStyle: DressStyle.CASUAL,
      isFeatured: true,
      isNewArrival: true,
      categoryId: jeans.id,
      images: ['/images/m2.png'],
      variants: [
        { sku: 'JN-SKN-BLU-30', size: '30', colorName: 'Indigo Blue', colorHex: '#1E3A8A', stockQuantity: 15, priceOffset: 0 },
        { sku: 'JN-SKN-BLU-32', size: '32', colorName: 'Indigo Blue', colorHex: '#1E3A8A', stockQuantity: 20, priceOffset: 0 },
        { sku: 'JN-SKN-BLU-34', size: '34', colorName: 'Indigo Blue', colorHex: '#1E3A8A', stockQuantity: 12, priceOffset: 0 },
      ],
    },
    {
      title: 'Checkered Shirt',
      slug: 'checkered-shirt',
      description: 'Classic red and black tartan pattern button-up shirt made from 100% brushed flannel cotton.',
      basePrice: 180.0,
      discountPercentage: 0,
      rating: 4.6,
      reviewCount: 35,
      dressStyle: DressStyle.CASUAL,
      isFeatured: true,
      isNewArrival: true,
      categoryId: shirts.id,
      images: ['/images/m3.png'],
      variants: [
        { sku: 'SH-CHK-RED-S', size: 'S', colorName: 'Red Plaid', colorHex: '#DC2626', stockQuantity: 14, priceOffset: 0 },
        { sku: 'SH-CHK-RED-M', size: 'M', colorName: 'Red Plaid', colorHex: '#DC2626', stockQuantity: 22, priceOffset: 0 },
        { sku: 'SH-CHK-RED-L', size: 'L', colorName: 'Red Plaid', colorHex: '#DC2626', stockQuantity: 16, priceOffset: 0 },
      ],
    },
    {
      title: 'Sleeve Striped T-shirt',
      slug: 'sleeve-striped-t-shirt',
      description: 'Sporty crewneck t-shirt with dual contrast sleeve stripes and athletic breathable weave.',
      basePrice: 160.0,
      discountPercentage: 30, // Final: $112.00
      rating: 4.5,
      reviewCount: 19,
      dressStyle: DressStyle.GYM,
      isFeatured: true,
      isNewArrival: true,
      categoryId: tshirts.id,
      images: ['/images/m4.png'],
      variants: [
        { sku: 'TS-STR-ORG-M', size: 'M', colorName: 'Orange', colorHex: '#F97316', stockQuantity: 18, priceOffset: 0 },
        { sku: 'TS-STR-ORG-L', size: 'L', colorName: 'Orange', colorHex: '#F97316', stockQuantity: 14, priceOffset: 0 },
      ],
    },
    {
      title: 'Vertical Striped Shirt',
      slug: 'vertical-striped-shirt',
      description: 'Elegant vertical striped formal shirt tailored for breathable summer evenings and professional office wear.',
      basePrice: 232.0,
      discountPercentage: 20, // Final: $185.60
      rating: 4.9,
      reviewCount: 104,
      dressStyle: DressStyle.FORMAL,
      isFeatured: true,
      isNewArrival: false,
      categoryId: shirts.id,
      images: ['/images/n1.png'],
      variants: [
        { sku: 'SH-VSTR-GRN-S', size: 'S', colorName: 'Forest Green', colorHex: '#15803D', stockQuantity: 10, priceOffset: 0 },
        { sku: 'SH-VSTR-GRN-M', size: 'M', colorName: 'Forest Green', colorHex: '#15803D', stockQuantity: 24, priceOffset: 0 },
        { sku: 'SH-VSTR-GRN-L', size: 'L', colorName: 'Forest Green', colorHex: '#15803D', stockQuantity: 15, priceOffset: 0 },
      ],
    },
    {
      title: 'Courage Graphic T-shirt',
      slug: 'courage-graphic-t-shirt',
      description: 'Bold typographic courage print t-shirt rendered in high-density screen print on vintage wash cotton.',
      basePrice: 145.0,
      discountPercentage: 0,
      rating: 4.7,
      reviewCount: 62,
      dressStyle: DressStyle.CASUAL,
      isFeatured: true,
      isNewArrival: false,
      categoryId: tshirts.id,
      images: ['/images/n2.png'],
      variants: [
        { sku: 'TS-CRG-ORG-M', size: 'M', colorName: 'Burnt Orange', colorHex: '#EA580C', stockQuantity: 20, priceOffset: 0 },
        { sku: 'TS-CRG-ORG-L', size: 'L', colorName: 'Burnt Orange', colorHex: '#EA580C', stockQuantity: 18, priceOffset: 0 },
      ],
    },
    {
      title: 'Loose Fit Bermuda Shorts',
      slug: 'loose-fit-bermuda-shorts',
      description: 'Relaxed utilitarian bermuda shorts equipped with deep slash pockets and an adjustable waistband.',
      basePrice: 90.0,
      discountPercentage: 0,
      rating: 4.3,
      reviewCount: 28,
      dressStyle: DressStyle.CASUAL,
      isFeatured: false,
      isNewArrival: false,
      categoryId: jeans.id,
      images: ['/images/n3.png'],
      variants: [
        { sku: 'SH-BERM-DNM-32', size: '32', colorName: 'Washed Denim', colorHex: '#3B82F6', stockQuantity: 20, priceOffset: 0 },
        { sku: 'SH-BERM-DNM-34', size: '34', colorName: 'Washed Denim', colorHex: '#3B82F6', stockQuantity: 15, priceOffset: 0 },
      ],
    },
    {
      title: 'Faded Skinny Jeans',
      slug: 'faded-skinny-jeans',
      description: 'Stone-washed distressed black skinny jeans with hand-sanded highlights and premium stretch recovery.',
      basePrice: 210.0,
      discountPercentage: 0,
      rating: 4.6,
      reviewCount: 51,
      dressStyle: DressStyle.PARTY,
      isFeatured: true,
      isNewArrival: false,
      categoryId: jeans.id,
      images: ['/images/n4.png'],
      variants: [
        { sku: 'JN-FAD-BLK-30', size: '30', colorName: 'Washed Black', colorHex: '#18181B', stockQuantity: 12, priceOffset: 0 },
        { sku: 'JN-FAD-BLK-32', size: '32', colorName: 'Washed Black', colorHex: '#18181B', stockQuantity: 18, priceOffset: 0 },
      ],
    },
    {
      title: 'Heavyweight Pullover Hoodie',
      slug: 'heavyweight-pullover-hoodie',
      description: '450GSM organic French terry cotton hoodie featuring double-layer hood and ribbed side gussets.',
      basePrice: 150.0,
      discountPercentage: 15, // Final: $127.50
      rating: 4.9,
      reviewCount: 77,
      dressStyle: DressStyle.CASUAL,
      isFeatured: true,
      isNewArrival: true,
      categoryId: hoodies.id,
      images: ['/images/pd1.png'],
      variants: [
        { sku: 'HD-HVY-GRY-M', size: 'M', colorName: 'Heather Grey', colorHex: '#9CA3AF', stockQuantity: 15, priceOffset: 0 },
        { sku: 'HD-HVY-GRY-L', size: 'L', colorName: 'Heather Grey', colorHex: '#9CA3AF', stockQuantity: 20, priceOffset: 0 },
        { sku: 'HD-HVY-GRY-XL', size: 'XL', colorName: 'Heather Grey', colorHex: '#9CA3AF', stockQuantity: 8, priceOffset: 0 },
      ],
    },
  ];

  for (const item of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        basePrice: item.basePrice,
        discountPercentage: item.discountPercentage,
        rating: item.rating,
        reviewCount: item.reviewCount,
        dressStyle: item.dressStyle,
        isFeatured: item.isFeatured,
        isNewArrival: item.isNewArrival,
        categoryId: item.categoryId,
        images: {
          create: item.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
          })),
        },
        variants: {
          create: item.variants.map((v) => ({
            sku: v.sku,
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex,
            stockQuantity: v.stockQuantity,
            priceOffset: v.priceOffset,
          })),
        },
        reviews: {
          create: [
            {
              author: 'Samantha D.',
              rating: 5,
              comment: 'I absolutely love this! The fabric quality exceeded my expectations and it fits true to size.',
            },
            {
              author: 'Alex M.',
              rating: 4,
              comment: 'Great craftsmanship and fast shipping. Would definitely recommend to anyone looking for premium streetwear.',
            },
          ],
        },
      },
    });

    console.log(`📦 Seeded Product: ${createdProduct.title}`);
  }

  console.log('✅ Database seeded successfully with realistic catalog.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });