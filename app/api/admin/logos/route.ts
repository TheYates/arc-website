import { NextRequest, NextResponse } from "next/server";
import { Logo, LogoResponse } from "@/lib/types/logos";
import { CacheService } from "@/lib/redis";

// In-memory storage for demo - replace with actual database
let logos: Logo[] = [
  {
    id: "1",
    name: "UTB",
    src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMGQ5NDg4Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VVRCPC90ZXh0Pgo8L3N2Zz4K",
    alt: "UTB Logo",
    url: "https://utbghana.com",
    width: 120,
    height: 60,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "NOVA",
    src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMGQ5NDg4Ii8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tk9WQTwvdGV4dD4KPHN2Zz4K",
    alt: "NOVA Logo",
    url: "https://novaghana.com",
    width: 120,
    height: 60,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Pastosa",
    src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiB2aWV3Qm94PSIwIDAgMTIwIDYwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMGQ5NDg4Ci8+Cjx0ZXh0IHg9IjYwIiB5PSIzNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UEFTVD9TQTwvdGV4dD4KPHN2Zz4K",
    alt: "Pastosa Logo",
    url: "https://pastosa.com",
    width: 120,
    height: 60,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// GET - Fetch all logos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";
    const cacheKey = `logos:${activeOnly ? "active" : "all"}`;

    // Try to get from cache first
    const cachedLogos = await CacheService.get<Logo[]>(cacheKey);
    if (cachedLogos) {
      console.log(`💾 Cache HIT for ${cacheKey}`);
      const response: LogoResponse = {
        success: true,
        data: cachedLogos,
      };
      return NextResponse.json(response);
    }

    let filteredLogos = logos;
    if (activeOnly) {
      filteredLogos = logos.filter((logo) => logo.isActive);
    }

    // Sort by sortOrder
    filteredLogos.sort((a, b) => a.sortOrder - b.sortOrder);

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, filteredLogos, 300);
    console.log(`💾 Cache SET for ${cacheKey}`);

    const response: LogoResponse = {
      success: true,
      data: filteredLogos,
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: LogoResponse = {
      success: false,
      error: "Failed to fetch logos",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// POST - Create new logo
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

    const newLogo: Logo = {
      id: Date.now().toString(),
      name,
      src: body.src || "", // Will be updated after file upload
      alt,
      url,
      width,
      height,
      isActive,
      sortOrder: sortOrder || logos.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    logos.push(newLogo);

    // Invalidate cache
    await CacheService.invalidatePattern("logos:*");
    console.log("🗑️ Cache invalidated after logo creation");

    const response: LogoResponse = {
      success: true,
      data: newLogo,
      message: "Logo created successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: LogoResponse = {
      success: false,
      error: "Failed to create logo",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// PUT - Update logo
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, alt, url, width, height, isActive, sortOrder, src } =
      body;

    if (!id) {
      const response: LogoResponse = {
        success: false,
        error: "Logo ID is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const logoIndex = logos.findIndex((logo) => logo.id === id);
    if (logoIndex === -1) {
      const response: LogoResponse = {
        success: false,
        error: "Logo not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    // Update logo
    const updatedLogo = {
      ...logos[logoIndex],
      ...(name && { name }),
      ...(alt && { alt }),
      ...(url !== undefined && { url }),
      ...(width && { width }),
      ...(height && { height }),
      ...(isActive !== undefined && { isActive }),
      ...(sortOrder && { sortOrder }),
      ...(src && { src }),
      updatedAt: new Date().toISOString(),
    };

    logos[logoIndex] = updatedLogo;

    // Invalidate cache
    await CacheService.invalidatePattern("logos:*");
    console.log("🗑️ Cache invalidated after logo update");

    const response: LogoResponse = {
      success: true,
      data: updatedLogo,
      message: "Logo updated successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: LogoResponse = {
      success: false,
      error: "Failed to update logo",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

// DELETE - Delete logo
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      const response: LogoResponse = {
        success: false,
        error: "Logo ID is required",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const logoIndex = logos.findIndex((logo) => logo.id === id);
    if (logoIndex === -1) {
      const response: LogoResponse = {
        success: false,
        error: "Logo not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    logos.splice(logoIndex, 1);

    // Invalidate cache
    await CacheService.invalidatePattern("logos:*");
    console.log("🗑️ Cache invalidated after logo deletion");

    const response: LogoResponse = {
      success: true,
      message: "Logo deleted successfully",
    };

    return NextResponse.json(response);
  } catch (error) {
    const response: LogoResponse = {
      success: false,
      error: "Failed to delete logo",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
