import { NextRequest, NextResponse } from 'next/server';
import { DressStyle } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const styleParam = searchParams.get('style');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    const whereCondition: Record<string, unknown> = {};

    if (styleParam && Object.values(DressStyle).includes(styleParam as DressStyle)) {
      whereCondition.dressStyle = styleParam as DressStyle;
    }

    if (category) {
      whereCondition.category = { slug: category };
    }

    if (search) {
      whereCondition.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: whereCondition,
        include: {
          images: true,
          variants: true,
          category: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where: whereCondition }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}