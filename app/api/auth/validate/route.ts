import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: "Token is required" },
        { status: 400 }
      );
    }

    // Verify token server-side where it's safe
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { valid: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Check if token is expiring soon (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    const expiringSoon = payload.exp && payload.exp < (now + 300);

    return NextResponse.json({
      valid: true,
      payload,
      expiringSoon,
      expiresAt: payload.exp ? new Date(payload.exp * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return NextResponse.json(
      { valid: false, error: "Token validation failed" },
      { status: 500 }
    );
  }
}
