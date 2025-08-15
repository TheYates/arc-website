import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { LogoUploadResponse } from "@/lib/types/logos";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      const response: LogoUploadResponse = {
        success: false,
        error: "No file provided",
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Validate file type
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      const response: LogoUploadResponse = {
        success: false,
        error: "Invalid file type. Only PNG, JPG, SVG, and WebP files are allowed.",
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      const response: LogoUploadResponse = {
        success: false,
        error: "File size too large. Maximum size is 5MB.",
      };
      return NextResponse.json(response, { status: 400 });
    }
    
    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${originalName}`;
    
    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "images", "logos");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }
    
    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filepath = join(uploadDir, filename);
    
    await writeFile(filepath, buffer);
    
    // Return the public URL
    const publicUrl = `/images/logos/${filename}`;
    
    const response: LogoUploadResponse = {
      success: true,
      url: publicUrl,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Upload error:", error);
    const response: LogoUploadResponse = {
      success: false,
      error: "Failed to upload file",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
