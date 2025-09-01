import { NextRequest, NextResponse } from "next/server";
import { getCareNotes, createCareNote } from "@/lib/api/care-notes-prisma";
import { CacheService } from "@/lib/redis";
import { authenticateRequest } from "@/lib/api/auth";
import { triggerCareNoteCreated } from "@/lib/utils/activity-triggers";
import { prisma } from "@/lib/database/postgresql";

// GET /api/care-notes - Get care notes with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const start = performance.now();
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");
    const authorRole = searchParams.get("authorRole") as
      | "caregiver"
      | "reviewer"
      | null;
    const authorId = searchParams.get("authorId"); // For user-specific caching

    console.log(
      `🔍 Care Notes API called with patientId: ${patientId}, authorRole: ${authorRole}`
    );

    if (!patientId) {
      return NextResponse.json(
        { error: "patientId is required" },
        { status: 400 }
      );
    }

    // Create user-specific cache key for security
    const cacheKey = authorId
      ? `care-notes:${patientId}:${authorRole || "all"}:${authorId}`
      : `care-notes:${patientId}:${authorRole || "all"}`;

    // Try to get from cache first
    const cachedNotes = await CacheService.get(cacheKey);
    if (cachedNotes) {
      console.log(`💾 Cache HIT for care notes ${cacheKey}`);
      return NextResponse.json({ notes: cachedNotes });
    }

    const dbStart = performance.now();
    const notes = await getCareNotes(patientId, authorRole || undefined);
    const dbEnd = performance.now();

    console.log(
      `📊 Care notes DB query took ${(dbEnd - dbStart).toFixed(2)}ms, found ${
        notes.length
      } notes`
    );

    // Cache the result for 5 minutes
    await CacheService.set(cacheKey, notes, 300);
    console.log(`💾 Cache SET for care notes ${cacheKey}`);

    const end = performance.now();
    console.log(`✅ Care Notes API completed in ${(end - start).toFixed(2)}ms`);

    return NextResponse.json({ notes });
  } catch (error) {
    console.error("Get care notes error:", error);
    return NextResponse.json(
      { error: "Failed to fetch care notes" },
      { status: 500 }
    );
  }
}

// POST /api/care-notes - Create new care note
export async function POST(request: NextRequest) {
  try {
    // Authenticate the request
    const authResult = await authenticateRequest(request);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { user } = authResult;
    const body = await request.json();
    const {
      patientId,
      authorId,
      authorName,
      authorRole,
      noteType,
      content,
      priority,
      isPrivate,
      followUpRequired,
      followUpDate,
    } = body;

    // Validate required fields
    if (
      !patientId ||
      !authorId ||
      !authorName ||
      !authorRole ||
      !content
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: patientId, authorId, authorName, authorRole, content",
        },
        { status: 400 }
      );
    }

    // Validate authorRole
    if (!["caregiver", "reviewer"].includes(authorRole)) {
      return NextResponse.json(
        {
          error: 'Invalid authorRole. Must be either "caregiver" or "reviewer"',
        },
        { status: 400 }
      );
    }

    const note = await createCareNote({
      patientId,
      authorId,
      authorName,
      authorRole,
      noteType,
      content,
      priority,
      isPrivate,
      followUpRequired,
      followUpDate,
    });

    // Invalidate care notes cache for this patient
    await CacheService.invalidatePattern(`care-notes:${patientId}:*`);
    console.log(`🗑️ Cache invalidated for patient ${patientId} care notes`);

    // Trigger activity feed item for care note creation
    try {
      // Get patient name directly from database
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      if (patient) {
        const patientName = `${patient.user.firstName} ${patient.user.lastName}`;
        await triggerCareNoteCreated(patientId, patientName, noteType, user);
        console.log("✅ Activity feed item created for care note:", patientId, noteType);
      } else {
        console.error("Patient not found for activity feed:", patientId);
      }
    } catch (activityError) {
      console.error("Failed to create activity feed item:", activityError);
      // Don't fail the main operation if activity creation fails
    }

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error("Create care note error:", error);
    return NextResponse.json(
      { error: "Failed to create care note" },
      { status: 500 }
    );
  }
}
