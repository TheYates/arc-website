import { NextRequest, NextResponse } from "next/server";
import {
  getCareNoteById,
  updateCareNote,
  deleteCareNote,
} from "@/lib/api/care-notes-prisma";
import { CacheService } from "@/lib/redis";

// GET /api/care-notes/[id] - Get specific care note
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cacheKey = `care-note:${id}`;

    // Try cache first
    const cachedNote = await CacheService.get(cacheKey);
    if (cachedNote) {
      console.log(`💾 Cache HIT for care note ${id}`);
      return NextResponse.json({ note: cachedNote });
    }

    const note = await getCareNoteById(id);

    if (!note) {
      return NextResponse.json(
        { error: "Care note not found" },
        { status: 404 }
      );
    }

    // Cache individual note for 10 minutes
    await CacheService.set(cacheKey, note, 600);
    console.log(`💾 Cache SET for care note ${id}`);

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Get care note error:", error);
    return NextResponse.json(
      { error: "Failed to fetch care note" },
      { status: 500 }
    );
  }
}

// PUT /api/care-notes/[id] - Update care note
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      content,
      priority,
      status,
      tags,
      isPrivate,
      followUpRequired,
      followUpDate,
    } = body;

    const note = await updateCareNote(id, {
      title,
      content,
      priority,
      status,
      tags,
      isPrivate,
      followUpRequired,
      followUpDate,
    });

    // Invalidate caches
    await CacheService.del(`care-note:${id}`);
    await CacheService.invalidatePattern(`care-notes:${note.patientId}:*`);
    console.log(
      `🗑️ Cache invalidated for care note ${id} and patient ${note.patientId}`
    );

    return NextResponse.json({ note });
  } catch (error) {
    console.error("Update care note error:", error);
    return NextResponse.json(
      { error: "Failed to update care note" },
      { status: 500 }
    );
  }
}

// DELETE /api/care-notes/[id] - Delete care note
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get note first to get patientId for cache invalidation
    const note = await getCareNoteById(id);

    await deleteCareNote(id);

    // Invalidate caches
    await CacheService.del(`care-note:${id}`);
    if (note) {
      await CacheService.invalidatePattern(`care-notes:${note.patientId}:*`);
      console.log(
        `🗑️ Cache invalidated for deleted care note ${id} and patient ${note.patientId}`
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete care note error:", error);
    return NextResponse.json(
      { error: "Failed to delete care note" },
      { status: 500 }
    );
  }
}
