import { NextRequest, NextResponse } from "next/server";
import { Logo, LogoResponse } from "@/lib/types/logos";
import { CacheService } from "@/lib/redis";
import { PrismaClient } from "@prisma/client";
import { applyRateLimit, RateLimitConfigs } from "@/lib/middleware/rate-limit";

const prisma = new PrismaClient();

// Helper function to convert Prisma Banner to Logo type
function bannerToLogo(banner: any): Logo {
  return {
    id: banner.id,
    name: banner.name,
    src: banner.src,
    alt: banner.alt,
    url: banner.url,
    width: banner.width,
    height: banner.height,
    isActive: banner.isActive,
    sortOrder: banner.sortOrder,
    createdAt: banner.createdAt.toISOString(),
    updatedAt: banner.updatedAt.toISOString(),
  };
}

// GET - Fetch all banners from database
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting for read operations
    const rateLimitResponse = await applyRateLimit(request, RateLimitConfigs.read);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    const cacheKey = `banners:${activeOnly ? "active" : "all"}`;

    // Try to get from cache first
    const cachedBanners = await CacheService.get<Logo[]>(cacheKey);
    if (cachedBanners) {
      console.log(`💾 Cache HIT for ${cacheKey}`);
      const response: LogoResponse = {
        success: true,
        data: cachedBanners,
      };
      return NextResponse.json(response);
    }

    // Fetch from database
    const banners = await prisma.banner.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });

    // Convert to Logo format
    const logos = banners.map(bannerToLogo);

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, logos, 300);
    console.log(`💾 Cache SET for ${cacheKey}`);

    const response: LogoResponse = {
      success: true,
      data: logos,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching banners:", error);
    const response: LogoResponse = {
      success: false,
      error: "Failed to fetch banners",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create new banner
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      alt,
      url,
      width = 120,
      height = 60,
      isActive = true,
      sortOrder,
    } = body;

    if (!name || !alt) {
      const response: LogoResponse = {
        success: false,
        error: "Name and alt text are required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Get the next sort order if not provided
    let finalSortOrder = sortOrder;
    if (!finalSortOrder) {
      const maxSortOrder = await prisma.banner.aggregate({
        _max: { sortOrder: true },
      });
      finalSortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
    }

    const newBanner = await prisma.banner.create({
      data: {
        name,
        src: body.src || "",
        alt,
        url,
        width,
        height,
        isActive,
        sortOrder: finalSortOrder,
      },
    });

    // Clear cache
    await CacheService.del("banners:all");
    await CacheService.del("banners:active");

    const response: LogoResponse = {
      success: true,
      data: bannerToLogo(newBanner),
      message: "Banner created successfully",
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("Error creating banner:", error);
    const response: LogoResponse = {
      success: false,
      error: "Failed to create banner",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT - Update banner
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, alt, url, width, height, isActive, sortOrder, src } = body;

    if (!id) {
      const response: LogoResponse = {
        success: false,
        error: "Banner ID is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      const response: LogoResponse = {
        success: false,
        error: "Banner not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update banner
    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(alt !== undefined && { alt }),
        ...(url !== undefined && { url }),
        ...(width !== undefined && { width }),
        ...(height !== undefined && { height }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(src !== undefined && { src }),
      },
    });

    // Clear cache
    await CacheService.del("banners:all");
    await CacheService.del("banners:active");

    const response: LogoResponse = {
      success: true,
      data: bannerToLogo(updatedBanner),
      message: "Banner updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error updating banner:", error);
    const response: LogoResponse = {
      success: false,
      error: "Failed to update banner",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - Delete banner
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      const response: LogoResponse = {
        success: false,
        error: "Banner ID is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    // Check if banner exists
    const existingBanner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!existingBanner) {
      const response: LogoResponse = {
        success: false,
        error: "Banner not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Delete banner
    await prisma.banner.delete({
      where: { id },
    });

    // Clear cache
    await CacheService.del("banners:all");
    await CacheService.del("banners:active");

    const response: LogoResponse = {
      success: true,
      message: "Banner deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error deleting banner:", error);
    const response: LogoResponse = {
      success: false,
      error: "Failed to delete banner",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
