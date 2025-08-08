import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/api/auth-prisma";

export async function POST(request: NextRequest) {
  console.log("🚀 API route /api/auth/login called");

  try {
    const { email, password } = await request.json();
    console.log("📥 Request data:", {
      email,
      passwordLength: password?.length,
    });

    if (!email || !password) {
      console.log("❌ Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("🔐 Calling authenticateUser...");
    const result = await authenticateUser(email, password);
    console.log("📄 authenticateUser result:", {
      success: result.success,
      error: result.error,
    });

    if (!result.success) {
      console.log("❌ Authentication failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    // Convert Prisma user to client format with lowercase role
    console.log("🔄 Converting user data, original role:", result.user!.role);
    const user = {
      id: result.user!.id,
      email: result.user!.email,
      username: result.user!.username,
      firstName: result.user!.firstName,
      lastName: result.user!.lastName,
      phone: result.user!.phone,
      address: result.user!.address,
      role: result.user!.role.toLowerCase(),
      isEmailVerified: result.user!.isEmailVerified,
      isActive: result.user!.isActive,
      profileComplete: result.user!.profileComplete,
      createdAt: result.user!.createdAt.toISOString(),
      updatedAt: result.user!.updatedAt.toISOString(),
      lastLogin: result.user!.lastLogin?.toISOString(),
    };

    console.log("✅ API route success, returning user:", {
      email: user.email,
      role: user.role,
    });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
