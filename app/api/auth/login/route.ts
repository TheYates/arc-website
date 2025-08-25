import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/api/auth-prisma";
import { generateTokens } from "@/lib/jwt";
import { prisma } from "@/lib/database/postgresql";

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
      mustChangePassword: result.user!.mustChangePassword,
      passwordChangedAt: result.user!.passwordChangedAt?.toISOString(),
      createdAt: result.user!.createdAt.toISOString(),
      updatedAt: result.user!.updatedAt.toISOString(),
      lastLogin: result.user!.lastLogin?.toISOString(),
    };

    // Generate JWT tokens for session management
    console.log("🎟️ Generating JWT tokens...");
    const tokens = await generateTokens(result.user!);

    // Update user's last login timestamp
    await prisma.user.update({
      where: { id: result.user!.id },
      data: { lastLogin: new Date() },
    });

    console.log("✅ API route success, returning user and tokens:", {
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      sessionId: tokens.sessionId,
      expiresAt: tokens.expiresAt,
    });
    
    return NextResponse.json({ 
      success: true, 
      user,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        sessionId: tokens.sessionId,
        expiresAt: tokens.expiresAt,
      },
      requiresPasswordChange: user.mustChangePassword,
    });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
