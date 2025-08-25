import { NextRequest, NextResponse } from "next/server";
import { refreshAccessToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  console.log("🔄 API route /api/auth/refresh called");

  try {
    const { refreshToken } = await request.json();
    console.log("📥 Request data received");

    if (!refreshToken) {
      console.log("❌ Missing refresh token");
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    console.log("🎟️ Attempting to refresh access token...");
    const tokens = await refreshAccessToken(refreshToken);

    if (!tokens) {
      console.log("❌ Failed to refresh token - invalid or expired");
      return NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    console.log("✅ Token refresh successful:", {
      sessionId: tokens.sessionId,
      expiresAt: tokens.expiresAt,
    });

    return NextResponse.json({
      success: true,
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        sessionId: tokens.sessionId,
        expiresAt: tokens.expiresAt,
      },
    });
  } catch (error) {
    console.error("Token refresh API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
