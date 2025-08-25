import { NextRequest, NextResponse } from "next/server";
import { invalidateSession, verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  console.log("🚪 API route /api/auth/logout called");

  try {
    const { sessionId, accessToken } = await request.json();
    console.log("📥 Request data received");

    // If we have a sessionId, use it directly
    if (sessionId) {
      console.log("🗑️ Invalidating session by sessionId:", sessionId);
      const success = await invalidateSession(sessionId);
      
      if (success) {
        console.log("✅ Session invalidated successfully");
        return NextResponse.json({ success: true });
      } else {
        console.log("⚠️ Session invalidation failed, but continuing logout");
        return NextResponse.json({ success: true }); // Still allow logout
      }
    }

    // If we have an access token, extract sessionId from it
    if (accessToken) {
      console.log("🔍 Extracting sessionId from access token");
      const tokenPayload = verifyToken(accessToken);
      
      if (tokenPayload?.sessionId) {
        console.log("🗑️ Invalidating session by token sessionId:", tokenPayload.sessionId);
        const success = await invalidateSession(tokenPayload.sessionId);
        
        if (success) {
          console.log("✅ Session invalidated successfully");
          return NextResponse.json({ success: true });
        } else {
          console.log("⚠️ Session invalidation failed, but continuing logout");
          return NextResponse.json({ success: true }); // Still allow logout
        }
      }
    }

    console.log("ℹ️ No session information provided, logout successful");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout API error:", error);
    // Don't fail logout even if there's an error
    console.log("⚠️ Error during logout, but allowing logout to continue");
    return NextResponse.json({ success: true });
  }
}
