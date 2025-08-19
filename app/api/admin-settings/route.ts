import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/database/postgresql";
import { authenticateRequest } from "@/lib/api/auth";

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can view admin settings
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can view admin settings" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const key = searchParams.get("key");

    let whereClause: any = {};
    if (category) whereClause.category = category;
    if (key) whereClause.key = key;

    const settings = await prisma.adminSettings.findMany({
      where: whereClause,
      orderBy: { category: "asc" },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Error fetching admin settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can create admin settings
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can create admin settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { key, value, description, category = "general", isEditable = true } = body;

    // Check if setting already exists
    const existingSetting = await prisma.adminSettings.findUnique({
      where: { key },
    });

    if (existingSetting) {
      return NextResponse.json(
        { error: "Setting with this key already exists" },
        { status: 400 }
      );
    }

    const setting = await prisma.adminSettings.create({
      data: {
        key,
        value: typeof value === "string" ? value : JSON.stringify(value),
        description,
        category,
        isEditable,
      },
    });

    return NextResponse.json({ setting }, { status: 201 });
  } catch (error) {
    console.error("Error creating admin setting:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;

    // Only admins can update admin settings
    if (user.role !== "admin" && user.role !== "super_admin") {
      return NextResponse.json(
        { error: "Only administrators can update admin settings" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { settings } = body; // Array of { key, value } objects

    if (!Array.isArray(settings)) {
      return NextResponse.json(
        { error: "Settings must be an array" },
        { status: 400 }
      );
    }

    const updatedSettings = [];

    for (const { key, value } of settings) {
      const existingSetting = await prisma.adminSettings.findUnique({
        where: { key },
      });

      if (!existingSetting) {
        return NextResponse.json(
          { error: `Setting with key '${key}' not found` },
          { status: 404 }
        );
      }

      if (!existingSetting.isEditable) {
        return NextResponse.json(
          { error: `Setting '${key}' is not editable` },
          { status: 400 }
        );
      }

      const updated = await prisma.adminSettings.update({
        where: { key },
        data: {
          value: typeof value === "string" ? value : JSON.stringify(value),
        },
      });

      updatedSettings.push(updated);
    }

    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error("Error updating admin settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
